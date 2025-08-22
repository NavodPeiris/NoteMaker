# app.py
import datetime
import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import uvicorn
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import Column, Integer, String, select, delete, func
from utils import (
    get_db, 
    redis_conn,
    CACHE_EXPIRE,
    vectorstore,
    text_splitter,
    qdrant_client
)
from models import ReadReq, CreateReq, UpdateReq, DeleteReq, GetGroupsReq, CreateGroupsReq
from jose import jwt
from tables import Notes, Groups
from sqlalchemy.orm import aliased
from qdrant_client.http import models

IS_PROD = False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def invalidate_notes_cache(user_id):
    keys = await redis_conn.keys(f"{user_id}_notes:*")
    if keys:
        await redis_conn.delete(*keys)


@app.get("/health")
async def health_check():
    return {"message": "running"}


@app.post("/create")
async def create_notes(req: CreateReq, db: AsyncSession = Depends(get_db)):
    new_note = Notes(
        title=req.title,
        tags=req.tags,
        note=req.note,
        group_id=req.group_id,
        updatedAt=req.updatedAt,
        user_id=req.user_id
    )
    db.add(new_note)
    await db.commit()
    await db.refresh(new_note)

    chunks = text_splitter.split_text(req.note)
    
    # add vectors
    vectorstore.add_texts(
        chunks,
        metadatas=[{"user_id": req.user_id, "note_id": new_note.id, "chunk": i} for i in range(len(chunks))]
    )

    await invalidate_notes_cache(req.user_id)

    return {"note_id": new_note.id}


@app.post("/update")
async def update_notes(req: UpdateReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notes).where(Notes.id == req.id))
    existing_note = result.scalar()
    
    if req.title:
        existing_note.title = req.title

    if req.tags:
        existing_note.tags = req.tags

    if req.note:
        existing_note.note = req.note

    if req.group_id:
        existing_note.group_id = req.group_id

    if req.updatedAt:
        existing_note.updatedAt = req.updatedAt

    await db.commit()

    await invalidate_notes_cache(req.user_id)

    # delete existing vectors
    qdrant_client.delete(
        collection_name="notes",
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.note_id",
                        match=models.MatchValue(value=existing_note.id)
                    )
                ]
            )
        )
    )

    chunks = text_splitter.split_text(existing_note.note)
    
    # add updated vectors
    vectorstore.add_texts(
        chunks,
        metadatas=[{"user_id": req.user_id, "note_id": existing_note.id, "chunk": i} for i in range(len(chunks))]
    )

    return {
        "updated_note": "updated note"
    }


@app.post("/delete")
async def delete_note(req: DeleteReq, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Notes).where(Notes.id == req.id))
    await db.commit()
    await invalidate_notes_cache(req.user_id)

    # delete existing vectors
    qdrant_client.delete(
        collection_name="notes",
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.note_id",
                        match=models.MatchValue(value=req.id)
                    )
                ]
            )
        )
    )

    return {"message": "deleted note"}


@app.post("/read")
async def read_notes(req: ReadReq, db: AsyncSession = Depends(get_db)):
    cache_key = f"{req.user_id}_notes:{req.page}:{req.page_size}"

    # 1. Try Redis cache
    cached = await redis_conn.get(cache_key)
    if cached:
        return json.loads(cached)

    # 2. Query DB
    offset = (req.page - 1) * req.page_size
    
    # Alias the Groups table
    grp = aliased(Groups)

    # Query notes with a join to groups
    result = await db.execute(
        select(
            Notes.id,
            Notes.title,
            Notes.tags,
            Notes.note,
            Notes.updatedAt,
            Notes.user_id,
            grp.id.label("group_id"),
            grp.title.label("group_title")
        )
        .join(grp, Notes.group_id == grp.id)
        .where(Notes.user_id == req.user_id)
        .offset(offset)
        .limit(req.page_size)
    )

    notes_with_groups = result.mappings().all()

    total = await db.execute(select(func.count()).select_from(Notes))
    total_count = total.scalar()

    response = {
        "notes": [
            {
                "id": note["id"],
                "title": note["title"],
                "tags": note["tags"],
                "note": note["note"],
                "group": {
                    "id": note["group_id"],
                    "title": note["group_title"]
                },
                "updatedAt": note["updatedAt"]
            }
            for note in notes_with_groups
        ],
        "page": req.page,
        "page_size": req.page_size,
        "total": total_count,
        "has_next": (req.page * req.page_size) < total_count,
    }

    # 3. Save to Redis
    await redis_conn.set(cache_key, json.dumps(response), ex=CACHE_EXPIRE)

    return response


@app.post("/getGroups")
async def getGroups(req: GetGroupsReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Groups).where(Groups.user_id == req.user_id)
    )
    groups = result.scalars().all()
    print("groups: ", groups)
    response = {
        "groups": [
            {
                "id": group.id,
                "title": group.title
            }
            for group in groups
        ],
    }

    return response


@app.post("/createGroups")
async def createGroups(req: CreateGroupsReq, db: AsyncSession = Depends(get_db)):
    
    group = Groups(
        title=req.title,
        user_id=req.user_id
    )

    db.add(group)
    await db.commit()

    return {"message": "added to groups"}


if __name__ == "__main__":
    if IS_PROD:
        handler = Mangum(app, lifespan="off")  # Lambda entry point
    else:
        uvicorn.run("app:app", host="0.0.0.0", port=8003, reload=True)
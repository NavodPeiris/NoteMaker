# app.py
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from sqlalchemy import delete, select
import uvicorn
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from utils import (
    get_db, 
    summarize_chain, 
    vectorstore, 
    llm,
    llm_graph_transformer,
    combine_docs_chain
)
from models import Triple, NoteReq, QuestionReq, KGReq, GetKGReq, Node, KGDelReq
from tables import KnowledgeGraphEdges, KnowledgeGraphNodes
from langchain_core.documents import Document
from langchain.chains.retrieval import create_retrieval_chain

from fastapi.responses import StreamingResponse
from fastapi import Request, Query
import json
import uuid

IS_PROD = False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def remove_from_knowledge_graph(note_id: int, db: AsyncSession):
    result = await db.execute(delete(KnowledgeGraphNodes).where(KnowledgeGraphNodes.note_id == note_id))


async def add_kg_nodes(node: Node, user_id: int, note_id: int, db: AsyncSession):
    node_added = KnowledgeGraphNodes(
        entity=node.entity,
        user_id=user_id,
        note_id=note_id
    )

    db.add(node_added)

    await db.commit()


async def add_to_knowledge_graph(triple: Triple, user_id: int, note_id: int, db: AsyncSession):
    result = await db.execute(select(KnowledgeGraphNodes.id).where(KnowledgeGraphNodes.entity == triple.source))
    source_id_exist = result.scalar()

    if source_id_exist != None:
        triple.source = source_id_exist
    else:
        source_added = KnowledgeGraphNodes(
            entity=triple.source,
            user_id=user_id,
            note_id=note_id
        )

        db.add(source_added)

        await db.commit()
        db.refresh(source_added)

        triple.source = source_added.id

    result = await db.execute(select(KnowledgeGraphNodes.id).where(KnowledgeGraphNodes.entity == triple.target))
    target_id_exist = result.scalar()

    if target_id_exist:
        triple.target = target_id_exist
    else:
        target_added = KnowledgeGraphNodes(
            entity=triple.target,
            user_id=user_id,
            note_id=note_id
        )

        db.add(target_added)

        await db.commit()
        db.refresh(target_added)

        triple.target = target_added.id

    edge = KnowledgeGraphEdges(
        source=triple.source,
        relation=triple.relation,
        target=triple.target,
        user_id=user_id
    )

    db.add(edge)
    await db.commit()


@app.get("/health")
async def health_check():
    return {"message": "running"}


@app.post("/summarize")
async def summarize(req: NoteReq):
    text = req.text
    texts = [text]

    docs = [Document(page_content=t) for t in texts]
    summary = summarize_chain.run(docs)

    return {"summary": summary}


@app.post("/question")
async def qna_stream(request: Request, protocol: str = Query("data")):
    body = await request.json()
    user_id = body["user_id"]
    messages = body["messages"]
    question = messages[-1]["content"]

    # Retrieve docs for the user
    retriever = vectorstore.as_retriever(
        search_kwargs={"filter": {"user_id": user_id}}
    )
    rag_chain = create_retrieval_chain(retriever, combine_docs_chain)

    def generate():
        # Run the chain
        res = rag_chain.invoke({"input": question})
        answer = res.get("answer", "")

        if protocol == "text":
            # plain text streaming
            for chunk in answer.split("\n"):
                yield chunk
        elif protocol == "data":
            # AI-SDK streaming protocol
            # '0:' prefix for assistant text
            yield f'0:{json.dumps(answer)}\n'
            # 'd:' for finish event
            yield f'd:{{"finishReason":"stop"}}\n'

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/kgupdate")
async def kgUpdate(req: KGReq, db: AsyncSession = Depends(get_db)):
    await remove_from_knowledge_graph(req.note_id, db)
    
    documents = [Document(page_content=req.text)]
    graph_documents = await llm_graph_transformer.aconvert_to_graph_documents(documents)
    print(f"Nodes:{graph_documents[0].nodes}")
    print(f"Relationships:{graph_documents[0].relationships}")

    for node in graph_documents[0].nodes:
        await add_kg_nodes(Node(entity=node.id), req.user_id, req.note_id, db)

    for relationship in graph_documents[0].relationships:
        await add_to_knowledge_graph(
            Triple(
                source=relationship.source.id,
                relation=relationship.type,
                target=relationship.target.id
            ),
            req.user_id,
            req.note_id,
            db
        )


    return {"message": "updated knowledge graph"}


@app.post("/kgdelete")
async def kgDelete(req: KGDelReq, db: AsyncSession = Depends(get_db)):
    await remove_from_knowledge_graph(req.note_id, db)

    return {"message": "removed from knowledge graph"}


@app.post("/getKGEdges")
async def getKGEdges(req: GetKGReq, db: AsyncSession = Depends(get_db)):
    results = await db.execute(select(KnowledgeGraphEdges).where(KnowledgeGraphEdges.user_id == req.user_id))
    edges = results.scalars().all()

    res = {
        "edges": [
            {
                "id": str(edge.id),
                "source": str(edge.source),
                "target": str(edge.target),
                "label": str(edge.relation)
            } 
            for edge in edges
        ],
    }

    return res


@app.post("/getKGNodes")
async def getKGNodes(req: GetKGReq, db: AsyncSession = Depends(get_db)):
    results = await db.execute(select(KnowledgeGraphNodes).where(KnowledgeGraphNodes.user_id == req.user_id))
    nodes = results.scalars().all()

    res = {
        "nodes": [
            {
                "id": str(node.id),
                "label": str(node.entity)
            } 
            for node in nodes
        ],
    }

    return res


if __name__ == "__main__":
    if IS_PROD:
        handler = Mangum(app, lifespan="off")  # Lambda entry point
    else:
        uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
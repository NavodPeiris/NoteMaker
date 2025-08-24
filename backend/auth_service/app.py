# app.py
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import uvicorn
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt
from utils import (
    get_db, 
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_DAYS,
    pwd_context,
)
from models import LoginReq, RegisterReq
from tables import User

IS_PROD = False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility functions
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """Create JWT access token using PyJWT"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token, expire


@app.get("/health")
async def health_check():
    return {"message": "running"}


@app.post("/login")
async def login(req: LoginReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    db_user = result.scalar()
    
    if not db_user or not verify_password(req.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token, expire = create_access_token(data={"email": db_user.email})
    return {"access_token": access_token, "expire": expire, "user_id": db_user.id}


@app.post("/register")
async def register(req: RegisterReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=req.name,
        email=req.email,
        password=hash_password(req.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)  # Ensure new_user.id is populated

    access_token, expire = create_access_token(data={"email": new_user.email})
    return {"access_token": access_token, "expire": expire, "user_id": new_user.id}


if __name__ == "__main__":
    if IS_PROD:
        handler = Mangum(app, lifespan="off")  # Lambda entry point
    else:
        uvicorn.run("app:app", host="0.0.0.0", port=8002, reload=True)

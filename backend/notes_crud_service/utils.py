from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, select, JSON
from dotenv import load_dotenv
import os
from passlib.context import CryptContext
import redis.asyncio as redis
from qdrant_client import QdrantClient
from langchain.vectorstores.qdrant import Qdrant
from qdrant_client.http import models
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,   # characters
    chunk_overlap=50, # keep small overlap for context
)

# JWT config
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
CACHE_EXPIRE = 3600


load_dotenv()
DB_URL = os.getenv("DB_URL")
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=GOOGLE_API_KEY)

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

qdrant_client = QdrantClient(url="http://localhost:6333")
vectorstore = Qdrant(client=qdrant_client, collection_name="notes", embeddings=embeddings)

COLLECTION_NAME = "notes"

# make sure collection exists
if not qdrant_client.collection_exists(COLLECTION_NAME):
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
    )

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

bearer_scheme = HTTPBearer(auto_error=False)

engine = create_async_engine(DB_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


# Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        

redis_conn = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

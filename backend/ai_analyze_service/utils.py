from langchain_groq import ChatGroq
from langchain.chains.summarize import load_summarize_chain
from qdrant_client import QdrantClient
from langchain.vectorstores.qdrant import Qdrant
from langchain.prompts import PromptTemplate

from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain import hub
from langchain.output_parsers import PydanticOutputParser

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String
from dotenv import load_dotenv
import os
from models import Triple
from qdrant_client.http import models
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_experimental.graph_transformers import LLMGraphTransformer


load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")
DB_URL = os.getenv("DB_URL")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

COLLECTION_NAME = "notes"

genai.configure(api_key=GOOGLE_API_KEY)

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

qdrant_client = QdrantClient(url="http://localhost:6333")
vectorstore = Qdrant(client=qdrant_client, collection_name="notes", embeddings=embeddings)

if not qdrant_client.collection_exists(COLLECTION_NAME):
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
    )

engine = create_async_engine(DB_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


# Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key=API_KEY
)

llm_graph_transformer = LLMGraphTransformer(llm=llm)

summarize_chain = load_summarize_chain(llm, chain_type="stuff")

retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")

combine_docs_chain = create_stuff_documents_chain(llm, retrieval_qa_chat_prompt)
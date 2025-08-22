from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from dotenv import load_dotenv
import os

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

    # Relationships
    groups = relationship("Groups", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    notes = relationship("Notes", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    knowledge_graph_edges = relationship("KnowledgeGraphEdges", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    knowledge_graph_nodes = relationship("KnowledgeGraphNodes", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)


class Groups(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True)
    title = Column(String, unique=True)

    # Foreign key to users.id
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship
    user = relationship("User", back_populates="groups")
    notes = relationship("Notes", back_populates="group_rel", cascade="all, delete-orphan", passive_deletes=True)


class Notes(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    tags = Column(JSON)  # JSON array ["python","fastapi"]
    note = Column(String)
    updatedAt = Column(String)

    # Foreign keys
    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notes")
    group_rel = relationship("Groups", back_populates="notes")
    kg_nodes = relationship("KnowledgeGraphNodes", back_populates="notes", cascade="all, delete-orphan", passive_deletes=True)


class KnowledgeGraphNodes(Base):
    __tablename__ = "knowledge_graph_nodes"

    id = Column(Integer, primary_key=True, index=True)
    entity = Column(String, nullable=False)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="knowledge_graph_nodes")
    notes = relationship("Notes", back_populates="kg_nodes")

    # Edges where this node is entity1 or entity2
    edges_from = relationship("KnowledgeGraphEdges", foreign_keys="KnowledgeGraphEdges.source", back_populates="node1")
    edges_to = relationship("KnowledgeGraphEdges", foreign_keys="KnowledgeGraphEdges.target", back_populates="node2")


class KnowledgeGraphEdges(Base):
    __tablename__ = "knowledge_graph_edges"

    id = Column(Integer, primary_key=True, index=True)
    relation = Column(String, nullable=False)

    # Foreign keys
    source = Column(Integer, ForeignKey("knowledge_graph_nodes.id", ondelete="CASCADE"), nullable=False)
    target = Column(Integer, ForeignKey("knowledge_graph_nodes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="knowledge_graph_edges")
    node1 = relationship("KnowledgeGraphNodes", foreign_keys=[source], back_populates="edges_from")
    node2 = relationship("KnowledgeGraphNodes", foreign_keys=[target], back_populates="edges_to")


async def init_models(db_url: str):
    engine = create_async_engine(db_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    import asyncio
    load_dotenv()
    DB_URL = os.getenv("DB_URL")
    asyncio.run(init_models(DB_URL))

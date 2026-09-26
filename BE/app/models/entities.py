import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=True)
    role = Column(String(32), default="DevOps Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships with eager selectin loading
    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan", lazy="selectin")


class ModelRegistryEntry(Base):
    __tablename__ = "model_registry"

    id = Column(String(64), primary_key=True, index=True) # e.g. "google-gemini-flash"
    name = Column(String(128), nullable=False)
    provider = Column(String(64), nullable=False)
    module_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    version = Column(String(32), default="1.0.0")
    is_active = Column(Boolean, default=True)
    latency_ms = Column(Integer, default=120)
    context_window = Column(Integer, default=8192)
    parameters_count = Column(String(32), default="8B")
    capabilities = Column(JSON, default=lambda: ["chat", "code", "devops"])
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(256), default="New AI Consultation")
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    model_id = Column(String(64), default="google-gemini-flash")
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships with eager selectin loading
    user = relationship("User", back_populates="sessions", lazy="selectin")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at", lazy="selectin")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), index=True, nullable=False)
    role = Column(String(16), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    model_id = Column(String(64), nullable=True)
    tokens_prompt = Column(Integer, default=0)
    tokens_completion = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    comparison_meta = Column(JSON, nullable=True) # Stores similarity/comparison against DB records
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships with eager selectin loading
    session = relationship("ChatSession", back_populates="messages", lazy="selectin")


class KnowledgeRecord(Base):
    """
    Stores historical data, golden prompt datasets, and enterprise context records
    for comparing incoming requests against the historical database.
    """
    __tablename__ = "knowledge_records"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(256), nullable=False)
    category = Column(String(64), default="DevOps/Infra")
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=lambda: [])
    version = Column(String(32), default="v1.0")
    checksum = Column(String(64), nullable=True)
    created_by = Column(String(64), default="system")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

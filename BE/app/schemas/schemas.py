from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: Optional[str] = "DevOps Engineer"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Model Registry Schemas ---
class ModelEntryBase(BaseModel):
    id: str
    name: str
    provider: str
    module_type: str
    description: str
    version: str = "1.0.0"
    is_active: bool = True
    latency_ms: int = 120
    context_window: int = 8192
    parameters_count: str = "8B"
    capabilities: List[str] = ["chat", "code", "devops"]

class ModelEntryResponse(ModelEntryBase):
    created_at: datetime

    class Config:
        from_attributes = True


# --- Chat Message Schemas ---
class MessageCreate(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    username: Optional[str] = "devops_lead"
    content: str = Field(..., min_length=1)
    model_id: Optional[str] = "inhouse-llama3-enterprise"
    enable_comparison: Optional[bool] = True
    temperature: Optional[float] = 0.7

class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    model_id: Optional[str] = None
    tokens_prompt: int = 0
    tokens_completion: int = 0
    latency_ms: float = 0.0
    comparison_meta: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Chat Session Schemas ---
class SessionCreate(BaseModel):
    title: Optional[str] = "New AI Architecture Chat"
    user_id: Optional[str] = None
    username: Optional[str] = "devops_lead"
    model_id: Optional[str] = "inhouse-llama3-enterprise"

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class SessionResponse(BaseModel):
    id: str
    title: str
    user_id: str
    model_id: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class SessionDetailResponse(SessionResponse):
    messages: List[MessageResponse] = []


# --- Data Comparison & Deduplication Schemas ---
class DataComparisonRequest(BaseModel):
    input_text: str = Field(..., min_length=1, description="New prompt, config, or data payload to compare against database")
    category: Optional[str] = None
    threshold: Optional[float] = Field(0.3, ge=0.0, le=1.0, description="Similarity threshold (0.0 to 1.0)")
    limit: Optional[int] = 5

class ComparisonMatch(BaseModel):
    record_id: str
    title: str
    category: str
    historical_content: str
    similarity_score: float = Field(..., description="Similarity percentage between 0 and 100")
    match_type: str = Field(..., description="'High Match', 'Partial Match', 'Semantic Overlap'")
    diff_summary: str
    source_type: str # "KnowledgeBase", "HistoricalChat", "ConfigRepository"

class DataComparisonResponse(BaseModel):
    input_analyzed: str
    total_db_records_checked: int
    matches_found: int
    highest_similarity: float
    is_duplicate_or_similar: bool
    recommendation: str
    matches: List[ComparisonMatch]


# --- Knowledge Record Schemas ---
class KnowledgeRecordCreate(BaseModel):
    title: str
    category: str = "DevOps/Infra"
    content: str
    tags: List[str] = []
    version: str = "v1.0"
    created_by: str = "devops_lead"

class KnowledgeRecordResponse(KnowledgeRecordCreate):
    id: str
    checksum: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Analytics & Health Schemas ---
class SystemStats(BaseModel):
    status: str
    database_status: str
    active_models_count: int
    total_sessions: int
    total_messages: int
    total_knowledge_records: int
    uptime_seconds: float
    environment: str
    version: str

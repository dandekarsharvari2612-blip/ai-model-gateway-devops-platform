import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func
from app.database import get_db
from app.config import settings
from app.models.entities import User, ChatSession, ChatMessage, KnowledgeRecord, ModelRegistryEntry
from app.schemas.schemas import SystemStats

router = APIRouter()
START_TIME = time.time()

@router.get("/live", response_model=dict)
async def liveness_probe():
    """Kubernetes liveness probe - confirms the FastAPI process is running."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": time.time()
    }

@router.get("/ready", response_model=dict)
async def readiness_probe(db: AsyncSession = Depends(get_db)):
    """Kubernetes readiness probe - verifies active connection to Azure PostgreSQL / Database."""
    try:
        # Perform quick database check
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {
            "status": "ready",
            "database": "connected",
            "database_url_scheme": settings.DATABASE_URL.split("://")[0],
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database readiness check failed: {str(e)}"
        )

@router.get("/stats", response_model=SystemStats)
async def get_system_stats(db: AsyncSession = Depends(get_db)):
    """Get system health metrics, model count, and database record stats."""
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "degraded"

    total_sessions = (await db.execute(select(func.count(ChatSession.id)))).scalar() or 0
    total_messages = (await db.execute(select(func.count(ChatMessage.id)))).scalar() or 0
    total_records = (await db.execute(select(func.count(KnowledgeRecord.id)))).scalar() or 0
    total_models = (await db.execute(select(func.count(ModelRegistryEntry.id)))).scalar() or 0

    return SystemStats(
        status="healthy",
        database_status=db_status,
        active_models_count=total_models,
        total_sessions=total_sessions,
        total_messages=total_messages,
        total_knowledge_records=total_records,
        uptime_seconds=round(time.time() - START_TIME, 1),
        environment=settings.ENVIRONMENT,
        version=settings.VERSION
    )

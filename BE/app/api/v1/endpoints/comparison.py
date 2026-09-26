from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.schemas.schemas import (
    DataComparisonRequest,
    DataComparisonResponse,
    KnowledgeRecordCreate,
    KnowledgeRecordResponse
)
from app.models.entities import KnowledgeRecord
from app.services.comparison_service import comparison_service
from typing import List, Optional

router = APIRouter()

@router.post("/compare", response_model=DataComparisonResponse)
async def compare_data_with_database(
    payload: DataComparisonRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Compares incoming user input, configurations, or knowledge items with
    historical records in the database to detect overlaps and prevent duplicates.
    """
    try:
        results = await comparison_service.compare_with_database(
            db=db,
            input_text=payload.input_text,
            category=payload.category,
            threshold=payload.threshold or 0.25,
            limit=payload.limit or 5
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(e)}"
        )

@router.get("/records", response_model=List[KnowledgeRecordResponse])
async def list_knowledge_records(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all historical knowledge records stored in the database."""
    stmt = select(KnowledgeRecord)
    if category:
        stmt = stmt.where(KnowledgeRecord.category == category)
    stmt = stmt.order_by(KnowledgeRecord.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())

@router.post("/records", response_model=KnowledgeRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge_record(
    payload: KnowledgeRecordCreate,
    db: AsyncSession = Depends(get_db)
):
    """Store a new knowledge record / baseline architecture specification in the database."""
    record = KnowledgeRecord(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        tags=payload.tags,
        version=payload.version,
        created_by=payload.created_by
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import UserCreate, UserResponse
from app.services.chat_service import chat_service
from typing import List

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    """List all registered users / team members."""
    return await chat_service.list_users(db)

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user / team member."""
    user = await chat_service.get_or_create_user(
        db=db,
        username=payload.username,
        full_name=payload.full_name,
        role=payload.role or "DevOps Engineer"
    )
    return user

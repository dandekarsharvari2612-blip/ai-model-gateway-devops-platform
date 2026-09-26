from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import SessionCreate, SessionResponse, SessionDetailResponse
from app.services.chat_service import chat_service
from typing import List, Optional

router = APIRouter()

@router.get("", response_model=List[SessionResponse])
async def list_sessions(
    username: Optional[str] = Query(None, description="Filter sessions by username. If omitted, returns all user sessions"),
    user_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    List chat sessions from the database.
    Allows any user to retrieve their own or team historical sessions.
    """
    return await chat_service.list_user_sessions(db=db, user_id=user_id, username=username)

@router.post("", response_model=SessionResponse)
async def create_session(
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new empty chat session."""
    session = await chat_service.create_session(
        db=db,
        title=payload.title or "New Architecture Discussion",
        username=payload.username or "devops_lead",
        model_id=payload.model_id or "inhouse-llama3-enterprise"
    )
    return session

@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get full details and all messages of a chat session."""
    session = await chat_service.get_session_details(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )
    return session

@router.delete("/{session_id}", response_model=dict)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a session and its message history from the database."""
    success = await chat_service.delete_session(db, session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or already deleted."
        )
    return {"message": "Session deleted successfully", "id": session_id}

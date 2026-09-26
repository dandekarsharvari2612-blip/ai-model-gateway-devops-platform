from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import MessageCreate, MessageResponse, SessionDetailResponse
from app.services.chat_service import chat_service
from typing import Dict, Any

router = APIRouter()

@router.post("/message", response_model=Dict[str, Any])
async def send_message(
    payload: MessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Core Chat Endpoint:
    1. Saves incoming prompt to database.
    2. Runs real-time comparison with historical database records.
    3. Invokes selected AI model module (in-house or cloud).
    4. Persists AI response to database.
    5. Returns unified payload for real-time frontend rendering.
    """
    try:
        result = await chat_service.send_message_and_respond(
            db=db,
            content=payload.content,
            session_id=payload.session_id,
            username=payload.username or "devops_lead",
            model_id=payload.model_id or "inhouse-llama3-enterprise",
            enable_comparison=payload.enable_comparison if payload.enable_comparison is not None else True,
            temperature=payload.temperature or 0.7
        )
        return {
            "session_id": result["session_id"],
            "session_title": result["session_title"],
            "user_message": MessageResponse.model_validate(result["user_message"]),
            "assistant_message": MessageResponse.model_validate(result["assistant_message"]),
            "comparison": result["comparison"],
            "model_used": result["model_used"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@router.get("/history/{session_id}", response_model=SessionDetailResponse)
async def get_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full historical conversation for a session from the database."""
    session = await chat_service.get_session_details(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found in database."
        )
    return session

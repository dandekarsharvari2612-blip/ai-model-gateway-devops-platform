from fastapi import APIRouter, HTTPException, status
from app.services.model_service import model_service
from typing import List, Dict, Any

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def list_available_models():
    """List all registered in-house and cloud AI models/modules."""
    return await model_service.list_models()

@router.get("/{model_id}", response_model=Dict[str, Any])
async def get_model_details(model_id: str):
    """Get metadata, capabilities, and parameters for a specific model module."""
    if model_id not in model_service.AVAILABLE_MODELS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model module '{model_id}' is not registered."
        )
    return {
        "id": model_id,
        **model_service.AVAILABLE_MODELS[model_id]
    }

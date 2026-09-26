from fastapi import APIRouter
from app.api.v1.endpoints import chat, models, sessions, comparison, users, health

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health & Probes"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat & Inference"])
api_router.include_router(models.router, prefix="/models", tags=["Model Registry"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Session Management"])
api_router.include_router(comparison.router, prefix="/comparison", tags=["Data Comparison"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Team"])

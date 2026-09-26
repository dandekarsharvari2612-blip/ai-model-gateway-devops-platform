# AI Model Gateway & Backend Service (Tier 2)

Enterprise FastAPI backend designed for Kubernetes (Azure AKS) and Azure Database for PostgreSQL (RDS).

## Architecture Highlights
- **Modular Model Gateway**: Dynamically select between in-house reasoning models, DevOps copilot, security classifier, RAG synthesizer, or Azure OpenAI GPT-4o.
- **Data Comparison Engine**: Automatically compares incoming prompts and datasets against historical database records to detect duplicates, measure similarity %, and prevent redundant runs.
- **Multi-Tenant State Persistence**: Chat history, sessions, metrics, and models are persisted in PostgreSQL/SQLite for multi-user team collaboration.
- **Cloud-Native & Production-Ready**: Implements Kubernetes readiness/liveness probes (`/health/ready`, `/health/live`), Prometheus-ready stats, async SQLAlchemy ORM, and multi-stage Docker builds.

## Quick Start (Local)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests
```bash
pytest tests/ -v
```

## API Documentation
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

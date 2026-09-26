import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.entities import User, ModelRegistryEntry, KnowledgeRecord, ChatSession, ChatMessage
from app.services.model_service import ModelService

logger = logging.getLogger(__name__)

INITIAL_USERS = [
    {"username": "devops_lead", "full_name": "DevOps Lead Engineer", "role": "Principal DevOps"},
    {"username": "cloud_architect", "full_name": "Cloud Solution Architect", "role": "Infrastructure Architect"},
    {"username": "ai_engineer", "full_name": "MLOps & AI Engineer", "role": "AI Specialist"},
    {"username": "security_officer", "full_name": "SecOps Lead", "role": "Cybersecurity Engineer"}
]

INITIAL_KNOWLEDGE_RECORDS = [
    {
        "title": "Azure AKS Production Baseline Specification",
        "category": "Kubernetes/AKS",
        "tags": ["aks", "kubernetes", "production", "node-pools", "cni"],
        "version": "v2.1",
        "content": (
            "Standard Production AKS cluster configuration requires Azure CNI Overlay networking, "
            "private cluster endpoints, Azure AD (Entra ID) RBAC integration, and dedicated system "
            "and user node pools with minimum 3 nodes across availability zones."
        )
    },
    {
        "title": "Azure Database for PostgreSQL Flexible Server Connection Architecture",
        "category": "Database/RDS",
        "tags": ["postgres", "azure-rds", "connection-pooling", "pgbouncer", "ssl"],
        "version": "v1.4",
        "content": (
            "PostgreSQL Flexible Server deployed with Private DNS Zone integration within VNet. "
            "Requires SSL enforcement (`sslmode=require`), PgBouncer connection pooling enabled for "
            "microservices on AKS, and daily geo-redundant backups retained for 35 days."
        )
    },
    {
        "title": "Self-Hosted Master-Node and GitHub Runner Topology",
        "category": "DevOps/CI-CD",
        "tags": ["github-actions", "runners", "master-node", "ephemeral", "arc"],
        "version": "v3.0",
        "content": (
            "Dual-tier CI/CD runner architecture: Master controller node coordinates repository tokens "
            "and workflow triggers, while worker runner nodes execute docker-in-docker container builds. "
            "Auto-scaled via Actions Runner Controller (ARC) on AKS with spot instance cost optimization."
        )
    },
    {
        "title": "Three-Tier Application Architecture Ingress & Routing",
        "category": "Architecture",
        "tags": ["3-tier", "ingress", "nginx", "fastapi", "react"],
        "version": "v1.0",
        "content": (
            "Frontend (Tier 1): React SPA served via Nginx on port 80/443. "
            "Backend (Tier 2): FastAPI async microservice handling AI model routing on port 8000. "
            "Database (Tier 3): Managed Azure PostgreSQL database with persistent storage on port 5432."
        )
    }
]

async def seed_initial_data(db: AsyncSession):
    """Seed users, models, and sample historical records if tables are empty."""
    try:
        # 1. Seed Users
        user_stmt = select(User)
        user_res = await db.execute(user_stmt)
        existing_users = {u.username: u for u in user_res.scalars().all()}

        created_users = {}
        for u_data in INITIAL_USERS:
            if u_data["username"] not in existing_users:
                user = User(**u_data)
                db.add(user)
                created_users[u_data["username"]] = user
            else:
                created_users[u_data["username"]] = existing_users[u_data["username"]]

        await db.commit()

        # 2. Seed Model Registry
        model_stmt = select(ModelRegistryEntry)
        model_res = await db.execute(model_stmt)
        existing_models = {m.id for m in model_res.scalars().all()}

        for model_id, m_data in ModelService.AVAILABLE_MODELS.items():
            if model_id not in existing_models:
                entry = ModelRegistryEntry(
                    id=model_id,
                    name=m_data["name"],
                    provider=m_data["provider"],
                    module_type=m_data["module_type"],
                    description=m_data["description"],
                    version=m_data["version"],
                    latency_ms=m_data["latency_ms"],
                    context_window=m_data["context_window"],
                    parameters_count=m_data["parameters_count"],
                    capabilities=m_data["capabilities"]
                )
                db.add(entry)

        # 3. Seed Knowledge Records for Historical Comparison
        kr_stmt = select(KnowledgeRecord)
        kr_res = await db.execute(kr_stmt)
        existing_kr_titles = {kr.title for kr in kr_res.scalars().all()}

        for kr_data in INITIAL_KNOWLEDGE_RECORDS:
            if kr_data["title"] not in existing_kr_titles:
                kr = KnowledgeRecord(
                    title=kr_data["title"],
                    category=kr_data["category"],
                    tags=kr_data["tags"],
                    version=kr_data["version"],
                    content=kr_data["content"],
                    created_by="system"
                )
                db.add(kr)

        await db.commit()

        # 4. Seed a Sample Session for devops_lead if none exists
        devops_user = created_users.get("devops_lead")
        if devops_user:
            sess_stmt = select(ChatSession).where(ChatSession.user_id == devops_user.id)
            sess_res = await db.execute(sess_stmt)
            if not sess_res.scalars().first():
                sample_session = ChatSession(
                    title="AKS 3-Tier Production Setup Discussion",
                    user_id=devops_user.id,
                    model_id="inhouse-devops-copilot"
                )
                db.add(sample_session)
                await db.commit()
                await db.refresh(sample_session)

                # Add sample initial messages
                m1 = ChatMessage(
                    session_id=sample_session.id,
                    role="user",
                    content="How should we configure the 3-tier architecture with Azure AKS and PostgreSQL?",
                    model_id="inhouse-devops-copilot"
                )
                m2 = ChatMessage(
                    session_id=sample_session.id,
                    role="assistant",
                    content=(
                        "### 🏗️ 3-Tier Architecture Deployment on Azure AKS\n\n"
                        "1. **Tier 1 (Frontend)**: React Single-Page Application behind Nginx Ingress.\n"
                        "2. **Tier 2 (Backend)**: FastAPI async microservice with HPA auto-scaling on AKS worker nodes.\n"
                        "3. **Tier 3 (Database)**: Azure Database for PostgreSQL Flexible Server with SSL and persistent storage.\n\n"
                        "All state and session records are persisted in the database so team members can retrieve history seamlessly!"
                    ),
                    model_id="inhouse-devops-copilot",
                    tokens_prompt=24,
                    tokens_completion=88,
                    latency_ms=92.5
                )
                db.add_all([m1, m2])
                await db.commit()

        logger.info("Database seeding completed successfully.")

    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
        await db.rollback()

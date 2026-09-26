#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# LOCAL DOCKER COMPOSE LAUNCHER SCRIPT
# Starts Tier 1 (FE), Tier 2 (BE), and Tier 3 (DB) with health verification
# ==============================================================================

echo "=================================================================="
echo ">>> Starting 3-Tier Enterprise AI Stack via Docker Compose <<<"
echo "=================================================================="

docker compose up --build -d

echo ""
echo "--> Checking container status..."
docker compose ps

echo ""
echo "=================================================================="
echo ">>> STACK ONLINE! <<<"
echo "• Frontend (React SPA):       http://localhost:3000"
echo "• Backend (FastAPI Swagger):   http://localhost:8000/api/v1/docs"
echo "• PostgreSQL Database:         localhost:5432 (db: aidatabase, user: dbadmin)"
echo "• Health Endpoint:             http://localhost:8000/api/v1/health/ready"
echo "=================================================================="

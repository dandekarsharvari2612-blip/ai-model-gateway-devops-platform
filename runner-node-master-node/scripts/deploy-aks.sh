#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# AZURE AKS 3-TIER APPLICATION DEPLOYMENT SCRIPT
# Deploys Database, FastAPI AI Backend, React Frontend, and Ingress to AKS
# ==============================================================================

NAMESPACE="production"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="${SCRIPT_DIR}/../k8s"

echo "=================================================================="
echo ">>> Deploying 3-Tier Enterprise AI Stack to Azure AKS <<<"
echo "=================================================================="

# 1. Create Namespaces
echo "--> [1/6] Applying Namespaces..."
kubectl apply -f "${K8S_DIR}/00-namespace.yaml"

# 2. ConfigMaps and Secrets
echo "--> [2/6] Applying ConfigMaps and Secrets..."
kubectl apply -f "${K8S_DIR}/01-configmap-secrets.yaml"

# 3. Database StatefulSet
echo "--> [3/6] Deploying PostgreSQL Database (Tier 3)..."
kubectl apply -f "${K8S_DIR}/02-postgres-database.yaml"

echo "Waiting for PostgreSQL database pod to become ready..."
kubectl rollout status statefulset/postgres-db -n "${NAMESPACE}" --timeout=180s

# 4. Backend AI Gateway
echo "--> [4/6] Deploying FastAPI AI Gateway (Tier 2)..."
kubectl apply -f "${K8S_DIR}/03-backend-deployment.yaml"
kubectl apply -f "${K8S_DIR}/06-backend-hpa.yaml"

echo "Waiting for Backend AI pods to become ready..."
kubectl rollout status deployment/ai-backend -n "${NAMESPACE}" --timeout=180s

# 5. Frontend React SPA
echo "--> [5/6] Deploying React Single-Page Application (Tier 1)..."
kubectl apply -f "${K8S_DIR}/04-frontend-deployment.yaml"

echo "Waiting for Frontend pods to become ready..."
kubectl rollout status deployment/ai-frontend -n "${NAMESPACE}" --timeout=180s

# 6. Ingress Routing
echo "--> [6/6] Applying Ingress rules..."
kubectl apply -f "${K8S_DIR}/05-ingress.yaml"

echo "=================================================================="
echo ">>> DEPLOYMENT SUCCEEDED! Pods Overview: <<<"
kubectl get pods -n "${NAMESPACE}" -o wide
echo ""
echo ">>> Services & Ingress: <<<"
kubectl get svc,ingress -n "${NAMESPACE}"
echo "=================================================================="

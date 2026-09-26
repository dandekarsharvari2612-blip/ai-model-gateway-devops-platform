# Runner Node, Master Node & Cloud DevOps Infrastructure

This directory contains the end-to-end DevOps automation, CI/CD pipelines, Master-Node / Runner-Node configuration, Azure AKS Kubernetes manifests, Helm charts, and Terraform IaC for the 3-tier enterprise AI application.

## Directory Structure
```
runner-node-master-node/
├── master-node/
│   ├── setup-master.sh                 # Master node provisioning script
│   ├── master-controller-config.yaml   # Master controller config spec
│   └── generate-runner-token.sh        # GitHub token generator for worker nodes
├── runner-node/
│   ├── setup-runner.sh                 # Worker node binary installation & registration
│   ├── runner.service                  # Linux systemd daemon unit
│   └── docker-runner/
│       ├── Dockerfile                  # Containerized runner with Docker-in-Docker
│       └── entrypoint.sh               # Ephemeral runner container lifecycle
├── k8s/                                # Production Azure AKS Kubernetes Manifests
│   ├── 00-namespace.yaml               # Namespaces
│   ├── 01-configmap-secrets.yaml       # ConfigMaps & Secrets
│   ├── 02-postgres-database.yaml       # PostgreSQL Tier 3 StatefulSet & PVC
│   ├── 03-backend-deployment.yaml      # FastAPI Tier 2 Deployment with probes
│   ├── 04-frontend-deployment.yaml     # React/Nginx Tier 1 Deployment
│   ├── 05-ingress.yaml                 # Nginx Ingress routing
│   ├── 06-backend-hpa.yaml             # Horizontal Pod Autoscaler (HPA)
│   └── 07-actions-runner-controller.yaml # ARC autoscaling runners on AKS
├── helm/
│   └── ai-app-chart/                   # Production Helm 3 Chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── terraform/                          # Infrastructure as Code (Azure)
│   ├── main.tf                         # Azurerm provider & Resource Group
│   ├── vnet.tf                         # Virtual Network & Subnets
│   ├── aks.tf                          # Managed AKS cluster & node pools
│   ├── postgres.tf                     # Azure Database for PostgreSQL Flexible
│   ├── acr.tf                          # Azure Container Registry & Role Assignment
│   ├── variables.tf
│   └── outputs.tf
├── scripts/
│   ├── deploy-aks.sh                   # One-command deployment to AKS
│   └── local-dev-up.sh                 # Local Docker Compose launcher
└── docker-compose.yml                  # 3-Tier local orchestration
```

## Quick Start
### 1. Run Complete 3-Tier Stack Locally
```bash
docker compose up --build -d
```

### 2. Deploy to Azure AKS via Helm
```bash
helm upgrade --install ai-enterprise ./helm/ai-app-chart \
  --namespace production \
  --create-namespace
```

### 3. Setup Self-Hosted Master & Runner Nodes
```bash
# On Master Node:
sudo ./master-node/setup-master.sh
GITHUB_PAT='ghp_xxx' ./master-node/generate-runner-token.sh <org> <repo>

# On Worker Runner Node:
sudo ./runner-node/setup-runner.sh https://github.com/<org>/<repo> <RUNNER_TOKEN>
```

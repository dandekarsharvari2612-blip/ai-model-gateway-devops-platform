#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# MASTER NODE PROVISIONING & ACTIONS RUNNER CONTROLLER (ARC) SETUP SCRIPT
# Configures the CI/CD Master Orchestrator Node for AKS and GitHub Actions
# ==============================================================================

echo "=================================================================="
echo ">>> Initializing Master Node Orchestrator for 3-Tier AI Project <<<"
echo "=================================================================="

# 1. Update system packages
echo "--> [1/5] Updating system packages & installing core prerequisites..."
sudo apt-get update -y && sudo apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    jq \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https

# 2. Install Docker Engine
echo "--> [2/5] Installing Docker container runtime..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
fi

# 3. Install Kubectl and Helm
echo "--> [3/5] Installing Kubectl and Helm 3..."
if ! command -v kubectl &> /dev/null; then
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
    sudo apt-get update -y
    sudo apt-get install -y kubectl
fi

if ! command -v helm &> /dev/null; then
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# 4. Install Azure CLI
echo "--> [4/5] Installing Azure CLI..."
if ! command -v az &> /dev/null; then
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
fi

# 5. Install Actions Runner Controller (ARC) Helm Chart
echo "--> [5/5] Deploying Actions Runner Controller (ARC) to AKS..."
helm repo add actions-runner-controller https://actions-runner-controller.github.io/actions-runner-controller || true
helm repo update

echo "=================================================================="
echo ">>> Master Node Provisioning Completed Successfully! <<<"
echo "You can now connect runner worker nodes using ./generate-runner-token.sh"
echo "=================================================================="

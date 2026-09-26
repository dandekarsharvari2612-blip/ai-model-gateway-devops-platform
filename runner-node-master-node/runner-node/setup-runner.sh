#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# GITHUB ACTIONS SELF-HOSTED RUNNER WORKER NODE SETUP SCRIPT
# Installs runtime, downloads actions-runner binary, registers, and starts systemd service
# ==============================================================================

REPO_URL="${1:-https://github.com/my-org/April-End-End-Project}"
RUNNER_TOKEN="${2:-}"
RUNNER_NAME="${RUNNER_NAME:-runner-worker-$(hostname)}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,aks-runner,master-node,linux,x64}"
RUNNER_DIR="/opt/actions-runner"
RUNNER_VERSION="2.317.0"

if [ -z "$RUNNER_TOKEN" ]; then
    echo "ERROR: Runner registration token is required."
    echo "Usage: sudo ./setup-runner.sh <repo_url> <runner_token>"
    exit 1
fi

echo "=================================================================="
echo ">>> Setting up GitHub Actions Runner Worker: ${RUNNER_NAME} <<<"
echo "=================================================================="

# 1. Install prerequisites (Docker, Git, JQ, Kubectl, Helm)
echo "--> [1/4] Installing runner dependencies..."
sudo apt-get update -y && sudo apt-get install -y --no-install-recommends \
    curl \
    tar \
    git \
    jq \
    ca-certificates \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3 \
    python3-pip \
    docker.io

# 2. Setup Runner Directory
echo "--> [2/4] Downloading GitHub Actions runner v${RUNNER_VERSION}..."
sudo mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [ ! -f "config.sh" ]; then
    sudo curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
        https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
    sudo tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
    sudo rm -f actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
fi

# 3. Configure and Register the Runner
echo "--> [3/4] Registering runner with repository..."
sudo ./config.sh \
    --url "$REPO_URL" \
    --token "$RUNNER_TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$RUNNER_LABELS" \
    --work "_work" \
    --unattended \
    --replace

# 4. Install and Start Systemd Daemon
echo "--> [4/4] Installing and starting systemd background service..."
sudo ./svc.sh install
sudo ./svc.sh start

echo "=================================================================="
echo ">>> Runner Worker ${RUNNER_NAME} is ONLINE and LISTENING! <<<"
echo "Check status: sudo ./svc.sh status"
echo "=================================================================="

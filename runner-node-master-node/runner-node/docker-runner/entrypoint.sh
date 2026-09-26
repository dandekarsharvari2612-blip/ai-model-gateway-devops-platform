#!/usr/bin/env bash
set -e

REPO_URL="${REPO_URL:-https://github.com/my-org/April-End-End-Project}"
RUNNER_TOKEN="${RUNNER_TOKEN:-}"
RUNNER_NAME="${RUNNER_NAME:-aks-dind-runner-$(hostname)}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,aks-runner,docker-in-docker,linux,x64}"

if [ -z "$RUNNER_TOKEN" ]; then
    echo "ERROR: RUNNER_TOKEN is required."
    exit 1
fi

cleanup() {
    echo "Deregistering runner..."
    ./config.sh remove --token "${RUNNER_TOKEN}" || true
}

trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

./config.sh \
    --url "${REPO_URL}" \
    --token "${RUNNER_TOKEN}" \
    --name "${RUNNER_NAME}" \
    --labels "${RUNNER_LABELS}" \
    --work "_work" \
    --unattended \
    --replace

./run.sh &
PID=$!
wait $PID

#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# GITHUB ACTIONS RUNNER TOKEN GENERATOR SCRIPT
# Fetches registration tokens from GitHub REST API for self-hosted worker nodes
# ==============================================================================

GITHUB_OWNER="${1:-my-organization}"
GITHUB_REPO="${2:-April-End-End-Project}"
GITHUB_PAT="${GITHUB_PAT:-}"

if [ -z "$GITHUB_PAT" ]; then
    echo "ERROR: GITHUB_PAT environment variable is required to fetch registration tokens."
    echo "Usage: GITHUB_PAT='ghp_xxx' ./generate-runner-token.sh <owner> <repo>"
    exit 1
fi

echo "--> Requesting registration token for https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}..."

RESPONSE=$(curl -s -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token ${GITHUB_PAT}" \
  "https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runners/registration-token")

TOKEN=$(echo "$RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo "ERROR: Failed to retrieve runner token. Response was:"
    echo "$RESPONSE"
    exit 1
fi

echo "=================================================================="
echo ">>> RUNNER REGISTRATION TOKEN GENERATED: ${TOKEN} <<<"
echo "Valid for 1 hour. Pass this to your runner node setup script:"
echo "./setup-runner.sh https://github.com/${GITHUB_OWNER}/${GITHUB_REPO} ${TOKEN}"
echo "=================================================================="

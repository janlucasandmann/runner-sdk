#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT_ID="${PROJECT_ID:-firechatbot-a9654}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-computer-agents-platform}"
IMAGE_URI="${IMAGE_URI:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest}"
TMP_BUILD_DIR="$(mktemp -d)"
TMP_ENV_FILE="$(mktemp)"

cleanup() {
  rm -rf "${TMP_BUILD_DIR}"
  rm -f "${TMP_ENV_FILE}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"

mkdir -p "${TMP_BUILD_DIR}/repos" "${TMP_BUILD_DIR}/web/hosting"
cp -R "repos/runner-web-sdk" "${TMP_BUILD_DIR}/repos/"
cp -R "web/hosting/public" "${TMP_BUILD_DIR}/web/hosting/"

python3 - <<'PY' "${ROOT_DIR}/web/hosting/.env.production" "${TMP_ENV_FILE}"
from pathlib import Path
import json
import sys

source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
keys = [
    "AIOS_APP_ORIGIN",
    "PLATFORM_APP_ORIGIN",
    "RUNNER_UPSTREAM_ORIGIN",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "GITHUB_OAUTH_CLIENT_ID",
    "GITHUB_OAUTH_CLIENT_SECRET",
    "GITHUB_OAUTH_REDIRECT_URI",
    "GITHUB_OAUTH_REDIRECT_URL",
    "GITHUB_TOKEN_ENCRYPTION_KEY",
    "FB_SERVICE_ACCOUNT_KEY",
]
values = {
    "NODE_ENV": "production",
    "AIOS_APP_ORIGIN": "https://computer-agents.com",
    "PLATFORM_APP_ORIGIN": "https://platform.computer-agents.com",
    "RUNNER_UPSTREAM_ORIGIN": "https://api.computer-agents.com",
}

if source_path.exists():
    for line in source_path.read_text().splitlines():
        if not line or line.lstrip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if ((value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'"))):
            value = value[1:-1]
        if key in keys and value:
            values[key] = value

with output_path.open("w") as f:
    for key, value in values.items():
        f.write(f"{key}: {json.dumps(value)}\n")
PY

echo "Building platform image: ${IMAGE_URI}"
gcloud builds submit \
  --project "${PROJECT_ID}" \
  --config "repos/runner-web-sdk/examples/cloudbuild.platform.yaml" \
  --substitutions "_IMAGE_URI=${IMAGE_URI}" \
  "${TMP_BUILD_DIR}"

echo "Deploying Cloud Run service: ${SERVICE_NAME}"
gcloud run deploy "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --platform managed \
  --image "${IMAGE_URI}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --env-vars-file "${TMP_ENV_FILE}"

echo "Done."

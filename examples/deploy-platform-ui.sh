#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT_ID="${PROJECT_ID:-firechatbot-a9654}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-computer-agents-platform}"
IMAGE_URI="${IMAGE_URI:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest}"
TMP_BUILD_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${TMP_BUILD_DIR}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"

mkdir -p "${TMP_BUILD_DIR}/repos" "${TMP_BUILD_DIR}/web/hosting"
cp -R "repos/runner-web-sdk" "${TMP_BUILD_DIR}/repos/"
cp -R "web/hosting/public" "${TMP_BUILD_DIR}/web/hosting/"

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
  --set-env-vars "NODE_ENV=production,AIOS_APP_ORIGIN=https://computer-agents.com,PLATFORM_APP_ORIGIN=https://platform.computer-agents.com,RUNNER_UPSTREAM_ORIGIN=https://api.computer-agents.com"

echo "Done."

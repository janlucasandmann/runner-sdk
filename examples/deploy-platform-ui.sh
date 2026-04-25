#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT_ID="${PROJECT_ID:-firechatbot-a9654}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-computer-agents-platform}"
IMAGE_URI="${IMAGE_URI:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest}"
TMP_BUILD_DIR="$(mktemp -d)"
TMP_ENV_FILE="$(mktemp)"
TMP_SOURCE_ARCHIVE="$(mktemp -t platform-source.XXXXXX).tar.gz"
SOURCE_ARCHIVE_NAME="${SERVICE_NAME}-$(date +%Y%m%d%H%M%S).tar.gz"
SOURCE_OBJECT="gs://${PROJECT_ID}_cloudbuild/source/${SOURCE_ARCHIVE_NAME}"

cleanup() {
  rm -rf "${TMP_BUILD_DIR}"
  rm -f "${TMP_ENV_FILE}"
  rm -f "${TMP_SOURCE_ARCHIVE}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"

mkdir -p "${TMP_BUILD_DIR}/repos" "${TMP_BUILD_DIR}/web/hosting"
rsync -a --exclude ".git" --exclude "node_modules" --exclude "dist" --exclude "img" "repos/runner-web-sdk/" "${TMP_BUILD_DIR}/repos/runner-web-sdk/"
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img"
for public_file in 404.html index.html robots.txt; do
  if [[ -f "web/hosting/public/${public_file}" ]]; then
    cp "web/hosting/public/${public_file}" "${TMP_BUILD_DIR}/web/hosting/public/${public_file}"
  fi
done
for public_dir in img/05-model-provider-icons; do
  mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/$(dirname "${public_dir}")"
  rsync -a "web/hosting/public/${public_dir}/" "${TMP_BUILD_DIR}/web/hosting/public/${public_dir}/"
done
for public_file in \
  img/001-docs/screen-agents.png \
  img/001-docs/screen-environments.png \
  img/001-docs/screen-projects.png \
  img/001-docs/screen-skills.png \
  img/002-hero/inside-rocket.jpg \
  img/04-skills/gitlab.svg \
  img/bg/bg-abstract.avif \
  img/bg/blend.avif \
  img/bg/clouds.jpeg \
  img/bg/dune.avif \
  img/bg/moon.avif \
  img/bg/mountain.avif \
  img/bg/newdesert.avif \
  img/bg/road.avif \
  img/bg/water.avif \
  img/logos/agentsappicon.png \
  img/logos/apple-touch-icon.png \
  img/logos/browsericon.png \
  img/logos/discord.svg \
  img/logos/envappicon.png \
  img/logos/favicon-16x16.png \
  img/logos/favicon-32x32.png \
  img/logos/filesicon.png \
  img/logos/folder.png \
  img/logos/mailicon.webp \
  img/logos/maxicon.png \
  img/logos/proicon.png \
  img/logos/scaleicon.png \
  img/logos/settingsicon.png \
  img/logos/skillsicon.webp \
  img/logos/telegram.svg \
  img/logos/terminalicon.png \
  img/logos/txtfile.png; do
  mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/$(dirname "${public_file}")"
  cp "web/hosting/public/${public_file}" "${TMP_BUILD_DIR}/web/hosting/public/${public_file}"
done
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img/agent-profile-pics"
for public_file in \
  assistantastro-1.webp \
  blueastro.webp \
  devastro.webp \
  orangeastro.webp \
  researchastro.webp \
  starbg.jpeg \
  suitastro.webp; do
  cp "repos/runner-web-sdk/img/agent-profile-pics/${public_file}" "${TMP_BUILD_DIR}/web/hosting/public/img/agent-profile-pics/${public_file}"
done

cat > "${TMP_BUILD_DIR}/.gcloudignore" <<'EOF'
.gcloudignore
**/.git
**/.git/**
**/node_modules
**/node_modules/**
repos/runner-web-sdk/dist
repos/runner-web-sdk/dist/**
EOF

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
tar -czf "${TMP_SOURCE_ARCHIVE}" -C "${TMP_BUILD_DIR}" .
ACCESS_TOKEN="$(gcloud auth print-access-token --project "${PROJECT_ID}")"
SOURCE_SIZE="$(wc -c < "${TMP_SOURCE_ARCHIVE}" | tr -d '[:space:]')"
UPLOAD_HEADERS="$(mktemp)"
UPLOAD_RESPONSE="$(mktemp)"
CHUNK_FILE="$(mktemp -t platform-source-chunk.XXXXXX)"
trap 'rm -rf "${TMP_BUILD_DIR}"; rm -f "${TMP_ENV_FILE}" "${TMP_SOURCE_ARCHIVE}" "${UPLOAD_HEADERS:-}" "${UPLOAD_RESPONSE:-}" "${CHUNK_FILE:-}"' EXIT
curl --fail --show-error --silent --ipv4 \
  --request POST \
  --dump-header "${UPLOAD_HEADERS}" \
  --output "${UPLOAD_RESPONSE}" \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header "Content-Type: application/json; charset=UTF-8" \
  --header "X-Upload-Content-Type: application/gzip" \
  --header "X-Upload-Content-Length: ${SOURCE_SIZE}" \
  --data "{\"name\":\"source/${SOURCE_ARCHIVE_NAME}\"}" \
  "https://storage.googleapis.com/upload/storage/v1/b/${PROJECT_ID}_cloudbuild/o?uploadType=resumable"
UPLOAD_URL="$(awk '{key=tolower($1); if (key == "location:") {gsub(/\r/, ""); print $2}}' "${UPLOAD_HEADERS}" | tail -n 1)"
if [[ -z "${UPLOAD_URL}" ]]; then
  echo "Failed to start Cloud Storage resumable upload." >&2
  cat "${UPLOAD_RESPONSE}" >&2
  exit 1
fi

CHUNK_SIZE=$((256 * 1024))
OFFSET=0
CHUNK_INDEX=0
echo "Uploading platform source archive in 256 KiB chunks (${SOURCE_SIZE} bytes)..."
while [[ "${OFFSET}" -lt "${SOURCE_SIZE}" ]]; do
  REMAINING=$((SOURCE_SIZE - OFFSET))
  CURRENT_CHUNK_SIZE="${CHUNK_SIZE}"
  if [[ "${REMAINING}" -lt "${CURRENT_CHUNK_SIZE}" ]]; then
    CURRENT_CHUNK_SIZE="${REMAINING}"
  fi
  END=$((OFFSET + CURRENT_CHUNK_SIZE - 1))
  dd if="${TMP_SOURCE_ARCHIVE}" of="${CHUNK_FILE}" bs="${CHUNK_SIZE}" skip="${CHUNK_INDEX}" count=1 status=none
  HTTP_CODE="$(curl --show-error --silent --ipv4 \
    --retry 10 --retry-delay 1 --retry-all-errors \
    --speed-limit 512 --speed-time 20 \
    --request PUT \
    --output "${UPLOAD_RESPONSE}" \
    --write-out "%{http_code}" \
    --header "Content-Length: ${CURRENT_CHUNK_SIZE}" \
    --header "Content-Range: bytes ${OFFSET}-${END}/${SOURCE_SIZE}" \
    --upload-file "${CHUNK_FILE}" \
    "${UPLOAD_URL}")"
  if [[ "${HTTP_CODE}" != "308" && "${HTTP_CODE}" != "200" && "${HTTP_CODE}" != "201" ]]; then
    echo "Cloud Storage chunk upload failed with HTTP ${HTTP_CODE}." >&2
    cat "${UPLOAD_RESPONSE}" >&2
    exit 1
  fi
  OFFSET=$((OFFSET + CURRENT_CHUNK_SIZE))
  CHUNK_INDEX=$((CHUNK_INDEX + 1))
  printf "."
done
echo
gcloud builds submit \
  --project "${PROJECT_ID}" \
  --config "repos/runner-web-sdk/examples/cloudbuild.platform.yaml" \
  --substitutions "_IMAGE_URI=${IMAGE_URI}" \
  "${SOURCE_OBJECT}"

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

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT_ID="${PROJECT_ID:-firechatbot-a9654}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-computer-agents-platform}"
IMAGE_URI="${IMAGE_URI:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest}"
CLOUDBUILD_SUBMIT_VIA_VM="${CLOUDBUILD_SUBMIT_VIA_VM:-0}"
TMP_BUILD_DIR="$(mktemp -d)"
TMP_ENV_FILE="$(mktemp)"
TMP_SOURCE_ARCHIVE="$(mktemp -t platform-source.XXXXXX).tar.gz"
SOURCE_ARCHIVE_NAME="${SERVICE_NAME}-$(date +%Y%m%d%H%M%S).tar.gz"

cleanup() {
  rm -rf "${TMP_BUILD_DIR}"
  rm -f "${TMP_ENV_FILE}"
  rm -f "${TMP_SOURCE_ARCHIVE}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"
source "${ROOT_DIR}/web/deploy-helpers.sh"

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
COPYFILE_DISABLE=1 tar -czf "${TMP_SOURCE_ARCHIVE}" -C "${TMP_BUILD_DIR}" .
SOURCE_SIZE="$(wc -c < "${TMP_SOURCE_ARCHIVE}" | tr -d '[:space:]')"
if [[ "${CLOUDBUILD_SUBMIT_VIA_VM:-0}" == "1" ]]; then
  BUILD_SUBMIT_VM_NAME="${BUILD_SUBMIT_VM_NAME:-testbase-mig-d25h}"
  BUILD_SUBMIT_VM_ZONE="${BUILD_SUBMIT_VM_ZONE:-us-central1-a}"
  REMOTE_ARCHIVE="/tmp/${SOURCE_ARCHIVE_NAME}"
  REMOTE_SOURCE_DIR="/tmp/${SERVICE_NAME}-source-${SOURCE_ARCHIVE_NAME%.tar.gz}"

  echo "Submitting platform build from ${BUILD_SUBMIT_VM_NAME} (${SOURCE_SIZE} bytes)..."
  deploy_stream_file_to_vm "${PROJECT_ID}" "${BUILD_SUBMIT_VM_ZONE}" "${BUILD_SUBMIT_VM_NAME}" "${TMP_SOURCE_ARCHIVE}" "${REMOTE_ARCHIVE}" "platform source archive"
  gcloud compute ssh "${BUILD_SUBMIT_VM_NAME}" \
    --project "${PROJECT_ID}" \
    --zone "${BUILD_SUBMIT_VM_ZONE}" \
    --quiet \
    --command="
      set -e
      trap 'rm -rf \"${REMOTE_SOURCE_DIR}\" \"${REMOTE_ARCHIVE}\"' EXIT
      rm -rf '${REMOTE_SOURCE_DIR}'
      mkdir -p '${REMOTE_SOURCE_DIR}'
      tar -xzf '${REMOTE_ARCHIVE}' -C '${REMOTE_SOURCE_DIR}'
      cd '${REMOTE_SOURCE_DIR}'
      gcloud builds submit --project '${PROJECT_ID}' --config 'repos/runner-web-sdk/examples/cloudbuild.platform.yaml' --substitutions '_IMAGE_URI=${IMAGE_URI}' .
    "
else
  echo "Submitting platform build locally (${SOURCE_SIZE} bytes)..."
  deploy_gcloud_build_submit "${PROJECT_ID}" "${TMP_BUILD_DIR}" "repos/runner-web-sdk/examples/cloudbuild.platform.yaml" "_IMAGE_URI=${IMAGE_URI}" "platform"
fi

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

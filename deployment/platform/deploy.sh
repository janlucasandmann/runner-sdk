#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PROJECT_ID="${PROJECT_ID:-firechatbot-a9654}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${SERVICE_NAME:-computer-agents-platform}"
DEPLOYMENT_STAGE="${DEPLOYMENT_STAGE:-prod}"
DEPLOY_ACTION="${DEPLOY_ACTION:-all}"
RELEASE_ID="${RELEASE_ID:-$(git -C "${ROOT_DIR}/repos/runner-web-sdk" rev-parse --short=12 HEAD)}"
SAFE_RELEASE_ID="$(printf '%s' "${RELEASE_ID}" | tr -cs 'A-Za-z0-9_.-' '-')"
RELEASE_LABEL="$(printf '%s' "${SAFE_RELEASE_ID}" | tr '[:upper:].' '[:lower:]-' | cut -c1-63)"
IMAGE_URI="${IMAGE_URI:-gcr.io/${PROJECT_ID}/${SERVICE_NAME}:${SAFE_RELEASE_ID}}"
DEPLOY_IMAGE_URI="${DEPLOY_IMAGE_URI:-}"
RELEASE_OUTPUT_FILE="${RELEASE_OUTPUT_FILE:-}"
HARDENED_DEPLOYMENT="${HARDENED_DEPLOYMENT:-0}"
CLOUD_RUN_SECRET_BINDINGS="${CLOUD_RUN_SECRET_BINDINGS:-}"
CLOUD_RUN_SERVICE_ACCOUNT="${CLOUD_RUN_SERVICE_ACCOUNT:-}"
CONNECTOR_TOKEN_ENCRYPTION_KEY_SECRET_NAME="${CONNECTOR_TOKEN_ENCRYPTION_KEY_SECRET_NAME:-connector-token-encryption-key}"
PLATFORM_MIN_INSTANCES="${PLATFORM_MIN_INSTANCES:-1}"
PLATFORM_CPU_ALWAYS_ALLOCATED="${PLATFORM_CPU_ALWAYS_ALLOCATED:-1}"
APP_ORIGIN="${APP_ORIGIN:-https://computer-agents.com}"
PLATFORM_ORIGIN="${PLATFORM_ORIGIN:-https://platform.computer-agents.com}"
API_ORIGIN="${API_ORIGIN:-https://api.computer-agents.com}"
STOCKIFI_ORIGIN="${STOCKIFI_ORIGIN:-}"
LEMONSQUEEZY_MODE="${LEMONSQUEEZY_MODE:-$([[ "${DEPLOYMENT_STAGE}" == "prod" ]] && echo production || echo test)}"
if [[ -n "${RUNTIME_ENV_SOURCE:-}" ]]; then
  STAGE_ENV_SOURCE="${RUNTIME_ENV_SOURCE}"
elif [[ "${HARDENED_DEPLOYMENT}" == "1" ]]; then
  STAGE_ENV_SOURCE="${ROOT_DIR}/web/hosting/.env.${DEPLOYMENT_STAGE}"
elif [[ "${DEPLOYMENT_STAGE}" == "prod" ]]; then
  STAGE_ENV_SOURCE="${ROOT_DIR}/web/hosting/.env.production"
else
  STAGE_ENV_SOURCE="${ROOT_DIR}/web/hosting/.env.${DEPLOYMENT_STAGE}"
fi
CLOUDBUILD_SUBMIT_VIA_VM="${CLOUDBUILD_SUBMIT_VIA_VM:-0}"
CLOUDBUILD_STAGE_VIA_VM="${CLOUDBUILD_STAGE_VIA_VM:-0}"
CLOUD_BUILD_SOURCE_URI="${CLOUD_BUILD_SOURCE_URI:-}"
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

if [[ "${HARDENED_DEPLOYMENT}" == "1" ]]; then
  deploy_assert_stage_env_safe "${STAGE_ENV_SOURCE}"
  if [[ "${DEPLOY_ACTION}" != "build" && -z "${CLOUD_RUN_SECRET_BINDINGS}" ]]; then
    echo "PLATFORM_SECRET_BINDINGS is required for hardened platform deployment." >&2
    exit 1
  fi
  if [[ "${DEPLOY_ACTION}" != "build" && -z "${CLOUD_RUN_SERVICE_ACCOUNT}" ]]; then
    echo "PLATFORM_RUNTIME_SERVICE_ACCOUNT is required for hardened platform deployment." >&2
    exit 1
  fi
fi

mkdir -p "${TMP_BUILD_DIR}/repos" "${TMP_BUILD_DIR}/web/hosting"
rsync -a --exclude ".git" --exclude "node_modules" --exclude "dist" --exclude "img" "repos/runner-web-sdk/" "${TMP_BUILD_DIR}/repos/runner-web-sdk/"
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img"
for public_file in 404.html index.html robots.txt; do
  if [[ -f "web/hosting/public/${public_file}" ]]; then
    cp "web/hosting/public/${public_file}" "${TMP_BUILD_DIR}/web/hosting/public/${public_file}"
  fi
done
for public_dir in img/05-model-provider-icons img/logos/aios-presentation; do
  mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/$(dirname "${public_dir}")"
  rsync -a "web/hosting/public/${public_dir}/" "${TMP_BUILD_DIR}/web/hosting/public/${public_dir}/"
done
for public_file in \
  img/001-docs/screen-agents.png \
  img/001-docs/screen-environments.png \
  img/001-docs/screen-projects.png \
  img/001-docs/screen-skills.png \
  img/001-docs/thread.jpg \
  img/001-docs/computer.jpg \
  img/001-docs/projects.jpg \
  img/001-docs/server-function.webp \
  img/002-hero/inside-rocket.jpg \
  img/002-hero/projectsheader.webp \
  img/04-skills/gitlab.svg \
  img/bg/bg-abstract.avif \
  img/bg/blend.avif \
  img/bg/clouds.jpeg \
  img/bg/desert.avif \
  img/bg/dune.avif \
  img/bg/forest.avif \
  img/bg/macapp.mp4 \
  img/bg/macapp-poster.jpg \
  img/bg/moon.avif \
  img/bg/mountain.avif \
  img/bg/newdesert.avif \
  img/bg/road.avif \
  img/bg/water.avif \
  img/010-svgs/animated_cube_layer.svg \
  img/logos/agentsappicon.png \
  img/logos/apple-touch-icon.png \
  img/logos/browsericon.png \
  img/logos/calogonew.webp \
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
  if [[ -f "web/hosting/public/${public_file}" ]]; then
    cp "web/hosting/public/${public_file}" "${TMP_BUILD_DIR}/web/hosting/public/${public_file}"
  else
    echo "Warning: optional platform asset missing: web/hosting/public/${public_file}" >&2
  fi
done
cp "repos/runner-web-sdk/img/camark.svg" "${TMP_BUILD_DIR}/web/hosting/public/img/camark.svg"
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img/agent-profile-pics"
for public_file in \
  assistantastro-1.webp \
  blueastro.webp \
  devastro.webp \
  foundry.webp \
  forge.webp \
  orangeastro.webp \
  researchastro.webp \
  spark.webp \
  starbg.jpeg \
  suitastro.webp; do
  cp "repos/runner-web-sdk/img/agent-profile-pics/${public_file}" "${TMP_BUILD_DIR}/web/hosting/public/img/agent-profile-pics/${public_file}"
done
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img/empty-state"
rsync -a "repos/runner-web-sdk/img/empty-state/" "${TMP_BUILD_DIR}/web/hosting/public/img/empty-state/"
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img/imagine"
rsync -a "repos/runner-web-sdk/img/imagine/" "${TMP_BUILD_DIR}/web/hosting/public/img/imagine/"
mkdir -p "${TMP_BUILD_DIR}/web/hosting/public/img/plugins"
rsync -a --exclude ".DS_Store" "repos/runner-web-sdk/img/plugins/" "${TMP_BUILD_DIR}/web/hosting/public/img/plugins/"

cat > "${TMP_BUILD_DIR}/.gcloudignore" <<'EOF'
.gcloudignore
**/.git
**/.git/**
**/node_modules
**/node_modules/**
repos/runner-web-sdk/dist
repos/runner-web-sdk/dist/**
EOF

python3 - <<'PY' "${STAGE_ENV_SOURCE}" "${TMP_ENV_FILE}" "${DEPLOYMENT_STAGE}" "${APP_ORIGIN}" "${PLATFORM_ORIGIN}" "${API_ORIGIN}" "${LEMONSQUEEZY_MODE}" "${STOCKIFI_ORIGIN}"
from pathlib import Path
import json
import sys

source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
deployment_stage, app_origin, platform_origin, api_origin, lemonsqueezy_mode, stockifi_origin = sys.argv[3:]
keys = [
    "AIOS_APP_ORIGIN",
    "PLATFORM_APP_ORIGIN",
    "PLATFORM_STOCKIFI_ORIGIN",
    "RUNNER_UPSTREAM_ORIGIN",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "PLATFORM_ADMIN_EMAIL",
    "FIREBASE_REST_API_KEY",
    "ENABLE_EXECUTION_DISPATCHER",
    "EXECUTION_DISPATCH_CONTROL_ORIGIN",
    "EXECUTION_DISPATCH_WORKER_ID",
    "EXECUTION_DISPATCH_POLL_INTERVAL_MS",
    "EXECUTION_DISPATCH_HEARTBEAT_INTERVAL_MS",
    "EXECUTION_DISPATCH_LEASE_TTL_MS",
    "EXECUTION_DISPATCH_BATCH_SIZE",
    "EXECUTION_DISPATCH_MAX_CONCURRENCY",
    "PLATFORM_PRINCIPAL_ASSERTION_AUDIENCE",
    "PLATFORM_PRINCIPAL_ASSERTION_ISSUER",
    "ADMIN_API_KEY",
    "CONTACT_SALES_API_TOKEN",
    "CONNECTOR_OAUTH_ALLOWED_ORIGINS",
    "CONNECTOR_MCP_ORIGIN",
    "CONNECTOR_RUNTIME_SIGNING_KEY",
    "CONNECTOR_TOKEN_ENCRYPTION_KEY",
    "PLATFORM_CONTROL_PLANE_SECRET",
    "GITHUB_OAUTH_CLIENT_ID",
    "GITHUB_OAUTH_CLIENT_SECRET",
    "GITHUB_OAUTH_ALLOWED_ORIGINS",
    "GITHUB_OAUTH_REDIRECT_URI",
    "GITHUB_OAUTH_REDIRECT_URL",
    "GITHUB_TOKEN_ENCRYPTION_KEY",
    "ATLASSIAN_OAUTH_CLIENT_ID",
    "ATLASSIAN_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_OAUTH_REDIRECT_URI",
    "ATLASSIAN_OAUTH_REDIRECT_URL",
    "ATLASSIAN_CLIENT_ID",
    "ATLASSIAN_CLIENT_SECRET",
    "JIRA_OAUTH_CLIENT_ID",
    "JIRA_OAUTH_CLIENT_SECRET",
    "JIRA_OAUTH_REDIRECT_URI",
    "JIRA_OAUTH_REDIRECT_URL",
    "JIRA_TOKEN_ENCRYPTION_KEY",
    "DROPBOX_OAUTH_CLIENT_ID",
    "DROPBOX_OAUTH_CLIENT_SECRET",
    "DROPBOX_OAUTH_CALLBACK_URL",
    "DROPBOX_TOKEN_ENCRYPTION_KEY",
    "ASANA_OAUTH_CLIENT_ID",
    "ASANA_OAUTH_CLIENT_SECRET",
    "ASANA_OAUTH_CALLBACK_URL",
    "ASANA_TOKEN_ENCRYPTION_KEY",
    "BOX_OAUTH_CLIENT_ID",
    "BOX_OAUTH_CLIENT_SECRET",
    "BOX_OAUTH_CALLBACK_URL",
    "BOX_TOKEN_ENCRYPTION_KEY",
    "FIGMA_OAUTH_CLIENT_ID",
    "FIGMA_OAUTH_CLIENT_SECRET",
    "FIGMA_OAUTH_CALLBACK_URL",
    "FIGMA_TOKEN_ENCRYPTION_KEY",
    "LINEAR_OAUTH_CLIENT_ID",
    "LINEAR_OAUTH_CLIENT_SECRET",
    "LINEAR_OAUTH_CALLBACK_URL",
    "LINEAR_TOKEN_ENCRYPTION_KEY",
    "MICROSOFT_CONNECTOR_CLIENT_ID",
    "MICROSOFT_CONNECTOR_CLIENT_SECRET",
    "MICROSOFT_TEAMS_OAUTH_CALLBACK_URL",
    "MICROSOFT_TEAMS_TOKEN_ENCRYPTION_KEY",
    "OUTLOOK_OAUTH_CALLBACK_URL",
    "OUTLOOK_TOKEN_ENCRYPTION_KEY",
    "OUTLOOK_CALENDAR_OAUTH_CALLBACK_URL",
    "OUTLOOK_CALENDAR_TOKEN_ENCRYPTION_KEY",
    "SLACK_OAUTH_CLIENT_ID",
    "SLACK_OAUTH_CLIENT_SECRET",
    "SLACK_OAUTH_CALLBACK_URL",
    "SLACK_TOKEN_ENCRYPTION_KEY",
    "BIGQUERY_TOKEN_ENCRYPTION_KEY",
    "FB_SERVICE_ACCOUNT_KEY",
]
values = {
    "NODE_ENV": "production",
    "DEPLOYMENT_STAGE": deployment_stage,
    "DEPLOYMENT_PROFILE_ID": "cloud-saas-v1",
    "DEPLOYMENT_TOPOLOGY": "gcp_saas",
    "LEMONSQUEEZY_MODE": lemonsqueezy_mode,
    "AIOS_APP_ORIGIN": app_origin,
    "PLATFORM_APP_ORIGIN": platform_origin,
    "RUNNER_UPSTREAM_ORIGIN": api_origin,
    "CONNECTOR_MCP_ORIGIN": platform_origin,
    "ATLASSIAN_OAUTH_REDIRECT_URI": f"{platform_origin.rstrip('/')}/api/jira/callback",
    "DROPBOX_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/dropbox/callback",
    "ASANA_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/asana/callback",
    "BOX_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/box/callback",
    "FIGMA_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/figma/callback",
    "LINEAR_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/linear/callback",
    "MICROSOFT_TEAMS_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/microsoft-teams/callback",
    "OUTLOOK_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/outlook/callback",
    "OUTLOOK_CALENDAR_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/outlook-calendar/callback",
    "SLACK_OAUTH_CALLBACK_URL": f"{platform_origin.rstrip('/')}/api/aios/connectors/slack/callback",
}
if stockifi_origin:
    values["PLATFORM_STOCKIFI_ORIGIN"] = stockifi_origin

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

if [[ "${DEPLOY_ACTION}" != "deploy" ]]; then
  echo "Building platform image: ${IMAGE_URI}"
  COPYFILE_DISABLE=1 tar -czf "${TMP_SOURCE_ARCHIVE}" -C "${TMP_BUILD_DIR}" .
  SOURCE_SIZE="$(wc -c < "${TMP_SOURCE_ARCHIVE}" | tr -d '[:space:]')"
fi
if [[ "${DEPLOY_ACTION}" != "deploy" && "${CLOUDBUILD_STAGE_VIA_VM}" == "1" ]]; then
  if [[ ! "${CLOUD_BUILD_SOURCE_URI}" =~ ^gs://[^/]+/.+\.(tar\.gz|tgz|zip)$ ]]; then
    echo "CLOUD_BUILD_SOURCE_URI must be an explicit gs:// archive when CLOUDBUILD_STAGE_VIA_VM=1." >&2
    exit 1
  fi
  BUILD_SUBMIT_VM_NAME="${BUILD_SUBMIT_VM_NAME:-testbase-mig-d25h}"
  BUILD_SUBMIT_VM_ZONE="${BUILD_SUBMIT_VM_ZONE:-us-central1-a}"
  REMOTE_ARCHIVE="/tmp/${SOURCE_ARCHIVE_NAME}"

  echo "Staging platform build source through ${BUILD_SUBMIT_VM_NAME} (${SOURCE_SIZE} bytes)..."
  deploy_stream_file_to_vm "${PROJECT_ID}" "${BUILD_SUBMIT_VM_ZONE}" "${BUILD_SUBMIT_VM_NAME}" "${TMP_SOURCE_ARCHIVE}" "${REMOTE_ARCHIVE}" "platform source archive"
  gcloud compute ssh "${BUILD_SUBMIT_VM_NAME}" \
    --project "${PROJECT_ID}" \
    --zone "${BUILD_SUBMIT_VM_ZONE}" \
    --quiet \
    --command="
      set -e
      trap 'rm -f \"${REMOTE_ARCHIVE}\"' EXIT
      gcloud storage cp \
        --if-generation-match=0 \
        '${REMOTE_ARCHIVE}' \
        '${CLOUD_BUILD_SOURCE_URI}'
    "
  echo "Submitting platform Cloud Build from immutable source: ${CLOUD_BUILD_SOURCE_URI}"
  gcloud builds submit \
    --project "${PROJECT_ID}" \
    --config "${ROOT_DIR}/repos/runner-web-sdk/deployment/platform/cloudbuild.yaml" \
    --substitutions "_IMAGE_URI=${IMAGE_URI}" \
    "${CLOUD_BUILD_SOURCE_URI}"
elif [[ "${DEPLOY_ACTION}" != "deploy" && "${CLOUDBUILD_SUBMIT_VIA_VM:-0}" == "1" ]]; then
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
      gcloud builds submit --project '${PROJECT_ID}' --config 'repos/runner-web-sdk/deployment/platform/cloudbuild.yaml' --substitutions '_IMAGE_URI=${IMAGE_URI}' .
    "
elif [[ "${DEPLOY_ACTION}" != "deploy" ]]; then
  echo "Submitting platform build locally (${SOURCE_SIZE} bytes)..."
  deploy_gcloud_build_submit "${PROJECT_ID}" "${TMP_BUILD_DIR}" "repos/runner-web-sdk/deployment/platform/cloudbuild.yaml" "_IMAGE_URI=${IMAGE_URI}" "platform"
fi

if [[ -z "${DEPLOY_IMAGE_URI}" ]]; then
  DEPLOY_IMAGE_URI="$(deploy_resolve_image_digest "${PROJECT_ID}" "${IMAGE_URI}")"
fi
echo "Immutable platform image: ${DEPLOY_IMAGE_URI}"
if [[ -n "${RELEASE_OUTPUT_FILE}" ]]; then
  printf 'PLATFORM_DEPLOY_IMAGE=%s\n' "${DEPLOY_IMAGE_URI}" > "${RELEASE_OUTPUT_FILE}"
fi
if [[ "${DEPLOY_ACTION}" == "build" ]]; then
  exit 0
fi
if [[ ! "${DEPLOY_IMAGE_URI}" =~ @sha256:[a-f0-9]{64}$ ]]; then
  echo "Refusing mutable deploy image: ${DEPLOY_IMAGE_URI}" >&2
  exit 1
fi

if [[ "${DEPLOYMENT_STAGE}" == "prod" ]]; then
  # Connector credentials are encrypted once and must remain decryptable by
  # every production revision. Bind the canonical Secret Manager value on
  # every production rollout instead of relying on a local env file.
  gcloud secrets describe "${CONNECTOR_TOKEN_ENCRYPTION_KEY_SECRET_NAME}" \
    --project "${PROJECT_ID}" \
    --format='value(name)' >/dev/null
  connector_secret_binding="CONNECTOR_TOKEN_ENCRYPTION_KEY=${CONNECTOR_TOKEN_ENCRYPTION_KEY_SECRET_NAME}:latest"
  if [[ -n "${CLOUD_RUN_SECRET_BINDINGS}" ]]; then
    CLOUD_RUN_SECRET_BINDINGS="${CLOUD_RUN_SECRET_BINDINGS},${connector_secret_binding}"
  else
    CLOUD_RUN_SECRET_BINDINGS="${connector_secret_binding}"
  fi
fi

echo "Deploying Cloud Run service: ${SERVICE_NAME}"
DEPLOY_ARGS=(
  gcloud run deploy "${SERVICE_NAME}"
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --platform managed \
  --image "${DEPLOY_IMAGE_URI}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances "${PLATFORM_MIN_INSTANCES}" \
  --labels "deployment-stage=${DEPLOYMENT_STAGE},release-id=${RELEASE_LABEL}" \
  --env-vars-file "${TMP_ENV_FILE}"
)
if [[ "${PLATFORM_CPU_ALWAYS_ALLOCATED}" == "1" ]]; then
  DEPLOY_ARGS+=(--no-cpu-throttling)
else
  DEPLOY_ARGS+=(--cpu-throttling)
fi
if [[ -n "${CLOUD_RUN_SECRET_BINDINGS}" ]]; then
  DEPLOY_ARGS+=(--set-secrets "${CLOUD_RUN_SECRET_BINDINGS}")
fi
if [[ -n "${CLOUD_RUN_SERVICE_ACCOUNT}" ]]; then
  DEPLOY_ARGS+=(--service-account "${CLOUD_RUN_SERVICE_ACCOUNT}")
fi
"${DEPLOY_ARGS[@]}"

gcloud run services update-traffic "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --to-latest \
  --quiet

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format='value(status.url)')"
deploy_verify_http_service "${SERVICE_URL}" "platform ${DEPLOYMENT_STAGE}"

echo "Done."

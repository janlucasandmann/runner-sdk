# Runtime configuration

Use `.env.example` as the canonical variable inventory. The platform reads
process environment variables; it does not implicitly load a root `.env` file.
Export variables in the shell, inject them through the service runtime, or use
the deployment secret/configuration mechanism.

## Local defaults

`npm run dev` starts the platform API at `http://localhost:4177` and Vite at
`http://localhost:5173`. The HMR origin inherits the platform hostname so
local authentication cookies never cross from `localhost` to `127.0.0.1`.
`PLATFORM_API_PORT` and `PLATFORM_VITE_PORT` override those ports.
Only the API origin is an application URL. Vite serves source modules and Fast
Refresh; HTML navigation to its port redirects to the platform application.

The historical monorepo layout is still used as a compatibility fallback for
landing-page assets and system skills. Standalone checkouts should set:

- `AIOS_HOSTING_ROOT`;
- `COMPUTER_AGENTS_CLOUD_INFRASTRUCTURE_ROOT`, or
  `PLATFORM_SYSTEM_SKILLS_ROOT`;
- `PLATFORM_RUNTIME_ENV_FILES` when runtime secrets must be read from existing
  files. Separate multiple absolute paths with the operating system path
  delimiter.

## Restricted operations

Operational summary pages fail closed when `PLATFORM_ADMIN_EMAIL` is empty.
Set it explicitly for environments that expose those pages. Firebase identity
lookup also requires `FIREBASE_REST_API_KEY` or
`NEXT_PUBLIC_FIREBASE_API_KEY`; there is no source-code credential fallback.

The deployment-VM fallback is optional. Configure `GCLOUD_BIN` when `gcloud`
is not on `PATH`, and set the target project/name variables explicitly.

## OAuth

GitHub OAuth requires a client ID, client secret, redirect URI, and a
32-byte/base64 token-encryption key. Restrict callback origins with
`GITHUB_OAUTH_ALLOWED_ORIGINS`.

Never use wildcard production origins, commit OAuth secrets, or share one token
encryption key across unrelated environments.

## Deployment

`deployment/platform/deploy.sh` builds an explicit environment file from the
deployment source configuration. Review the resulting target project, service,
region, origins, admin identity, and OAuth values before deploying. Running a
build or test command never deploys or restarts production.

<!-- platform-directory-guide:v1 -->

# Platform container deployment

## Purpose

This directory defines the production platform container, Cloud Build job, and explicit deployment script.

## Contents

- [`cloudbuild.yaml`](cloudbuild.yaml) — Declarative configuration for Cloudbuild.
- [`deploy.sh`](deploy.sh) — Operational script for Deploy.
- [`Dockerfile`](Dockerfile) — Container image definition.

## Deployment workflow

`Dockerfile` builds the production platform host and immutable frontend assets.
`cloudbuild.yaml` defines the hosted image build. `deploy.sh` is the explicit
operator entry point and assembles a reviewed environment file before invoking
the cloud deployment.

Builds and tests never deploy automatically. Before running `deploy.sh`, review
the target project, service, region, application and upstream origins, identity
provider, administrator allowlist, OAuth settings, and injected secret names.
Use the workspace appliance installer for on-prem hosts; do not fork platform
application code into a second deployment implementation.

## Working in this directory

Keep build inputs reproducible and deployment mutations explicit. Never commit
rendered environment files or secret values. Update runtime configuration
documentation whenever the container contract changes.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run build
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

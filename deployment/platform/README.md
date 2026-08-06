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

The hosted platform also owns the durable execution dispatcher. The deployment
therefore keeps at least one instance warm and disables request-scoped CPU
throttling by default, so queue polling and lease heartbeats continue when no
browser request is active. Override `PLATFORM_MIN_INSTANCES` or set
`PLATFORM_CPU_ALWAYS_ALLOCATED=0` only when the dispatcher is disabled or moved
to a dedicated worker service.

### Runtime-only incident overlays

[`Dockerfile.runtime-overlay`](Dockerfile.runtime-overlay) and
[`cloudbuild-runtime-overlay.yaml`](cloudbuild-runtime-overlay.yaml) provide a
narrow recovery path for the durable dispatcher. They layer only the reviewed
dispatcher runtime modules onto an exact immutable platform image. This avoids
silently including unrelated worktree changes during an urgent worker fix.

Use this path only after the dispatcher tests pass. Pin `_BASE_IMAGE` by digest,
build a new immutable image, deploy it without traffic, verify the candidate
revision, and then promote that exact digest. A runtime overlay is a release
artifact, not a substitute for consolidating the source into the next normal
platform release.

The GitHub connector has a separate narrow overlay in
[`Dockerfile.github-connector-overlay`](Dockerfile.github-connector-overlay)
and
[`cloudbuild-github-connector-overlay.yaml`](cloudbuild-github-connector-overlay.yaml).
It layers only the GitHub adapter, its trusted capability manifest, the adapter
registry entry, and the asynchronous MCP discovery boundary onto an exact
immutable platform image. Build and deploy it with zero traffic first, verify
the tagged revision through the complete MCP lifecycle, and promote only that
verified revision. Use
[`gcloudignore.github-connector-overlay`](gcloudignore.github-connector-overlay)
as the `gcloud builds submit --ignore-file` value so unrelated workspace files
are not uploaded to the build.

### Resilient source staging

The default build path uploads the generated context directly with
`gcloud builds submit`. When that local upload path is unreliable, the same
script can stage the already-generated archive through an existing deployment
VM:

```bash
CLOUDBUILD_STAGE_VIA_VM=1 \
CLOUD_BUILD_SOURCE_URI=gs://authorized-bucket/build-sources/release-id.tar.gz \
BUILD_SUBMIT_VM_NAME=deployment-vm \
BUILD_SUBMIT_VM_ZONE=europe-west1-b \
DEPLOY_USE_IAP=1 \
./deployment/platform/deploy.sh
```

The VM writes the archive with `if-generation-match=0`, so an existing source
object cannot be overwritten. The operator identity still submits the Cloud
Build job; the VM does not require Cloud Build or Service Usage administration
permissions. Use a unique source object for every release and deploy only the
digest returned by the build.

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

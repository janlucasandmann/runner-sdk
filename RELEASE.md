# Platform release checklist

This repository is a private platform application. It is deployed as a service;
it is not published to npm.

## Preflight

1. Confirm the release commit and inspect all uncommitted changes.
2. Install exactly the locked dependency graph and run the complete gate:

```bash
npm ci
npm run check
npm audit --omit=dev --audit-level=high
```

3. Confirm production configuration is present, especially
   `PLATFORM_ADMIN_EMAIL`, Firebase identity configuration, OAuth secrets, and
   the target Google Cloud project.
4. Build and test the container in the intended staging environment.

## Deploy

Deployment is always explicit:

```bash
PROJECT_ID=<project> REGION=<region> ./deployment/platform/deploy.sh
```

Verify health, authentication, thread execution, static assets, WebSocket/VNC
upgrade behavior, and one representative page from each platform mode before
promoting traffic.

## Record

Tag the exact deployed commit when a versioned release is required:

```bash
git tag v<version>
git push origin v<version>
```

Record the image digest, service revision, configuration change, and rollback
revision in the release notes.

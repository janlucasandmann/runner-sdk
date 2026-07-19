<!-- platform-directory-guide:v1 -->

# GitHub Actions workflows

## Purpose

This directory contains the CI workflows that execute the repository's checked-in quality and build commands.

## Contents

- [`ci.yml`](ci.yml) — Declarative configuration for CI.

## Workflow contract

`ci.yml` runs for every pull request and push to `main` with read-only
repository permissions. It uses the Node version in `.nvmrc`, installs exactly
from `package-lock.json`, audits production dependencies, and runs
`npm run check`. Concurrency cancellation prevents superseded commits from
consuming a second full quality run.

Keep reusable behavior in package scripts so developers can reproduce CI
locally. Pin third-party actions to reviewed major versions or immutable
revisions, grant only the permissions a job needs, and never expose deployment
credentials to pull-request jobs.

## Working in this directory

Keep workflow YAML orchestration-only. Add a package script for substantive
logic, document its local invocation, and call that script from CI.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run docs:check
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

<!-- platform-directory-guide:v1 -->

# Repository migrations

## Purpose

This directory is reserved for explicit, reviewable repository or persisted-data migrations. Migrations must be idempotent or document their rollback and one-shot semantics.

## Contents

- `migrate-legacy-prompts-to-api.mjs` moves the former repository-level prompt
  JSON records into the selected deployment's authenticated prompt API. It is
  idempotent, reconciles partial migrations by source ID and version number,
  and deliberately leaves the explicitly supplied archive untouched for
  rollback review. Runtime prompt storage never falls back to this archive.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

To preview or execute the prompt migration, provide the API key through the
environment so it is never written to arguments or logs:

```bash
PROMPT_MIGRATION_API_KEY=... node scripts/migrations/migrate-legacy-prompts-to-api.mjs \
  --source=/secure/path/to/prompts.repo-prompt-json-v1.json \
  --origin=http://127.0.0.1:4177 --dry-run
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

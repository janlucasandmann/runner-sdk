<!-- platform-directory-guide:v1 -->

# Create mode services

## Purpose

Services surfaced in the platform's Create mode live here. Each service owns
its client/runtime behavior, server routes, integration contracts, and tests.

## Services

- [`calendar/`](calendar/) — Schedules, recurrence, event projection, and the
  Projects calendar integration.
- [`files/`](files/) — Workspace browsing, editing, previews, transfers, and
  file routes.
- [`imagine/`](imagine/) — Generative template discovery and creation flows.
- [`metronome/`](metronome/) — Workflow definition, execution, and run
  supervision.
- [`projects/`](projects/) — Projects, tasks, releases, sprints, and Mission
  Control.

Import a service through its root `index.mjs`. Cross-service behavior must use
an explicit integration adapter rather than reaching into another service's
page, shell, or runtime internals.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)

<!-- platform-directory-guide:v1 -->

# Configure mode services

## Purpose

Services surfaced in the platform's Configure mode belong in this directory.
Keep service ownership boundaries consistent with the modules under Create mode.

## Services

- [`configure-home/`](configure-home/) — Configure landing page and
  notification center.
- [`evaluations/`](evaluations/) — Evaluation sets, cases, versions, and runs.
- [`fine-tuning/`](fine-tuning/) — Fine-tuning jobs and publication workflow.
- [`tests/`](tests/) — Versioned engineering test plans, durable runs, and
  execution evidence.
- [`assurance/`](assurance/) — Versioned release policies that bind canonical
  Test, Evaluation, and Agent Optimization evidence into auditable decisions.
- [`guardrails/`](guardrails/) — Versioned guardrail policy and Agent
  integration.
- [`inference/`](inference/) — Customer-managed inference endpoints and local
  runtime presentation.
- [`marketplace/`](marketplace/) — Reusable resource-template catalog.
- [`models/`](models/) — Managed agent-model catalog.
- [`organizations/`](organizations/) — Tenancy, membership, roles, usage, and
  billing presentation.
- [`teams/`](teams/) — Team membership and shared-resource access.

Each service exposes a root `index.*` composition boundary. The platform host
supplies generic authentication and transport; Configure services own their
domain state, pages, shell integration, styles, and server adapters.

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

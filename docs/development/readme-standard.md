<!-- platform-directory-guide:v1 -->

# Directory README standard

## Purpose

Every maintained directory in the platform repository has a `README.md`. A
directory guide should let a developer answer four questions without first
reverse-engineering the implementation:

1. Why does this directory exist?
2. What does it own, and what belongs somewhere else?
3. How should its public resource, component, or module be used and changed?
4. Which focused checks demonstrate that a change is safe?

The repository uses two levels of documentation:

- **Ownership guides** describe applications, services, resources, shared UI
  components, deployment boundaries, and other public integration surfaces in
  detail.
- **Implementation guides** orient developers inside focused `client`,
  `server`, `domain`, `page`, `runtime`, `styles`, and similar subdirectories.
  They are intentionally concise and defer domain rules to their nearest
  ownership guide.

Generated output and local dependency/cache directories are excluded:
`.cache`, `.git`, `.platform-dev`, `.vite`, `.next`, `.turbo`, `node_modules`,
`dist`, `build`, `coverage`, and `.nyc_output`.

## Required structure

Every guide starts with the invisible
`<!-- platform-directory-guide:v1 -->` policy marker and one `#` title. It then
uses these common sections:

- `Purpose` states ownership and dependency direction.
- `Contents` maps important files and child directories. A detailed ownership
  guide may call this `Structure`, `Responsibilities`, or `Layout`.
- `Working in this directory` explains extension rules and likely pitfalls.
- `Verification` provides commands that run from the repository root.
- `Related documentation` links upward and to durable architecture guidance.

Existing detailed guides may retain additional sections such as `Usage`,
`Security invariants`, or `Host boundary`. Accuracy is more important than
making every guide the same length.

## Writing guidance

- Describe current behavior, not an aspirational architecture presented as
  complete.
- Name the public entry point and the layer that owns state, effects, rendering,
  styles, transport, and persistence.
- Include a short example when a component or API is not self-evident.
- Call out security, compatibility, ordering, or migration constraints where
  violating them could produce a subtle failure.
- Prefer repository-relative links and commands that can be copied directly.
- Do not repeat secrets, environment-specific values, or generated inventories.
- Update the nearest guide in the same change when moving ownership.

## Scaffolding and enforcement

Create guides for newly introduced directories and normalize existing ones:

```bash
npm run docs:readmes:write
```

The command only creates missing `README.md` files and adds missing standard
sections to existing guides. It does not overwrite their authored content.
Review every scaffold and replace generic wording with domain-specific context
before merging.

CI checks coverage, structure, and local links through:

```bash
npm run docs:check
```

## Working in this directory

Treat this standard as an engineering contract. Change it together with the
scaffolder and CI policy so written guidance and automated enforcement never
diverge.

## Verification

Run from the platform repository root:

```bash
npm run docs:check
npm run check:static
```

## Related documentation

- [Development documentation](README.md)
- [Platform architecture](../platform-architecture.md)
- [Repository guide](../../README.md)

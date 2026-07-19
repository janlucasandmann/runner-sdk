<!-- platform-directory-guide:v1 -->

# Product-mode services

## Purpose

This directory contains product services organized exactly by Create, Configure, and Develop mode.

## Contents

- [`configure-mode/`](configure-mode/) — Policy, organization, model,
  evaluation, and other administrative services.
- [`create-mode/`](create-mode/) — Task-producing Projects, Calendar, Files,
  Imagine, and Metronome services.
- [`develop-mode/`](develop-mode/) — Developer-facing resource services and
  their shared typed overview foundation.
- [`legacy-browser-source.mjs`](legacy-browser-source.mjs) — Focused implementation of Legacy Browser Source.
- [`legacy-browser-source.test.mjs`](legacy-browser-source.test.mjs) — Regression coverage for Legacy Browser Source.

## Service contract

Each service owns the smallest complete vertical slice that makes its product
surface independent:

```text
<mode>/<service>/
  client/       domain, API, page, runtime, shell, and styles as needed
  server/       service-specific route and upstream adapters
  index.*       public composition boundary
  *.test.*      service contract coverage
```

Not every service needs every layer. Typed modules are preferred. Remaining
`.mjs` script/style fragments preserve the evaluation order of the single
legacy browser program and should shrink as behavior moves into typed owners.

## Adding or extending a service

1. Put the service under the product mode in which users navigate to it.
2. Export one explicit integration surface from the service root.
3. Keep reusable resource behavior in `src/platform-resources` and
   domain-neutral presentation in `src/platform-ui`.
4. Integrate with other services through a narrow adapter directory rather than
   importing their page or shell internals.
5. Add a focused package script and service contract test when the service has
   server behavior or compatibility fragments.
6. Register typed pages through `src/platform-shell/presentation` instead of
   adding branches to a central renderer.

## Working in this directory

Treat each immediate child as an ownership boundary. Cross-mode utilities are
usually a sign that behavior belongs in a resource, runtime, shell, or UI
module. Preserve public entry points when decomposing a service, and remove
obsolete compatibility fragments rather than retaining two implementations.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run test:contracts
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

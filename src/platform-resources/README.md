<!-- platform-directory-guide:v1 -->

# Platform resources

## Purpose

`platform-resources` contains the resource domains that users and organizations work with directly on the Computer Agents platform. Examples include agents, computers, skills, plugins, and tags.

This directory sits beside `platform-ui` intentionally:

- `platform-resources` owns resource-specific repository clients, row models,
  page configuration, actions, filters, and presentation adapters.
- `platform-ui` owns resource-agnostic components and page shells such as `PlatformDataTable`, `ResourceOverviewPage`, and `ResourceDetailPage`.
- `platform-runtime` owns the generic authenticated API client and provider.
- `platform-services` owns product-service workflows, persistence orchestration,
  and service-specific backend contracts.

Resource modules may compose `platform-ui` components and pages. Generic UI code must not depend on a specific resource module.

## Structure

```text
platform-resources/
  access-control/
  agents/
  computers/
  plugins/
  skills/
  tags/
  shared/
  index.ts
```

Each resource owns a directory so overview and detail pages, adapters, tests, and future resource-specific behavior can evolve without increasing the main platform file.

`shared` is reserved for behavior that is genuinely shared by multiple resource domains. It must not become a second generic component directory; reusable UI primitives belong in `platform-ui/components`.

`access-control` owns the cross-resource principal contract and canonical
Manage Access composition. Resource modules must use its immutable system
principals instead of defining local `All Agents` or organization-member rows.

## Public API

Import resource pages and contracts through:

```ts
import {
  AgentsOverviewPage,
  ComputersOverviewPage,
} from "@computer-agents/platform/platform-resources";
```

The former `platform-ui/resources` package path remains a compatibility alias, but new code must use `platform-resources`.

Overview-page styling is available through:

```ts
import "@computer-agents/platform/platform-resources/styles.css";
```

## Adding a resource

1. Create `platform-resources/<resource>/index.ts` and an `overview` module.
2. Define the resource row model, columns, filters, actions, and callbacks in that module.
3. Compose the shared `ResourceOverviewPage`; do not duplicate the page shell or table implementation.
4. Export the resource from `platform-resources/index.ts`.
5. Add the resource to the cross-resource overview test and structural invariant.
6. Put reusable resource endpoint access in a typed `client` repository. Keep
   product-service workflows and cross-resource mutations in their owning
   service or application adapter.

Detail modules follow the same boundary: resource adapters define tabs and domain behavior, then compose `ResourceDetailPage`. Navigation and persistence remain outside the shared shell.

## Verification

Run the structural checks and cross-resource page contract tests with:

```sh
npm run platform-resource-overview-test
```

The structural invariant also runs as part of `npm run build`, preventing the old `platform-ui/resources` source directory or runtime import path from being reintroduced.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

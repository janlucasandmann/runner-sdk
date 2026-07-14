# Platform resources

`platform-resources` contains the resource domains that users and organizations work with directly on the Computer Agents platform. Examples include agents, computers, skills, plugins, and tags.

This directory sits beside `platform-ui` intentionally:

- `platform-resources` owns resource-specific row models, page configuration, actions, filters, and presentation adapters.
- `platform-ui` owns resource-agnostic components and page shells such as `PlatformDataTable` and `ResourceOverviewPage`.
- `platform-services` owns API access, persistence, transport, and backend-facing contracts.

Resource modules may compose `platform-ui` components and pages. Generic UI code must not depend on a specific resource module.

## Structure

```text
platform-resources/
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

## Public API

Import resource pages and contracts through:

```ts
import {
  AgentsOverviewPage,
  ComputersOverviewPage,
} from "@computer-agents/runner-web-sdk/platform-resources";
```

The former `platform-ui/resources` package path remains a compatibility alias, but new code must use `platform-resources`.

Overview-page styling is available through:

```ts
import "@computer-agents/runner-web-sdk/platform-resources/styles.css";
```

## Adding a resource

1. Create `platform-resources/<resource>/index.ts` and an `overview` module.
2. Define the resource row model, columns, filters, actions, and callbacks in that module.
3. Compose the shared `ResourceOverviewPage`; do not duplicate the page shell or table implementation.
4. Export the resource from `platform-resources/index.ts`.
5. Add the resource to the cross-resource overview test and structural invariant.
6. Keep fetching and mutations in platform services or the application adapter.

## Verification

Run the structural checks and cross-resource page contract tests with:

```sh
npm run platform-resource-overview-test
```

The structural invariant also runs as part of `npm run build`, preventing the old `platform-ui/resources` source directory or runtime import path from being reintroduced.

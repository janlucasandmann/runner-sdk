<!-- platform-directory-guide:v1 -->

# Platform UI system

## Purpose

This directory is the provider-neutral shared UI system. It may not import owning services, resources, shell features, or Runner compatibility modules.

## Contents

- [`components/`](components/) — This directory contains focused presentation components within Platform UI. Follow the parent directory's ownership boundary.
- [`pages/`](pages/) — This directory owns reusable page-level layouts for overview, detail, home, and permission experiences.

## Dependency direction

Platform UI is the lowest presentation layer. It may depend on React and
presentation-focused libraries, but it must not import:

- product services or resources;
- application-shell behavior;
- platform runtime or server implementations;
- Runner compatibility modules under `src/react`.

Primitives live in `components/ui`, reusable multi-part interfaces in
`components/composite`, thread-aware presentation in
`components/thread-components`, and reusable page shells in `pages`.

## Usage

Prefer the narrow canonical category or component export:

```tsx
import { PlatformButton } from "./components/ui/button/index.js";
import { PlatformDataTable } from "./components/composite/data-table/index.js";
```

Standalone package consumers must also load the component's documented style
subpath once. The platform application and Runner bundle compose the canonical
stylesheets centrally. Domain modules provide records, mutations, navigation,
and copy; shared UI owns only reusable state and presentation contracts.

## Working in this directory

Add a primitive only when it is domain-agnostic and cannot be composed from an
existing control. Put higher-level behavior in the appropriate composite or
page. Preserve accessibility semantics, controlled-state contracts, and the
canonical CSS ownership path. Add new exports and invariant coverage together.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

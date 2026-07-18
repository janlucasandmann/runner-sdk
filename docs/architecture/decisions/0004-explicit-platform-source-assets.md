# ADR 0004: Serve explicit platform source assets

- Status: Accepted
- Date: 2026-07-17

## Context

The platform browser program was previously assembled as one server-generated
HTML string containing an inline stylesheet and browser module. The server then
parsed those blocks back out of the generated document to publish external
assets. This made a 49,000-line document renderer part of server startup,
blurred the browser/server boundary, and made static analysis and asset delivery
needlessly indirect.

The fragment-based program remains required while behavior moves into typed
owning domains. Removing it in one rewrite would break active product surfaces,
but retaining an HTML renderer is not required.

## Decision

The platform application is composed as three explicit sources:

- a small static HTML shell with style and module markers;
- a stylesheet source;
- a browser-module source.

`createLegacyPlatformApplicationSources` binds the remaining browser fragments
into those sources. Production asset delivery hashes and compresses
the stylesheet and module directly. Development asset delivery rewrites module
imports and stylesheet links directly. Neither path extracts executable or
style source from HTML.

The former `create-legacy-platform-document.mjs` renderer is retired and guarded
as a forbidden architecture path.

## Consequences

- Server startup no longer constructs or parses a monolithic inline document.
- Production and development share one explicit source contract.
- The HTML shell stays small and auditable.
- Assembled CSS and JavaScript remain large transitional assets; this
  decision changes their delivery boundary without pretending they are already
  migrated.
- Domain extraction can delete individual fragment bindings without
  another host-layer redesign.

## Verification

- `apps/platform/client/legacy/platform-sources.test.mjs` verifies deterministic
  source composition and complete binding resolution.
- `apps/platform/server/platform-assets.test.mjs` verifies immutable production
  asset delivery.
- `apps/platform/server/platform-development-assets.test.mjs` verifies Vite
  source rewriting and development delivery.
- `apps/platform/testing/platform-architecture.test.mjs` prevents the document
  renderer from returning and enforces the small source-composition boundary.

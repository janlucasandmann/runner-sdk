<!-- platform-directory-guide:v1 -->

# Typed platform runtime

## Purpose

This directory owns the typed browser API client, provider, Suspense/error boundary, and runtime composition used by platform pages.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`platform-api-client.test.ts`](platform-api-client.test.ts) — Regression coverage for Platform API Client.
- [`platform-api-client.ts`](platform-api-client.ts) — Boundary adapter for Platform API Client.
- [`platform-api-provider.tsx`](platform-api-provider.tsx) — Focused implementation of Platform API Provider.
- [`platform-application-boundary.tsx`](platform-application-boundary.tsx) — Focused implementation of Platform Application Boundary.
- [`platform-runtime.tsx`](platform-runtime.tsx) — Focused implementation of Platform Runtime.

## Public API

- `PlatformRuntimeProvider` supplies normalized application, API, and AIOS
  origins plus the runtime environment.
- `PlatformApiProvider` supplies a `PlatformApiClient` to typed pages.
- `createPlatformApiClient` creates an immutable JSON client with query
  encoding, request cancellation, credential handling, and structured
  `PlatformApiRequestError` failures.
- `PlatformApplicationBoundary` centralizes Suspense and page-level error
  recovery.

## Usage

Mount the application boundary once above typed platform pages. It composes the
runtime provider, API provider, error boundary, and Suspense fallback:

```tsx
<PlatformApplicationBoundary
  runtime={{
    apiOrigin: window.location.origin,
    appOrigin: window.location.origin,
    environment: "development",
  }}
>
  <PlatformPage />
</PlatformApplicationBoundary>
```

Feature repositories call `usePlatformApiClient()` or accept a
`PlatformApiClient` explicitly. They should not create ad-hoc `fetch` wrappers
or read process configuration inside render code. Abort signals should be
forwarded for lifecycle-bound loads.

## Working in this directory

Keep the runtime provider-neutral and independent of product services. Add
transport behavior to the client, page lifecycle behavior to the application
boundary, and runtime configuration to the provider contract. Preserve
dependency injection for tests and embedded hosts.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npx vitest run src/platform-runtime
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)

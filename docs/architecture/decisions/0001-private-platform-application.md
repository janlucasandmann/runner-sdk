# ADR 0001: Treat this repository as a private platform application

- Status: Accepted
- Date: 2026-07-17

## Context

The repository began as a reusable Runner web SDK. It now owns the platform
frontend, local and production host, domain services, deployment definition,
shared UI, and compatibility Runner surfaces. SDK-oriented naming, peer
dependency behavior, npm release instructions, and permissive export growth no
longer describe its operational role.

## Decision

The package identity is `@computer-agents/platform` and remains private.
React and React DOM are application runtime dependencies. Releases produce and
deploy an application/container; they are not npm publications.

The former SDK exports remain private compatibility seams while embedded
Runner consumers migrate. New product behavior belongs in typed platform
domains, not in the compatibility surface.

## Consequences

- CI verifies the application, server, typed client, architecture, and emitted
  artifacts together.
- Package exports are maintained only for known internal consumers.
- Compatibility removals require an explicit migration and can reduce exports
  over time.
- Deployment configuration and security policy are first-class repository
  concerns.

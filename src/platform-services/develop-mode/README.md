<!-- platform-directory-guide:v1 -->

# Develop mode services

## Purpose

Services surfaced in the platform's Develop mode belong in this directory.
Each service is an independent ownership boundary, matching the architecture in
Create and Configure mode.

## Services

- [`develop-home/`](develop-home/) — Develop landing page and resource
  activity.
- [`api-keys/`](api-keys/) — API credential lifecycle and analytics.
- [`security/`](security/) — GitHub repository security policy, runs, findings,
  audit records, and remediation approval boundaries.
- [`web-apps/`](web-apps/) — Web application resources.
- [`apis/`](apis/) — API resources.
- [`functions/`](functions/) — Function resources.
- [`databases/`](databases/) — Database resources.
- [`authentication/`](authentication/) — Authentication resources.
- [`agent-runtime/`](agent-runtime/) — Agent runtime resources.
- [`voice-agents/`](voice-agents/) — Voice-agent configuration, provisioning,
  and test sessions.
- [`secrets/`](secrets/) — Secret resources.
- [`payments/`](payments/) — Payment resources.
- [`shared/`](shared/) — Reusable typed overview model and surface.

Each service owns its `client/domain` definition and `client/page` surfaces;
future detail, usage, settings, runtime, styles, and server modules stay within
that service. `shared/` contains only reusable overview mechanics, and
`service-registry.tsx` is the thin composition boundary used by hosts that
select a service dynamically.

## Usage

Import concrete definitions or pages from the owning service root. Dynamic
hosts use the exports from this directory and `service-registry.tsx`; feature
code should not switch on a resource kind and reach into another service's
internals. The shared overview contract accepts normalized rows, timeframe and
analytics state, and host-owned navigation and mutation callbacks.

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

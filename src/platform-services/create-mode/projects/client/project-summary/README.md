<!-- platform-directory-guide:v1 -->

# Project summary

## Purpose

This module owns the compact identity header on the project Home page. It
composes project icon and color editing through `ProjectIconPicker`, the stable
project title, and the short project summary stored in the project
`description` field.

`ProjectSummaryDetails` renders project-scoped Teams and Resources directly
beneath that identity block. Its normalized inputs keep access-control and
resource API knowledge in the runtime adapter. The adapter always includes the
All Agents and All Organization Members system principals, then adds loaded
workspace teams that have not been removed from the project.

Each row renders at most three entries. Its label and shared secondary
`Show all` action delegate navigation to the runtime adapter so the component
remains independent of Projects routing state.

The backend-agnostic React component owns presentation and input behavior. Its
legacy-runtime adapter normalizes project values and delegates persistence to
the existing Projects update boundary. The long-form project Description
remains the Mission Control document and renders separately in Home content.

## Working in this directory

Keep project API requests out of the React component. Add project-specific
runtime integration to `runtime.mjs`, presentation styling to `styles.mjs`, and
focused interaction coverage beside the component. Preserve the distinction
between the short project summary and the long-form Mission Control document.

## Verification

Run the focused checks from the repository root:

```bash
npx vitest run src/platform-services/create-mode/projects/client/project-summary
npm run platform:legacy-syntax-test
```

## Related documentation

- [Projects client guide](../README.md)
- [Project icon picker](../project-icon-picker/README.md)
- [Project overview](../overview/README.md)

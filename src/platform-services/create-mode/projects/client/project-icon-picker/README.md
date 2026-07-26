<!-- platform-directory-guide:v1 -->

# Project icon picker

## Purpose

This module owns the backend-agnostic project icon and emoji picker, project
icon color selection, serialized update handoff through a caller-owned
persistence boundary, and shared project identity icon styling.

The project Summary module composes this picker and owns the project Home title
treatment. Breadcrumb rendering consumes the same normalized icon and color
values through the Projects domain runtime.

## Working in this directory

Keep persistence and project-record normalization outside the React component.
Add reusable picker behavior here, and keep project Home composition in the
sibling `project-summary` module. Update focused component tests whenever icon,
emoji, color, or serialization behavior changes.

## Verification

Run the focused checks from the repository root:

```bash
npx vitest run src/platform-services/create-mode/projects/client/project-icon-picker
npm run platform:legacy-syntax-test
```

## Related documentation

- [Projects client guide](../README.md)
- [Project summary](../project-summary/README.md)
- [Projects service](../../README.md)

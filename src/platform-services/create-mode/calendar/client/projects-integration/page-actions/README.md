<!-- platform-directory-guide:v1 -->

# Page Actions

## Purpose

This directory contains page actions behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`comments.mjs`](comments.mjs) — Focused implementation of Comments.
- [`description-editor.mjs`](description-editor.mjs) — Adapts Calendar event instructions and attachments to the shared ticket instructions editor contract.
- [`draft-updates.mjs`](draft-updates.mjs) — Focused implementation of Draft Updates.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`parent-picker.mjs`](parent-picker.mjs) — Focused implementation of Parent Picker.
- [`parent-selection.mjs`](parent-selection.mjs) — Focused implementation of Parent Selection.
- [`schedule-dialog.mjs`](schedule-dialog.mjs) — Focused implementation of Schedule Dialog.
- [`skills.mjs`](skills.mjs) — Focused implementation of Skills.
- [`task-navigation.mjs`](task-navigation.mjs) — Focused implementation of Task Navigation.
- [`task-type.mjs`](task-type.mjs) — Focused implementation of Task Type.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run calendar-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)

<!-- platform-directory-guide:v1 -->

# Subtasks

## Purpose

`PlatformSubtasks` is the canonical subtask card for resource detail pages. It
owns the shared card surface, header action, empty state, interactive rows, and
status labels while callers retain navigation and persistence behavior. Use
the `minimal` appearance when the section should sit directly in a detail-page
content flow without a card surface.

```tsx
<PlatformSubtasks
  appearance="minimal"
  items={subtasks}
  onAdd={openSubtaskComposer}
/>
```

Import it from `platform-ui/components/composite/subtasks`.

## Working in this directory

Keep project-specific task records and routing outside this component. Pass
normalized labels, metadata, status variants, and callbacks through props.

## Verification

```bash
npx vitest run src/platform-ui/components/composite/subtasks
npm run platform-component-invariants
```

## Related documentation

- [Composite component guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)

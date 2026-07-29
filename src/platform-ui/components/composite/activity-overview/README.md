# Activity Overview

`PlatformActivityOverview` is the shared chronological work visualization for
projects and other platform resources. It renders a dark waterfall timeline
from a data-source-neutral list of:

- activity intervals;
- point-in-time signals;
- nested or delegated subflows.

`PlatformActivityOverviewCard` is the canonical chart entry. It combines a
permission-ring visual, a compact action title, and the responsible actor
without coupling the chart to a resource-specific preview row.

The component owns timeline normalization, ordering, status treatment, time
ticks, scrolling, and the bottom overview navigator. The navigator and its
labels remain fixed below the scrollable plot. Feature pages remain responsible
only for mapping their domain records to the shared item contract.

```tsx
<PlatformActivityOverview
  items={[
    {
      id: "task-1",
      label: "CA-12 Build onboarding flow",
      startAt: "2026-07-27T10:00:00Z",
      endAt: "2026-07-27T10:12:00Z",
      status: "success",
    },
    {
      id: "signal-1",
      label: "Moved to In Progress",
      startAt: "2026-07-27T10:03:00Z",
      kind: "signal",
    },
  ]}
/>
```

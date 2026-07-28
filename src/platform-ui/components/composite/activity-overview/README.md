# Activity Overview

`PlatformActivityOverview` is the shared chronological work visualization for
projects and other platform resources. It renders a dark waterfall timeline
from a data-source-neutral list of:

- activity intervals;
- point-in-time signals;
- nested or delegated subflows.

The component owns timeline normalization, ordering, status
treatment, time ticks, scrolling, and the bottom overview navigator. Feature
pages remain responsible only for mapping their domain records to the shared
item contract.

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

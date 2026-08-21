<!-- platform-directory-guide:v1 -->

# Calendar service

## Purpose

`src/platform-services/create-mode/calendar` is the ownership boundary for the platform
Calendar experience. `apps/platform/server/index.mjs` composes the service, and the Projects
surface embeds its compiled UI fragments, but neither owns Calendar domain
behavior or schedule HTTP routing.

## Structure

- `client/domain/` owns schedule normalization, cron/recurrence evaluation,
  visible-range generation, task and Metronome event projection, and the home
  Calendar widget runtime.
- `client/projects-integration/` contains the Calendar state, persistence,
  actions, schedule editor, modal, and view fragments currently mounted inside
  `PlaygroundTasksPage`. This is an explicit integration boundary rather than
  Calendar implementation code living in the Projects service.
- The Calendar event inspector follows the same shared detail composition as
  the inline ticket preview for centralized instructions editing, selectors,
  attachment previews, and connector data browsing. Comments, Subtasks, and
  Activity are intentionally omitted. Project-bound Milestone and Blocked by
  controls only appear after a project is selected. Calendar adapters own
  schedule persistence while the presentation primitives remain in
  `src/platform-ui`.
- The app-header `Schedule` split action creates Task, Loop, Workflow, or Batch
  events. Workflow schedules resolve the selected immutable Workflow version,
  render its shared manual-run contract (including task prompts and structured
  trigger fields), and persist a canonical `metronome_run` input for the
  schedule processor. Their Save Changes action is gated by an explicit title,
  an explicit Workflow selection, and the selected Workflow contract's required
  inputs. Batch schedules use the same centralized selector/search composition
  and list only runnable `manual` (Keep on shelf) and `stay_on_shelf` jobs in
  `held` or retryable `failed` state. The schedule stores the stable Batch job
  ID and display name; the backend rechecks organization/resource access and
  shelf policy before moving the selected job to its queue at execution time.
  `when_capacity_available` jobs are intentionally excluded because they are
  already self-starting and are not Calendar shelf actions. New and existing schedules cross the persistence
  boundary only through the fixed footer Save Changes action (or its
  Command/Ctrl+S shortcut). The action is revision-aware, remains disabled for
  clean drafts, and cannot discard edits made while an earlier save is in
  flight. Standalone Calendar projection includes the complete loaded schedule
  collection rather than incorrectly requiring a selected Project. New
  schedules are projected immediately as provisional calendar events while the
  editor is open; provisional events use a neutral surface until persistence
  replaces them with the standard blue scheduled-event presentation.
  Day and Week views replace the library's per-day current-time indicator with
  a Calendar-owned, gutter-anchored full-width rule and a minute-updated time
  label. The gutter owns the vertical time coordinate while the rule measures
  the complete visible time grid, keeping the label and line aligned through
  scrolling and resizing. Day and Week views auto-scroll once on opening to a
  ten-minute lead-in before the current time, which keeps the complete pill
  visible at the highest practical viewport position without snapping the user
  back after they start browsing. Persisted Calendar labels expose the same centralized
  schedule-actions popup on right-click as the inspector header; both surfaces
  share one action renderer so Run and Delete behavior cannot drift.
  Superseded Workflow selections cancel their in-flight context load; structured
  trigger fields are grouped in the Calendar-only Parameters card while the
  shared Metronome contract remains presentation-neutral. Details is always the
  first editor section after the schedule identity block. That identity block
  owns the editable display name and short description independently from task
  instructions or Workflow inputs. Selecting another Workflow marks the draft
  dirty immediately; required-input validation stays at the persistence
  boundary so the Save Changes action reflects edits instead of remaining
  artificially disabled while the new Workflow context settles.
- `client/styles/` contains cascade-preserving Calendar toolbar, scheduler,
  standalone workspace, welcome-widget, legacy-grid, and upgrade styles.
- `client/foundation/` owns the `react-big-calendar` and date-fns browser
  imports plus localizer initialization.
- `client/shell/` owns Calendar navigation behavior used by the shared shell.
- `client/vendor/` owns Calendar-specific document-head dependencies.
- `server/routes.mjs` owns standalone and project-scoped schedule routes.
- `server/index.mjs` exposes the Calendar service factory.

## Host boundary

The platform server may provide authentication and upstream transport adapters,
mount Calendar in shared navigation, and pass Projects/tasks/Metronome data to
Calendar projections. Projects may expose the host React component while the
current UI is shared, but Calendar state, schedule editing, event projection,
rendering, styles, and route matching belong here.

The single platform document still composes ordered Calendar script and style
fragments. Those fragments preserve legacy evaluation and CSS cascade order
while typed modules replace them incrementally; they do not define another
browser application.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)

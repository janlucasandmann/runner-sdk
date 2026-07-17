# Calendar service

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

The browser application is still emitted as one inline module. Calendar client
modules therefore expose compiled script/style fragments that preserve the
legacy evaluation and CSS cascade order. A future standalone bundled page can
consume the same ownership boundary without moving implementation code again.

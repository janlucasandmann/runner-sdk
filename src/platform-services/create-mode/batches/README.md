<!-- platform-directory-guide:v1 -->

# Batches service

## Purpose

`src/platform-services/create-mode/batches` owns the Create-mode Batches
experience. The platform shell composes the service but does not own its API
translation, page state, overview, definition detail, or creation flow.

## Structure

- `client/batches-api.ts` is the typed BFF client.
- `client/batches-types.ts` mirrors the public Batch contract.
- `client/page/batches-workspace-page.tsx` owns polling, navigation, mutations,
  the shared create/edit/view modal, and confirmation lifecycle.
- `client/page/batches-overview-page.tsx` projects Batches into the centralized
  Skills overview component so filtering, table behavior, menus, empty state,
  and header actions retain the same design. Its app-header scope switch keeps
  the complete organization queue and the current user's jobs as explicit
  views, while creator cells reuse the canonical resource identity treatment
  for account names, avatars, and initials. The queue is presented as three
  independently expandable sections—`Keep on shelf`, `Stay on shelf`, and
  `Start when capacity is free`—and drag ordering persists only within the
  matching durable policy partition. Successful one-shot jobs leave the queue;
  successful `Stay on shelf` jobs return as held items at the bottom of their
  partition and always require another explicit start. Row-menu Move up/Move
  down actions remain available for keyboard operation.
- `client/page/batch-create-modal.tsx` is the single definition surface. It
  creates jobs, edits jobs while they remain on the shelf, and becomes
  read-only once execution begins. Row clicks and cross-service deep links open
  this modal without replacing the overview page.
- `client/shell` keeps the Batches overview app header stable while a job modal
  is open.

The shared composer supports both Thread Batch forms: an optional existing
thread ID resumes that thread, while a prompt without an ID defines a new
thread that the durable scheduler creates only when the Batch is released.
The durable definition still retains optional agent, computer, project,
attachment, skills, reasoning-effort, and cost-boundary settings; details
project those fields into the workload view rather than exposing storage JSON.
- `server/routes.mjs` owns `/api/real/batch-jobs` matching and exact upstream
  translation.

## Producer integration

Existing services open the shared composer rather than importing Batches page
internals. The shell exposes:

```js
window.computerAgentsOpenBatchComposer({
  name: "Run nightly review",
  targetKind: "metronome_run",
  targetResourceId: "metronome_...",
  definition: { metronomeId: "metronome_...", input: {} },
  startPolicy: "manual",
});
```

The draft is also written under `computer_agents_batch_draft_v1` so navigation
survives the page transition. The workspace consumes it once and removes it.
Threads, Metronome, Evaluations, Agent Optimization, and Project tickets all
use this contract. A Project ticket prepares its canonical thread in deferred
mode before opening the composer, so releasing the Batch never recreates ticket
state.

The shared Task Input additionally exposes `/Batch` when its host provides
`onBatchJobCreate`. This is a deliberately narrow quick-save producer: it
captures the resolved prompt, attachments, agent, computer, project, skills,
connectors, Knowledge context, repository context, and reasoning effort as a
new `thread_run`, always maps the visible “Keep on shelf” policy to the durable
`manual` API value, and never starts a thread. The composer is cleared and the
centralized status receipt is shown only after the create request succeeds;
failed requests preserve the complete draft for retry. Both this path and the
full Batch modal use `client/batch-thread-draft.ts` so their executable thread
definitions cannot drift.

## Access integration

The Teams resource picker loads accessible Batches from the same BFF and stores
shares as the centralized `batch_job` resource type. No Batches-specific team
permission table exists. The backend resource-access registry remains the
authorization source of truth.

## Working in this directory

Keep durable scheduling semantics in the backend Batches domain and keep this
service focused on presentation, navigation, and BFF translation. Producers
must open the shared composer contract; they must not import page internals or
write Batch records themselves. Reuse centralized platform components for all
tables, buttons, selectors, modals, loading states, and detail sections. When a
target definition changes, update the backend contract, public SDK, producer,
and service tests together so a shelved job remains executable after restart.

## Verification

From the platform repository root:

```bash
pnpm batches-service-test
pnpm teams-service-test
pnpm app-sidebar-service-test
pnpm platform:legacy-syntax-test
```

## Related documentation

- [Metronome service](../metronome/README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)

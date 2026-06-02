# Metronome Agentic Workflows

Metronome is the automation layer for Computer Agents. It should let humans and agents build persistent workflows that connect threads, projects, computers, files, Imagine, deployed resources, plugins, connectors, approvals, and team collaboration.

The product shape is a mixture of Jira automation, n8n, and an agent workflow builder. The key difference is that Metronome actions can call into the same primitives that already exist in Computer Agents: start a thread with a selected agent/computer, update a project ticket, run Mission Control, deploy a resource, write to a database, or wait for human approval.

## Goals

- Give users a visual workflow builder for agentic automations.
- Make triggers, conditions, actions, loops, and approvals first-class workflow nodes.
- Reuse existing Computer Agents services instead of creating a parallel automation stack.
- Keep every workflow inspectable: runs, node state, errors, approvals, retries, and outputs.
- Make workflows usable by both humans and agents through UI and future API/SDK endpoints.
- Keep compute token attribution tied to the user or service account that runs the workflow.

## Initial UI Scope

The first platform UI should include:

- Create mode sidebar link: `Metronome` under `Files`, using the lucide Metronome icon.
- Overview page:
  - KPI strip similar to server overview pages.
  - Empty state for users without workflows.
  - Workflow table listing existing Metronomes.
  - Create button that opens the workflow editor.
- Details page:
  - Full content-area visual editor powered by React Flow.
  - Left node palette with draggable node categories.
  - Center canvas with grid, edges, controls, and custom node cards.
  - Right node details sidebar when a node is selected.
  - Draft metadata: name, status, last run, trigger count, and owner.

The first implementation can store drafts in local state/localStorage while backend execution is specified and added.

## Node Model

Each workflow contains nodes and edges.

```ts
type MetronomeNodeKind =
  | "trigger"
  | "condition"
  | "action"
  | "loop"
  | "approval";

type MetronomeNode = {
  id: string;
  kind: MetronomeNodeKind;
  label: string;
  subtype: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
};

type MetronomeEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};
```

## Trigger Nodes

Triggers start a run.

- Periodic: cron-like schedules, same underlying scheduler concept as Calendar.
- Email: incoming email through the email plugin.
- Telegram: incoming Telegram message through the Telegram connector.
- GitHub: issue, pull request, push, release, or workflow event.
- Thread: new thread started, thread completed, thread received a new user message.
- Project ticket: ticket created, edited, finished, moved, or commented.
- Resource: web app/function/database/auth/secret/payment/agent runtime created or deployed.
- Database entry: row/document created in a Computer Agents database.

## Condition Nodes

Conditions branch a run.

Initial conditions:

- Thread belongs to a project.
- First user message contains substring.
- Thread was started with a given agent.
- Thread was started on a given computer.
- Ticket status equals / changed to.
- Resource kind equals / deployment status equals.
- Database entry field matches value.
- Connector payload field exists or equals value.

## Action Nodes

Actions perform work.

Initial actions:

- Start thread with selected message, agent, computer, project context, and optional attachments.
- Add or edit project ticket.
- Write comment on project ticket.
- Run Mission Control on a project.
- Deploy resource.
- Invoke function/API resource.
- Insert database entry.
- Generate Imagine image/video from prompt and template.
- Send email or Telegram message.
- Create approval request.

## Loop Nodes

Loops repeat child actions until a break condition is met.

Initial loop configuration:

- For each item in list, database query, connector payload, or selected files.
- Break on max iterations.
- Break when condition evaluates true.
- Break when approval is rejected.
- Break when action fails more than N times.

## User Approval Nodes

Approval nodes reuse the existing approval system.

Initial approval types:

- Approve before deploy.
- Approve before sending external message.
- Approve before modifying a project.
- Approve before spending over a CT threshold.
- Approve before writing to a shared team resource.

## Runtime Architecture

The runtime should eventually live on the backend, not in the browser.

Suggested backend resources:

- `metronomes`
- `metronome_nodes`
- `metronome_edges`
- `metronome_runs`
- `metronome_run_steps`
- `metronome_approvals`

Suggested API:

- `GET /metronomes`
- `POST /metronomes`
- `GET /metronomes/:id`
- `PATCH /metronomes/:id`
- `DELETE /metronomes/:id`
- `POST /metronomes/:id/publish`
- `POST /metronomes/:id/test`
- `GET /metronomes/:id/runs`
- `GET /metronomes/:id/runs/:runId`
- `POST /metronomes/:id/runs/:runId/approve`
- `POST /metronomes/:id/runs/:runId/cancel`

## Permissions and Team Sharing

Metronomes should be team-shareable resources.

- Create permission can run workflows from allowed create-mode surfaces.
- Configure permission can create and edit workflows that touch create/configure resources.
- Develop permission can include server resources and deployment actions.
- Admin can manage team-shared workflows and permissions.

Compute tokens should be charged to the user or service account that triggered the workflow run, not necessarily the owner of the workflow or resources.

## Execution Safety

Before enabling production execution:

- Require explicit approval nodes for risky actions by default.
- Validate connector and resource permissions per run.
- Store every node input/output in run history.
- Redact secrets and credentials from run logs.
- Enforce retry limits and CT spend limits.
- Show dry-run preview for deploy/write/send actions.

## Implementation Milestones

1. UI foundation: sidebar link, overview page, visual editor, node palette, custom node cards, right node inspector.
2. Draft persistence: local drafts, import/export JSON, simple table state.
3. Backend persistence: CRUD endpoints and database tables.
4. Trigger subscriptions: periodic, thread, project ticket, resource, connector webhook.
5. Execution engine: topological run planning, condition branching, actions, loop handling.
6. Approvals and observability: approval inbox, run timeline, retries, CT attribution.
7. SDK/API surface: create, publish, invoke, inspect, and manage Metronomes programmatically.


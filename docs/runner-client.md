# Runner client compatibility API

Standalone runner integration for web apps that want streamed agent execution logs (SSE), setup-phase logs, and a drop-in runner-style chat UI.

This package is extracted from the aiOS runner behavior, but is independent from the aiOS app shell and UI components.

## What this package provides

- Headless `RunnerClient` to execute runs via SSE.
- Optional `prepare` step before stream start.
- `RunnerChat` React component with runner-style logs + input bar.
- `RunnerChat` input behavior aligned to embedded aiOS runner integrations:
  - no agent selector
  - no environment selector
  - `+` opens file upload only
- Event normalization for common runner events:
  - `direct.response`
  - `computer.starting`
  - `response.started`
  - `response.item.completed`
  - `response.completed`
  - `response.failed`
  - `stream.error`
  - `deep_research`

## Install

```bash
npm install @computer-agents/platform
```

Optional static stylesheet import:

```ts
import "@computer-agents/platform/react/styles.css";
```

`RunnerChat` still mounts its core styles automatically, but the extracted CSS file is available when you want stylesheet-based delivery instead of runtime injection.

## Interactive local demo

Run:

```bash
npm install
npm run dev
```

Then open:

`http://localhost:4177`

This serves a browser UI that connects to your **real backend** through local proxy routes:

- `POST /api/real/threads`
- `POST /api/real/threads/:threadId/messages` (SSE streaming)

In the UI, provide:

- Upstream backend URL (for example `https://api.computer-agents.com`)
- Real API key
- Optional `environmentId` / `agentId`

The demo renders the **actual `RunnerChat` React component** from this SDK and proxies requests through the local demo server to avoid local CORS friction while still hitting your real backend.

## Basic usage

```ts
import { RunnerClient } from "@computer-agents/platform";

const client = new RunnerClient();

const result = await client.execute({
  prepare: {
    url: "/api/threads/thread_123/prepare",
    body: {
      task: "Fix failing tests",
      isFollowUp: false,
      agentConfig: { id: "agent_default", name: "Default Agent" }
    }
  },
  run: {
    url: "/api/threads/thread_123/messages",
    body: {
      task: "Fix failing tests"
    },
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  },
  onLog: (log) => {
    console.log(log.time, log.eventType, log.message);
  },
  onSetupComplete: () => {
    console.log("Setup complete, agent is running.");
  }
});

console.log(result.durationSeconds, result.usage);
```

## Metronome workflows

`RunnerClient` also exposes Metronome workflow CRUD, runs, and versioning. Function nodes can call either a deployed Computer Agents function or an external HTTP API.
Function triggers can also deploy a callable Computer Agents cloud function endpoint for a workflow.

```ts
import {
  RunnerClient,
  type RunnerMetronomeWorkflowCreateInput,
} from "@computer-agents/platform";

const client = new RunnerClient();

const workflow: RunnerMetronomeWorkflowCreateInput = {
  name: "Send webhook",
  definition: {
    version: 1,
    nodes: [
      {
        id: "trigger",
        kind: "trigger",
        label: "Trigger",
        config: {
          triggerType: "function",
          functionName: "metronome-send-webhook",
          functionRequireApiKey: true,
          payloadFields: [
            { key: "message", type: "string", value: "" },
            { key: "customer_id", type: "string", value: "" },
          ],
          samplePayloadJson: "{\n  \"message\": \"hello\",\n  \"customer_id\": \"cus_123\"\n}",
        },
      },
      {
        id: "call_api",
        kind: "function",
        label: "Call API",
        config: {
          functionMode: "external_api",
          httpMethod: "POST",
          url: "https://api.example.com/events",
          requestHeaders: [
            { name: "Content-Type", value: "application/json" },
            {
              name: "Authorization",
              valueType: "secret",
              secretRef: "secrets:my-secrets-vault:api-token",
            },
          ],
          payloadJson: "{\n  \"message\": \"{{ trigger.payload.message }}\",\n  \"customer_id\": \"{{ trigger.payload.customer_id }}\"\n}",
          outputKey: "webhook",
        },
      },
    ],
    edges: [{ id: "edge_1", source: "trigger", target: "call_api" }],
  },
};

const metronome = await client.createMetronome({
  backendUrl: "https://api.computer-agents.com",
  headers: { Authorization: "Bearer YOUR_API_KEY" },
  workflow,
});

await client.createMetronomeRun({
  backendUrl: "https://api.computer-agents.com",
  headers: { Authorization: "Bearer YOUR_API_KEY" },
  metronomeId: metronome.id,
  run: { inputs: { prompt: "hello" } },
});

await client.triggerMetronomeFunction({
  backendUrl: "https://api.computer-agents.com",
  headers: { Authorization: "Bearer YOUR_API_KEY" },
  metronomeId: metronome.id,
  trigger: "metronome-send-webhook",
  apiKey: "YOUR_COMPUTER_AGENTS_API_KEY",
  payload: { message: "hello", customer_id: "cus_123" },
});
```

For deployed Computer Agents functions, use `functionMode: "computer_agents_function"` with `functionId` and `payloadJson` instead of `url` and `requestHeadersJson`.

## React bindings

Use the optional React exports when building an app UI:

```tsx
import { RunnerLogList, TaskComposer, useRunnerExecution } from "@computer-agents/platform/react";

export function RunnerPanel() {
  const { status, logs, execute } = useRunnerExecution();

  return (
    <section>
      <TaskComposer
        disabled={status === "running"}
        onSubmit={async ({ task }) => {
          await execute({
            prepare: {
              url: "/api/threads/thread_123/prepare",
              body: { task, isFollowUp: false, agentConfig: { id: "agent_default", name: "Default Agent" } },
              headers: { "Content-Type": "application/json" },
              credentials: "include"
            },
            run: {
              url: "/api/threads/thread_123/messages",
              body: { task },
              headers: { "Content-Type": "application/json" },
              credentials: "include"
            }
          });
        }}
      />
      <RunnerLogList logs={logs} />
    </section>
  );
}
```

The React entrypoint also exports the extracted animation/style helpers used by `RunnerChat`, so the same motion tokens can be reused in adjacent UI:

```ts
import {
  getRunnerChatEnterAnimationStyle,
  mountRunnerChatStyles,
} from "@computer-agents/platform/react";
```

## Runner-style chat component

`RunnerChat` is the high-level component for the exact use case of embedding a runner-like chat panel in your app without rebuilding thread/message API plumbing.

It directly calls your real backend:

- `POST {backendUrl}/threads` (auto-create thread when needed)
- `POST {backendUrl}/threads/:threadId/messages` (SSE streaming)
- `WS {speechToTextUrl | backendUrl + "/ws/speech-to-text"}` (real-time microphone transcription)

```tsx
import { RunnerChat } from "@computer-agents/platform/react";

export function MyAgentPanel() {
  return (
    <div style={{ height: 680 }}>
      <RunnerChat
        backendUrl="https://api.computer-agents.com"
        apiKey="YOUR_REAL_API_KEY"
        speechToTextUrl="wss://api.computer-agents.com/ws/speech-to-text"
        appId="my-webapp"
        placeholder="What would you like me to do?"
      />
    </div>
  );
}
```

### Input variants

`RunnerChat` supports two task-bar variants:

- `minimal` (default): upload button + send button only
- `computer-agents`: aiOS-style task bar with agent selector, environment selector, and the full `+` popup stack for attachments, GitHub, Google Drive, OneDrive, Notion, skills, and scheduling

```tsx
<RunnerChat
  backendUrl="https://api.computer-agents.com"
  apiKey="YOUR_REAL_API_KEY"
  inputMode="computer-agents"
  agents={[
    { id: "agent_default", name: "Developer" },
    { id: "agent_research", name: "Research Agent" },
  ]}
  environments={[
    { id: "env_default", name: "Default", isDefault: true },
    { id: "env_staging", name: "Staging" },
  ]}
  skills={[
    { id: "image_generation", name: "Image Generation", enabled: true },
    { id: "web_search", name: "Web Search", enabled: true },
    { id: "frontend_design", name: "Frontend Design", enabled: true },
  ]}
  computerAgents={{
    github: {
      connected: true,
      repositories: [{ id: "repo_runner", name: "runner-web-sdk" }],
      contexts: [{ id: "main", name: "main" }],
    },
    notion: {
      connected: true,
      databases: [{ id: "db_product", name: "Product Specs" }],
    },
  }}
/>
```

### File upload behavior (`+`)

The `+` button opens the system file picker and attaches selected files.

- Default behavior: files are converted to attachment metadata and sent in `attachments` with the run request.
- If you need real upload (S3/GCS/etc), pass `uploadFiles(files)` and return backend-ready attachment objects.

## Prepare-to-run mapping

If your `prepare` endpoint returns `{ backendBody }`, this SDK will automatically use that as the run request body.

If your shape is different, pass a custom mapper:

```ts
prepare: {
  url: "/api/prepare",
  body: {...},
  buildRunRequest: (preparePayload, runRequest) => {
    const payload = preparePayload as { streamPayload: unknown };
    return {
      ...runRequest,
      body: payload.streamPayload
    };
  }
}
```

## Notes

- `RunnerChat` includes UI and real backend wiring, but does not persist API keys.
- For production-grade attachment storage, provide `uploadFiles`.
- The core `RunnerClient` remains available for fully custom UIs.

## Thread v2: concurrent conversation and work

The additive Thread v2 API models messages, worker runs, observer activity
groups, permission requests, and routing receipts independently. This allows a
communicator to keep responding while workers remain active and gives long runs
a collapsed semantic summary with lazy, hierarchical detail.

```tsx
import {
  RunnerThread,
  useRunnerThreadProjection,
} from "@computer-agents/platform/react";

function LiveThread({ threadId }: { threadId: string }) {
  const thread = useRunnerThreadProjection({
    threadId,
    backendUrl: "https://api.computer-agents.com",
    headers: { Authorization: "Bearer YOUR_REAL_API_KEY" },
    includeLegacy: false,
  });

  return (
    <RunnerThread
      projection={thread.projection}
      loading={thread.loading}
      error={thread.error}
      onLoadEarlier={thread.loadMore}
      runDetailStates={thread.runDetailStates}
      activityGroupActionStates={thread.activityGroupActionStates}
      onLoadRunDetails={(run) => thread.loadRunDetails(run.id)}
      onLoadActivityGroupActions={thread.loadActivityGroupActions}
      onControlRun={(run, action) => thread.controlRun(run.id, { action })}
    />
  );
}
```

For existing data, `adaptLegacyThreadToProjection()` converts messages, logs,
steps, and trace clusters into the same projection. This supports incremental
migration while the legacy execution stream remains available. `RunnerChat`
uses `threadViewMode="auto"` by default: it promotes a thread with durable
Thread v2 activity only when the existing turn data does not contain rich
legacy-only affordances such as attachments, task previews, or custom action
renderers. This parity gate prevents an automatic cutover from hiding existing
content. Use `threadViewMode="canonical"` to opt into the unified surface
explicitly or `"legacy"` as a temporary rollout override.

See [Thread v2 architecture](./docs/thread-v2-architecture.md) for invariants,
delivery semantics, and the migration contract.

## Next runtime milestones

- Run the model observer that publishes evidence-linked activity revisions into
  the implemented group/projection contracts.
- Connect the distributed run coordinator to durable checkpoint, interrupt, and
  control deliveries. Until that coordinator is active, `RunnerChat` executes
  worker follow-ups through its page-resident legacy queue and never reports a
  queued canonical command as applied.
- Publish the transactional event outbox through the production pub/sub layer;
  resumable SSE currently provides the client transport.

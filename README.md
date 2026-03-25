# Runner Web SDK

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
npm install @computer-agents/runner-web-sdk
```

Optional static stylesheet import:

```ts
import "@computer-agents/runner-web-sdk/react/styles.css";
```

`RunnerChat` still mounts its core styles automatically, but the extracted CSS file is available when you want stylesheet-based delivery instead of runtime injection.

## Interactive local demo

Run:

```bash
npm install
npm run demo
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
import { RunnerClient } from "@computer-agents/runner-web-sdk";

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

## React bindings

Use the optional React exports when building an app UI:

```tsx
import { RunnerLogList, TaskComposer, useRunnerExecution } from "@computer-agents/runner-web-sdk/react";

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
} from "@computer-agents/runner-web-sdk/react";
```

## Runner-style chat component

`RunnerChat` is the high-level component for the exact use case of embedding a runner-like chat panel in your app without rebuilding thread/message API plumbing.

It directly calls your real backend:

- `POST {backendUrl}/threads` (auto-create thread when needed)
- `POST {backendUrl}/threads/:threadId/messages` (SSE streaming)
- `WS {speechToTextUrl | backendUrl + "/ws/speech-to-text"}` (real-time microphone transcription)

```tsx
import { RunnerChat } from "@computer-agents/runner-web-sdk/react";

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

## Roadmap

- Rich log renderers (tool-call cards, file diff cards, deep research cards).
- Optional thread tabs/history component package.
- Stable backend adapter contracts for custom auth/proxy setups.

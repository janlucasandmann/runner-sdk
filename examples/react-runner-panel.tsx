import { RunnerLogList, TaskComposer, useRunnerExecution } from "../src/react/index.js";

export function RunnerPanelExample() {
  const { status, logs, execute, cancel } = useRunnerExecution();

  return (
    <div>
      <TaskComposer
        disabled={status === "running"}
        onSubmit={async ({ task }) => {
          await execute({
            prepare: {
              url: "/api/threads/thread_123/prepare",
              body: {
                task,
                isFollowUp: false,
                agentConfig: { id: "agent_default", name: "Default Agent" },
              },
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            },
            run: {
              url: "/api/threads/thread_123/messages",
              body: { task },
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            },
          });
        }}
      />

      {status === "running" ? <button onClick={cancel}>Stop Run</button> : null}

      <RunnerLogList logs={logs} emptyText="Waiting for first run..." />
    </div>
  );
}


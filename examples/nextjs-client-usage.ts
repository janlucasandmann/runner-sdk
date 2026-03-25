import { RunnerClient } from "../src/index.js";

async function runThread() {
  const threadId = "thread_123";
  const client = new RunnerClient();

  const result = await client.execute({
    prepare: {
      url: `/api/threads/${threadId}/prepare`,
      body: {
        task: "Implement feature X",
        isFollowUp: false,
        agentConfig: { id: "agent_default", name: "Default Agent" },
      },
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
    run: {
      url: `/api/threads/${threadId}/messages`,
      body: {},
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    },
    onLog: (log) => {
      // Render this in your app's log UI.
      console.log(`[${log.time}] ${log.eventType ?? "log"}: ${log.message}`);
    },
    onSetupComplete: () => {
      console.log("Computer setup finished.");
    },
  });

  console.log("Run done:", result);
}

void runThread();


import { RunnerClient } from "../dist/index.js";

function createSseResponse(events) {
  const payload = events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(payload));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

function createJsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function createMockFetch() {
  let callCount = 0;
  return async (url) => {
    callCount += 1;
    if (String(url).includes("/prepare")) {
      return createJsonResponse({
        setupLogs: [
          { time: "00:00", message: "Preparing environment", type: "info", eventType: "setup" },
          { time: "00:01", message: "Repository ready", type: "success", eventType: "setup" },
        ],
        backendBody: {
          task: "Create a README",
          prepared: true,
        },
      });
    }

    if (String(url).includes("/messages")) {
      return createSseResponse([
        { type: "computer.starting" },
        { type: "response.started" },
        {
          type: "response.item.completed",
          item: {
            type: "reasoning",
            content: { text: "Planning the file updates..." },
          },
        },
        {
          type: "response.item.completed",
          item: {
            type: "message",
            content: [{ type: "text", text: "Implemented README successfully." }],
          },
        },
        {
          type: "response.completed",
          response: {
            usage: {
              input_tokens: 120,
              output_tokens: 40,
              cached_tokens: 10,
            },
            cost_usd: 0.0012,
          },
        },
      ]);
    }

    return new Response(`Unknown URL: ${String(url)} (call ${callCount})`, { status: 404 });
  };
}

async function main() {
  const logs = [];
  const client = new RunnerClient(createMockFetch());

  const result = await client.execute({
    prepare: {
      url: "https://example.local/api/threads/thread_123/prepare",
      body: { task: "Create a README" },
      headers: { "Content-Type": "application/json" },
    },
    run: {
      url: "https://example.local/api/threads/thread_123/messages",
      body: { task: "Create a README" },
      headers: { "Content-Type": "application/json" },
    },
    onLog: (log) => logs.push(log),
  });

  const hasRunSummary = logs.some((log) => log.eventType === "turn_completed");
  const hasAgentMessage = logs.some((log) => log.eventType === "agent_message");
  const tokenTotal = result.usage?.totalTokens;

  if (!hasRunSummary || !hasAgentMessage || tokenTotal !== 160) {
    throw new Error(
      `Smoke test failed: hasRunSummary=${hasRunSummary}, hasAgentMessage=${hasAgentMessage}, tokenTotal=${tokenTotal}`
    );
  }

  console.log("Smoke test passed.");
  console.log(`Status: cancelled=${result.cancelled}, durationSeconds=${result.durationSeconds}`);
  console.log(`Usage: input=${result.usage?.inputTokens}, output=${result.usage?.outputTokens}, total=${result.usage?.totalTokens}`);
  console.log(`Collected logs: ${logs.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


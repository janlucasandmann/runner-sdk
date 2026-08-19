import { describe, expect, it, vi } from "vitest";
import { RunnerClient } from "./client.js";

describe("RunnerClient durable Batch admission", () => {
  it("returns the structured queue receipt from stream completion", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(
          'data: {"type":"log","log":{"message":"Queued in Batches.","type":"info","eventType":"batch_queued","metadata":{"batchJobId":"batch_1"}}}\n\n',
        ));
        controller.enqueue(encoder.encode(
          'data: {"type":"stream.completed","queued":true,"batchJobId":"batch_1","admissionReason":"runtime_execution_capacity_exhausted"}\n\n',
        ));
        controller.close();
      },
    });
    const fetchMock = vi.fn(async () => new Response(body, {
      status: 202,
      headers: { "content-type": "text/event-stream" },
    }));
    const onLog = vi.fn();
    const client = new RunnerClient(fetchMock as typeof fetch);

    const result = await client.execute({
      run: {
        url: "https://api.example.test/v1/threads/thread_1/messages",
        body: { content: "Do the work" },
      },
      onLog,
    });

    expect(result).toMatchObject({
      queued: true,
      cancelled: false,
      batchJobId: "batch_1",
      admissionReason: "runtime_execution_capacity_exhausted",
    });
    expect(onLog).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "batch_queued",
    }));
  });
});

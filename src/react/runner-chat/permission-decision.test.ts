import { describe, expect, it, vi } from "vitest";

import type { RunnerLog } from "../../types.js";
import {
  applyRunnerPermissionDecision,
  submitRunnerPermissionDecision,
} from "./permission-decision.js";
import type { RunnerTurn } from "./turn-types.js";

function permissionLog(requestId = "request-1"): RunnerLog {
  return {
    time: "2026-07-18T10:00:00.000Z",
    message: "Allow deployment?",
    type: "warning",
    metadata: {
      permissionRequestId: requestId,
      status: "pending",
    },
  };
}

function permissionTurn(log = permissionLog()): RunnerTurn {
  return {
    id: "turn-1",
    prompt: "Deploy",
    logs: [log],
    startedAtMs: 1,
    status: "permission_asked",
  };
}

describe("permission decisions", () => {
  it("submits an authenticated ruling and derives the active turn state", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ active: true, canonicalMirrored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const outcome = await submitRunnerPermissionDecision({
      apiKey: " key ",
      backendUrl: "https://runner.example/",
      decision: "allow",
      fetchImpl: fetchImpl as typeof fetch,
      log: permissionLog(),
      threadId: "thread-1",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://runner.example/threads/thread-1/permission-requests/request-1/decision",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ decision: "allow" }),
      }),
    );
    expect(outcome).toEqual({
      completedAtMs: undefined,
      decision: "allow",
      nextTurnStatus: "running",
      notice: null,
      requestId: "request-1",
    });
  });

  it("preserves backend errors and reports canonical reconciliation limitations", async () => {
    await expect(
      submitRunnerPermissionDecision({
        apiKey: "key",
        backendUrl: "https://runner.example",
        decision: "deny",
        fetchImpl: vi
          .fn()
          .mockResolvedValue(new Response("Not allowed", { status: 403 })) as typeof fetch,
        log: permissionLog(),
        threadId: "thread-1",
      }),
    ).rejects.toThrow("Not allowed");

    const outcome = await submitRunnerPermissionDecision({
      apiKey: "key",
      backendUrl: "https://runner.example",
      decision: "deny",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            active: false,
            canonicalMirrored: false,
            message: "Run already stopped.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ) as typeof fetch,
      log: permissionLog(),
      now: () => 42,
      threadId: "thread-1",
    });

    expect(outcome.nextTurnStatus).toBe("cancelled");
    expect(outcome.completedAtMs).toBe(42);
    expect(outcome.notice).toBe("Run already stopped.");
  });

  it("reconciles only the matching request log while updating waiting turns", () => {
    const untouchedLog = permissionLog("request-2");
    const turns = [
      permissionTurn(),
      {
        ...permissionTurn(untouchedLog),
        id: "turn-2",
      },
      {
        ...permissionTurn(permissionLog("request-3")),
        id: "turn-3",
        status: "completed" as const,
      },
    ];

    const nextTurns = applyRunnerPermissionDecision(turns, {
      completedAtMs: 42,
      decision: "allow",
      nextTurnStatus: "running",
      notice: null,
      requestId: "request-1",
    });

    expect(nextTurns[0]?.status).toBe("running");
    expect(nextTurns[0]?.completedAtMs).toBe(42);
    expect(nextTurns[0]?.logs[0]?.type).toBe("success");
    expect(nextTurns[0]?.logs[0]?.metadata?.status).toBe("approved");
    expect(nextTurns[1]?.status).toBe("running");
    expect(nextTurns[1]?.logs[0]).toEqual(untouchedLog);
    expect(nextTurns[2]?.status).toBe("completed");
  });
});

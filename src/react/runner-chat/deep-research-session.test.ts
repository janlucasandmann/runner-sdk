import { describe, expect, it } from "vitest";
import type { RunnerDeepResearchSession, RunnerLog } from "../../types.js";
import {
  extractDeepResearchSessionIdFromLogs,
  extractDeepResearchTopicFromGroup,
  isDeepResearchSessionActive,
  resolveDeepResearchSessionForGroup,
} from "./deep-research-session.js";

const baseLog: RunnerLog = {
  time: "00:00",
  message: "Researching",
  type: "info",
};

describe("deep research session projection", () => {
  it("prefers structured session identity and topic metadata", () => {
    const log: RunnerLog = {
      ...baseLog,
      metadata: {
        deepResearch: {
          event: "session_started",
          sessionId: " session_1 ",
          topic: " Platform architecture ",
        },
      },
    };
    expect(extractDeepResearchSessionIdFromLogs([log])).toBe("session_1");
    expect(extractDeepResearchTopicFromGroup([log])).toBe("Platform architecture");
  });

  it("falls back to the deep-research command topic", () => {
    expect(extractDeepResearchTopicFromGroup([], {
      ...baseLog,
      metadata: {
        command: 'python deep-research.py "permission systems"',
      },
    })).toBe("permission systems");
  });

  it("matches the nearest session when no explicit id exists", () => {
    const startedAtMs = Date.parse("2026-07-16T10:00:00.000Z");
    const sessions = [
      {
        id: "far",
        topic: "Other",
        status: "running",
        createdAt: "2026-07-16T09:50:00.000Z",
      },
      {
        id: "near",
        topic: "Other",
        status: "running",
        createdAt: "2026-07-16T10:00:05.000Z",
      },
    ] as RunnerDeepResearchSession[];
    expect(resolveDeepResearchSessionForGroup({
      logs: [],
      turn: {
        id: "turn",
        prompt: "Research",
        logs: [],
        startedAtMs,
        status: "running",
      },
      sessions,
    })?.id).toBe("near");
  });

  it("recognizes terminal statuses", () => {
    expect(isDeepResearchSessionActive({
      id: "running",
      topic: "Topic",
      status: "running",
    } as RunnerDeepResearchSession)).toBe(true);
    expect(isDeepResearchSessionActive({
      id: "done",
      topic: "Topic",
      status: "completed",
    } as RunnerDeepResearchSession)).toBe(false);
  });
});

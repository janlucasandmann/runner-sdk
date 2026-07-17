import { describe, expect, it } from "vitest";

import {
  findRunnerWorkingLogJsonSegments,
  formatRunnerWorkingLogJsonPreview,
  splitRunnerWorkingLogJsonContent,
} from "./working-log-json.js";

describe("working-log JSON segmentation", () => {
  it("recognizes a complete JSON payload", () => {
    expect(splitRunnerWorkingLogJsonContent('{"ok":true}', "Result")).toEqual([
      {
        kind: "json",
        value: { ok: true },
        id: "json-0",
        title: "Result",
      },
    ]);
  });

  it("keeps surrounding prose and labels inline JSON documents", () => {
    expect(
      splitRunnerWorkingLogJsonContent(
        'Request payload: {"query":"hello } world"} Complete.',
        "JSON",
      ),
    ).toEqual([
      {
        kind: "markdown",
        content: "Request payload:",
        id: "markdown-0",
      },
      {
        kind: "json",
        value: { query: "hello } world" },
        id: "json-0",
        title: "Request Payload",
      },
      {
        kind: "markdown",
        content: "Complete.",
        id: "markdown-2",
      },
    ]);
  });

  it("ignores non-JSON code fences and selects the first structured candidate", () => {
    const segments = findRunnerWorkingLogJsonSegments([
      "No structured value here.",
      'Before\n```json\n[{"id":1}]\n```\nAfter',
    ]);
    expect(segments.map((segment) => segment.kind)).toEqual([
      "markdown",
      "json",
      "markdown",
    ]);
  });

  it("formats compact structural previews", () => {
    expect(formatRunnerWorkingLogJsonPreview({ first: 1, second: 2 })).toBe(
      "2 fields",
    );
    expect(formatRunnerWorkingLogJsonPreview([1])).toBe("1 item");
    expect(formatRunnerWorkingLogJsonPreview(false)).toBe("false");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createInitialRunnerThreadProjection } from "../../thread/projection.js";
import {
  RunnerThreadLiveWorkStatus,
  resolveRunnerThreadLiveWorkStatusLabel,
} from "./live-work-status.js";

describe("RunnerThreadLiveWorkStatus", () => {
  it("uses an informative timeline fallback while the canonical projection connects", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    expect(resolveRunnerThreadLiveWorkStatusLabel(
      projection,
      "validating the workflow output",
    )).toBe("Validating the workflow output");
  });

  it("does not expose a generic thread lifecycle message", () => {
    const projection = createInitialRunnerThreadProjection("thread-1");
    expect(resolveRunnerThreadLiveWorkStatusLabel(
      projection,
      "Thread is running.",
    )).toBe("Working...");
  });

  it("renders the shared spinner and optional workflow-node context", () => {
    const html = renderToStaticMarkup(
      <RunnerThreadLiveWorkStatus
        backendUrl=""
        threadId="thread-1"
        enabled={false}
        fallbackLabel="Inspecting project context"
        contextLabel="Analyze evidence"
      />,
    );

    expect(html).toContain("tb-thread-live-work-status");
    expect(html).toContain('src="/img/spinner.svg"');
    expect(html).toContain("Analyze evidence");
    expect(html).toContain("Inspecting project context");
    expect(html).not.toContain("aria-expanded");
  });
});

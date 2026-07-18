import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RunnerThreadContextControl } from "./thread-context-control.js";

describe("RunnerThreadContextControl", () => {
  it("renders a grounded context title and progress value", () => {
    const html = renderToStaticMarkup(
      <RunnerThreadContextControl
        actionAvailability={{
          compact: true,
          clear: true,
          btw: true,
          fork: true,
        }}
        actionLoading={null}
        animation={false}
        buttonRef={createRef<HTMLButtonElement>()}
        context={{
          threadId: "thread_1",
          sessionId: "session_1",
          model: "test",
          maxTokens: 1000,
          usedTokens: 250,
          remainingTokens: 750,
          remainingRatio: 0.75,
          source: "test",
          exact: true,
        }}
        currentThreadId="thread_1"
        details={null}
        detailsError={null}
        detailsLoading={false}
        hasApiKey
        hasAssistantAnswer
        hasMessages
        indicatorLoading={false}
        onAction={vi.fn()}
        onIndicatorClick={vi.fn()}
        onRefresh={vi.fn()}
        open={false}
        popupRef={createRef<HTMLDivElement>()}
        popupStyle={null}
      />,
    );

    expect(html).toContain("Conversation context remaining: 75%");
    expect(html).toContain("--tb-context-progress:0.25");
  });
});

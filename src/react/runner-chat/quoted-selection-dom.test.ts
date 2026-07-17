// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  findQuotedSelectionContainer,
  getQuotedSelectionSourceType,
} from "./quoted-selection-dom.js";

describe("quoted selection DOM projection", () => {
  it("finds eligible worker and summary content", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="agent-step-content"><span id="work">work</span></div>
      <div class="tb-turn-summary"><span id="summary">summary</span></div>
    `;
    document.body.append(root);

    const work = root.querySelector("#work");
    const summary = root.querySelector("#summary");
    expect(findQuotedSelectionContainer(
      work?.firstChild || null,
      root,
    )?.classList.contains("agent-step-content")).toBe(true);
    const summaryContainer = findQuotedSelectionContainer(
      summary?.firstChild || null,
      root,
    );
    expect(summaryContainer?.classList.contains("tb-turn-summary")).toBe(true);
    if (!summaryContainer) {
      throw new Error("Expected a run-summary selection container.");
    }
    expect(getQuotedSelectionSourceType(summaryContainer)).toBe("run_summary");
  });

  it("rejects selection from user and composer surfaces", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="tb-user-turn-shell">
        <div class="agent-step-content"><span id="user">user</span></div>
      </div>
    `;
    expect(findQuotedSelectionContainer(
      root.querySelector("#user")?.firstChild || null,
      root,
    )).toBeNull();
  });
});

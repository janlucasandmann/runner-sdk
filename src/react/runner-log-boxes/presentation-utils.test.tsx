import { describe, expect, it } from "vitest";

import {
  sanitizeSubagentDisplayText,
  truncateSubagentPreviewText,
} from "./presentation-utils.js";

describe("runner log presentation helpers", () => {
  it("removes private subagent protocol fields", () => {
    expect(
      sanitizeSubagentDisplayText(
        "agentId: agent_123\n\nUseful result\n<usage>42 tokens</usage>",
      ),
    ).toBe("Useful result");
  });

  it("truncates normalized previews", () => {
    expect(truncateSubagentPreviewText("abcdefgh", 5)).toBe("abcde...");
  });
});

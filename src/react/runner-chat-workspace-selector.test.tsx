// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunnerChat } from "./runner-chat.js";

describe("RunnerChat workspace selector", () => {
  it("remains visible while computer and project options are loading", () => {
    render(
      <RunnerChat
        backendUrl=""
        apiKey=""
        inputMode="computer-agents"
        environments={[]}
        computerAgents={{ projects: { items: [] } }}
        autoCreateThread={false}
      />
    );

    expect(screen.getByRole("button", { name: "Default" })).not.toBeNull();
  });
});

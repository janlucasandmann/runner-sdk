import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  RunnerAgentSelectorControl,
  RunnerComposerOrganizationSelector,
} from "./composer-selector-controls.js";

describe("composer selector controls", () => {
  it("renders the selected agent and reasoning effort", () => {
    const html = renderToStaticMarkup(
      <RunnerAgentSelectorControl
        animation={false}
        availableModes={["agents"]}
        buttonRef={createRef<HTMLButtonElement>()}
        displayedAgentLabel="Forge"
        hasApiKey
        hidden={false}
        mode="agents"
        onCloseReasoning={vi.fn()}
        onDoneReasoning={vi.fn()}
        onModeChange={vi.fn()}
        onOpenReasoning={vi.fn()}
        onSelectAgent={vi.fn()}
        onSelectReasoningEffort={vi.fn()}
        onToggle={vi.fn()}
        open={false}
        options={[{ id: "agent_1", name: "Forge" }]}
        popupRef={createRef<HTMLDivElement>()}
        popupStyle={null}
        reasoningEffort="high"
        reasoningOpen={false}
        reasoningPopupAnimation={false}
        reasoningPopupRef={createRef<HTMLDivElement>()}
        reasoningPopupStyle={null}
        selectedAgentId="agent_1"
        totalAgentCount={1}
      />,
    );

    expect(html).toContain("Forge");
    expect(html).toContain("Max");
  });

  it("resolves the default organization label", () => {
    const html = renderToStaticMarkup(
      <RunnerComposerOrganizationSelector
        animation={false}
        buttonRef={createRef<HTMLButtonElement>()}
        canChange
        onSelect={vi.fn()}
        onToggle={vi.fn()}
        open={false}
        options={[
          { id: "org_1", name: "Testbase", isDefault: true },
          { id: "org_2", name: "Other" },
        ]}
        organizationId={null}
        popupRef={createRef<HTMLDivElement>()}
        popupStyle={null}
      />,
    );

    expect(html).toContain("Organization: Testbase");
    expect(html).toContain(">Testbase</span>");
  });
});

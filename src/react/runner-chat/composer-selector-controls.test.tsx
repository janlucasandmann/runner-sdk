// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RunnerAgentSelectorControl,
  RunnerComposerOrganizationSelector,
  RunnerWorkspaceSelectorControl,
} from "./composer-selector-controls.js";

afterEach(cleanup);

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
        locked
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
    expect(html).toContain("tb-selector-anchor-agent");
    expect(html).toContain('class="tb-inline-selector-label"');
    expect(html).toContain('title="Forge"');
    expect(html).toContain('data-platform-hover-label="Agent"');
    expect(html).toContain("is-locked");
    expect(html).toContain("disabled");
  });

  it("fills the reasoning-effort secondary popup with its switch", () => {
    render(
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
        reasoningOpen
        reasoningPopupAnimation={false}
        reasoningPopupRef={createRef<HTMLDivElement>()}
        reasoningPopupStyle={null}
        selectedAgentId="agent_1"
        totalAgentCount={1}
      />,
    );

    const switchElement = document.body.querySelector<HTMLElement>(
      '[role="radiogroup"][aria-label="Reasoning effort"]',
    );
    expect(switchElement?.classList.contains("is-full-width")).toBe(true);
  });

  it("marks the selected workspace label as a truncation target", () => {
    const workspaceName = "A very long computer environment name";
    const html = renderToStaticMarkup(
      <RunnerWorkspaceSelectorControl
        animation={false}
        buttonRef={createRef<HTMLButtonElement>()}
        displayedWorkspaceLabel={workspaceName}
        effectiveMode="computers"
        environments={[{ id: "environment_1", name: workspaceName }]}
        hasApiKey
        hidden={false}
        locked
        mode="computers"
        onModeChange={vi.fn()}
        onSelectEnvironment={vi.fn()}
        onSelectProject={vi.fn()}
        onToggle={vi.fn()}
        open={false}
        popupRef={createRef<HTMLDivElement>()}
        popupStyle={null}
        projects={[]}
        selectedEnvironmentId="environment_1"
        selectedProjectId=""
      />,
    );

    expect(html).toContain("tb-selector-anchor-workspace");
    expect(html).toContain('class="tb-inline-selector-label"');
    expect(html).toContain(`title="${workspaceName}"`);
    expect(html).toContain('data-platform-hover-label="Environment"');
    expect(html).toContain("is-locked");
    expect(html).toContain("disabled");
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

// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunnerWorkStatusDisclosure } from "../../platform-ui/components/thread-components/work-status-disclosure/index.js";
import { RunnerTurnIdentity } from "./turn-presentation.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("RunnerTurnIdentity", () => {
  it("keeps the agent and environment presentation identical for hydrated turns", () => {
    const onAgentClick = vi.fn();
    const { container } = render(
      <RunnerTurnIdentity
        agentName="Spark"
        agentPhotoUrl="/spark.webp"
        environmentName="Default"
        onAgentClick={onAgentClick}
      />,
    );

    expect(screen.getByText("Spark")).toBeTruthy();
    expect(screen.getByText("Default")).toBeTruthy();
    expect(container.querySelector(".tb-turn-agent-avatar-image")?.getAttribute("src")).toBe(
      "/spark.webp",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open agent details for Spark" }));
    expect(onAgentClick).toHaveBeenCalledTimes(1);
  });

  it("animates the Spark avatar only while that agent is generating", () => {
    const { container, rerender } = render(
      <RunnerTurnIdentity
        agentName="Spark"
        agentPhotoUrl="/img/agent-profile-pics/spark.webp"
        environmentName="Default"
      />,
    );

    expect(container.querySelector(".tb-turn-agent-avatar-image")?.getAttribute("src")).toBe(
      "/img/agent-profile-pics/spark.webp",
    );

    rerender(
      <RunnerTurnIdentity
        agentName="Spark"
        agentPhotoUrl="/img/agent-profile-pics/spark.webp"
        environmentName="Default"
        isGenerating
      />,
    );

    expect(container.querySelector(".tb-turn-agent-avatar-image")?.getAttribute("src")).toBe(
      "/img/agent-profile-pics/exp-spark.gif",
    );
    expect(container.querySelector(".tb-turn-agent-avatar")?.classList.contains("is-generating")).toBe(true);

    rerender(
      <RunnerTurnIdentity
        agentName="Forge"
        agentPhotoUrl="/img/agent-profile-pics/forge.webp"
        environmentName="Default"
        isGenerating
      />,
    );

    expect(container.querySelector(".tb-turn-agent-avatar-image")?.getAttribute("src")).toBe(
      "/img/agent-profile-pics/forge.webp",
    );
  });

  it("animates the Spark avatar on hover without changing other agent images", () => {
    const { container, rerender } = render(
      <RunnerTurnIdentity
        agentName="Spark"
        agentPhotoUrl="/img/agent-profile-pics/spark.webp"
        environmentName="Default"
      />,
    );
    const avatar = () => container.querySelector(".tb-turn-agent-avatar") as Element;
    const image = () => container.querySelector(".tb-turn-agent-avatar-image")?.getAttribute("src");

    expect(image()).toBe("/img/agent-profile-pics/spark.webp");
    fireEvent.mouseEnter(avatar());
    expect(image()).toBe("/img/agent-profile-pics/exp-spark.gif");
    fireEvent.mouseLeave(avatar());
    expect(image()).toBe("/img/agent-profile-pics/spark.webp");

    rerender(
      <RunnerTurnIdentity
        agentName="Forge"
        agentPhotoUrl="/img/agent-profile-pics/forge.webp"
        environmentName="Default"
      />,
    );
    fireEvent.mouseEnter(avatar());
    expect(image()).toBe("/img/agent-profile-pics/forge.webp");
  });

  it("can make the complete standard identity header navigable", () => {
    const onClick = vi.fn();
    render(
      <RunnerTurnIdentity
        agentName="Spark"
        agentPhotoUrl="/spark.webp"
        environmentName="Default"
        onClick={onClick}
        ariaLabel="Open Maintain project issues"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Maintain project issues" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("RunnerWorkStatusDisclosure", () => {
  it("controls raw work entries from one compact disclosure row", () => {
    const onLoadMore = vi.fn();
    const onExpandedChange = vi.fn();
    const { container, rerender } = render(
      <RunnerWorkStatusDisclosure
        expanded={false}
        hasMore
        headline="Worked for 43s"
        items={[
          { key: "one", content: <span>Read project files</span> },
          { key: "two", content: <span>Updated configuration</span> },
        ]}
        onExpandedChange={onExpandedChange}
        onLoadMore={onLoadMore}
      />,
    );

    const disclosure = screen.getByRole("button", { name: "Worked for 43s" });
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    const collapsedLog = container.querySelector(".tb-work-collapse");
    expect(collapsedLog?.getAttribute("aria-hidden")).toBe("true");
    expect(collapsedLog?.textContent).toContain("Read project files");
    expect(collapsedLog?.textContent).toContain("Updated configuration");

    fireEvent.click(disclosure);
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    rerender(
      <RunnerWorkStatusDisclosure
        expanded
        hasMore
        headline="Worked for 43s"
        items={[
          { key: "one", content: <span>Read project files</span> },
          { key: "two", content: <span>Updated configuration</span> },
        ]}
        onExpandedChange={onExpandedChange}
        onLoadMore={onLoadMore}
      />,
    );

    const loadMoreButton = screen.getByRole("button", { name: "Load more..." });
    expect(loadMoreButton.getAttribute("data-platform-button-variant")).toBe("secondary");
    fireEvent.click(loadMoreButton);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("announces the latest live work summary without inventing a log body", () => {
    const { container } = render(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Validating service contracts"
        items={[]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(
      screen.getByText("Validating service contracts").getAttribute("aria-live"),
    ).toBe("polite");
    expect(container.querySelector(".tb-work-status-loader .tb-log-inline-status-dot-loader")).toBeTruthy();
    expect(container.querySelector(".tb-work-header.is-static")).toBeTruthy();
  });

  it("retains only the latest available entry whenever the disclosure is collapsed", () => {
    const { container, rerender } = render(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Running automated tests"
        items={[
          { key: "one", content: <span>Read project files</span>, isToolCall: true },
          { key: "two", content: <span>Updated configuration</span>, isToolCall: true },
          { key: "three", content: <span>Ran service tests</span>, isToolCall: true },
        ]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    const liveTail = container.querySelector(".tb-work-live-tail");
    expect(liveTail?.textContent).toContain("Ran service tests");
    expect(liveTail?.textContent).not.toContain("Read project files");
    expect(liveTail?.textContent).not.toContain("Updated configuration");

    rerender(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Worked for 43s"
        items={[
          { key: "one", content: <span>Read project files</span>, isToolCall: true },
          { key: "two", content: <span>Updated configuration</span>, isToolCall: true },
          { key: "three", content: <span>Ran service tests</span>, isToolCall: true },
        ]}
        live={false}
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail")?.textContent).toContain("Ran service tests");
    expect(container.querySelector(".tb-work-collapse")?.getAttribute("aria-hidden")).toBe("true");

    rerender(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Worked for 43s"
        items={[]}
        live={false}
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail")?.textContent).toContain("Ran service tests");
  });

  it("slides and crossfades the retained latest entry when a newer log arrives", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Inspecting workspace files"
        items={[{ key: "one", content: <span>Read project files</span>, isToolCall: true }]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    rerender(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Updating configuration"
        items={[
          { key: "one", content: <span>Read project files</span>, isToolCall: true },
          { key: "two", content: <span>Updated configuration</span>, isToolCall: true },
        ]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail-transition-item.is-exiting")?.textContent).toContain(
      "Read project files",
    );
    expect(container.querySelector(".tb-work-live-tail-transition-item.is-entering")?.textContent).toContain(
      "Updated configuration",
    );

    act(() => {
      vi.advanceTimersByTime(220);
    });

    expect(container.querySelector(".tb-work-live-tail-transition-item.is-exiting")).toBeNull();
    expect(container.querySelector(".tb-work-live-tail")?.textContent).toContain("Updated configuration");
  });

  it("keeps the latest tool call visible when newer reasoning logs arrive", () => {
    const readTool = {
      key: "tool-read",
      content: <span>Read project files</span>,
      isToolCall: true,
    };
    const { container, rerender } = render(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Inspecting workspace files"
        items={[readTool]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    rerender(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Considering the next step"
        items={[
          readTool,
          { key: "reasoning", content: <span>Considering the next step</span>, isToolCall: false },
        ]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail")?.textContent).toContain("Read project files");
    expect(container.querySelector(".tb-work-live-tail")?.textContent).not.toContain("Considering the next step");
    expect(container.querySelector(".tb-work-live-tail-transition-item.is-exiting")).toBeNull();

    rerender(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Running service tests"
        items={[
          readTool,
          { key: "reasoning", content: <span>Considering the next step</span>, isToolCall: false },
          { key: "tool-test", content: <span>Ran service tests</span>, isToolCall: true },
        ]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail-transition-item.is-entering")?.textContent).toContain(
      "Ran service tests",
    );
  });

  it("hides the collapsed preview after the run summary arrives while retaining expandable history", () => {
    const items = [
      { key: "one", content: <span>Read project files</span>, isToolCall: true },
      { key: "two", content: <span>Ran service tests</span>, isToolCall: true },
    ];
    const { container, rerender } = render(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Running automated tests"
        items={items}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail")?.textContent).toContain("Ran service tests");

    rerender(
      <RunnerWorkStatusDisclosure
        expanded={false}
        headline="Worked for 43s"
        items={items}
        live={false}
        showCollapsedPreview={false}
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail")).toBeNull();
    expect(container.querySelector(".tb-work-collapse")?.getAttribute("aria-hidden")).toBe("true");

    rerender(
      <RunnerWorkStatusDisclosure
        expanded
        headline="Worked for 43s"
        items={items}
        live={false}
        showCollapsedPreview={false}
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-collapse")?.textContent).toContain("Read project files");
    expect(container.querySelector(".tb-work-collapse")?.textContent).toContain("Ran service tests");
  });

  it("renders the complete supplied log instead of a live tail when expanded", () => {
    const { container } = render(
      <RunnerWorkStatusDisclosure
        expanded
        headline="Running automated tests"
        items={[
          { key: "one", content: <span>Read project files</span> },
          { key: "two", content: <span>Updated configuration</span> },
          { key: "three", content: <span>Ran service tests</span> },
        ]}
        live
        onExpandedChange={vi.fn()}
      />,
    );

    expect(container.querySelector(".tb-work-live-tail")).toBeNull();
    expect(container.querySelector(".tb-work-collapse")?.textContent).toContain("Read project files");
    expect(container.querySelector(".tb-work-collapse")?.textContent).toContain("Ran service tests");
  });
});

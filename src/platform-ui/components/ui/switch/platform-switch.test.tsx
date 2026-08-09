// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformSwitch } from "./platform-switch.js";

const OPTIONS = [
  { value: "agents", label: "Agents" },
  { value: "squads", label: "Squads" },
];

afterEach(cleanup);

describe("PlatformSwitch", () => {
  it("renders the controlled active option", () => {
    render(
      <PlatformSwitch
        ariaLabel="Agent type"
        value="agents"
        options={OPTIONS}
        onValueChange={() => undefined}
      />
    );

    expect(screen.getByRole("radio", { name: "Agents" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Squads" }).getAttribute("aria-checked")).toBe("false");
  });

  it("emits option changes", () => {
    const onValueChange = vi.fn();
    render(
      <PlatformSwitch
        ariaLabel="Agent type"
        value="agents"
        options={OPTIONS}
        onValueChange={onValueChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Squads" }));
    expect(onValueChange).toHaveBeenCalledWith("squads");
  });

  it("moves one shared indicator between variable-width options", () => {
    const { container, rerender } = render(
      <PlatformSwitch
        ariaLabel="Agent type"
        value="agents"
        options={OPTIONS}
        onValueChange={() => undefined}
      />
    );
    const agentOption = screen.getByRole("radio", { name: "Agents" });
    const squadOption = screen.getByRole("radio", { name: "Squads" });
    Object.defineProperties(agentOption, {
      offsetLeft: { configurable: true, value: 0 },
      offsetWidth: { configurable: true, value: 72 },
    });
    Object.defineProperties(squadOption, {
      offsetLeft: { configurable: true, value: 72 },
      offsetWidth: { configurable: true, value: 84 },
    });
    fireEvent(window, new Event("resize"));

    const indicator = container.querySelector<HTMLElement>(
      ".platform-switch__indicator",
    );
    expect(indicator?.style.width).toBe("72px");
    expect(indicator?.style.transform).toBe("translateX(0px)");

    rerender(
      <PlatformSwitch
        ariaLabel="Agent type"
        value="squads"
        options={OPTIONS}
        onValueChange={() => undefined}
      />
    );
    expect(indicator?.style.width).toBe("84px");
    expect(indicator?.style.transform).toBe("translateX(72px)");
  });

  it("supports arrow-key selection", () => {
    const onValueChange = vi.fn();
    render(
      <PlatformSwitch
        ariaLabel="Agent type"
        value="agents"
        options={OPTIONS}
        onValueChange={onValueChange}
      />
    );

    fireEvent.keyDown(screen.getByRole("radio", { name: "Agents" }), { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledWith("squads");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Squads" }));
  });

  it("supports the shared full-width layout variant", () => {
    const { container } = render(
      <PlatformSwitch
        ariaLabel="Agent type"
        value="agents"
        options={OPTIONS}
        onValueChange={() => undefined}
        fullWidth
      />
    );

    expect(container.querySelector(".platform-switch")?.classList.contains("is-full-width")).toBe(true);
  });
});

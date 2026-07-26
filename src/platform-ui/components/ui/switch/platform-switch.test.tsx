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

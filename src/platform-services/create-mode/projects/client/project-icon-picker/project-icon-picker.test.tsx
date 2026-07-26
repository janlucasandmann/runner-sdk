// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Flame, Rocket } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectIconPicker } from "./project-icon-picker.js";

const iconOptions = [
  { id: "rocket", label: "Rocket", icon: Rocket },
  { id: "flame", label: "Flame", icon: Flame },
] as const;

const colorOptions = ["#79d0ff", "#ef5858"] as const;

afterEach(() => cleanup());

describe("ProjectIconPicker", () => {
  it("changes project icons and colors through one serialized callback", async () => {
    const onChange = vi.fn(async () => true);
    render(
      <ProjectIconPicker
        projectName="Computer Agents"
        icon="rocket"
        color="#79d0ff"
        iconOptions={iconOptions}
        colorOptions={colorOptions}
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change icon and color for Computer Agents",
      }),
    );
    const popup = document.querySelector(".platform-project-icon-picker__popup");
    expect(popup?.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(popup?.getAttribute("data-platform-popup-animation")).toBe("down-in");
    fireEvent.click(screen.getByRole("option", { name: "Flame" }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        icon: "flame",
        color: "#79d0ff",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Use #ef5858" }));

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({
        icon: "flame",
        color: "#ef5858",
      });
    });
  });

  it("supports searchable emoji identities", async () => {
    const onChange = vi.fn(async () => true);
    render(
      <ProjectIconPicker
        projectName="Research"
        icon="rocket"
        color="#79d0ff"
        iconOptions={iconOptions}
        colorOptions={colorOptions}
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change icon and color for Research",
      }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Emojis" }));
    fireEvent.change(screen.getByPlaceholderText("Search emojis"), {
      target: { value: "logistics" },
    });
    fireEvent.click(screen.getByRole("option", { name: "Logistics" }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        icon: "emoji:\u{1F69A}",
        color: "#79d0ff",
      });
    });
  });
});

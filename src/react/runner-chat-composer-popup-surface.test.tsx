// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RunnerChat } from "./runner-chat.js";

afterEach(cleanup);

function expectMinimalComposerSurfaces() {
  const surfaces = Array.from(
    document.body.querySelectorAll<HTMLElement>(
      ".tb-composer-popup-portal-root .platform-popup-surface",
    ),
  );
  expect(surfaces.length).toBeGreaterThan(0);
  surfaces.forEach((surface) => {
    expect(surface.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(surface.classList.contains("is-minimal")).toBe(true);
  });
}

describe("RunnerChat task-input popup surfaces", () => {
  it("standardizes task-input popup typography at 12px", () => {
    const composerCss = readFileSync(
      resolve(process.cwd(), "src/react/runner-chat/styles/composer.css"),
      "utf8",
    );

    expect(composerCss).toMatch(
      /\.tb-composer-popup-portal-root \.platform-popup-surface \*[\s\S]*?font-size: 12px !important;/,
    );
    expect(composerCss).toMatch(
      /\.tb-composer-field-selector-popup\.platform-popup-surface \*[\s\S]*?font-size: 12px !important;/,
    );
  });

  it("uses the centralized minimal popup for the main and nested task-input menus", async () => {
    render(
      <RunnerChat
        backendUrl=""
        apiKey="runner-key"
        inputMode="computer-agents"
        environments={[{ id: "environment_1", name: "Default" }]}
        agents={[{ id: "agent_1", name: "Spark" }]}
        autoCreateThread={false}
      />,
    );

    const moreOptionsButton = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="More options"]',
    );
    expect(moreOptionsButton).not.toBeNull();
    if (!moreOptionsButton) throw new Error("More options button was not rendered");
    fireEvent.click(moreOptionsButton);

    const mainPopup = await waitFor(() => {
      const popup = document.body.querySelector<HTMLElement>(".tb-popup-menu-main");
      expect(popup).not.toBeNull();
      if (!popup) throw new Error("Task-input popup was not rendered");
      return popup;
    });
    expectMinimalComposerSurfaces();

    fireEvent.click(within(mainPopup).getByRole("button", { name: "Skills" }));
    await waitFor(() => {
      expect(document.body.querySelector(".tb-popup-menu-skills")).not.toBeNull();
    });
    expectMinimalComposerSurfaces();
  });
});

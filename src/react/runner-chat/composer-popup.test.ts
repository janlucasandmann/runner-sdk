// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emitRunnerComposerPopupOpen,
  getMainPopupRenderId,
  getRunnerComposerPopupEventSource,
  getSidePopupRenderId,
  isPlusPopupId,
  RunnerComposerPopupSurface,
} from "./composer-popup.js";

afterEach(cleanup);

describe("composer popup routing", () => {
  it("projects the active popup into main and side surfaces", () => {
    expect(isPlusPopupId("skills")).toBe(true);
    expect(isPlusPopupId("context")).toBe(false);
    expect(getMainPopupRenderId("agent-reasoning")).toBe("agent");
    expect(getMainPopupRenderId("github")).toBe("main");
    expect(getSidePopupRenderId("github")).toBe("github");
    expect(getSidePopupRenderId("organization")).toBeNull();
  });

  it("coordinates popup ownership through a typed window event", () => {
    const listener = vi.fn((event: Event) => getRunnerComposerPopupEventSource(event));
    window.addEventListener("tb-runner-composer-popup-open", listener);
    emitRunnerComposerPopupOpen("composer-1");
    window.removeEventListener("tb-runner-composer-popup-open", listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.results[0]?.value).toBe("composer-1");
  });

  it("locks task-input popup surfaces to the centralized minimal variant", () => {
    const { container } = render(
      createElement(
        RunnerComposerPopupSurface,
        { role: "menu", className: "composer-test-popup" },
        "Composer actions",
      ),
    );

    const surface = container.querySelector(".composer-test-popup");
    expect(surface?.classList.contains("platform-popup-surface")).toBe(true);
    expect(surface?.classList.contains("is-minimal")).toBe(true);
    expect(surface?.getAttribute("data-platform-popup-variant")).toBe("minimal");
  });
});

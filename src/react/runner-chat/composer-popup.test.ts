// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import {
  emitRunnerComposerPopupOpen,
  getMainPopupRenderId,
  getRunnerComposerPopupEventSource,
  getSidePopupRenderId,
  isPlusPopupId,
} from "./composer-popup.js";

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
    const listener = vi.fn((event: Event) =>
      getRunnerComposerPopupEventSource(event));
    window.addEventListener("tb-runner-composer-popup-open", listener);
    emitRunnerComposerPopupOpen("composer-1");
    window.removeEventListener("tb-runner-composer-popup-open", listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.results[0]?.value).toBe("composer-1");
  });
});

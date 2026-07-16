// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPlatformDefaultPermissionSet,
  getPlatformPermissionRingAccessById,
} from "../../../platform-ui/pages/permissions/index.js";
import {
  AgentPermissionsPage,
  getAgentPermissionSummary,
} from "./agent-permissions-page.js";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fill: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
  } as never);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(performance.now() + 300);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AgentPermissionsPage", () => {
  it("owns immutable agent permission updates", async () => {
    const user = userEvent.setup();
    const onPermissionSetChange = vi.fn();
    render(
      <AgentPermissionsPage
        permissionSet={createPlatformDefaultPermissionSet("agent")}
        onPermissionSetChange={onPermissionSetChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Ring 1 default permissions" }));
    await user.click(screen.getByRole("option", { name: "Read only" }));

    expect(onPermissionSetChange).toHaveBeenCalledTimes(1);
    expect(
      getPlatformPermissionRingAccessById(onPermissionSetChange.mock.calls[0][0], "ring_1"),
    ).toBe("read_only");
  });

  it("formats the canonical ring summary", () => {
    expect(getAgentPermissionSummary(createPlatformDefaultPermissionSet("agent"))).toBe(
      "Local: Full access / Shared: Ask permission / Public: Ask permission",
    );
  });
});

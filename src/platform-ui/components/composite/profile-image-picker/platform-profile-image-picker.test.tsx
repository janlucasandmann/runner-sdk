// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS,
  PlatformProfileImagePicker,
} from "./platform-profile-image-picker.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("PlatformProfileImagePicker", () => {
  it("renders a read-only image identity without an interactive trigger", () => {
    const { container } = render(
      <PlatformProfileImagePicker
        value="/avatar.webp"
        fallback="AT"
        editable={false}
        ariaLabel="Atlas profile picture"
      />,
    );

    expect(container.querySelector("img")?.getAttribute("src")).toBe("/avatar.webp");
    expect(screen.queryByRole("button", { name: "Atlas profile picture" })).toBeNull();
  });

  it("opens the shared popup and reports the selected preset", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <PlatformProfileImagePicker
        value={PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS[0].url}
        fallback="AT"
        ariaLabel="Choose avatar"
        onChange={onChange}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Choose avatar" }));
    const option = await screen.findByRole("option", {
      name: PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS[1].label,
    });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(
      PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS[1].url,
      PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS[1],
    );
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(screen.queryByRole("listbox", { name: "Profile picture options" })).toBeNull();
  });
});

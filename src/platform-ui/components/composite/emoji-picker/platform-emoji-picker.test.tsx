// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformEmojiPicker } from "./platform-emoji-picker.js";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlatformEmojiPicker", () => {
  it("renders the searchable grouped minimal picker and selects a reaction", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSelect = vi.fn().mockResolvedValue(undefined);

    render(
      <PlatformEmojiPicker
        open
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("searchbox", { name: "Search emoji" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Frequently used" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Smileys & People" })).not.toBeNull();

    await user.click(screen.getAllByRole("button", { name: "React with 😂" })[0]);
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("😂"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows a stable empty result while filtering", async () => {
    const user = userEvent.setup();

    render(
      <PlatformEmojiPicker
        open
        onOpenChange={() => undefined}
        onSelect={() => undefined}
      />,
    );

    await user.type(screen.getByRole("searchbox", { name: "Search emoji" }), "not-an-emoji");
    expect(screen.getByText("No emoji found.")).not.toBeNull();
  });

  it("finds emoji by descriptive keywords", async () => {
    const user = userEvent.setup();

    render(
      <PlatformEmojiPicker
        open
        onOpenChange={() => undefined}
        onSelect={() => undefined}
      />,
    );

    await user.type(screen.getByRole("searchbox", { name: "Search emoji" }), "heart");
    expect(screen.getAllByRole("button", { name: "React with ❤️" }).length).toBeGreaterThan(0);
  });
});

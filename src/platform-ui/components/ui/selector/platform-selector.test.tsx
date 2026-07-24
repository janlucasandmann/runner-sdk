// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { PlatformSelector } from "./platform-selector.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformSelector", () => {
  it("renders the selected label with ChevronsUpDown and selects from PlatformPopup", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <PlatformSelector
        value="full_access"
        options={[
          { value: "full_access", label: "Full access" },
          { value: "read_only", label: "Read only" },
        ]}
        ariaLabel="Default permissions"
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Default permissions" });
    expect(trigger.textContent).toContain("Full access");
    expect(trigger.querySelector(".lucide-chevrons-up-down")).not.toBeNull();

    await user.click(trigger);

    const popup = document.body.querySelector(
      ".platform-popup-surface.platform-selector__popup.is-minimal.is-portaled",
    );
    expect(popup).not.toBeNull();
    expect(popup?.parentElement).toBe(document.body);
    expect(container.querySelector(".platform-popup-surface")).toBeNull();
    expect(screen.getByRole("listbox", { name: "Default permissions options" })).not.toBeNull();
    await user.click(screen.getByRole("option", { name: "Read only" }));

    expect(onValueChange).toHaveBeenCalledWith(
      "read_only",
      expect.objectContaining({ value: "read_only", label: "Read only" }),
    );
    expect(screen.queryByRole("listbox", { name: "Default permissions options" })).toBeNull();
  });

  it("dismisses on outside interaction and Escape", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <PlatformSelector
          value="one"
          options={[
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
          ]}
          ariaLabel="Number"
        />
        <button type="button">Outside</button>
      </div>,
    );

    const trigger = screen.getByRole("button", { name: "Number" });
    await user.click(trigger);
    expect(screen.getByRole("listbox", { name: "Number options" })).not.toBeNull();

    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("listbox", { name: "Number options" })).toBeNull();

    await user.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("listbox", { name: "Number options" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("supports custom trigger and option content", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSelector
        value="andrea"
        options={[
          {
            value: "andrea",
            label: "Andrea",
            description: "andrea@example.com",
            leading: <span data-testid="avatar">A</span>,
            trailing: <span data-testid="shortcut">1</span>,
          },
        ]}
        label={<span data-testid="owner-label">Andrea</span>}
        ariaLabel="Choose owner"
        fullWidth
      />,
    );

    expect(screen.getByTestId("owner-label")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Choose owner" }));
    expect(screen.getByTestId("avatar")).not.toBeNull();
    expect(screen.getByTestId("shortcut")).not.toBeNull();
    expect(screen.getByText("andrea@example.com")).not.toBeNull();
  });

  it("keeps focus in an autofocus popup header instead of moving it to an option", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSelector
        value="todo"
        options={[
          { value: "todo", label: "Todo" },
          { value: "done", label: "Done" },
        ]}
        popupHeader={<input aria-label="Search statuses" autoFocus />}
        ariaLabel="Choose status"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Choose status" }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Search statuses" }));
  });

  it("supports an interactive popup header outside the listbox", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSelector
        value="andrea"
        options={[{ value: "andrea", label: "Andrea" }]}
        popupHeader={<button type="button">People</button>}
        ariaLabel="Choose assignee"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Choose assignee" }));

    const listbox = screen.getByRole("listbox", { name: "Choose assignee options" });
    expect(screen.getByRole("button", { name: "People" })).not.toBeNull();
    expect(listbox.contains(screen.getByRole("button", { name: "People" }))).toBe(false);
  });

  it("supports custom popup content without rendering an options list", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSelector
        value="scheduled"
        options={[]}
        label="Tomorrow"
        popupContent={<input aria-label="Run at" />}
        popupAriaLabel="Edit schedule"
        ariaLabel="Select ticket schedule"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Select ticket schedule" }));

    const popup = screen.getByRole("dialog", { name: "Edit schedule" });
    expect(popup.classList.contains("has-custom-content")).toBe(true);
    expect(screen.getByRole("textbox", { name: "Run at" })).not.toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports right-edge popup alignment independently from trigger alignment", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSelector
        value="full_access"
        options={[
          { value: "full_access", label: "Full access" },
          { value: "read_only", label: "Read only" },
        ]}
        ariaLabel="Right aligned permissions"
        alignment="start"
        popupAlignment="right"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Right aligned permissions" }));

    expect(
      screen.getByRole("listbox", { name: "Right aligned permissions options" })
        .closest(".platform-popup-surface")
        ?.getAttribute("data-platform-popup-placement"),
    ).toBe("bottom-end");
  });
});

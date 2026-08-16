// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, type FormEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformSetupModal, PlatformSetupModalStep } from "./platform-setup-modal.js";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("PlatformSetupModal", () => {
  it("provides the shared split setup composition without replacing modal behavior", () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLElement>) => event.preventDefault());
    const inputRef = createRef<HTMLInputElement>();

    render(
      <PlatformSetupModal
        open
        visible
        portal={false}
        title="Create webhook"
        description="Route external events into agent work."
        features={[
          { id: "automation", icon: <span>1</span>, title: "Start work automatically" },
          { id: "routing", icon: <span>2</span>, title: "Keep routing explicit" },
        ]}
        onClose={onClose}
        as="form"
        initialFocusRef={inputRef}
        surfaceProps={{ onSubmit }}
        footer={<button type="submit">Create webhook</button>}
      >
        <PlatformSetupModalStep number={1} title="Name the webhook">
          <input ref={inputRef} aria-label="Webhook name" />
        </PlatformSetupModalStep>
        <PlatformSetupModalStep
          number={2}
          title="Choose an event"
          description="Select the source and event that should start work."
        >
          Event controls
        </PlatformSetupModalStep>
      </PlatformSetupModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Create webhook" });
    expect(dialog.classList.contains("platform-setup-modal")).toBe(true);
    expect(dialog.querySelector(".platform-setup-modal__intro")).not.toBeNull();
    expect(dialog.querySelector(".platform-setup-modal__workspace")).not.toBeNull();
    expect(screen.getByText("Start work automatically")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Name the webhook", level: 3 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Choose an event", level: 3 })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Webhook name"));

    fireEvent.submit(dialog);
    expect(onSubmit).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Close setup" }));
    expect(onClose).toHaveBeenCalledWith("close-button");
  });

  it("blocks every dismissal path while setup is busy", () => {
    const onClose = vi.fn();
    const { container } = render(
      <PlatformSetupModal open visible portal={false} title="Create webhook" onClose={onClose} busy>
        Setup
      </PlatformSetupModal>,
    );

    expect(
      (screen.getByRole("button", { name: "Close setup" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    fireEvent.click(container.querySelector(".platform-modal-backdrop") as HTMLElement);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

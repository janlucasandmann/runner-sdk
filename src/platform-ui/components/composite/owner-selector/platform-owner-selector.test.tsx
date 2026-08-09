// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformOwnerSelector } from "./platform-owner-selector.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("PlatformOwnerSelector", () => {
  it("confirms an ownership transfer before invoking the mutation", async () => {
    const user = userEvent.setup();
    const onTransfer = vi.fn().mockResolvedValue(undefined);
    render(
      <PlatformOwnerSelector
        owner={{ value: "member-1", name: "Current Owner", email: "owner@example.com" }}
        options={[
          { value: "member-1", name: "Current Owner", email: "owner@example.com" },
          { value: "member-2", name: "Next Owner", email: "next@example.com" },
        ]}
        resourceLabel="organization"
        onTransfer={onTransfer}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Choose owner" }));
    await user.click(await screen.findByRole("option", { name: "Next Owner, next@example.com" }));

    expect(onTransfer).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(screen.getByText(/cannot take the owner role back yourself/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Transfer Ownership" }));
    expect(onTransfer).toHaveBeenCalledWith(
      "member-2",
      expect.objectContaining({ value: "member-2", name: "Next Owner" }),
    );
  });

  it("keeps the confirmation open and reports transfer failures", async () => {
    const user = userEvent.setup();
    render(
      <PlatformOwnerSelector
        owner={{ value: "member-1", name: "Current Owner" }}
        options={[
          { value: "member-1", name: "Current Owner" },
          { value: "member-2", name: "Next Owner" },
        ]}
        onTransfer={() => Promise.reject(new Error("Transfer rejected."))}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Choose owner" }));
    await user.click(await screen.findByRole("option", { name: "Next Owner" }));
    await user.click(screen.getByRole("button", { name: "Transfer Ownership" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Transfer rejected.");
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });
});

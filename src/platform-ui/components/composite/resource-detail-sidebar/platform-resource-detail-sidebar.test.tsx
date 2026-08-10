// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformResourceDetailSidebar } from "./platform-resource-detail-sidebar.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("PlatformResourceDetailSidebar", () => {
  it("renders extensible attributes and the shared owner selector", async () => {
    const user = userEvent.setup();
    const onTransfer = vi.fn().mockResolvedValue(undefined);
    render(
      <PlatformResourceDetailSidebar
        attributes={[{ id: "updated", label: "Updated", value: "Just now" }]}
        creator={{ value: "creator-1", name: "Creator Name" }}
        owner={{ value: "owner-1", name: "Owner Name" }}
        ownerOptions={[
          { value: "owner-1", name: "Owner Name" },
          { value: "owner-2", name: "Next Owner" },
        ]}
        onOwnerTransfer={onTransfer}
        additionalAttributes={[{ id: "id", label: "ID", value: "resource-1" }]}
      />,
    );

    expect(screen.getByText("Updated")).toBeTruthy();
    expect(screen.getByText("Creator Name")).toBeTruthy();
    expect(screen.getByText("Owner Name")).toBeTruthy();
    expect(screen.getByText("resource-1").closest("details")?.open).toBe(false);

    await user.click(screen.getByText("More details"));
    expect(screen.getByText("resource-1")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Choose owner" }));
    await user.click(await screen.findByRole("option", { name: "Next Owner" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(screen.getByText(/irreversible/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Transfer Ownership" }));
    expect(onTransfer).toHaveBeenCalledWith("owner-2", expect.objectContaining({ name: "Next Owner" }));
  });
});

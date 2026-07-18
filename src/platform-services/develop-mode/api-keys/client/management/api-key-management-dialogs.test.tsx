// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiKeyCreateDialog, ApiKeyRevealDialog } from "./api-key-management-dialogs.js";

afterEach(() => {
  cleanup();
});

describe("API key management dialogs", () => {
  it("submits the selected scope through the typed create contract", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<ApiKeyCreateDialog open submitting={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Name"), "Read-only integration");
    await user.type(screen.getByLabelText(/Description/), "Used by the reporting service");
    await user.click(screen.getByRole("button", { name: /Read Only/ }));
    await user.click(screen.getByRole("button", { name: "Create Key" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Read-only integration",
      description: "Used by the reporting service",
      permissions: ["projects:read", "threads:read", "billing:read"],
    });
  });

  it("copies a revealed secret without exposing another command surface", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();

    render(
      <ApiKeyRevealDialog
        state={{
          id: "key_1",
          name: "Automation",
          key: "tb_secret",
          loading: false,
          error: "",
          copied: false,
        }}
        onClose={vi.fn()}
        onCopy={onCopy}
      />,
    );

    expect(screen.getByText("tb_secret")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Copy API key" }));
    expect(onCopy).toHaveBeenCalledOnce();
  });
});

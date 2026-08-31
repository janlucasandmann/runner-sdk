// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformOwnerSelector } from "./platform-owner-selector.js";
import { PlatformOrganizationMemberDirectoryProvider } from "./platform-organization-member-directory.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("PlatformOwnerSelector", () => {
  it("renders a compact circular avatar before the owner name", () => {
    const { container } = render(
      <PlatformOwnerSelector
        owner={{
          value: "member-1",
          name: "Current Owner",
          avatarUrl: "/avatars/current-owner.png",
        }}
        options={[
          {
            value: "member-1",
            name: "Current Owner",
            avatarUrl: "/avatars/current-owner.png",
          },
        ]}
        onTransfer={vi.fn()}
      />,
    );

    const identity = container.querySelector(".platform-owner-selector__identity");
    const avatar = identity?.querySelector(".platform-owner-selector__avatar");
    const image = avatar?.querySelector(".platform-owner-selector__avatar-image");
    const name = identity?.querySelector(".platform-owner-selector__name");

    expect(identity?.firstElementChild).toBe(avatar);
    expect(image?.getAttribute("src")).toBe("/avatars/current-owner.png");
    expect(name?.textContent).toBe("Current Owner");
  });

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
    const search = screen.getByRole("searchbox", { name: "Search owners" });
    expect(search).toBeTruthy();
    await user.type(search, "Next");
    const listbox = screen.getByRole("listbox", { name: "Choose owner options" });
    expect(within(listbox).queryByRole("option", { name: "Current Owner" })).toBeNull();
    expect(screen.getByText("Next Owner")).toBeTruthy();
    expect(screen.queryByText("next@example.com")).toBeNull();
    await user.click(await screen.findByRole("option", { name: "Next Owner" }));

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

  it("prefers a matching profile name over an email-shaped persisted owner label", () => {
    render(
      <PlatformOwnerSelector
        owner={{
          value: "member-1",
          name: "jan@example.com",
          email: "jan@example.com",
        }}
        options={[{
          value: "member-1",
          name: "Jan Sandmann",
          email: "jan@example.com",
        }]}
        onTransfer={vi.fn()}
      />,
    );

    expect(screen.getByText("Jan Sandmann")).toBeTruthy();
    expect(screen.queryByText("jan@example.com")).toBeNull();
  });

  it("resolves an email-local-part owner label before the selector is opened", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            members: [{
              userId: "member-jan",
              displayName: "Jan Luca Sandmann",
              email: "janls2601@icloud.com",
            }],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ profiles: [] }),
      } as Response);

    render(
      <PlatformOrganizationMemberDirectoryProvider organizationId="organization-closed-owner-test">
        <PlatformOwnerSelector
          owner={{
            value: "member-jan",
            name: "Janls2601",
            email: "janls2601@icloud.com",
          }}
          options={[]}
          onTransfer={vi.fn()}
        />
      </PlatformOrganizationMemberDirectoryProvider>,
    );

    expect(await screen.findByText("Jan Luca Sandmann")).toBeTruthy();
    expect(screen.queryByText("Janls2601")).toBeNull();
  });

  it("clears a stale avatar when the organization profile has no image", () => {
    const { container } = render(
      <PlatformOwnerSelector
        owner={{
          value: "member-simone",
          name: "Simone",
          email: "simone@example.com",
          avatarUrl: "/avatars/current-user.png",
        }}
        options={[{
          value: "member-simone",
          name: "Simone",
          email: "simone@example.com",
          avatarUrl: "",
        }]}
        onTransfer={vi.fn()}
      />,
    );

    expect(container.querySelector(".platform-owner-selector__avatar-image")).toBeNull();
    expect(container.querySelector(".platform-owner-selector__avatar-fallback")?.textContent).toBe("S");
  });

  it("loads organization members in the background before the popup opens", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            members: [{
              userId: "member-2",
              displayName: "Simone",
              email: "simone@example.com",
            }],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ profiles: [] }),
      } as Response);

    render(
      <PlatformOrganizationMemberDirectoryProvider organizationId="organization-selector-test">
        <PlatformOwnerSelector
          owner={{ value: "member-1", name: "Current Owner" }}
          options={[{ value: "member-1", name: "Current Owner" }]}
          onTransfer={vi.fn()}
        />
      </PlatformOrganizationMemberDirectoryProvider>,
    );

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));
    await user.click(screen.getByRole("button", { name: "Choose owner" }));

    expect(await screen.findByRole("option", { name: "Simone" })).toBeTruthy();
    expect(screen.queryByText("simone@example.com")).toBeNull();
  });
});

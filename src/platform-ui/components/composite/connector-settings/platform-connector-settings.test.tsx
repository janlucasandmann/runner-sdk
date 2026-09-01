// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PlatformConnectorPreviewCard,
  PlatformConnectorSettingsSectionHeading,
  PlatformConnectorSettingsModal,
} from "./platform-connector-settings.js";

afterEach(cleanup);

describe("Platform connector settings", () => {
  it("moves section copy into the centralized text-only info tooltip", () => {
    render(
      <PlatformConnectorSettingsSectionHeading
        titleId="connectors-title"
        description="Synchronize this resource with connected repositories."
        trailing={<span>Managed centrally</span>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Connectors" }).id).toBe(
      "connectors-title",
    );
    expect(
      screen.queryByText("Synchronize this resource with connected repositories."),
    ).toBeNull();
    fireEvent.mouseEnter(screen.getByRole("button", { name: "About Connectors" }));
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toBe(
      "Synchronize this resource with connected repositories.",
    );
    expect(tooltip.querySelector(".platform-info-tooltip__title")).toBeNull();
    expect(tooltip.querySelector(".platform-info-tooltip__action")).toBeNull();
    expect(screen.getByText("Managed centrally")).toBeTruthy();
  });

  it("renders the compact card with its settings action and minimal action menu", () => {
    const onOpenSettings = vi.fn();
    const onViewAllConnectors = vi.fn();
    render(
      <PlatformConnectorPreviewCard
        connectorName="GitHub"
        title="GitHub"
        description="Synchronize source with a repository."
        icon={<svg data-testid="github-icon" />}
        backgroundImageSrc="/img/bg/blur.webp"
        activeConnectionCount={1}
        aria-label="Open GitHub connector settings"
        onOpenSettings={onOpenSettings}
        onViewAllConnectors={onViewAllConnectors}
      />,
    );

    const card = screen.getByRole("button", { name: "Open GitHub connector settings" });
    expect(
      card.closest("[data-platform-connector-preview-card='true']"),
    ).toBeTruthy();
    expect(card.getAttribute("aria-haspopup")).toBe("dialog");
    const backgroundImage = card.querySelector(".platform-connector-preview-card__media-image");
    expect(backgroundImage?.getAttribute("src")).toBe("/img/bg/blur.webp");
    expect(backgroundImage?.getAttribute("loading")).toBe("lazy");
    expect(screen.getByText("Synchronize source with a repository.")).toBeTruthy();
    expect(screen.getByText("1 Connection")).toBeTruthy();
    fireEvent.click(card);
    expect(onOpenSettings).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "GitHub actions" }));
    const menu = screen.getByRole("menu", { name: "GitHub actions" });
    expect(menu.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(screen.getByRole("menuitem", { name: "GitHub Settings" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "View all Connectors" }));
    expect(onViewAllConnectors).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu", { name: "GitHub actions" })).toBeNull();
  });

  it("uses the headerless split modal with provider-grouped repositories", () => {
    const onClose = vi.fn();
    const onAddGithubRepository = vi.fn();
    const onAddGitlabRepository = vi.fn();
    const onActiveItemChange = vi.fn();
    const onDisconnect = vi.fn();
    render(
      <PlatformConnectorSettingsModal
        open
        ariaLabel="Resource connector settings"
        activeItemId="github:acme/platform"
        onActiveItemChange={onActiveItemChange}
        onClose={onClose}
        primaryAction={{
          label: "Add another repo",
          options: [
            { id: "github", label: "GitHub", onSelect: onAddGithubRepository },
            { id: "gitlab", label: "GitLab", onSelect: onAddGitlabRepository },
          ],
        }}
        groups={[
          {
            id: "github",
            label: "GitHub",
            icon: <svg data-testid="github-sidebar-icon" />,
            items: [{
              id: "github:acme/platform",
              label: "acme/platform",
              onDisconnect,
              content: <div>Repository policy</div>,
            }],
          },
          {
            id: "gitlab",
            label: "GitLab",
            icon: <svg data-testid="gitlab-sidebar-icon" />,
            items: [],
          },
        ]}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Resource connector settings" });
    expect(dialog.querySelector("[data-platform-modal-layout='split']")).toBeTruthy();
    expect(dialog.querySelector("[data-platform-modal-part='sidebar']")).toBeTruthy();
    expect(dialog.querySelector("[data-platform-modal-part='content']")).toBeTruthy();
    expect(dialog.querySelectorAll("[data-platform-modal-pane-part='header']")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Connectors", level: 1 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GitHub" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GitLab" })).toBeTruthy();
    expect(screen.getByTestId("github-sidebar-icon")).toBeTruthy();
    expect(screen.getByTestId("gitlab-sidebar-icon")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "acme/platform", level: 1 }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Connection actions" }));
    expect(screen.getByRole("menu", { name: "Connection actions" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Actions for active connection" }));
    const sidebarMenu = screen.getByRole("menu", {
      name: "Actions for active connection",
    });
    expect(sidebarMenu.getAttribute("data-platform-popup-variant")).toBe("minimal");
    fireEvent.click(screen.getByRole("menuitem", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "acme/platform" }));
    expect(onActiveItemChange).toHaveBeenCalledWith("github:acme/platform");
    expect(screen.getByText("Repository policy")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add another repo" }));
    const addRepositoryMenu = screen.getByRole("menu", { name: "Add another repo" });
    expect(addRepositoryMenu.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(addRepositoryMenu.getAttribute("data-platform-popup-animation")).toBe("up-in");
    fireEvent.click(screen.getByRole("menuitem", { name: "GitHub" }));
    expect(onAddGithubRepository).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu", { name: "Add another repo" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add another repo options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "GitLab" }));
    expect(onAddGitlabRepository).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("centers the supplied empty state when no repositories are connected", () => {
    render(
      <PlatformConnectorSettingsModal
        open
        ariaLabel="Empty connector settings"
        onClose={vi.fn()}
        groups={[
          { id: "github", label: "GitHub", items: [] },
          { id: "gitlab", label: "GitLab", items: [] },
        ]}
        emptyState={<div>No repositories connected</div>}
      />,
    );

    expect(screen.getByText("No repositories connected")).toBeTruthy();
    expect(
      screen.getByText("No repositories connected").closest(
        ".platform-connector-settings-modal__content-body.is-empty",
      ),
    ).toBeTruthy();
  });
});

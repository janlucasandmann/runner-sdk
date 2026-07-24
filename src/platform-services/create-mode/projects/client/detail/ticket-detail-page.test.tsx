// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TicketDetailPage } from "./ticket-detail-page.js";

afterEach(cleanup);

describe("TicketDetailPage", () => {
  it("omits the internal detail header when the host app header owns ticket identity", () => {
    const { container } = render(
      <TicketDetailPage
        details={<div>Priority: High</div>}
      >
        <div>Ticket description</div>
      </TicketDetailPage>,
    );

    const detailPage = container.querySelector("[data-resource-detail-page='true']");
    expect(container.querySelector(".resource-detail-page__header")).toBeNull();
    expect(detailPage?.classList.contains("is-headerless")).toBe(true);
    expect(Array.from(detailPage?.children || []).map((child) => child.className.split(" ")[0])).toEqual([
      "resource-detail-page__content",
      "platform-detail-sidebar",
    ]);
  });

  it("uses the shared tabless detail shell and a headerless sidebar card", () => {
    const { container } = render(
      <TicketDetailPage
        header={<h1>Resolve customer issue</h1>}
        headerActions={<button type="button">Actions</button>}
        details={<div>Priority: High</div>}
      >
        <div>Ticket description</div>
      </TicketDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList.contains("playground-agents-detail-overview-layout")).toBe(true);
    expect(container.querySelector("[data-platform-detail-tab-bar='true']")).toBeNull();
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-ui-card-variant='sidebar']")).toHaveLength(1);
    expect(container.querySelectorAll(".platform-detail-sidebar__section")).toHaveLength(0);
    expect(Array.from(container.querySelector("[data-resource-detail-page='true']")?.children || []).map((child) => child.className.split(" ")[0])).toEqual([
      "resource-detail-page__header",
      "resource-detail-page__content",
      "platform-detail-sidebar",
    ]);
    expect(screen.queryByRole("heading", { name: "Details", level: 2 })).toBeNull();
    expect(container.querySelector(".platform-ui-card__sidebar-header")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Threads", level: 2 })).toBeNull();
    expect(screen.getByText("Ticket description")).not.toBeNull();
  });

  it("opens attachments in the shared full-height sidebar and collapses ticket details", () => {
    const handlePreviewClose = vi.fn();
    const { container } = render(
      <TicketDetailPage
        header={<h1>Ticket</h1>}
        details={<div>Details</div>}
        preview={<div>document.pdf</div>}
        previewTitle="document.pdf"
        previewHeaderActions={<button type="button">Attachment actions</button>}
        onPreviewClose={handlePreviewClose}
      >
        <div>Description</div>
      </TicketDetailPage>,
    );

    expect(container.querySelector("[data-ticket-detail-page='true']")?.classList.contains("has-preview")).toBe(true);
    expect(container.querySelector("[data-platform-floating-sidebar='true']")).not.toBeNull();
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList.contains("is-sidebar-collapsed")).toBe(true);
    expect(container.querySelector(".platform-floating-sidebar__title")?.textContent).toBe("document.pdf");
    expect(screen.getByRole("button", { name: "Attachment actions", hidden: true })).not.toBeNull();

    const closeButton = container.querySelector<HTMLButtonElement>("button[aria-label='Close attachment preview']");
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton!);
    expect(handlePreviewClose).toHaveBeenCalledTimes(1);
  });

  it("portals the attachment sidebar into the platform content shell", () => {
    const portalTarget = document.createElement("div");
    document.body.append(portalTarget);
    const { container, unmount } = render(
      <TicketDetailPage
        header={<h1>Ticket</h1>}
        details={<div>Details</div>}
        preview={<div>report.csv</div>}
        previewTitle="report.csv"
        previewPortalTarget={portalTarget}
      >
        <div>Description</div>
      </TicketDetailPage>,
    );

    expect(container.querySelector("[data-platform-floating-sidebar='true']")).toBeNull();
    expect(portalTarget.querySelector("[data-platform-floating-sidebar='true']")).not.toBeNull();

    unmount();
    portalTarget.remove();
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TicketDetailPage } from "./ticket-detail-page.js";

afterEach(cleanup);

describe("TicketDetailPage", () => {
  it("uses the shared tabless detail shell and canonical sidebar sections", () => {
    const { container } = render(
      <TicketDetailPage
        header={<h1>Resolve customer issue</h1>}
        headerActions={<button type="button">Actions</button>}
        details={<div>Priority: High</div>}
        detailsActions={<button type="button">Collapse details</button>}
        threads={<div>Thread 001</div>}
      >
        <div>Ticket description</div>
      </TicketDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList.contains("playground-agents-detail-overview-layout")).toBe(true);
    expect(container.querySelector("[data-platform-detail-tab-bar='true']")).toBeNull();
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(container.querySelectorAll(".platform-detail-sidebar__section")).toHaveLength(2);
    expect(Array.from(container.querySelector("[data-resource-detail-page='true']")?.children || []).map((child) => child.className.split(" ")[0])).toEqual([
      "resource-detail-page__header",
      "resource-detail-page__content",
      "platform-detail-sidebar",
    ]);
    expect(screen.getByText("Details")).not.toBeNull();
    expect(screen.getByText("Threads")).not.toBeNull();
    expect(screen.getByText("Ticket description")).not.toBeNull();
  });

  it("adds the optional attachment preview outside the shared detail grid", () => {
    const { container } = render(
      <TicketDetailPage
        header={<h1>Ticket</h1>}
        details={<div>Details</div>}
        threads={<div>Threads</div>}
        preview={<div>document.pdf</div>}
      >
        <div>Description</div>
      </TicketDetailPage>,
    );

    expect(container.querySelector("[data-ticket-detail-page='true']")?.classList.contains("has-preview")).toBe(true);
    expect(screen.getByRole("complementary", { name: "Attachment preview" })).not.toBeNull();
  });
});

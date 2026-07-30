// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FineTuningDetailPage } from "./fine-tuning-detail-page.js";

describe("FineTuningDetailPage", () => {
  afterEach(cleanup);

  it("composes headerless optimization content and an untitled properties sidebar", () => {
    render(
      <FineTuningDetailPage properties={<div>Support Agent</div>}>
        <div>Optimization analytics</div>
      </FineTuningDetailPage>,
    );

    const page = screen.getByRole("region", {
      name: "Agent optimization details",
    });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(page.classList.contains("is-headerless")).toBe(true);
    expect(page.classList.contains("is-tabless")).toBe(true);
    expect(page.classList.contains("is-sidebar-collapsed")).toBe(false);
    expect(screen.getByText("Optimization analytics")).toBeTruthy();
    expect(
      page.querySelector(".playground-ticket-detail-sidebar-details"),
    ).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Properties" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Actions" })).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Toggle optimization sidebar" }),
    ).toBeNull();
  });
});

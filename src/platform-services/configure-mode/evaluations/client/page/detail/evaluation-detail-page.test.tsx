// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvaluationDetailPage } from "./evaluation-detail-page.js";

describe("EvaluationDetailPage", () => {
  afterEach(cleanup);

  it("composes headerless evaluation content and an untitled properties sidebar", () => {
    render(
      <EvaluationDetailPage
        properties={<div>12 cases</div>}
      >
        <div>Evaluation analytics</div>
      </EvaluationDetailPage>,
    );

    const page = screen.getByRole("region", { name: "Evaluation details" });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(page.classList.contains("is-headerless")).toBe(true);
    expect(page.classList.contains("is-tabless")).toBe(true);
    expect(page.classList.contains("is-sidebar-collapsed")).toBe(false);
    expect(screen.getByText("Evaluation analytics")).toBeTruthy();
    expect(
      page.querySelector(".playground-ticket-detail-sidebar-details"),
    ).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Properties" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Actions" })).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("renders run details without a local header, tab bar, or sidebar toggle", () => {
    render(
      <EvaluationDetailPage
        variant="run"
        ariaLabel="Evaluation run details"
        properties={<div>8 cases</div>}
        actions={<button type="button">Run again</button>}
      >
        <div>Run analytics</div>
      </EvaluationDetailPage>,
    );

    const page = screen.getByRole("region", { name: "Evaluation run details" });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(page.classList.contains("is-run-detail")).toBe(true);
    expect(page.classList.contains("is-headerless")).toBe(true);
    expect(page.classList.contains("is-tabless")).toBe(true);
    expect(page.classList.contains("is-sidebar-collapsed")).toBe(false);
    expect(
      page.querySelector(".playground-ticket-detail-sidebar-details"),
    ).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Run Properties" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Actions" })).toBeTruthy();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("button", { name: "Toggle run sidebar" })).toBeNull();
  });
});

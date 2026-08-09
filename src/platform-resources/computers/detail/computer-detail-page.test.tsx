// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ComputerDetailPage } from "./computer-detail-page.js";

afterEach(cleanup);

describe("ComputerDetailPage", () => {
  it("composes the shared tabless detail shell", () => {
    const { container } = render(
      <ComputerDetailPage
        header={<h1>Build Computer</h1>}
      >
        <div>Computer analytics</div>
        <div>Computer details</div>
      </ComputerDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(0);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(0);
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList.contains("is-tabless")).toBe(true);
    expect(container.querySelector("[data-resource-detail-page='true']")?.classList.contains("is-sidebar-empty")).toBe(true);
    expect(screen.getByRole("heading", { name: "Build Computer" })).toBeTruthy();
    expect(screen.getByText("Computer analytics")).toBeTruthy();
    expect(screen.getByText("Computer details")).toBeTruthy();
    expect(screen.queryByText("Filebase")).toBeNull();
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FileResourceDetailPage } from "./file-resource-detail-page.js";

afterEach(cleanup);

describe("FileResourceDetailPage", () => {
  it("composes metadata and a full-height file workspace on the code tab", () => {
    const { container } = render(
      <FileResourceDetailPage
        activeTab="code"
        metadata={<div>Resource identity</div>}
        code={<div>File workspace</div>}
        settings={<div>Resource settings</div>}
        sidebar={<div>Resource properties</div>}
      />,
    );

    expect(screen.getByText("Resource identity")).not.toBeNull();
    expect(screen.getByText("File workspace")).not.toBeNull();
    expect(screen.queryByText("Resource settings")).toBeNull();
    expect(
      container
        .querySelector(".file-resource-detail-page")
        ?.classList.contains("is-sidebar-auto-collapsed"),
    ).toBe(true);
  });

  it("renders settings and the resource sidebar without a local tab bar", () => {
    const { container } = render(
      <FileResourceDetailPage
        activeTab="settings"
        code={<div>File workspace</div>}
        settings={<div>Resource settings</div>}
        sidebar={<div>Resource properties</div>}
      />,
    );

    expect(screen.getByText("Resource settings")).not.toBeNull();
    expect(screen.getByText("Resource properties")).not.toBeNull();
    expect(screen.queryByText("File workspace")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      container
        .querySelector(".file-resource-detail-page")
        ?.classList.contains("is-sidebar-collapsed"),
    ).toBe(false);
  });
});

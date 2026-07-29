// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvaluationCaseDetailPage } from "./evaluation-case-detail-page.js";

afterEach(cleanup);

describe("EvaluationCaseDetailPage", () => {
  it("uses the shared file resource shell for case input and output", () => {
    const { container } = render(
      <EvaluationCaseDetailPage
        activeTab="code"
        metadata={<div>Case identity</div>}
        code={<div>Input and output workspace</div>}
        settings={<div>Case settings</div>}
        sidebar={<div>Case properties</div>}
      />,
    );

    expect(screen.getByText("Case identity")).not.toBeNull();
    expect(screen.getByText("Input and output workspace")).not.toBeNull();
    expect(screen.queryByText("Case settings")).toBeNull();
    expect(
      container.querySelector(".file-resource-detail-page"),
    ).not.toBeNull();
    expect(
      container.querySelector(".evaluation-case-detail-page"),
    ).not.toBeNull();
  });
});

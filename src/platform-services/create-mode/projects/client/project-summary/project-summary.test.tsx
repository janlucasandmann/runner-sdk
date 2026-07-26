// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Rocket } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectSummary } from "./project-summary.js";

afterEach(cleanup);

describe("ProjectSummary", () => {
  it("renders project identity separately from its editable summary", () => {
    const onSummaryChange = vi.fn();
    const onSummaryCommit = vi.fn();
    render(
      <ProjectSummary
        projectName="Computer Agents"
        summary="Initial summary"
        icon="rocket"
        color="#79d0ff"
        iconOptions={[{ id: "rocket", label: "Rocket", icon: Rocket }]}
        colorOptions={["#79d0ff"]}
        onIdentityChange={vi.fn()}
        onSummaryChange={onSummaryChange}
        onSummaryCommit={onSummaryCommit}
      />,
    );

    expect(screen.getByRole("heading", { name: "Computer Agents" })).not.toBeNull();
    expect(screen.queryByText("Computer Agents", { selector: "span" })).toBeNull();

    const summary = screen.getByRole("textbox", { name: "Project summary" });
    fireEvent.change(summary, { target: { value: "A concise project summary" } });
    expect(onSummaryChange).toHaveBeenCalledWith("A concise project summary");

    fireEvent.blur(summary);
    expect(onSummaryCommit).toHaveBeenCalledWith("A concise project summary");
  });

  it("allows an existing summary to be cleared", () => {
    const onSummaryChange = vi.fn();
    const onSummaryCommit = vi.fn();
    render(
      <ProjectSummary
        projectName="Computer Agents"
        summary="Initial summary"
        icon="rocket"
        color="#79d0ff"
        iconOptions={[{ id: "rocket", label: "Rocket", icon: Rocket }]}
        colorOptions={["#79d0ff"]}
        onIdentityChange={vi.fn()}
        onSummaryChange={onSummaryChange}
        onSummaryCommit={onSummaryCommit}
      />,
    );

    const summary = screen.getByRole("textbox", { name: "Project summary" });
    fireEvent.change(summary, { target: { value: "" } });
    expect(onSummaryChange).toHaveBeenLastCalledWith("");

    fireEvent.blur(summary);
    expect(onSummaryCommit).toHaveBeenLastCalledWith("");
  });
});

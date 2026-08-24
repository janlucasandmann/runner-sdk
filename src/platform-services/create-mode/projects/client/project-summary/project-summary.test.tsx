// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Rocket } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectSummary } from "./project-summary.js";

afterEach(cleanup);

describe("ProjectSummary", () => {
  it("renders project identity separately from its editable summary", () => {
    const onProjectNameChange = vi.fn();
    const onProjectNameCommit = vi.fn();
    const onSummaryChange = vi.fn();
    const onSummaryCommit = vi.fn();
    const { container } = render(
      <ProjectSummary
        projectName="Computer Agents"
        summary="Initial summary"
        icon="rocket"
        color="#79d0ff"
        iconOptions={[{ id: "rocket", label: "Rocket", icon: Rocket }]}
        colorOptions={["#79d0ff"]}
        onIdentityChange={vi.fn()}
        onProjectNameChange={onProjectNameChange}
        onProjectNameCommit={onProjectNameCommit}
        onSummaryChange={onSummaryChange}
        onSummaryCommit={onSummaryCommit}
      />,
    );

    const projectName = screen.getByRole("textbox", { name: "Project name" });
    expect(projectName).not.toBeNull();
    expect(screen.queryByText("Computer Agents", { selector: "span" })).toBeNull();
    const header = container.querySelector(".platform-project-summary");
    expect(header?.firstElementChild?.classList.contains("platform-project-summary__icon-picker"))
      .toBe(true);
    expect(header?.lastElementChild?.classList.contains("platform-project-summary__copy"))
      .toBe(true);

    fireEvent.change(projectName, { target: { value: "Renamed project" } });
    expect(onProjectNameChange).toHaveBeenCalledWith("Renamed project");
    fireEvent.blur(projectName);
    expect(onProjectNameCommit).toHaveBeenCalledWith("Renamed project");

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

  it("grows to the full summary content height", () => {
    render(
      <ProjectSummary
        projectName="Computer Agents"
        summary="Initial summary"
        icon="rocket"
        color="#79d0ff"
        iconOptions={[{ id: "rocket", label: "Rocket", icon: Rocket }]}
        colorOptions={["#79d0ff"]}
        onIdentityChange={vi.fn()}
        onSummaryChange={vi.fn()}
      />,
    );

    const summary = screen.getByRole("textbox", { name: "Project summary" });
    Object.defineProperty(summary, "scrollHeight", {
      configurable: true,
      value: 144,
    });

    fireEvent.change(summary, {
      target: { value: "A summary that spans enough lines to exceed the previous height cap." },
    });

    expect(summary.style.height).toBe("144px");
  });
});

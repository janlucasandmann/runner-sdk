// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RunnerGithubBranchSelector } from "./github-branch-selector.js";
import { RunnerProjectGithubRepositorySettings } from "./project-github-repository-settings.js";

afterEach(() => cleanup());

describe("RunnerGithubBranchSelector", () => {
  it("loads branches lazily and emits a selected base branch", async () => {
    const fetchBranches = vi.fn().mockResolvedValue([
      { id: "main", name: "main" },
      { id: "release", name: "release" },
    ]);
    const onValueChange = vi.fn();

    render(
      <RunnerGithubBranchSelector
        accountId="github-account"
        repoFullName="computer-agents/platform"
        value="main"
        fetchBranches={fetchBranches}
        onValueChange={onValueChange}
      />,
    );

    expect(fetchBranches).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Select base branch for computer-agents/platform" }),
    );

    await waitFor(() =>
      expect(fetchBranches).toHaveBeenCalledWith("computer-agents/platform", {
        accountId: "github-account",
      }),
    );
    fireEvent.click(await screen.findByRole("option", { name: "release" }));
    expect(onValueChange).toHaveBeenCalledWith("release");
  });
});

describe("RunnerProjectGithubRepositorySettings", () => {
  it("emits persisted branch, pull-request, and force-push policy changes", () => {
    const onChange = vi.fn();

    const { container } = render(
      <RunnerProjectGithubRepositorySettings
        repoFullName="computer-agents/platform"
        refName="main"
        branchPrefix="computer-agents/"
        createPullRequests
        forcePushCommits={false}
        onChange={onChange}
      />,
    );

    expect(
      container
        .querySelector(".playground-project-github-repository-settings__branch .platform-selector")
        ?.classList.contains("is-full-width"),
    ).toBe(false);
    const heading = container.querySelector(".platform-connector-configuration__header");
    expect(heading?.querySelector(".playground-project-github-repository-settings__branch")).toBeNull();
    expect(
      container.querySelector(
        ".platform-connector-configuration__row .playground-project-github-repository-settings__branch",
      ),
    ).toBeTruthy();

    const prefixInput = screen.getByRole("textbox", {
      name: "Branch prefix for computer-agents/platform",
    });
    fireEvent.change(prefixInput, { target: { value: "feature/" } });
    fireEvent.blur(prefixInput);
    expect(onChange).toHaveBeenCalledWith({ branchPrefix: "feature/" });

    fireEvent.click(
      screen.getByRole("switch", {
        name: "Create pull requests for computer-agents/platform",
      }),
    );
    expect(onChange).toHaveBeenCalledWith({ createPullRequests: false });

    fireEvent.click(
      screen.getByRole("switch", {
        name: "Force-push commits for computer-agents/platform",
      }),
    );
    expect(onChange).toHaveBeenCalledWith({ forcePushCommits: true });
  });
});

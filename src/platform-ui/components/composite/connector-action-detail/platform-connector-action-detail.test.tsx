// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  classifyPlatformConnectorAction,
  formatPlatformConnectorActionLabel,
  formatPlatformConnectorFieldLabel,
  PlatformConnectorActionDetail,
  parsePlatformConnectorActionValue,
} from "./platform-connector-action-detail.js";

afterEach(cleanup);

describe("PlatformConnectorActionDetail", () => {
  it("uses the centralized status label and renders update data as readable fields", () => {
    render(
      <PlatformConnectorActionDetail
        connectorId="jira"
        connectorName="Atlassian"
        logoUrl="/img/plugins/atlassian.svg"
        actionName="update_issue"
        description="Updated Jira issue FOU-019"
        status="completed"
        input={{
          issueIdOrKey: "FOU-019",
          fields: { status: "In Progress", assigneeId: "jan" },
        }}
        output={{
          structuredContent: {
            key: "FOU-019",
            fields: { summary: "Prepare release", status: { name: "In Progress" } },
          },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Atlassian", level: 1 })).toBeTruthy();
    const status = screen.getByText("Completed");
    expect(status.classList.contains("platform-label")).toBe(true);
    expect(status.dataset.platformLabelVariant).toBe("green");
    expect(screen.getByRole("main").getAttribute("data-action-kind")).toBe("update");
    expect(screen.getByRole("heading", { name: "Changes", level: 2 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Updated item", level: 2 })).toBeTruthy();
    expect(screen.getAllByText("Issue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FOU-019").length).toBeGreaterThan(0);
    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);
    const technicalDetails = screen.getByText("Technical details").closest("details");
    expect(technicalDetails?.open).toBe(false);
  });

  it("unwraps connector result envelopes and presents bounded result collections", () => {
    render(
      <PlatformConnectorActionDetail
        connectorName="Atlassian"
        actionName="search_issues"
        description="Searched Jira issues"
        status="completed"
        inputText={'{"jql":"project = FOU","maxResults":3}'}
        outputText={JSON.stringify({
          content: [{ type: "text", text: "fallback" }],
          structuredContent: {
            total: 3,
            issues: [
              { key: "FOU-1", summary: "Prepare release" },
              { key: "FOU-2", summary: "Review rollout" },
              { key: "FOU-3", summary: "Publish notes" },
            ],
          },
        })}
        maxCollectionItems={2}
      />,
    );

    expect(screen.getByRole("main").getAttribute("data-action-kind")).toBe("search");
    expect(screen.getByRole("heading", { name: "Search criteria", level: 2 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Search results", level: 2 })).toBeTruthy();
    expect(screen.getByText("Search query")).toBeTruthy();
    expect(screen.getByText("Prepare release")).toBeTruthy();
    expect(screen.getByText("Show 1 more")).toBeTruthy();
  });

  it("turns rich comment documents into prose and redacts sensitive fields", () => {
    render(
      <PlatformConnectorActionDetail
        connectorName="Atlassian"
        actionName="confluence_add_comment"
        description="Added a comment"
        status="running"
        input={{
          pageId: "12345",
          accessToken: "do-not-render-this",
          body: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "The rollout is ready for review." }],
              },
            ],
          },
        }}
      />,
    );

    expect(screen.getByRole("main").getAttribute("data-action-kind")).toBe("comment");
    expect(screen.getByText("Running").dataset.platformLabelVariant).toBe("blue");
    expect(screen.getByText("The rollout is ready for review.")).toBeTruthy();
    expect(screen.getByText("Hidden for security")).toBeTruthy();
    expect(screen.queryByText("do-not-render-this")).toBeNull();
  });

  it("omits missing attributes and keeps connector responses collapsed", () => {
    render(
      <PlatformConnectorActionDetail
        connectorName="Atlassian"
        actionName="add_comment"
        description="Added a comment"
        status="completed"
        input={{ message: "The rollout is ready.", issueId: undefined, optionalNote: null }}
        output={{ commentId: "1001", body: "Comment added" }}
      />,
    );

    expect(screen.getByText("Message")).toBeTruthy();
    expect(screen.queryByText("Issue")).toBeNull();
    expect(screen.queryByText("Optional note")).toBeNull();

    const responseDetails = screen.getByText("Connector response").closest("details");
    expect(responseDetails).toBeTruthy();
    expect(responseDetails?.open).toBe(false);
  });

  it("uses the red centralized label and a clear error section for failures", () => {
    render(
      <PlatformConnectorActionDetail
        connectorName="Box"
        actionName="get_file"
        description="Failed to open a file"
        status="failed"
        errorMessage="The file is no longer available."
      />,
    );

    expect(screen.getByText("Failed").dataset.platformLabelVariant).toBe("red");
    expect(screen.getByRole("heading", { name: "What went wrong", level: 2 })).toBeTruthy();
    expect(screen.getByText("The file is no longer available.")).toBeTruthy();
  });
});

describe("connector action presentation helpers", () => {
  it("classifies common connector operations into reusable semantic families", () => {
    expect(classifyPlatformConnectorAction("get_issue")).toBe("read");
    expect(classifyPlatformConnectorAction("list_projects")).toBe("list");
    expect(classifyPlatformConnectorAction("search_users")).toBe("search");
    expect(classifyPlatformConnectorAction("create_page")).toBe("create");
    expect(classifyPlatformConnectorAction("transition_issue")).toBe("update");
    expect(classifyPlatformConnectorAction("add_comment")).toBe("comment");
    expect(classifyPlatformConnectorAction("delete_file")).toBe("delete");
    expect(classifyPlatformConnectorAction("run_workflow")).toBe("other");
  });

  it("normalizes action names, field names, and JSON strings", () => {
    expect(formatPlatformConnectorActionLabel("confluence_update_page")).toBe("Update page");
    expect(formatPlatformConnectorFieldLabel("issueIdOrKey")).toBe("Issue");
    expect(parsePlatformConnectorActionValue('{"key":"FOU-19"}')).toEqual({ key: "FOU-19" });
    expect(parsePlatformConnectorActionValue("plain text")).toBe("plain text");
  });
});

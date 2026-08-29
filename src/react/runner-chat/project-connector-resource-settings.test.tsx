// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RunnerProjectConnectorResourceSettings } from "./project-connector-resource-settings.js";

afterEach(() => cleanup());

describe("RunnerProjectConnectorResourceSettings", () => {
  it.each([
    ["google-drive", "Project brief", "application/pdf", "PDF"],
    ["one-drive", "Launch plan", "document", "Document"],
    ["notion", "Product requirements", "database", "Database"],
    ["atlassian", "ACME delivery", "jira-project", "Jira Project"],
  ] as const)("renders a managed %s resource", (provider, name, resourceType, typeLabel) => {
    const { container } = render(
      <RunnerProjectConnectorResourceSettings
        provider={provider}
        resourceId={`${provider}-1`}
        resourceName={name}
        resourceType={resourceType}
      />,
    );

    expect(screen.getByText(name)).toBeTruthy();
    expect(screen.getByText(typeLabel)).toBeTruthy();
    expect(container.querySelector(`[data-project-connector-provider="${provider}"]`)).toBeTruthy();
  });
});

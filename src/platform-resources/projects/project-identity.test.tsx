// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createPlatformProjectIdentityFallback,
  getPlatformProjectReferenceFromKnowledgeMetadata,
  normalizePlatformProjectIdentity,
} from "./project-identity.js";
import { PlatformProjectIdentityApi } from "./project-identity-api.js";
import { PlatformProjectIdentityIcon } from "./project-identity-icon.js";
import {
  getPlatformResourceProjectScopeIds,
  isPlatformProjectStrategyKnowledgeMetadata,
  withPlatformResourceProjectScope,
} from "./project-scope.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("project identity resources", () => {
  it("recognizes project strategy Knowledge metadata and preserves its visual fallback", () => {
    const reference = getPlatformProjectReferenceFromKnowledgeMetadata({
      purpose: "project_strategy_and_documentation",
      projectId: "project-1",
      projectName: "Launch",
      projectIcon: "telescope",
      projectColor: "#8d83ff",
      projectType: "research_knowledge",
    });

    expect(reference).toEqual({
      projectId: "project-1",
      projectName: "Launch",
      projectIcon: "telescope",
      projectColor: "#8d83ff",
      projectType: "research_knowledge",
    });
    expect(createPlatformProjectIdentityFallback(reference)).toMatchObject({
      id: "project-1",
      name: "Launch",
      icon: "telescope",
      color: "#8d83ff",
    });
  });

  it("uses project-type defaults when an older linked library has no copied visual metadata", () => {
    const reference = getPlatformProjectReferenceFromKnowledgeMetadata({
      purpose: "project_knowledge",
      projectId: "project-2",
      projectName: "Platform",
      projectType: "software_development",
    });

    expect(reference).toMatchObject({
      projectIcon: "code",
      projectColor: "#66a6ff",
    });
  });

  it("recognizes every library carrying a project reference regardless of purpose", () => {
    expect(getPlatformProjectReferenceFromKnowledgeMetadata({
      purpose: "project_research_archive",
      projectId: "project-legacy",
      projectIcon: "flask",
    })).toMatchObject({
      projectId: "project-legacy",
      projectIcon: "flask",
    });
  });

  it("normalizes the current project API record over a library metadata fallback", () => {
    expect(normalizePlatformProjectIdentity({
      id: "project-1",
      name: "Current project name",
      color: "#55d8a5",
      metadata: { icon: "emoji:🧪", projectType: "business_operations" },
    }, {
      projectId: "project-1",
      projectName: "Old name",
      projectIcon: "rocket",
      projectColor: "#5f6bdc",
      projectType: "blank",
    })).toMatchObject({
      id: "project-1",
      name: "Current project name",
      icon: "emoji:🧪",
      color: "#55d8a5",
      projectType: "business_operations",
    });
  });

  it("loads the current project identity through the project metadata endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      project: {
        id: "project-1",
        name: "Evidence platform",
        icon: "telescope",
        color: "#8d83ff",
        projectType: "research_knowledge",
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const identity = await new PlatformProjectIdentityApi(
      "/api/real",
      { "X-Test-Identity": "user-1" },
    ).get("project-1");

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/real/projects/project-1?view=metadata");
    expect(identity).toMatchObject({
      id: "project-1",
      icon: "telescope",
      color: "#8d83ff",
    });
  });

  it("renders both Lucide and emoji project icons through one component", () => {
    const { container, rerender } = render(
      <PlatformProjectIdentityIcon icon="telescope" size={24} />,
    );
    expect(container.querySelector("[data-platform-project-icon='telescope']")).not.toBeNull();

    rerender(<PlatformProjectIdentityIcon icon="emoji:🚀" size={24} />);
    expect(container.querySelector("[data-platform-project-icon='emoji:🚀']")?.textContent).toBe("🚀");
  });

  it("normalizes legacy and multi-project resource scopes", () => {
    expect(getPlatformResourceProjectScopeIds({ projectId: "project-1" })).toEqual([
      "project-1",
    ]);
    expect(getPlatformResourceProjectScopeIds({
      projectScope: { projectIds: ["project-1", "project-2", "project-1"] },
    })).toEqual(["project-1", "project-2"]);

    const metadata = withPlatformResourceProjectScope(
      { purpose: "research" },
      [
        {
          id: "project-1",
          name: "Launch",
          icon: "rocket",
          color: "#5f6bdc",
          projectType: "blank",
        },
        {
          id: "project-2",
          name: "Research",
          icon: "telescope",
          color: "#8d83ff",
          projectType: "research_knowledge",
        },
      ],
    );
    expect(getPlatformResourceProjectScopeIds(metadata)).toEqual(["project-1", "project-2"]);
    expect(metadata).toMatchObject({
      purpose: "research",
      projectId: "project-1",
      projectName: "Launch",
      projectIds: ["project-1", "project-2"],
    });

    const independent = withPlatformResourceProjectScope(metadata, []);
    expect(getPlatformResourceProjectScopeIds(independent)).toEqual([]);
    expect(independent).not.toHaveProperty("projectId");
  });

  it("identifies only lifecycle-managed Project Strategy Knowledge metadata", () => {
    expect(isPlatformProjectStrategyKnowledgeMetadata({
      purpose: "project_knowledge",
      projectId: "project-1",
    })).toBe(true);
    expect(isPlatformProjectStrategyKnowledgeMetadata({
      purpose: "project_strategy_and_documentation",
      projectId: "project-1",
    })).toBe(true);
    expect(isPlatformProjectStrategyKnowledgeMetadata({
      schemaVersion: "computer_agents_project_knowledge_v1",
      managedBy: "mission_control",
      projectId: "project-1",
    })).toBe(true);
    expect(isPlatformProjectStrategyKnowledgeMetadata({
      purpose: "research",
      projectId: "project-1",
    })).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";
import { createOrganizationAccessRepository } from "./organization-access-repository.js";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("organization access repository", () => {
  it("scopes identity and authorization requests to the active organization", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/identity-connections")) {
        return jsonResponse({
          data: [
            {
              id: "idp_1",
              organization_id: "org_1",
              provider: "entra",
              display_name: "Company Entra",
              tenant_id: "tenant_1",
              client_id: "client_1",
              status: "active",
              claim_mappings: { display_name: "preferred_username" },
            },
          ],
        });
      }
      if (url.includes("/authorization/approvals")) {
        return jsonResponse({
          data: [
            {
              id: "approval_1",
              principal_id: "agent_1",
              action_id: "project_view",
              resource_type: "project",
              resource_id: "project_1",
              status: "pending",
            },
          ],
        });
      }
      return jsonResponse({ data: [] });
    });
    const repository = createOrganizationAccessRepository({
      organizationId: "org_1",
      requestHeaders: { authorization: "Bearer session" },
      fetcher: fetcher as typeof fetch,
    });

    const [connections, approvals] = await Promise.all([
      repository.listConnections(),
      repository.listApprovals("pending"),
    ]);

    expect(connections).toEqual([
      expect.objectContaining({
        id: "idp_1",
        organizationId: "org_1",
        displayName: "Company Entra",
        tenantId: "tenant_1",
        claimMappings: expect.objectContaining({
          displayName: "preferred_username",
        }),
      }),
    ]);
    expect(approvals).toEqual([
      expect.objectContaining({
        id: "approval_1",
        principalId: "agent_1",
        actionId: "project_view",
      }),
    ]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    for (const [, init] of fetcher.mock.calls) {
      const headers = new Headers(init?.headers);
      expect(headers.get("authorization")).toBe("Bearer session");
      expect(headers.get("x-computer-agents-organization")).toBe("org_1");
    }
    expect(String(fetcher.mock.calls[1]?.[0])).toContain(
      "/authorization/approvals?status=pending",
    );
  });

  it("uses bounded mutation contracts for SCIM, mappings, and delegations", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/scim-token")) {
        return jsonResponse({
          data: {
            token: "scim_secret",
            prefix: "scim_abcd",
            createdAt: "2026-07-25T08:00:00.000Z",
          },
        });
      }
      if (url.endsWith("/group-mappings")) {
        return jsonResponse(
          {
            data: {
              id: "mapping_1",
              external_group_id: "group_1",
              team_id: "team_1",
            },
          },
          201,
        );
      }
      if (url.endsWith("/authorization/delegations")) {
        return jsonResponse(
          {
            data: {
              id: "delegation_1",
              delegate_principal_id: "agent_1",
              allowed_actions: ["project_view"],
              resource_constraints: {
                types: ["project"],
                ids: ["project_1"],
              },
              status: "active",
            },
          },
          201,
        );
      }
      return jsonResponse({ success: true });
    });
    const repository = createOrganizationAccessRepository({
      apiBase: "/api/real/",
      organizationId: "org_1",
      fetcher: fetcher as typeof fetch,
    });

    await repository.rotateScimToken("idp one");
    await repository.saveGroupMapping("idp one", {
      externalGroupId: "group_1",
      teamId: "team_1",
    });
    await repository.createDelegation({
      delegatePrincipalId: "agent_1",
      allowedActions: ["project_view"],
      resourceConstraints: {
        types: ["project"],
        ids: ["project_1"],
      },
      expiresAt: "2026-07-25T09:00:00.000Z",
    });

    expect(String(fetcher.mock.calls[0]?.[0])).toBe(
      "/api/real/identity-connections/idp%20one/scim-token",
    );
    expect(fetcher.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(String(fetcher.mock.calls[1]?.[0])).toBe(
      "/api/real/identity-connections/idp%20one/group-mappings",
    );
    expect(fetcher.mock.calls[1]?.[1]?.method).toBe("POST");
    expect(String(fetcher.mock.calls[2]?.[0])).toBe(
      "/api/real/authorization/delegations",
    );
    expect(fetcher.mock.calls[2]?.[1]?.method).toBe("POST");
    expect(JSON.parse(String(fetcher.mock.calls[2]?.[1]?.body))).toEqual(
      expect.objectContaining({
        delegatePrincipalId: "agent_1",
        allowedActions: ["project_view"],
      }),
    );
  });
});

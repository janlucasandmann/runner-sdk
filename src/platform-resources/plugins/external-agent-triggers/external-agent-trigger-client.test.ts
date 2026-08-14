import { describe, expect, it } from "vitest";
import {
  ExternalAgentTriggerClient,
  normalizeExternalAgentOrganizationMembers,
} from "./external-agent-trigger-client.js";

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("ExternalAgentTriggerClient", () => {
  it("invokes a stored fetch implementation with the global receiver", async () => {
    const receivers: unknown[] = [];
    const fetchImplementation = function (
      this: unknown,
      input: RequestInfo | URL,
    ): Promise<Response> {
      receivers.push(this);
      const url = String(input);
      if (url.includes("/installations")) {
        return Promise.resolve(jsonResponse({ installations: [] }));
      }
      if (url.includes("/bindings")) {
        return Promise.resolve(jsonResponse({ bindings: [] }));
      }
      if (url.includes("/identities")) {
        return Promise.resolve(jsonResponse({ identities: [] }));
      }
      if (url.includes("/events")) {
        return Promise.resolve(jsonResponse({ events: [] }));
      }
      if (url.includes("/health")) {
        return Promise.resolve(jsonResponse({ started: true }));
      }
      return Promise.resolve(jsonResponse({ members: [] }));
    } as typeof fetch;
    const client = new ExternalAgentTriggerClient({
      organizationId: "org_receiver",
      fetchImplementation,
    });

    await client.load("jira");

    expect(receivers).toHaveLength(6);
    expect(receivers.every((receiver) => receiver === globalThis)).toBe(true);
  });

  it("loads an organization-scoped snapshot and filters it to the provider", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImplementation: typeof fetch = async (input, init) => {
      const url = String(input);
      requests.push({ url, init });
      if (url.includes("/installations")) {
        return jsonResponse({
          installations: [
            { id: "installation_jira", provider: "jira" },
            { id: "installation_linear", provider: "linear" },
          ],
        });
      }
      if (url.includes("/bindings")) {
        return jsonResponse({
          bindings: [
            { id: "binding_jira", provider: "jira" },
            { id: "binding_linear", provider: "linear" },
          ],
        });
      }
      if (url.includes("/identities")) {
        return jsonResponse({
          identities: [
            { id: "identity_jira", provider: "jira" },
            { id: "identity_linear", provider: "linear" },
          ],
        });
      }
      if (url.includes("/events")) {
        return jsonResponse({
          events: [
            { id: "event_jira", envelope: { provider: "jira" } },
            { id: "event_linear", envelope: { provider: "linear" } },
          ],
        });
      }
      if (url.includes("/health")) {
        return jsonResponse({ started: true, installations: 2 });
      }
      if (url.includes("/organizations/org_test/members")) {
        return jsonResponse({
          members: [{
            userId: "user_ada",
            displayName: "Ada Lovelace",
            email: "ada@example.com",
            photoUrl: "/ada.webp",
            role: "owner",
          }],
        });
      }
      return jsonResponse({ error: "not_found" }, 404);
    };
    const client = new ExternalAgentTriggerClient({
      organizationId: "org_test",
      fetchImplementation,
    });

    const snapshot = await client.load("jira");

    expect(snapshot.installations.map((item) => item.id)).toEqual([
      "installation_jira",
    ]);
    expect(snapshot.bindings.map((item) => item.id)).toEqual(["binding_jira"]);
    expect(snapshot.identities.map((item) => item.id)).toEqual([
      "identity_jira",
    ]);
    expect(snapshot.events.map((item) => item.id)).toEqual(["event_jira"]);
    expect(snapshot.members).toEqual([
      {
        id: "user_ada",
        name: "Ada Lovelace",
        email: "ada@example.com",
        photoUrl: "/ada.webp",
        role: "owner",
      },
    ]);
    const managementRequests = requests.filter((request) =>
      request.url.includes("/api/integrations/external-agents/"),
    );
    expect(managementRequests).toHaveLength(5);
    for (const request of managementRequests) {
      expect(new Headers(request.init?.headers).get(
        "X-Computer-Agents-Organization",
      )).toBe("org_test");
      expect(request.init?.credentials).toBe("include");
      expect(request.init?.cache).toBe("no-store");
    }
  });

  it("creates a webhook installation with JSON and organization scope", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    const fetchImplementation: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      return jsonResponse({
        installation: {
          id: "installation_jira",
          provider: "jira",
          tenantId: "cloud_123",
        },
        setup: {
          provider: "jira",
          tenantId: "cloud_123",
          callbackUrl: "https://example.com/webhooks/jira",
          verification: "bearer_token",
        },
      }, 201);
    };
    const client = new ExternalAgentTriggerClient({
      organizationId: "org_test",
      fetchImplementation,
    });

    const result = await client.createInstallation({
      provider: "jira",
      tenantId: "cloud_123",
      credentialId: "credential_123",
      displayName: "Product Jira",
    });

    expect(capturedUrl).toBe(
      "/api/integrations/external-agents/installations",
    );
    expect(capturedInit?.method).toBe("POST");
    expect(new Headers(capturedInit?.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(new Headers(capturedInit?.headers).get(
      "X-Computer-Agents-Organization",
    )).toBe("org_test");
    expect(JSON.parse(String(capturedInit?.body))).toMatchObject({
      provider: "jira",
      tenantId: "cloud_123",
      credentialId: "credential_123",
    });
    expect(result.setup.verification).toBe("bearer_token");
  });
});

describe("normalizeExternalAgentOrganizationMembers", () => {
  it("normalizes nested member identities and removes duplicates", () => {
    expect(normalizeExternalAgentOrganizationMembers({
      organizationMembers: [
        {
          user: {
            uid: "user_1",
            displayName: "Grace Hopper",
            email: "grace@example.com",
            photoURL: "/grace.webp",
          },
          organizationRole: "admin",
        },
        { userId: "user_1", name: "Duplicate" },
      ],
    })).toEqual([
      {
        id: "user_1",
        name: "Grace Hopper",
        email: "grace@example.com",
        photoUrl: "/grace.webp",
        role: "admin",
      },
    ]);
  });
});

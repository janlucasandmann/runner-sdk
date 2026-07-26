// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrganizationAccessControlPage } from "./organization-access-control-page.js";

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("OrganizationAccessControlPage", () => {
  it("composes the organization control plane from centralized UI surfaces", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/authorization/approvals")) {
        return jsonResponse({ data: [] });
      }
      return jsonResponse({ data: [] });
    });
    vi.stubGlobal("fetch", fetcher);
    const user = userEvent.setup();

    const { container } = render(
      <OrganizationAccessControlPage
        organizationId="org_1"
        organizationName="Platform Organization"
        requestHeaders={{ authorization: "Bearer session" }}
        canManage={false}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Platform Organization identity and access",
      }),
    ).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Identity" })).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Approvals" })).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Delegations" })).not.toBeNull();
    expect(screen.queryByRole("radio", { name: "Audit" })).toBeNull();

    await waitFor(() => {
      expect(
        screen.getByRole("table", {
          name: "Organization identity providers",
        }),
      ).not.toBeNull();
    });
    expect(
      container.querySelector(".platform-data-table.is-minimalistic-ui"),
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "New Identity Provider" }),
    ).toBeNull();

    await user.click(screen.getByRole("radio", { name: "Approvals" }));
    await waitFor(() => {
      expect(
        screen.getByRole("table", {
          name: "Authorization approval requests",
        }),
      ).not.toBeNull();
    });
    const approvalRequest = fetcher.mock.calls.find(([input]) =>
      String(input).includes("/authorization/approvals"),
    );
    expect(approvalRequest).toBeTruthy();
    expect(
      new Headers(approvalRequest?.[1]?.headers).get(
        "x-computer-agents-organization",
      ),
    ).toBe("org_1");
  });

  it("exposes decision audit only to organization managers", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ data: [] }));
    vi.stubGlobal("fetch", fetcher);

    render(
      <OrganizationAccessControlPage
        organizationId="org_1"
        canManage
        initialSection="audit"
      />,
    );

    expect(screen.getByRole("radio", { name: "Audit" })).not.toBeNull();
    await waitFor(() => {
      expect(
        screen.getByRole("table", {
          name: "Authorization decision audit",
        }),
      ).not.toBeNull();
    });
    expect(
      fetcher.mock.calls.some(([input]) =>
        String(input).includes("/authorization/decisions"),
      ),
    ).toBe(true);
  });
});

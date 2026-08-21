import { describe, expect, it, vi } from "vitest";
import { loadPlatformOrganizationOwnerDirectory } from "./platform-organization-member-directory.js";

function jsonResponse(payload: unknown, ok = true): Response {
  return {
    ok,
    json: async () => payload,
  } as Response;
}

describe("platform organization owner directory", () => {
  it("returns every active organization member and never borrows another member's avatar", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({
        data: {
          members: [
            {
              id: "membership-jan",
              userId: "user-jan",
              email: "jan@example.com",
            },
            {
              id: "membership-simone",
              userId: "user-simone",
              email: "simone@example.com",
            },
          ],
        },
      }))
      .mockResolvedValueOnce(jsonResponse({
        profiles: [{
          userId: "user-jan",
          displayName: "Jan Sandmann",
          email: "jan@example.com",
          photoURL: "/avatars/jan.png",
        }, {
          userId: "user-simone",
          displayName: "Simone",
          email: "simone@example.com",
        }],
      }));

    const candidates = await loadPlatformOrganizationOwnerDirectory({
      organizationId: "organization-owner-directory-test",
      fetcher,
    });

    expect(candidates).toEqual([
      expect.objectContaining({
        value: "user-jan",
        name: "Jan Sandmann",
        avatarUrl: "/avatars/jan.png",
      }),
      expect.objectContaining({
        value: "user-simone",
        name: "Simone",
        email: "simone@example.com",
        avatarUrl: "",
      }),
    ]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

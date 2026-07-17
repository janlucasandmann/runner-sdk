import { describe, expect, it } from "vitest";

import { normalizeApiKeyOverviewRows } from "./api-key-overview-model.js";

describe("API key overview model", () => {
  it("normalizes active keys and omits revoked records", () => {
    const rows = normalizeApiKeyOverviewRows([
      {
        id: "key_1",
        name: "Default",
        keyPrefix: "tb_",
        createdAt: "2026-01-02T12:00:00.000Z",
        lastUsedAt: "2026-01-03T12:00:00.000Z",
        permissions: ["*"],
        metadata: { isDefault: true },
      },
      { id: "key_2", revokedAt: "2026-01-04T12:00:00.000Z" },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "key_1",
      creatorName: "Computer Agents",
      permissionsLabel: "Full Access",
      isStandard: true,
    });
    expect(rows[0].createdAt).toBeGreaterThan(0);
    expect(rows[0].lastUsedAt).toBeGreaterThan(0);
  });
});

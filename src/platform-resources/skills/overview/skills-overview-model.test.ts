import { describe, expect, it } from "vitest";

import { normalizeSkillOverviewRows } from "./skills-overview-model.js";

describe("skills overview model", () => {
  it("normalizes system and custom skill rows", () => {
    const rows = normalizeSkillOverviewRows([
      {
        id: "browser",
        label: "Browser",
        isSystem: true,
        enabled: true,
      },
      {
        skillId: "custom-audit",
        name: "Audit",
        source: "custom",
        isActive: false,
        updatedAt: "2026-07-16T10:00:00.000Z",
      },
      {},
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: "Browser",
      isCustom: false,
      isActive: true,
      updatedLabel: "System",
    });
    expect(rows[1]).toMatchObject({
      id: "custom-audit",
      isCustom: true,
      isActive: false,
      updatedAt: Date.parse("2026-07-16T10:00:00.000Z"),
    });
  });
});

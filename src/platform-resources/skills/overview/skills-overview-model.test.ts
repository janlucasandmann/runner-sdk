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
        metadata: {
          iconColor: "#7c3aed",
        },
        creator: {
          name: "Jane Doe",
          avatarUrl: "/img/people/jane.jpg",
        },
        owner: {
          name: "Grace Hopper",
          avatarUrl: "/img/people/grace.jpg",
        },
      },
      {},
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: "Browser",
      isCustom: false,
      isActive: true,
      creatorName: "Computer Agents",
      creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
      ownerName: "Computer Agents",
      ownerAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
      updatedAt: 0,
      updatedLabel: "—",
    });
    expect(rows[1]).toMatchObject({
      id: "custom-audit",
      isCustom: true,
      isActive: false,
      iconColor: "#7c3aed",
      creatorName: "Jane Doe",
      creatorAvatarUrl: "/img/people/jane.jpg",
      ownerName: "Grace Hopper",
      ownerAvatarUrl: "/img/people/grace.jpg",
      updatedAt: Date.parse("2026-07-16T10:00:00.000Z"),
    });
    expect(rows[1].updatedLabel).not.toBe("—");
  });

  it("falls back to the details-page icon color for invalid custom metadata", () => {
    const [row] = normalizeSkillOverviewRows([{
      id: "custom-invalid-color",
      isCustom: true,
      metadata: { skillIconColor: "not-a-color" },
    }]);

    expect(row.iconColor).toBe("#ffffff");
  });
});

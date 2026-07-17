import { describe, expect, it } from "vitest";

import {
  normalizeConfigureHomeNotificationRows,
  selectConfigureHomeNotifications,
} from "./configure-home-overview-model.js";

describe("configure home overview model", () => {
  it("normalizes product HTML and invitation categories", () => {
    const rows = normalizeConfigureHomeNotificationRows([
      {
        id: "product-1",
        html: "<strong>New model</strong> is available",
        read: false,
        createdAt: "2026-07-16T10:00:00.000Z",
      },
      {
        id: "team-1",
        type: "team-invitation",
        title: "Join Platform",
      },
    ]);

    expect(rows[0]).toMatchObject({
      kind: "product",
      text: "New model is available",
      unread: true,
    });
    expect(rows[1]).toMatchObject({
      kind: "team_invitation",
      kindLabel: "Team invitation",
    });
  });

  it("filters, searches, and sorts one normalized projection", () => {
    const rows = normalizeConfigureHomeNotificationRows([
      {
        id: "old",
        kind: "permission",
        title: "Deploy permission",
        createdAt: "2026-07-15T10:00:00.000Z",
      },
      {
        id: "new",
        kind: "permission",
        title: "Database permission",
        createdAt: "2026-07-16T10:00:00.000Z",
      },
    ]);

    expect(selectConfigureHomeNotifications(rows, {
      query: "permission",
      filter: "permission",
      sort: "newest",
    }).map((row) => row.id)).toEqual(["new", "old"]);
  });
});

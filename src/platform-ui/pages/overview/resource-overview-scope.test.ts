import { describe, expect, it } from "vitest";
import {
  filterPlatformResourcesByOverviewScope,
  isPlatformResourceCreatedByViewer,
} from "./resource-overview-scope.js";

describe("resource overview scope", () => {
  const viewer = {
    id: "user_current",
    name: "Current User",
    email: "current@example.com",
  };

  it("matches creator identity across user id and email aliases", () => {
    expect(isPlatformResourceCreatedByViewer({ userId: "USER_CURRENT" }, viewer)).toBe(true);
    expect(isPlatformResourceCreatedByViewer({ email: "CURRENT@example.com" }, viewer)).toBe(true);
    expect(isPlatformResourceCreatedByViewer({ id: "user_other" }, viewer)).toBe(false);
  });

  it("keeps legacy resources without creator metadata in the personal scope", () => {
    expect(isPlatformResourceCreatedByViewer({}, viewer)).toBe(true);
    expect(isPlatformResourceCreatedByViewer({ name: "Unknown" }, viewer)).toBe(true);
  });

  it("partitions created and shared resources", () => {
    const resources = [
      { id: "mine", creator: { id: "user_current" } },
      { id: "shared", creator: { id: "user_other" } },
    ];
    expect(
      filterPlatformResourcesByOverviewScope(
        resources,
        "created",
        viewer,
        (resource) => resource.creator,
      ).map((resource) => resource.id),
    ).toEqual(["mine"]);
    expect(
      filterPlatformResourcesByOverviewScope(
        resources,
        "shared",
        viewer,
        (resource) => resource.creator,
      ).map((resource) => resource.id),
    ).toEqual(["shared"]);
  });
});

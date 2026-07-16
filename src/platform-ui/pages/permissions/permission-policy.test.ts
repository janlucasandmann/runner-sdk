import { describe, expect, it } from "vitest";
import {
  createPlatformDefaultPermissionSet,
  getPlatformPermissionActionExplicitAccessByDefinition,
  getPlatformPermissionRingAccessById,
  normalizePlatformPermissionSet,
  updatePlatformPermissionActionAccess,
  updatePlatformPermissionActionRing,
  updatePlatformPermissionRingAccess,
} from "./permission-policy.js";

describe("permission policy", () => {
  it("normalizes legacy string policies without mutating the source", () => {
    const source = {
      subjectType: "agent",
      rings: { ring_1: "read_only" },
      actions: { workspace_read: "no_access" },
      resources: { files: "read_only" },
    };

    const normalized = normalizePlatformPermissionSet(source, "agent");

    expect(getPlatformPermissionRingAccessById(normalized, "ring_1")).toBe("read_only");
    expect(getPlatformPermissionActionExplicitAccessByDefinition(normalized, "workspace_read")).toBe("no_access");
    expect(normalized.resources?.files).toEqual({ defaultAccess: "read_only", rules: [] });
    expect(source.rings.ring_1).toBe("read_only");
  });

  it("updates rings and actions immutably", () => {
    const original = createPlatformDefaultPermissionSet("agent");
    const withRing = updatePlatformPermissionRingAccess(original, "ring_2", "read_only", "agent");
    const withMovedAction = updatePlatformPermissionActionRing(
      withRing,
      "workspace_read",
      "ring_2",
      "agent",
    );
    const withActionAccess = updatePlatformPermissionActionAccess(
      withMovedAction,
      "workspace_read",
      "no_access",
      "agent",
    );

    expect(withRing).not.toBe(original);
    expect(getPlatformPermissionRingAccessById(original, "ring_2")).toBe("ask_for_permission");
    expect(getPlatformPermissionRingAccessById(withRing, "ring_2")).toBe("read_only");
    expect(withActionAccess.actions?.workspace_read).toEqual({
      ringId: "ring_2",
      access: "no_access",
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  getTestPlanCreatorIdentity,
  getTestPlanOwnerIdentity,
  initializeTestPlanIdentityMetadata,
  mergeTestOwnerCandidates,
  normalizeTestPersonIdentity,
  setTestPlanOwnerMetadata,
} from "./test-identity.js";

const currentUser = {
  id: "user_1",
  userId: "user_1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: "https://example.com/ada.png",
};

describe("test plan identities", () => {
  it("initializes creator and owner metadata without dropping existing values", () => {
    const metadata = initializeTestPlanIdentityMetadata(
      { source: "manual" },
      currentUser,
    );

    expect(metadata.source).toBe("manual");
    expect(metadata.creatorUserId).toBe("user_1");
    expect(metadata.ownerUserId).toBe("user_1");
    expect(getTestPlanCreatorIdentity({ metadata }).name).toBe("Ada Lovelace");
    expect(getTestPlanOwnerIdentity({ metadata }).avatarUrl).toBe(
      "https://example.com/ada.png",
    );
  });

  it("normalizes organization member records with nested profiles", () => {
    const identity = normalizeTestPersonIdentity({
      id: "membership_1",
      user: {
        uid: "user_2",
        email: "grace@example.com",
        profile: {
          displayName: "Grace Hopper",
          photoURL: "https://example.com/grace.png",
        },
      },
    });

    expect(identity).toMatchObject({
      id: "membership_1",
      userId: "user_2",
      name: "Grace Hopper",
      email: "grace@example.com",
      avatarUrl: "https://example.com/grace.png",
    });
  });

  it("changes owner while preserving the original creator", () => {
    const initial = initializeTestPlanIdentityMetadata({}, currentUser);
    const next = setTestPlanOwnerMetadata(initial, {
      id: "user_2",
      userId: "user_2",
      name: "Grace Hopper",
      email: "grace@example.com",
    });

    expect(getTestPlanCreatorIdentity({ metadata: next }).userId).toBe("user_1");
    expect(getTestPlanOwnerIdentity({ metadata: next })).toMatchObject({
      userId: "user_2",
      name: "Grace Hopper",
    });
  });

  it("deduplicates owner candidates across membership and user identifiers", () => {
    const candidates = mergeTestOwnerCandidates([
      {
        id: "user_2",
        userId: "user_2",
        name: "Grace Hopper",
        email: "grace@example.com",
      },
      {
        id: "membership_2",
        user: {
          uid: "user_2",
          email: "grace@example.com",
          photoURL: "https://example.com/grace.png",
        },
      },
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      userId: "user_2",
      avatarUrl: "https://example.com/grace.png",
    });
  });

  it("respects existing owner aliases when initializing legacy plans", () => {
    const metadata = initializeTestPlanIdentityMetadata(
      { ownerUserId: "legacy_owner" },
      currentUser,
    );

    expect(metadata.ownerUserId).toBe("legacy_owner");
  });
});

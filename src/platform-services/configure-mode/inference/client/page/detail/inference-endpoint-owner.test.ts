import { describe, expect, it } from "vitest";
import {
  getInferenceEndpointOwnerIdentity,
  mergeInferenceEndpointOwnerCandidates,
  normalizeInferenceEndpointIdentity,
} from "./inference-endpoint-owner.js";

describe("inference endpoint ownership", () => {
  it("resolves persisted owners without placeholder names", () => {
    expect(getInferenceEndpointOwnerIdentity({
      ownerUserId: "user_1",
      ownerName: "You",
      ownerEmail: "owner@example.com",
    })).toMatchObject({
      userId: "user_1",
      name: "owner@example.com",
    });
  });

  it("normalizes nested organization members and deduplicates candidates", () => {
    const candidates = mergeInferenceEndpointOwnerCandidates([
      { userId: "user_1", name: "Ada" },
      { member: { user: { id: "user_1", email: "ada@example.com" } } },
      { user: { id: "user_2", name: "Grace" } },
    ]);
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({ name: "Ada", email: "ada@example.com" });
    expect(normalizeInferenceEndpointIdentity({ profile: { photoURL: "/ada.png" } }).avatarUrl)
      .toBe("/ada.png");
  });
});

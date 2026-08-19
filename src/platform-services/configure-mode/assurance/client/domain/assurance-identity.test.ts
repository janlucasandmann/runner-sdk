import { describe, expect, it } from "vitest";
import {
  getAssurancePolicyCreatorIdentity,
  initializeAssurancePolicyIdentityMetadata,
} from "./assurance-identity.js";

describe("assurance identity metadata", () => {
  it("reads creator identity from persisted metadata aliases", () => {
    expect(
      getAssurancePolicyCreatorIdentity({
        metadata: {
          createdByUserId: "user_shared",
          createdByName: "Shared Owner",
          createdByEmail: "shared@example.com",
        },
      }),
    ).toMatchObject({
      userId: "user_shared",
      name: "Shared Owner",
      email: "shared@example.com",
    });
  });

  it("persists creator and owner identity for new policies", () => {
    const metadata = initializeAssurancePolicyIdentityMetadata(
      {},
      {
        id: "user_current",
        userId: "user_current",
        name: "Current User",
        email: "current@example.com",
      },
    );
    expect(metadata.creator).toMatchObject({ id: "user_current" });
    expect(metadata.owner).toMatchObject({ id: "user_current" });
    expect(metadata.creatorEmail).toBe("current@example.com");
  });

  it("does not replace an existing creator", () => {
    const metadata = initializeAssurancePolicyIdentityMetadata(
      {
        creator: { id: "user_original", name: "Original User" },
      },
      {
        id: "user_current",
        name: "Current User",
      },
    );
    expect(metadata.creator).toMatchObject({ id: "user_original" });
  });
});

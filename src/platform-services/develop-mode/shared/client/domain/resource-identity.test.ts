import { describe, expect, it } from "vitest";
import {
  getDevelopResourceCreatorIdentity,
  getDevelopResourceOwnerIdentity,
  initializeDevelopResourceIdentityMetadata,
} from "./resource-identity.js";

const jan = {
  id: "user_jan",
  userId: "user_jan",
  name: "Jan Sandmann",
  email: "jan@example.com",
  avatarUrl: "https://example.com/jan.png",
};

describe("Develop resource identities", () => {
  it("keeps creator provenance independent from a transferred owner", () => {
    const resource = {
      userId: "user_jan",
      metadata: {
        creator: jan,
        owner: {
          id: "user_ada",
          userId: "user_ada",
          name: "Ada Lovelace",
          email: "ada@example.com",
        },
      },
    };

    expect(getDevelopResourceCreatorIdentity(resource)).toMatchObject({
      userId: "user_jan",
      name: "Jan Sandmann",
    });
    expect(getDevelopResourceOwnerIdentity(resource)).toMatchObject({
      userId: "user_ada",
      name: "Ada Lovelace",
    });
  });

  it("supports legacy createdBy fields and only uses a matching viewer profile", () => {
    expect(getDevelopResourceCreatorIdentity({
      userId: "user_legacy",
      createdByName: "Legacy Creator",
    }, jan)).toMatchObject({
      userId: "user_legacy",
      name: "Legacy Creator",
      email: "",
    });
  });

  it("seeds creator and initial owner aliases for new resources", () => {
    const initialized = initializeDevelopResourceIdentityMetadata({
      name: "New Function",
      metadata: { region: "europe-west1" },
    }, jan);

    expect(initialized.metadata).toMatchObject({
      region: "europe-west1",
      creator: { userId: "user_jan", name: "Jan Sandmann" },
      owner: { userId: "user_jan", name: "Jan Sandmann" },
      creatorUserId: "user_jan",
      ownerUserId: "user_jan",
      createdByUserId: "user_jan",
    });
  });

  it("does not replace an existing creator when initializing a legacy owner", () => {
    const initialized = initializeDevelopResourceIdentityMetadata({
      metadata: {
        creator: {
          id: "user_original",
          name: "Original Creator",
        },
      },
    }, jan);

    expect(getDevelopResourceCreatorIdentity(initialized).name).toBe("Original Creator");
    expect(getDevelopResourceOwnerIdentity(initialized).name).toBe("Jan Sandmann");
  });

  it("reinitializes copied resources when force is enabled", () => {
    const initialized = initializeDevelopResourceIdentityMetadata({
      metadata: {
        creator: { id: "user_original", name: "Original Creator" },
        owner: { id: "user_original", name: "Original Creator" },
      },
    }, jan, { force: true });

    expect(getDevelopResourceCreatorIdentity(initialized).name).toBe("Jan Sandmann");
    expect(getDevelopResourceOwnerIdentity(initialized).name).toBe("Jan Sandmann");
  });
});

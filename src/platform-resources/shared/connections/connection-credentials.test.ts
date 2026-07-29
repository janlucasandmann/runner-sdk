import { describe, expect, it } from "vitest";
import {
  createPlatformConnectionCredential,
  finalizePlatformConnectionCredential,
  normalizePlatformConnectionCredentials,
  reconcilePlatformConnectionCredentials,
  removePlatformConnectionCredential,
  upsertPlatformConnectionCredential,
} from "./connection-credentials.js";

describe("connection credentials", () => {
  it("makes the first credential the only default", () => {
    const credentials = normalizePlatformConnectionCredentials([
      { id: "one", name: "Personal", status: "valid" },
      { id: "two", name: "Work", status: "valid", isDefault: true },
      { id: "three", name: "Backup", status: "valid", isDefault: true },
    ]);

    expect(credentials.map(({ id, isDefault }) => ({ id, isDefault }))).toEqual([
      { id: "one", isDefault: false },
      { id: "two", isDefault: true },
      { id: "three", isDefault: false },
    ]);
  });

  it("promotes the next credential when the default is removed", () => {
    const credentials = [
      createPlatformConnectionCredential({ id: "one", name: "Personal", isDefault: true }),
      createPlatformConnectionCredential({ id: "two", name: "Work" }),
    ];

    expect(removePlatformConnectionCredential(credentials, "one")).toMatchObject([
      { id: "two", isDefault: true },
    ]);
  });

  it("keeps credential identity stable while authorization is finalized", () => {
    const pending = createPlatformConnectionCredential({
      id: "credential-one",
      name: "Work GitHub",
    });
    const credentials = upsertPlatformConnectionCredential([], pending);
    const finalized = finalizePlatformConnectionCredential(credentials, pending.id, {
      identity: "octocat",
    });

    expect(finalized).toMatchObject([
      {
        id: "credential-one",
        name: "Work GitHub",
        identity: "octocat",
        status: "valid",
        isDefault: true,
      },
    ]);
  });

  it("treats provider credentials as authoritative while preserving pending OAuth work", () => {
    const configured = normalizePlatformConnectionCredentials([
      {
        id: "revoked",
        name: "Old account",
        status: "valid",
        isDefault: true,
      },
      {
        id: "work",
        name: "Engineering",
        status: "valid",
      },
      {
        id: "pending",
        name: "New account",
        status: "pending",
      },
    ]);
    const provider = normalizePlatformConnectionCredentials([
      {
        id: "work",
        name: "octocat",
        identity: "octocat",
        status: "valid",
        isDefault: true,
      },
    ]);

    expect(reconcilePlatformConnectionCredentials(configured, provider)).toMatchObject([
      {
        id: "work",
        name: "Engineering",
        identity: "octocat",
        status: "valid",
        isDefault: true,
      },
      {
        id: "pending",
        name: "New account",
        status: "pending",
        isDefault: false,
      },
    ]);
  });

  it("removes completed local metadata when the provider reports an empty credential list", () => {
    expect(
      reconcilePlatformConnectionCredentials(
        [
          { id: "revoked", name: "Revoked", status: "valid", isDefault: true },
          { id: "pending", name: "Pending", status: "pending" },
        ],
        [],
      ),
    ).toMatchObject([
      {
        id: "pending",
        name: "Pending",
        status: "pending",
        isDefault: true,
      },
    ]);
  });
});

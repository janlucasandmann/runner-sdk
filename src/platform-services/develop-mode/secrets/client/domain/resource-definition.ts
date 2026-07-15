import { KeyRound } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const SECRETS_RESOURCE_DEFINITION = Object.freeze({
  kind: "secrets",
  singular: "Secrets Vault",
  plural: "Secrets",
  resourceCountKey: "secrets",
  documentationPath: "/developers/libraries/secrets",
  icon: KeyRound,
  activityMetrics: [
    { id: "secret-reads", key: "secretReads", label: "Secret Reads", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);

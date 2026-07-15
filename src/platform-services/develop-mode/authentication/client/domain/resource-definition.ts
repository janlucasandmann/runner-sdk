import { Users } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const AUTHENTICATION_RESOURCE_DEFINITION = Object.freeze({
  kind: "auth",
  singular: "Authentication",
  plural: "Authentication",
  resourceCountKey: "auth",
  documentationPath: "/developers/libraries/authentication",
  icon: Users,
  activityMetrics: [
    { id: "auth-events", key: "authEvents", label: "Authentication Events", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);

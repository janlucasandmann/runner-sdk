import { Code2 } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const APIS_RESOURCE_DEFINITION = Object.freeze({
  kind: "api",
  singular: "API",
  plural: "APIs",
  resourceCountKey: "apis",
  documentationPath: "/developers",
  icon: Code2,
  activityMetrics: [
    { id: "api-requests", key: "apiRequests", label: "API Requests", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);

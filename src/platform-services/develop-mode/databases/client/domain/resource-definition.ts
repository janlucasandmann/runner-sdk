import { Database } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const DATABASES_RESOURCE_DEFINITION = Object.freeze({
  kind: "database",
  singular: "Database",
  plural: "Databases",
  resourceCountKey: "databases",
  documentationPath: "/developers/libraries/databases",
  icon: Database,
  activityMetrics: [
    { id: "database-reads", key: "databaseReads", label: "Database Reads", color: "#8fc4ff" },
    { id: "database-writes", key: "databaseWrites", label: "Database Writes", color: "#6750ff" },
  ],
} satisfies DevelopResourceDefinition);

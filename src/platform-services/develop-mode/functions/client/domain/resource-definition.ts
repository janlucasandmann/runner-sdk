import { FunctionSquare } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const FUNCTIONS_RESOURCE_DEFINITION = Object.freeze({
  kind: "function",
  singular: "Function",
  plural: "Functions",
  resourceCountKey: "functions",
  documentationPath: "/developers/libraries/functions",
  icon: FunctionSquare,
  activityMetrics: [
    { id: "function-calls", key: "functionCalls", label: "Function Calls", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);

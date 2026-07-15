import { Bot } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const AGENT_RUNTIME_RESOURCE_DEFINITION = Object.freeze({
  kind: "agent_runtime",
  singular: "Agent Runtime",
  plural: "Agent Runtime",
  resourceCountKey: "agentRuntimes",
  documentationPath: "/developers/libraries/agent-runtimes",
  icon: Bot,
  activityMetrics: [
    { id: "runtime-runs", key: "agentRuntimeRuns", label: "Runtime Runs", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);

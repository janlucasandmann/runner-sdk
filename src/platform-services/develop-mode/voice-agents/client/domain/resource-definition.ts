import { Mic } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const VOICE_AGENTS_RESOURCE_DEFINITION = Object.freeze({
  kind: "voice_agent",
  singular: "Voice Agent",
  plural: "Voice Agents",
  resourceCountKey: "voiceAgents",
  documentationPath: "/developers/libraries/voice-agents",
  icon: Mic,
  activityMetrics: [
    { id: "voice-calls", key: "voiceCalls", label: "Voice Calls", color: "#8fc4ff" },
    { id: "voice-minutes", key: "voiceMinutes", label: "Voice Minutes", color: "#6750ff" },
  ],
} satisfies DevelopResourceDefinition);

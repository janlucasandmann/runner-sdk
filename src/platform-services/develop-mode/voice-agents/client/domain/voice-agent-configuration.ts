import type { DevelopVoiceAgentOption, DevelopVoiceAgentOverviewRow } from "./voice-agent-types.js";

export const VOICE_AGENT_MODE_OPTIONS = Object.freeze([
  { id: "off", label: "Off" },
  { id: "web", label: "Web" },
  { id: "phone", label: "Phone" },
  { id: "web_and_phone", label: "Web + Phone" },
] satisfies readonly DevelopVoiceAgentOption[]);

export const VOICE_AGENT_MODEL_OPTIONS = Object.freeze([
  { id: "grok-voice-latest", label: "grok-voice-latest" },
  { id: "grok-voice-think-fast-1.0", label: "grok-voice-think-fast-1.0" },
  { id: "grok-voice-fast-1.0", label: "grok-voice-fast-1.0" },
] satisfies readonly DevelopVoiceAgentOption[]);

type EditableVoiceAgentFields = Pick<
  DevelopVoiceAgentOverviewRow,
  "instructions" | "languageHint" | "mode" | "model" | "voiceId"
>;

export interface DevelopVoiceAgentDraft {
  voiceMode: string;
  voiceModel: string;
  voiceId: string;
  voiceLanguageHint: string;
  voiceInstructions: string;
}

export interface VoiceAgentUpdatePayload {
  voiceMode: string;
  voiceProvider: "xai";
  voiceModel: string;
  voiceId: string | null;
  voiceLanguageHint: string | null;
  voiceInstructions: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getVoiceAgentRecordId(value: unknown): string {
  const record = asRecord(value);
  const agent = asRecord(record.agent);
  return asString(agent.id) || asString(record.id);
}

export function unwrapVoiceAgentRecord(value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  for (const candidate of [record.voiceAgent, record.data, record.record]) {
    const candidateRecord = asRecord(candidate);
    if (getVoiceAgentRecordId(candidateRecord)) return candidateRecord;
  }
  return record;
}

export function createVoiceAgentDraft(row: DevelopVoiceAgentOverviewRow): DevelopVoiceAgentDraft {
  return Object.freeze({
    voiceMode: row.mode,
    voiceModel: row.model,
    voiceId: row.voiceId,
    voiceLanguageHint: row.languageHint,
    voiceInstructions: row.instructions,
  });
}

export function createVoiceAgentUpdatePayload(
  row: EditableVoiceAgentFields,
): VoiceAgentUpdatePayload {
  return {
    voiceMode: asString(row.mode) || "off",
    voiceProvider: "xai",
    voiceModel: asString(row.model) || "grok-voice-latest",
    voiceId: asString(row.voiceId) || null,
    voiceLanguageHint: asString(row.languageHint) || null,
    voiceInstructions: asString(row.instructions) || null,
  };
}

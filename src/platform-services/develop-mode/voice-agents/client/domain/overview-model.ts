import type {
  DevelopVoiceAgentMutationState,
  DevelopVoiceAgentOverviewRow,
} from "./voice-agent-types.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeVoiceMode(value: unknown): string {
  const normalized = asString(value || "off").toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "web_phone") return "web_and_phone";
  return ["off", "web", "phone", "web_and_phone"].includes(normalized) ? normalized : "off";
}

export function createDevelopVoiceAgentOverviewRows(
  records: readonly unknown[],
  draftsById: Readonly<Record<string, unknown>> = {},
  mutationState: DevelopVoiceAgentMutationState = {},
  sessionResultsById: Readonly<Record<string, unknown>> = {},
): DevelopVoiceAgentOverviewRow[] {
  return records.flatMap((rawRecord) => {
    const record = asRecord(rawRecord);
    const agent = asRecord(record.agent);
    const voice = asRecord(record.voice);
    const phone = asRecord(record.phoneNumber);
    const id = asString(agent.id) || asString(record.id);
    if (!id) return [];
    const draft = asRecord(draftsById[id]);
    const session = asRecord(sessionResultsById[id]);
    const sessionThread = asRecord(session.thread);
    const voiceSession = asRecord(session.voiceSession);
    const xai = asRecord(session.xai);
    const mode = normalizeVoiceMode(draft.voiceMode || voice.mode || agent.voiceMode);
    const model = asString(draft.voiceModel || voice.model || agent.voiceModel) || "grok-voice-latest";
    const voiceId = asString(draft.voiceId || voice.voiceId || agent.voiceId) || "eve";
    const languageHint = asString(draft.voiceLanguageHint || voice.languageHint || agent.voiceLanguageHint);
    const instructions = typeof draft.voiceInstructions === "string"
      ? draft.voiceInstructions
      : typeof agent.voiceInstructions === "string" ? agent.voiceInstructions : "";
    const phoneNumber = asString(phone.phoneNumber);
    const name = asString(agent.name) || "Untitled Agent";
    const description = asString(agent.description) || id;
    return [{
      id,
      name,
      description,
      mode,
      model,
      voiceId,
      languageHint,
      instructions,
      phoneNumber,
      phoneStatus: asString(phone.status) || (phoneNumber ? "active" : ""),
      enabled: mode !== "off" || Boolean(phoneNumber),
      webEnabled: mode === "web" || mode === "web_and_phone",
      phoneEnabled: mode === "phone" || mode === "web_and_phone",
      isSaving: asString(mutationState.savingAgentId) === id,
      isProvisioning: asString(mutationState.provisioningAgentId) === id,
      isDisabling: asString(mutationState.disablingAgentId) === id,
      isTesting: asString(mutationState.testingAgentId) === id,
      sessionThreadId: asString(sessionThread.id) || asString(voiceSession.threadId),
      realtimeUrl: asString(xai.realtimeUrl),
      searchText: [name, description, id, phoneNumber, voiceId, model, mode].join(" "),
    }];
  });
}

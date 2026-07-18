import type { PlatformApiClient } from "../../../../../platform-runtime/platform-api-client.js";
import type { VoiceAgentUpdatePayload } from "../domain/voice-agent-configuration.js";

export interface VoiceAgentRepository {
  list(signal?: AbortSignal): Promise<unknown[]>;
  update(agentId: string, payload: VoiceAgentUpdatePayload): Promise<Record<string, unknown>>;
  provisionPhoneNumber(agentId: string): Promise<Record<string, unknown>>;
  disablePhoneNumber(agentId: string): Promise<Record<string, unknown>>;
  createTestSession(agentId: string): Promise<Record<string, unknown>>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrapVoiceAgentList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const candidate of [record.voiceAgents, record.data, record.items]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function requireAgentId(agentId: string): string {
  const normalizedAgentId = String(agentId || "").trim();
  if (!normalizedAgentId) {
    throw new Error("A voice agent id is required.");
  }
  return encodeURIComponent(normalizedAgentId);
}

export function createVoiceAgentRepository(
  apiClient: Pick<PlatformApiClient, "delete" | "get" | "patch" | "post">,
): VoiceAgentRepository {
  return Object.freeze({
    async list(signal?: AbortSignal) {
      return unwrapVoiceAgentList(await apiClient.get("/voice-agents", { signal }));
    },

    async update(agentId: string, payload: VoiceAgentUpdatePayload) {
      return asRecord(
        await apiClient.patch(`/voice-agents/agents/${requireAgentId(agentId)}`, payload),
      );
    },

    async provisionPhoneNumber(agentId: string) {
      return asRecord(
        await apiClient.post(`/voice-agents/agents/${requireAgentId(agentId)}/phone-number`, {
          origin: "xai_provisioned",
        }),
      );
    },

    async disablePhoneNumber(agentId: string) {
      return asRecord(
        await apiClient.delete(`/voice-agents/agents/${requireAgentId(agentId)}/phone-number`),
      );
    },

    async createTestSession(agentId: string) {
      return asRecord(
        await apiClient.post(`/voice-agents/agents/${requireAgentId(agentId)}/sessions`, {
          title: "Voice session",
        }),
      );
    },
  });
}

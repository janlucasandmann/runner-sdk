import { useMemo } from "react";

import { usePlatformApiClient } from "../../../../../platform-runtime/platform-api-provider.js";
import { createVoiceAgentRepository, type VoiceAgentRepository } from "./voice-agent-repository.js";

export function useVoiceAgentRepository(): VoiceAgentRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(() => createVoiceAgentRepository(apiClient), [apiClient]);
}

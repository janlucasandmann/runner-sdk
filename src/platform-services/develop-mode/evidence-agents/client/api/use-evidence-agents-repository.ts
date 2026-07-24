import { useMemo } from "react";
import { usePlatformApiClient } from "../../../../../platform-runtime/platform-api-provider.js";
import { createEvidenceAgentsRepository } from "./evidence-agents-repository.js";

export function useEvidenceAgentsRepository() {
  const apiClient = usePlatformApiClient();
  return useMemo(() => createEvidenceAgentsRepository(apiClient), [apiClient]);
}

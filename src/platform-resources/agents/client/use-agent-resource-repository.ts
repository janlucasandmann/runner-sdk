import { useMemo } from "react";

import { usePlatformApiClient } from "../../../platform-app/runtime/platform-api-provider.js";
import {
  createAgentResourceRepository,
  type AgentResourceRepository,
} from "./agent-resource-client.js";

export function useAgentResourceRepository(): AgentResourceRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(
    () => createAgentResourceRepository(apiClient),
    [apiClient],
  );
}

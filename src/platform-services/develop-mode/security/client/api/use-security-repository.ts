import { useMemo } from "react";
import { usePlatformApiClient } from "../../../../../platform-runtime/platform-api-provider.js";
import { createSecurityServiceRepository } from "./security-repository.js";

export function useSecurityServiceRepository() {
  const apiClient = usePlatformApiClient();
  return useMemo(() => createSecurityServiceRepository(apiClient), [apiClient]);
}


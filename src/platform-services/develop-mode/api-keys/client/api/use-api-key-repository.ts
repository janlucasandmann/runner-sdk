import { useMemo } from "react";

import { usePlatformApiClient } from "../../../../../platform-app/runtime/platform-api-provider.js";
import {
  createApiKeyRepository,
  type ApiKeyRepository,
} from "./api-key-repository.js";

export function useApiKeyRepository(): ApiKeyRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(() => createApiKeyRepository(apiClient), [apiClient]);
}

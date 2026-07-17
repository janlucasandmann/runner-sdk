import { useMemo } from "react";

import { usePlatformApiClient } from "../../../../../platform-app/runtime/platform-api-provider.js";
import {
  createConfigureHomeRepository,
  type ConfigureHomeRepository,
} from "./configure-home-client.js";

export function useConfigureHomeRepository(): ConfigureHomeRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(
    () => createConfigureHomeRepository(apiClient),
    [apiClient],
  );
}

import { useMemo } from "react";
import { usePlatformApiClient } from "../../../../../platform-runtime/platform-api-provider.js";
import {
  createDevelopResourceRepository,
  type DevelopResourceRepository,
} from "./develop-resource-client.js";

export function useDevelopResourceRepository(): DevelopResourceRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(
    () => createDevelopResourceRepository(apiClient),
    [apiClient],
  );
}

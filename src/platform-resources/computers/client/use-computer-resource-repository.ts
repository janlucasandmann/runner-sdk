import { useMemo } from "react";
import { usePlatformApiClient } from "../../../platform-runtime/platform-api-provider.js";
import {
  createComputerResourceRepository,
  type ComputerResourceRepository,
} from "./computer-resource-client.js";

export function useComputerResourceRepository(): ComputerResourceRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(
    () => createComputerResourceRepository(apiClient),
    [apiClient],
  );
}

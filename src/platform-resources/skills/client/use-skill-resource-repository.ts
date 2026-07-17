import { useMemo } from "react";

import { usePlatformApiClient } from "../../../platform-app/runtime/platform-api-provider.js";
import {
  createSkillResourceRepository,
  type SkillResourceRepository,
} from "./skill-resource-client.js";

export function useSkillResourceRepository(): SkillResourceRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(
    () => createSkillResourceRepository(apiClient),
    [apiClient],
  );
}

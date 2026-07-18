import { useMemo } from "react";

import { usePlatformApiClient } from "../../../../../platform-runtime/platform-api-provider.js";
import {
  createModelCatalogRepository,
  type ModelCatalogRepository,
} from "./model-catalog-repository.js";

export function useModelCatalogRepository(): ModelCatalogRepository {
  const apiClient = usePlatformApiClient();
  return useMemo(
    () => createModelCatalogRepository(apiClient),
    [apiClient],
  );
}

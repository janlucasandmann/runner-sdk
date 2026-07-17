import { SlidersHorizontal } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import {
  useModelCatalogRepository,
} from "../../platform-services/configure-mode/models/client/api/index.js";
import {
  createModelsOverviewProjection,
  MODELS_OVERVIEW_TABS,
  type ModelCatalogRow,
  type ModelsCategory,
} from "../../platform-services/configure-mode/models/client/domain/index.js";
import type {
  ModelsOverviewPageProps,
} from "../../platform-services/configure-mode/models/client/page/models-overview-page.js";
import {
  createModelsOverviewColumns,
  ModelsFeaturedSection,
} from "../../platform-services/configure-mode/models/client/page/models-overview-presentation.js";
import {
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";
import type {
  PlatformDataTableSortState,
} from "../../platform-ui/components/composite/data-table/index.js";
import { ModelsOverviewPage } from "../routing/platform-lazy-pages.js";

export interface ModelsOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load models.";
}

const SKILL_SETTINGS: Partial<
  Record<ModelsCategory, {
    skillId: string;
    title: string;
    description: string;
    buttonLabel: string;
  }>
> = Object.freeze({
  image: {
    skillId: "image_generation",
    title: "Choose default image models in skill settings",
    description: "Agents use the selected Image Generation defaults unless the thread asks for another model or quality.",
    buttonLabel: "Image Settings",
  },
  video: {
    skillId: "video_generation",
    title: "Choose default video models in skill settings",
    description: "Agents use the selected Video Generation model while honoring explicit model requests.",
    buttonLabel: "Video Settings",
  },
  deep_research: {
    skillId: "deep_research",
    title: "Choose default research models in skill settings",
    description: "Agents use the selected Deep Research model unless the user asks for another research model.",
    buttonLabel: "Research Settings",
  },
});

const ModelCatalogOverviewPage = ModelsOverviewPage as unknown as ComponentType<
  ModelsOverviewPageProps<ModelCatalogRow>
>;

export function ModelsOverviewRoute({
  onOpenLegacy,
}: ModelsOverviewRouteProps) {
  const repository = useModelCatalogRepository();
  const [remoteModels, setRemoteModels] = useState<readonly unknown[]>([]);
  const [category, setCategory] = useState<ModelsCategory>("agent");
  const [searchValue, setSearchValue] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sorting, setSorting] = useState<PlatformDataTableSortState>({
    id: "provider",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setRemoteModels(await repository.listAgentModels(signal));
    } catch (loadError) {
      if (!signal?.aborted) setError(readErrorMessage(loadError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const projection = useMemo(() => createModelsOverviewProjection({
    category,
    remoteAgentModels: remoteModels,
    query: searchValue,
    providerFilter,
    sorting,
  }), [
    category,
    providerFilter,
    remoteModels,
    searchValue,
    sorting,
  ]);
  const featuredModels = useMemo(() => createModelsOverviewProjection({
    category: "agent",
    remoteAgentModels: remoteModels,
  }).allRows, [remoteModels]);
  const columns = useMemo(
    () => createModelsOverviewColumns(category),
    [category],
  );
  const settings = SKILL_SETTINGS[category];
  const skillSettingsContent = settings ? (
    <section className="playground-models-skill-settings-section">
      <div className="playground-models-skill-settings-copy">
        <h3 className="playground-models-skill-settings-title">
          {settings.title}
        </h3>
        <p className="playground-models-skill-settings-description">
          {settings.description}
        </p>
      </div>
      <PlatformSecondaryButton
        type="button"
        className="playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-models-skill-settings-button"
        onClick={() => onOpenLegacy("skill-settings", settings.skillId)}
      >
        <SlidersHorizontal width={14} height={14} strokeWidth={1.8} />
        <span>{settings.buttonLabel}</span>
      </PlatformSecondaryButton>
    </section>
  ) : null;

  return (
    <ModelCatalogOverviewPage
      rows={projection.rows}
      columns={columns}
      featuredContent={<ModelsFeaturedSection models={featuredModels} />}
      skillSettingsContent={skillSettingsContent}
      tabs={MODELS_OVERVIEW_TABS}
      activeTab={category}
      onTabChange={(tabId) => {
        const nextCategory = (
          tabId === "image"
          || tabId === "video"
          || tabId === "deep_research"
        ) ? tabId : "agent";
        setCategory(nextCategory);
        setProviderFilter("all");
        setSorting({ id: "provider", direction: "asc" });
      }}
      onCreateAgent={(model) => onOpenLegacy(
        "create-agent",
        String(model.details?.agentModelId || model.id),
      )}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      providerFilter={providerFilter}
      providerFilterOptions={projection.providerFilterOptions}
      onProviderFilterChange={setProviderFilter}
      sorting={sorting}
      onSortingChange={(nextSorting) => {
        if (nextSorting) setSorting(nextSorting);
      }}
      getRowId={(model) => `${category}:${model.id}`}
      getRowClassName={(model) => (
        model.isPricingSubrow ? "is-pricing-subrow" : ""
      )}
      loading={loading}
      error={error || undefined}
    />
  );
}

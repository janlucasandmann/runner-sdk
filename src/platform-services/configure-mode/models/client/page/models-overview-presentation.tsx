import {
  Bot,
  Brain,
  Code2,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import {
  getAgentPricingCells,
  getModelProviderIcon,
  getModelProviderLabel,
  getModelSpeedLabel,
  type ModelCatalogRow,
  type ModelsCategory,
} from "../domain/index.js";

function ModelProviderIcon({ model }: { model: ModelCatalogRow }) {
  const icon = getModelProviderIcon(model);
  return (
    <span
      className="playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon"
      aria-hidden="true"
    >
      {icon ? (
        <img
          src={icon.src}
          alt=""
          draggable={false}
          className={`playground-agents-model-provider-icon${
            icon.className ? ` ${icon.className}` : ""
          }`}
        />
      ) : (
        <Bot width={16} height={16} strokeWidth={1.8} />
      )}
    </span>
  );
}

function ModelTextValue({
  children,
  strong = false,
  price = false,
}: {
  children: ReactNode;
  strong?: boolean;
  price?: boolean;
}) {
  return (
    <div
      className={`playground-models-entry-value${
        strong ? " is-strong" : ""
      }${price ? " is-price" : ""}`}
    >
      {children}
    </div>
  );
}

function IntelligenceValue({ model }: { model: ModelCatalogRow }) {
  const label = String(model.intelligence || "Custom");
  const level = {
    Custom: 1,
    Good: 2,
    High: 3,
    Highest: 4,
  }[label] || 1;
  return (
    <span
      className="playground-agents-model-brains"
      title={label}
      aria-label={`${label} intelligence, level ${level} of 4`}
    >
      {Array.from({ length: 4 }, (_, index) => (
        <Brain
          key={index}
          className={`playground-agents-model-brain${
            index < level ? " is-active" : ""
          }`}
          width={12}
          height={12}
          strokeWidth={1.9}
        />
      ))}
    </span>
  );
}

export function createModelsOverviewColumns(
  category: ModelsCategory,
): readonly PlatformDataTableColumn<ModelCatalogRow>[] {
  const agent = category === "agent";
  const video = category === "video";
  const capabilityLabel = video
    ? "Max Duration"
    : agent
      ? "Intelligence"
      : "Mode";
  const scopeLabel = agent
    ? "Context"
    : category === "image"
      ? "Quality"
      : video
        ? "Resolutions"
        : "Scope";
  const speedLabel = video
    ? "Input Modalities"
    : agent
      ? "Speed in TPS"
      : "Speed";

  return [
    {
      id: "name",
      header: "Model",
      accessor: "label",
      sortable: true,
      width: "minmax(185px, 1.35fr)",
      cell: ({ row }) => (
        <div className="playground-files-entry-main playground-models-entry-main">
          {!row.isPricingSubrow ? <ModelProviderIcon model={row} /> : null}
          <div className="playground-files-entry-name" title={row.label}>
            {row.label}
          </div>
        </div>
      ),
    },
    {
      id: "provider",
      header: "Provider",
      accessor: (model) => getModelProviderLabel(model),
      sortable: true,
      width: "minmax(105px, 0.72fr)",
      cell: ({ row }) => (
        <ModelTextValue strong>
          {getModelProviderLabel(row)}
        </ModelTextValue>
      ),
    },
    {
      id: agent ? "intelligence" : "capability",
      header: capabilityLabel,
      accessor: (model) => (
        video
          ? model.maxDuration || "Custom"
          : agent
            ? model.intelligence || "Custom"
            : model.mode || "Managed"
      ),
      sortable: true,
      width: "minmax(105px, 0.7fr)",
      hideBelow: 820,
      cell: ({ row }) => (
        agent
          ? <IntelligenceValue model={row} />
          : (
              <ModelTextValue>
                {video ? row.maxDuration : row.mode || "Managed"}
              </ModelTextValue>
            )
      ),
    },
    {
      id: agent ? "context" : "scope",
      header: scopeLabel,
      accessor: (model) => (
        video
          ? model.resolutions || "Custom"
          : model.contextWindow || "Custom"
      ),
      sortable: true,
      width: "minmax(85px, 0.55fr)",
      hideBelow: 720,
      cell: ({ row }) => (
        <ModelTextValue>
          {video ? row.resolutions : row.contextWindow || "Custom"}
        </ModelTextValue>
      ),
    },
    {
      id: "speed",
      header: speedLabel,
      accessor: (model) => (
        video
          ? model.inputModalities || "Custom"
          : getModelSpeedLabel(model)
      ),
      sortable: true,
      width: "minmax(95px, 0.62fr)",
      hideBelow: 940,
      cell: ({ row }) => (
        <ModelTextValue>
          {video ? row.inputModalities : getModelSpeedLabel(row)}
        </ModelTextValue>
      ),
    },
    ...(agent
      ? ([
          {
            id: "cost-input",
            header: "Input / mTok",
            accessor: (model: ModelCatalogRow) => (
              getAgentPricingCells(model).input
            ),
            sortable: true,
            width: "minmax(100px, 0.58fr)",
            cell: ({ row }: { row: ModelCatalogRow }) => (
              <ResourceOverviewValue>
                {getAgentPricingCells(row).input}
              </ResourceOverviewValue>
            ),
          },
          {
            id: "cost-output",
            header: "Output / mTok",
            accessor: (model: ModelCatalogRow) => (
              getAgentPricingCells(model).output
            ),
            sortable: true,
            width: "minmax(105px, 0.6fr)",
            hideBelow: 1040,
            cell: ({ row }: { row: ModelCatalogRow }) => (
              <ResourceOverviewValue>
                {getAgentPricingCells(row).output}
              </ResourceOverviewValue>
            ),
          },
          {
            id: "cost-cached",
            header: "Cached / mTok",
            accessor: (model: ModelCatalogRow) => (
              getAgentPricingCells(model).cached
            ),
            sortable: true,
            width: "minmax(105px, 0.6fr)",
            hideBelow: 1180,
            cell: ({ row }: { row: ModelCatalogRow }) => (
              <ResourceOverviewValue>
                {getAgentPricingCells(row).cached}
              </ResourceOverviewValue>
            ),
          },
        ] satisfies PlatformDataTableColumn<ModelCatalogRow>[])
      : ([
          {
            id: "cost",
            header: "Pricing",
            accessor: (model: ModelCatalogRow) => (
              model.pricingLabel || "Usage-based pricing"
            ),
            sortable: true,
            width: "minmax(125px, 0.75fr)",
            cell: ({ row }: { row: ModelCatalogRow }) => (
              <ModelTextValue strong>
                {row.pricingLabel || "Usage-based pricing"}
              </ModelTextValue>
            ),
          },
        ] satisfies PlatformDataTableColumn<ModelCatalogRow>[])),
  ];
}

interface FeaturedModelDefinition {
  id: string;
  displayName: string;
  badge: string;
  description: string;
  className: string;
  icon: LucideIcon;
  metrics: readonly {
    label: string;
    value: (model: ModelCatalogRow) => string;
  }[];
}

const FEATURED_MODELS: readonly FeaturedModelDefinition[] = [
  {
    id: "deepseek-v4-flash",
    displayName: "DeepSeek V4 Flash",
    badge: "Speed & value",
    description: "Fast, cost-efficient execution for high-volume agents and everyday production work.",
    className: "is-speed",
    icon: Zap,
    metrics: [
      { label: "Speed", value: getModelSpeedLabel },
      {
        label: "Input",
        value: (model) => `${getAgentPricingCells(model).input} / mTok`,
      },
      { label: "Context", value: (model) => model.contextWindow || "Custom" },
    ],
  },
  {
    id: "kimi-k2.7-code",
    displayName: "Kimi K2.7 Code",
    badge: "Coding",
    description: "Maximum coding performance for complex implementation work and long-horizon engineering.",
    className: "is-code",
    icon: Code2,
    metrics: [
      {
        label: "Intelligence",
        value: (model) => model.intelligence || "High",
      },
      { label: "Context", value: (model) => model.contextWindow || "Custom" },
      {
        label: "Input",
        value: (model) => `${getAgentPricingCells(model).input} / mTok`,
      },
    ],
  },
  {
    id: "glm-5.2",
    displayName: "GLM 5.2",
    badge: "Agent value",
    description: "Strong autonomous agent performance with excellent throughput at a low operating cost.",
    className: "is-agent",
    icon: Bot,
    metrics: [
      {
        label: "Intelligence",
        value: (model) => model.intelligence || "Highest",
      },
      { label: "Speed", value: getModelSpeedLabel },
      {
        label: "Input",
        value: (model) => `${getAgentPricingCells(model).input} / mTok`,
      },
    ],
  },
  {
    id: "grok-4.5",
    displayName: "Grok 4.5",
    badge: "Frontier",
    description: "Maximum performance and efficient token use for demanding agentic and knowledge work.",
    className: "is-frontier",
    icon: Sparkles,
    metrics: [
      {
        label: "Intelligence",
        value: (model) => model.intelligence || "Highest",
      },
      { label: "Speed", value: getModelSpeedLabel },
      { label: "Context", value: (model) => model.contextWindow || "Custom" },
    ],
  },
];

export function ModelsFeaturedSection({
  models,
}: {
  models: readonly ModelCatalogRow[];
}) {
  const entries = FEATURED_MODELS.flatMap((definition) => {
    const model = models.find((candidate) => candidate.id === definition.id);
    return model ? [{ definition, model }] : [];
  });
  if (!entries.length) return null;
  return (
    <section
      className="playground-models-featured-section"
      aria-label="Featured Models"
    >
      <div className="playground-models-featured-grid">
        {entries.map(({ definition, model }) => {
          const RecommendationIcon = definition.icon;
          return (
            <article
              key={definition.id}
              className={`playground-models-featured-card ${definition.className}`}
            >
              <div className="playground-models-featured-card-top">
                <div className="playground-models-featured-provider">
                  <span
                    className="playground-models-featured-provider-icon"
                    aria-hidden="true"
                  >
                    <ModelProviderIcon model={model} />
                  </span>
                  <span className="playground-models-featured-provider-label">
                    {getModelProviderLabel(model)}
                  </span>
                </div>
                <span className="playground-models-featured-badge">
                  <RecommendationIcon
                    width={11}
                    height={11}
                    strokeWidth={1.9}
                  />
                  <span>{definition.badge}</span>
                </span>
              </div>
              <h3 className="playground-models-featured-name">
                {definition.displayName}
              </h3>
              <p className="playground-models-featured-description">
                {definition.description}
              </p>
              <div className="playground-models-featured-metrics">
                {definition.metrics.map((metric) => {
                  const value = metric.value(model);
                  return (
                    <div
                      key={metric.label}
                      className="playground-models-featured-metric"
                    >
                      <span className="playground-models-featured-metric-label">
                        {metric.label}
                      </span>
                      <span
                        className="playground-models-featured-metric-value"
                        title={value}
                      >
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

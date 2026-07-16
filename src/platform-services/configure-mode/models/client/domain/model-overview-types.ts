export interface ModelOverviewDetailFact {
  label: string;
  value: string;
  description?: string;
}

export interface ModelOverviewProviderIcon {
  src: string;
  alt: string;
  className?: string;
}

export interface ModelOverviewDetails {
  categoryLabel: string;
  description: string;
  providerIcon?: ModelOverviewProviderIcon;
  overviewFacts: readonly ModelOverviewDetailFact[];
  availabilityFacts: readonly ModelOverviewDetailFact[];
  capabilities?: readonly string[];
  documentationUrl?: string;
  canCreateAgent?: boolean;
  agentModelId?: string;
}

export interface ModelsOverviewRow {
  id: string;
  label?: string;
  isPricingSubrow?: boolean;
  details?: ModelOverviewDetails;
  [key: string]: unknown;
}

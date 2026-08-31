import type { ResourceOverviewPeriod } from "../../../../../platform-ui/pages/overview/index.js";
import type { DevelopResourceOperationalMetrics } from "../../../shared/client/domain/index.js";
import type { DevelopResourceIdentity } from "../../../shared/client/domain/index.js";

export interface DevelopVoiceAgentOverviewRow {
  id: string;
  name: string;
  description: string;
  mode: string;
  model: string;
  voiceId: string;
  languageHint: string;
  instructions: string;
  phoneNumber: string;
  phoneStatus: string;
  createdAt?: string;
  updatedAt?: string;
  creator: DevelopResourceIdentity;
  owner: DevelopResourceIdentity;
  enabled: boolean;
  webEnabled: boolean;
  phoneEnabled: boolean;
  isSaving?: boolean;
  isProvisioning?: boolean;
  isDisabling?: boolean;
  isTesting?: boolean;
  sessionThreadId?: string;
  realtimeUrl?: string;
  searchText: string;
}

export interface DevelopVoiceAgentMutationState {
  savingAgentId?: string;
  provisioningAgentId?: string;
  disablingAgentId?: string;
  testingAgentId?: string;
}

export interface DevelopVoiceAgentOption {
  id: string;
  label: string;
}

export interface DevelopVoiceAgentsOverviewPageProps {
  rows: readonly DevelopVoiceAgentOverviewRow[];
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  operationalMetrics?: DevelopResourceOperationalMetrics | null;
  analyticsLoading?: boolean;
  analyticsError?: string;
  controlsPortalId?: string;
  loading?: boolean;
  error?: string;
  message?: string;
  modeOptions: readonly DevelopVoiceAgentOption[];
  modelOptions: readonly DevelopVoiceAgentOption[];
  onRefresh: () => void;
  onChange: (row: DevelopVoiceAgentOverviewRow, patch: Partial<Pick<DevelopVoiceAgentOverviewRow, "mode" | "model" | "voiceId" | "languageHint" | "instructions">>) => void;
  onSave: (row: DevelopVoiceAgentOverviewRow) => void | Promise<unknown>;
  onTest: (row: DevelopVoiceAgentOverviewRow) => void | Promise<unknown>;
  onProvision: (row: DevelopVoiceAgentOverviewRow) => void | Promise<unknown>;
  onDisablePhone: (row: DevelopVoiceAgentOverviewRow) => void | Promise<unknown>;
  onOpenThread?: (threadId: string) => void;
}

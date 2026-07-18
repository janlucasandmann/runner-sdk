import { useCallback, useEffect, useState } from "react";
import type { DevelopResourceOperationalMetrics } from "../../platform-services/develop-mode/shared/index.js";
import {
  DevelopVoiceAgentsOverviewPage,
  useVoiceAgentManagement,
  useVoiceAgentRepository,
  VOICE_AGENT_MODE_OPTIONS,
  VOICE_AGENT_MODEL_OPTIONS,
} from "../../platform-services/develop-mode/voice-agents/index.js";
import type { ResourceOverviewPeriod } from "../../platform-ui/pages/overview/index.js";
import { usePlatformApiClient } from "../runtime/platform-api-provider.js";

export interface VoiceAgentsOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrapOperationalMetrics(value: unknown): DevelopResourceOperationalMetrics | null {
  const envelope = asRecord(value);
  const metrics = asRecord(envelope.analytics || envelope.metrics || envelope);
  return Object.keys(metrics).length ? (metrics as DevelopResourceOperationalMetrics) : null;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load voice-agent analytics.";
}

export function VoiceAgentsOverviewRoute({ onOpenLegacy }: VoiceAgentsOverviewRouteProps) {
  const apiClient = usePlatformApiClient();
  const repository = useVoiceAgentRepository();
  const management = useVoiceAgentManagement(repository);
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [operationalMetrics, setOperationalMetrics] =
    useState<DevelopResourceOperationalMetrics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const loadAnalytics = useCallback(
    async (signal?: AbortSignal) => {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      try {
        const payload = await apiClient.get("/servers/analytics/overview", {
          query: { kind: "voice_agent", period },
          signal,
        });
        if (!signal?.aborted) {
          setOperationalMetrics(unwrapOperationalMetrics(payload));
        }
      } catch (error) {
        if (!signal?.aborted) {
          setOperationalMetrics(null);
          setAnalyticsError(readErrorMessage(error));
        }
      } finally {
        if (!signal?.aborted) setAnalyticsLoading(false);
      }
    },
    [apiClient, period],
  );

  useEffect(() => {
    const controller = new AbortController();
    void management.load(controller.signal);
    return () => controller.abort();
  }, [management.load]);

  useEffect(() => {
    const controller = new AbortController();
    void loadAnalytics(controller.signal);
    return () => controller.abort();
  }, [loadAnalytics]);

  const refresh = useCallback(async () => {
    await Promise.all([management.load(), loadAnalytics()]);
  }, [loadAnalytics, management.load]);

  return (
    <DevelopVoiceAgentsOverviewPage
      rows={management.rows}
      period={period}
      onPeriodChange={setPeriod}
      operationalMetrics={operationalMetrics}
      analyticsLoading={analyticsLoading}
      analyticsError={analyticsError}
      loading={management.loading}
      error={management.error}
      message={management.message}
      modeOptions={VOICE_AGENT_MODE_OPTIONS}
      modelOptions={VOICE_AGENT_MODEL_OPTIONS}
      onRefresh={() => {
        void refresh();
      }}
      onChange={management.updateDraft}
      onSave={management.save}
      onTest={management.test}
      onProvision={management.provision}
      onDisablePhone={management.disablePhone}
      onOpenThread={(threadId) => onOpenLegacy("open-thread", threadId)}
    />
  );
}

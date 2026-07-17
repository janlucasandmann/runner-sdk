import {
  BookOpen,
  Coins,
  Grid3X3,
  KeyRound,
  Webhook,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createDevelopHomeOverviewModel,
} from "../../platform-services/develop-mode/develop-home/client/domain/index.js";
import {
  useApiKeyRepository,
} from "../../platform-services/develop-mode/api-keys/client/api/index.js";
import {
  useDevelopResourceRepository,
} from "../../platform-services/develop-mode/shared/client/api/index.js";
import type {
  ResourceOverviewPeriod,
} from "../../platform-ui/pages/overview/index.js";
import {
  DevelopHomeOverviewPage,
} from "../routing/platform-lazy-pages.js";
import { navigatePlatformClient } from "../routing/platform-browser-navigation.js";
import type { PlatformRouteId } from "../routing/platform-route-registry.js";
import { usePlatformApiClient } from "../runtime/platform-api-provider.js";
import { usePlatformRuntime } from "../runtime/platform-runtime.js";

export interface DevelopHomeRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load Develop Home.";
}

function readUsageValue(value: unknown): string {
  const payload = asRecord(value);
  const totals = asRecord(payload.totals || asRecord(payload.summary).totals);
  const amount = Number(
    totals.totalCT
      ?? totals.totalCt
      ?? totals.total_ct
      ?? totals.totalCost
      ?? totals.total_cost
      ?? 0,
  );
  if (!Number.isFinite(amount) || amount <= 0) return "0 CT";
  return `${Math.round(amount).toLocaleString("en-US")} CT`;
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function DevelopHomeRoute({
  onOpenLegacy,
}: DevelopHomeRouteProps) {
  const apiClient = usePlatformApiClient();
  const runtime = usePlatformRuntime();
  const resourceRepository = useDevelopResourceRepository();
  const apiKeyRepository = useApiKeyRepository();
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [quickstartLanguage, setQuickstartLanguage] = useState("javascript");
  const [serverRecords, setServerRecords] = useState<readonly unknown[]>([]);
  const [databaseRecords, setDatabaseRecords] =
    useState<readonly unknown[]>([]);
  const [apiKeyCount, setApiKeyCount] = useState(0);
  const [serverAnalytics, setServerAnalytics] = useState<unknown>(null);
  const [databaseAnalytics, setDatabaseAnalytics] = useState<unknown>(null);
  const [usageValue, setUsageValue] = useState("0 CT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      resourceRepository.list("server", { signal }),
      resourceRepository.list("database", { signal }),
      apiKeyRepository.list(signal),
      apiClient.get("/servers/analytics/overview", {
        query: { period },
        signal,
      }),
      apiClient.get("/databases/analytics/overview", {
        query: { period },
        signal,
      }),
      apiClient.get("/costs/summary", {
        query: { period: "month" },
        signal,
      }),
    ]);
    if (signal?.aborted) return;
    const [
      serversResult,
      databasesResult,
      keysResult,
      serverAnalyticsResult,
      databaseAnalyticsResult,
      usageResult,
    ] = results;
    if (serversResult.status === "fulfilled") {
      setServerRecords(serversResult.value);
    }
    if (databasesResult.status === "fulfilled") {
      setDatabaseRecords(databasesResult.value);
    }
    if (keysResult.status === "fulfilled") {
      setApiKeyCount(keysResult.value.length);
    }
    setServerAnalytics(
      serverAnalyticsResult.status === "fulfilled"
        ? serverAnalyticsResult.value
        : null,
    );
    setDatabaseAnalytics(
      databaseAnalyticsResult.status === "fulfilled"
        ? databaseAnalyticsResult.value
        : null,
    );
    if (usageResult.status === "fulfilled") {
      setUsageValue(readUsageValue(usageResult.value));
    }
    const primaryFailure = [serversResult, databasesResult].find(
      (result) => result.status === "rejected",
    );
    if (primaryFailure?.status === "rejected") {
      setError(readErrorMessage(primaryFailure.reason));
    }
    setLoading(false);
  }, [apiClient, apiKeyRepository, period, resourceRepository]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const overview = useMemo(() => createDevelopHomeOverviewModel({
    serverRecords,
    databaseRecords,
    serverAnalytics,
    databaseAnalytics,
    period,
    loading,
    error,
  }), [
    databaseAnalytics,
    databaseRecords,
    error,
    loading,
    period,
    serverAnalytics,
    serverRecords,
  ]);
  const documentationOrigin = runtime.aiosOrigin
    || "https://computer-agents.com";
  const supplementaryContent = useMemo(() => ({
    quickstartLanguages: [
      {
        id: "javascript",
        label: "javascript",
        lines: [
          "import { ComputerAgentsClient } from 'computer-agents';",
          "",
          "const client = new ComputerAgentsClient();",
          "",
          "const result = await client.run('Build a CRM pipeline board', {",
          "  onEvent: (event) => console.log(event.type)",
          "});",
          "",
          "console.log(result.content);",
        ],
      },
      {
        id: "python",
        label: "python",
        lines: [
          "from computer_agents import ComputerAgentsClient",
          "",
          "client = ComputerAgentsClient()",
          "",
          "result = client.run(",
          "    'Build a CRM pipeline board',",
          "    on_event=lambda event: print(event['type']),",
          ")",
          "",
          "print(result.content)",
        ],
      },
    ],
    activeQuickstartLanguageId: quickstartLanguage,
    onQuickstartLanguageChange: setQuickstartLanguage,
    onOpenQuickstart: () => openExternal(
      `${documentationOrigin}/developers/quickstart`,
    ),
    concepts: [
      {
        id: "threads",
        title: "Threads",
        description: "Run work in persistent histories with streaming, editable turns, and resumable state.",
        imageUrl: "/img/001-docs/thread.jpg",
        onClick: () => openExternal(
          `${documentationOrigin}/developers/core-concepts#threads`,
        ),
      },
      {
        id: "computers",
        title: "Computers",
        description: "Give ACP stateful execution machines with runtimes, GUI access, snapshots, and forks.",
        imageUrl: "/img/001-docs/computer.jpg",
        onClick: () => openExternal(
          `${documentationOrigin}/developers/core-concepts#computers`,
        ),
      },
      {
        id: "projects",
        title: "Projects",
        description: "Coordinate mission control, tickets, resources, schedules, and agents in one workspace.",
        imageUrl: "/img/001-docs/projects.jpg",
        onClick: () => openExternal(
          `${documentationOrigin}/developers/core-concepts#projects`,
        ),
      },
    ],
    onOpenAllConcepts: () => openExternal(
      `${documentationOrigin}/developers/core-concepts`,
    ),
    usageValue,
    resourceCountLabel: `${overview.totalResourceCount} resources`,
    apiKeyCountLabel: `${apiKeyCount} keys`,
    onOpenUsage: () => onOpenLegacy("usage"),
    onCreateApiKey: () => onOpenLegacy("create-api-key"),
    onOpenResources: () => navigatePlatformClient("web-apps"),
    onOpenApiKeys: () => navigatePlatformClient("api-keys"),
    quickLinks: [
      {
        id: "create-api-key",
        label: "Create an API Key",
        icon: KeyRound,
        onClick: () => onOpenLegacy("create-api-key"),
      },
      {
        id: "browse-models",
        label: "Browse Models",
        icon: Grid3X3,
        onClick: () => navigatePlatformClient("models"),
      },
      {
        id: "webhooks",
        label: "Webhooks",
        icon: Webhook,
        onClick: () => navigatePlatformClient("webhooks"),
      },
      {
        id: "api-reference",
        label: "API Reference",
        icon: BookOpen,
        onClick: () => openExternal(`${documentationOrigin}/developers`),
      },
      {
        id: "pricing",
        label: "Pricing Overview",
        icon: Coins,
        onClick: () => openExternal(`${documentationOrigin}/pricing`),
      },
    ],
  }), [
    apiKeyCount,
    documentationOrigin,
    onOpenLegacy,
    overview.totalResourceCount,
    quickstartLanguage,
    usageValue,
  ]);

  return (
    <DevelopHomeOverviewPage
      rows={overview.rows}
      period={period}
      onPeriodChange={setPeriod}
      analytics={overview.analytics}
      loading={loading}
      supplementaryContent={supplementaryContent}
      onOpen={(row) => navigatePlatformClient(row.id as PlatformRouteId)}
      onShowUsage={() => onOpenLegacy("usage")}
      onOpenPricing={() => openExternal(`${documentationOrigin}/pricing`)}
      onOpenDocumentation={() => openExternal(
        `${documentationOrigin}/developers`,
      )}
    />
  );
}

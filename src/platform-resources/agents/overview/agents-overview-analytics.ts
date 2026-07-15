import type { PlatformAnalyticsModel } from "../../../platform-ui/components/composite/analytics/index.js";

export interface AgentOverviewAnalyticsBucket {
  label: string;
  agentRuns: number;
  squadRuns: number;
  agentCostUsd: number;
  squadCostUsd: number;
  tokens: number;
}

export interface CreateAgentsOverviewAnalyticsOptions {
  agentCount: number;
  squadCount: number;
  buckets: readonly AgentOverviewAnalyticsBucket[];
  loading?: boolean;
  error?: string | null;
  formatCurrency?: (value: number) => string;
}

function positiveNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function formatTokenCount(value: number): string {
  return Math.round(positiveNumber(value)).toLocaleString("en-US");
}

export function createAgentsOverviewAnalytics({
  agentCount,
  squadCount,
  buckets,
  loading = false,
  error = null,
  formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value),
}: CreateAgentsOverviewAnalyticsOptions): PlatformAnalyticsModel {
  const agentCosts = buckets.map((bucket) => positiveNumber(bucket.agentCostUsd));
  const squadCosts = buckets.map((bucket) => positiveNumber(bucket.squadCostUsd));
  const combinedCosts = buckets.map((_, index) => agentCosts[index] + squadCosts[index]);
  const combinedRuns = buckets.map((bucket) => positiveNumber(bucket.agentRuns) + positiveNumber(bucket.squadRuns));
  const combinedTokens = buckets.map((bucket) => positiveNumber(bucket.tokens));
  const totalAgentCost = agentCosts.reduce((sum, value) => sum + value, 0);
  const totalSquadCost = squadCosts.reduce((sum, value) => sum + value, 0);
  const totalTokens = combinedTokens.reduce((sum, value) => sum + value, 0);
  const hasCostData = totalAgentCost + totalSquadCost > 0;

  return {
    title: "Agent usage",
    ariaLabel: "Agent cost and token usage over time",
    loading,
    error: error || undefined,
    emptyState: "Agent usage appears here once agents start running.",
    metrics: [
      { id: "agents", label: "Agents", value: String(Math.round(positiveNumber(agentCount))), color: "#8fc4ff" },
      { id: "squads", label: "Squads", value: String(Math.round(positiveNumber(squadCount))), color: "#6750ff" },
      { id: "agent-cost", label: "Spent on Agents", value: formatCurrency(totalAgentCost), color: "#7effff" },
      { id: "squad-cost", label: "Spent on Squads", value: formatCurrency(totalSquadCost), color: "#4da3ff" },
      { id: "total-tokens", label: "Total tokens", value: formatTokenCount(totalTokens), color: "#fff" },
    ],
    labels: buckets.map((bucket) => String(bucket.label || "")),
    series: [
      {
        id: hasCostData ? "total-cost" : "runs",
        label: hasCostData ? "Total cost" : "Runs",
        color: "#8fc4ff",
        values: hasCostData ? combinedCosts : combinedRuns,
        valueKind: hasCostData ? "currency" : "count",
        type: "line",
      },
      {
        id: "tokens",
        label: "Token usage",
        color: "#7effff",
        values: combinedTokens,
        valueKind: "tokens",
        type: "line",
        axis: "secondary",
      },
    ],
  };
}

import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformIconButton } from "../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformLabel, type PlatformLabelVariant } from "../../../../../platform-ui/components/ui/label/index.js";
import type { SecurityFindingStatus, SecurityRunStatus, SecuritySeverity } from "../domain/index.js";

export function SecurityBackHeader({
  title,
  eyebrow,
  description,
  onBack,
}: {
  title: ReactNode;
  eyebrow: string;
  description?: ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="develop-security-detail-header">
      <PlatformIconButton size="medium" onClick={onBack} aria-label="Go back">
        <ArrowLeft width={16} height={16} strokeWidth={1.8} />
      </PlatformIconButton>
      <div className="develop-security-detail-icon"><ShieldCheck width={20} height={20} strokeWidth={1.8} /></div>
      <div className="develop-security-detail-heading">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  );
}

function severityVariant(value: SecuritySeverity): PlatformLabelVariant {
  if (value === "critical" || value === "high") return "red";
  if (value === "medium") return "yellow";
  if (value === "low") return "blue";
  return "gray";
}

export function SecuritySeverityLabel({ severity }: { severity: SecuritySeverity }) {
  return <PlatformLabel variant={severityVariant(severity)}>{severity}</PlatformLabel>;
}

export function SecurityRunStatusLabel({ status }: { status: SecurityRunStatus }) {
  const variant: PlatformLabelVariant = status === "succeeded"
    ? "green"
    : status === "failed"
      ? "red"
      : status === "partial" || status === "waiting_approval"
        ? "yellow"
        : status === "running" || status === "queued"
          ? "blue"
          : "gray";
  return <PlatformLabel variant={variant}>{status.replace(/_/g, " ")}</PlatformLabel>;
}

export function SecurityFindingStatusLabel({ status }: { status: SecurityFindingStatus }) {
  const variant: PlatformLabelVariant = status === "fixed"
    ? "green"
    : status === "open" || status === "accepted"
      ? "red"
      : status === "risk_accepted"
        ? "yellow"
        : "gray";
  return <PlatformLabel variant={variant}>{status.replace(/_/g, " ")}</PlatformLabel>;
}

export function SecurityPropertyList({
  items,
  variant = "default",
}: {
  items: ReadonlyArray<{ label: string; value: ReactNode; className?: string }>;
  variant?: "default" | "sidebar";
}) {
  const sidebar = variant === "sidebar";
  return (
    <dl
      className={
        sidebar
          ? "develop-security-properties is-sidebar playground-project-overview-sidebar-rows"
          : "develop-security-properties"
      }
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={`${sidebar ? "playground-project-overview-sidebar-row" : ""}${item.className ? ` ${item.className}` : ""}`}
        >
          <dt
            className={
              sidebar
                ? "playground-project-overview-sidebar-row-label"
                : undefined
            }
          >
            {item.label}
          </dt>
          <dd
            className={
              sidebar
                ? "playground-project-overview-sidebar-row-value"
                : undefined
            }
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SecurityMetricGrid({ metrics }: { metrics: ReadonlyArray<{ label: string; value: ReactNode; tone?: string; detail?: ReactNode }> }) {
  return (
    <section className="develop-security-metric-grid" aria-label="Security posture summary">
      {metrics.map((metric) => (
        <PlatformUiCard as="article" key={metric.label} className={`develop-security-metric${metric.tone ? ` is-${metric.tone}` : ""}`}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.detail ? <small>{metric.detail}</small> : null}
        </PlatformUiCard>
      ))}
    </section>
  );
}

export function SecurityJsonEvidence({ value, empty = "No structured evidence was recorded." }: { value: unknown; empty?: string }) {
  if (!value || (typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length === 0)) {
    return <p className="develop-security-muted">{empty}</p>;
  }
  return <pre className="develop-security-json">{JSON.stringify(value, null, 2)}</pre>;
}

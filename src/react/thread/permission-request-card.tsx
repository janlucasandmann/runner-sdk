import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, ShieldAlert, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { RunnerThreadPermissionRequest } from "../../thread/types.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";

export interface RunnerThreadPermissionRequestCardProps {
  request: RunnerThreadPermissionRequest;
  compact?: boolean;
  onDecision?: (request: RunnerThreadPermissionRequest, decision: "allow" | "deny") => Promise<void> | void;
}

function safePreview(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function RunnerThreadPermissionRequestCard({
  request,
  compact = false,
  onDecision,
}: RunnerThreadPermissionRequestCardProps) {
  const [submittingDecision, setSubmittingDecision] = useState<"allow" | "deny" | null>(null);
  const [submittedDecision, setSubmittedDecision] = useState<"allow" | "deny" | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const pending = request.status === "pending";
  const approved = request.status === "approved" || request.decision === "allow";
  const StatusIcon = pending ? Clock3 : approved ? CheckCircle2 : XCircle;
  const title = request.actionLabel || request.toolName || "External action";
  const inputPreview = safePreview(request.input);

  useEffect(() => {
    setSubmittingDecision(null);
    setSubmittedDecision(null);
    setDecisionError(null);
  }, [request.id, request.status, request.decision]);

  const submitDecision = async (decision: "allow" | "deny") => {
    if (!onDecision || submittingDecision || submittedDecision) return;
    setSubmittingDecision(decision);
    setDecisionError(null);
    try {
      await onDecision(request, decision);
      setSubmittedDecision(decision);
    } catch (error) {
      setDecisionError(error instanceof Error ? error.message : String(error));
    } finally {
      setSubmittingDecision(null);
    }
  };

  return (
    <section
      className={`tb-thread-permission-card is-${pending ? "pending" : approved ? "approved" : "denied"} ${compact ? "is-compact" : ""}`.trim()}
      aria-label={`Permission ${request.status}: ${title}`}
    >
      <div className="tb-thread-permission-heading">
        <span className="tb-thread-permission-icon-shell" aria-hidden="true">
          {pending ? <ShieldAlert strokeWidth={1.7} /> : <StatusIcon strokeWidth={1.7} />}
        </span>
        <div className="tb-thread-permission-copy">
          <div className="tb-thread-permission-title-row">
            <strong>{pending ? "Permission required" : approved ? "Permission approved" : "Permission denied"}</strong>
            {request.permissionRing ? (
              <span className={`tb-thread-ring is-ring-${request.permissionRing}`}>Ring {request.permissionRing}</span>
            ) : (
              <span className="tb-thread-ring is-ring-unknown">Unknown risk</span>
            )}
          </div>
          <div className="tb-thread-permission-action">{title}</div>
          {!compact && (request.actionDescription || request.reason) ? (
            <p>{request.actionDescription || request.reason}</p>
          ) : null}
        </div>
      </div>

      {!compact && inputPreview ? (
        <details className="tb-thread-permission-input">
          <summary>Requested input</summary>
          <pre>{inputPreview}</pre>
        </details>
      ) : null}

      {pending && onDecision ? (
        <>
          {submittedDecision ? (
            <div className="tb-thread-permission-submitted" role="status">
              <Clock3 strokeWidth={1.7} />
              {submittedDecision === "allow" ? "Approval sent" : "Denial sent"} · waiting for worker acknowledgement
            </div>
          ) : (
            <div className="tb-thread-permission-actions">
              <PlatformSecondaryButton
                size="compact"
                type="button"
                className="is-secondary"
                onClick={() => void submitDecision("deny")}
                disabled={Boolean(submittingDecision)}
              >
                {submittingDecision === "deny" ? <LoaderCircle className="is-spinning" strokeWidth={1.7} /> : null}
                Deny
              </PlatformSecondaryButton>
              <PlatformPrimaryButton
                size="compact"
                type="button"
                className="is-primary"
                onClick={() => void submitDecision("allow")}
                disabled={Boolean(submittingDecision)}
              >
                {submittingDecision === "allow" ? <LoaderCircle className="is-spinning" strokeWidth={1.7} /> : null}
                Approve once
              </PlatformPrimaryButton>
            </div>
          )}
          {decisionError ? (
            <div className="tb-thread-permission-error" role="alert">
              <AlertCircle strokeWidth={1.7} />
              <span>{decisionError}</span>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

import { AlertCircle, Check, Clock3, CornerDownRight, Route } from "../../platform-ui/components/ui/hugeicons-compat.js";
import type { RunnerThreadRoutingReceipt } from "../../thread/types.js";

export interface RunnerThreadRoutingReceiptProps {
  receipt: RunnerThreadRoutingReceipt;
  onCorrectRoute?: (receipt: RunnerThreadRoutingReceipt) => void;
}

function getReceiptPresentation(receipt: RunnerThreadRoutingReceipt) {
  if (receipt.status === "failed") {
    return { label: "Routing failed", Icon: AlertCircle, tone: "error" };
  }
  if (receipt.status === "classifying") {
    return { label: "Checking intent", Icon: Clock3, tone: "pending" };
  }
  if (receipt.status === "answered") {
    return { label: "Answered", Icon: Check, tone: "success" };
  }
  if (receipt.status === "delivered") {
    const suffix = receipt.deliveredAtSequence
      ? ` at action ${receipt.deliveredAtSequence}`
      : receipt.deliveredAtStepId
        ? ` at ${receipt.deliveredAtStepId}`
        : "";
    return { label: `Delivered${suffix}`, Icon: Check, tone: "success" };
  }
  if (receipt.status === "queued") {
    return {
      label: "Queued for delivery",
      Icon: CornerDownRight,
      tone: "pending",
    };
  }
  if (receipt.route === "human") {
    return { label: "Sent to participant", Icon: Check, tone: "success" };
  }
  return { label: receipt.reason || "Route recorded", Icon: Route, tone: "neutral" };
}

export function RunnerThreadRoutingReceiptView({
  receipt,
  onCorrectRoute,
}: RunnerThreadRoutingReceiptProps) {
  const { label, Icon, tone } = getReceiptPresentation(receipt);
  const deliveryLabel = receipt.deliveryMode === "checkpoint"
    ? "checkpoint delivery"
    : receipt.deliveryMode === "interrupt"
      ? "interrupt"
      : null;

  return (
    <div className={`tb-thread-routing-receipt is-${tone}`} role="status">
      <Icon className="tb-thread-routing-receipt-icon" strokeWidth={1.7} aria-hidden="true" />
      <span>{label}</span>
      {deliveryLabel ? <span className="tb-thread-routing-receipt-mode">· {deliveryLabel}</span> : null}
      {onCorrectRoute ? (
        <button
          type="button"
          className="tb-thread-routing-correct"
          onClick={() => onCorrectRoute(receipt)}
        >
          Change
        </button>
      ) : null}
    </div>
  );
}

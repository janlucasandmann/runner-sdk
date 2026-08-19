import { Clock3 } from "lucide-react";

export interface RunnerPageQueueReceiptProps {
  label?: string;
  durable?: boolean;
}

/**
 * Explicitly distinguishes the legacy page-local queue from the durable
 * Batches admission receipt. Durable receipts are reconstructed from Thread
 * history after refresh and disappear only when native execution progresses.
 */
export function RunnerPageQueueReceipt({
  label = "Queued in this page · starts after the current run",
  durable = false,
}: RunnerPageQueueReceiptProps) {
  return (
    <div className="tb-thread-page-queue-receipt" role="status">
      <Clock3 strokeWidth={1.7} aria-hidden="true" />
      <span>{label}</span>
      {!durable ? (
        <span className="tb-thread-page-queue-receipt-note">Not persisted</span>
      ) : null}
    </div>
  );
}

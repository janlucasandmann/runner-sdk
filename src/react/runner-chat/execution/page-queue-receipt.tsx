import { Clock3 } from "lucide-react";

export interface RunnerPageQueueReceiptProps {
  label?: string;
}

/**
 * Explicitly distinguishes the legacy in-memory queue from a durable worker
 * routing receipt. This state disappears if the page is closed or refreshed.
 */
export function RunnerPageQueueReceipt({
  label = "Queued in this page · starts after the current run",
}: RunnerPageQueueReceiptProps) {
  return (
    <div className="tb-thread-page-queue-receipt" role="status">
      <Clock3 strokeWidth={1.7} aria-hidden="true" />
      <span>{label}</span>
      <span className="tb-thread-page-queue-receipt-note">Not persisted</span>
    </div>
  );
}

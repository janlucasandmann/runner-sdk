import type { RunnerThreadRunReceiptViewModel } from "../../thread/presentation.js";
import { PlatformThreadRunReceipt } from "../../platform-ui/components/thread-components/thread-screen/index.js";
import { RunnerThreadParticipantAvatar } from "./participant-avatar.js";

export interface RunnerThreadRunReceiptProps {
  receipt: RunnerThreadRunReceiptViewModel;
  fallbackAgentName?: string | null;
  fallbackWorkspaceName?: string | null;
  selected?: boolean;
  onSelect?: (receipt: RunnerThreadRunReceiptViewModel) => void;
}

export function RunnerThreadRunReceipt({
  receipt,
  fallbackAgentName,
  fallbackWorkspaceName,
  selected,
  onSelect,
}: RunnerThreadRunReceiptProps) {
  return (
    <PlatformThreadRunReceipt
      receipt={receipt}
      avatar={<RunnerThreadParticipantAvatar participant={receipt.actor} size="small" />}
      fallbackAgentName={fallbackAgentName}
      fallbackWorkspaceName={fallbackWorkspaceName}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

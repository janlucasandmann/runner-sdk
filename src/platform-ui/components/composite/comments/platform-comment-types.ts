import type { ReactNode } from "react";

export type PlatformMentionKind = "human" | "agent";

export interface PlatformMentionReference {
  kind: PlatformMentionKind;
  id: string;
  label: string;
}

export interface PlatformMentionOption extends PlatformMentionReference {
  description?: string;
  avatar?: ReactNode;
}

export interface PlatformMentionSuggestionsProps {
  mentionOptions?: readonly PlatformMentionOption[];
  mentionsLoading?: boolean;
  mentionEmptyMessage?: string;
  onMentionQueryChange?: (query: string | null) => void;
  mentionManageLabel?: string;
  onMentionManage?: () => void;
}

export interface PlatformCommentReply {
  id: string;
  author: ReactNode;
  timestamp?: ReactNode;
  avatar?: ReactNode;
  content: ReactNode;
}

export interface PlatformCommentReplyComposerProps extends PlatformMentionSuggestionsProps {
  onSubmit: (
    value: string,
    mentions?: readonly PlatformMentionReference[],
  ) => void | Promise<void>;
  avatar?: ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface PlatformCommentActions {
  editableValue: string;
  onEdit?: (value: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  disabled?: boolean;
}

export interface PlatformCommentComposerProps extends PlatformMentionSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (
    files: readonly File[],
    mentions?: readonly PlatformMentionReference[],
    body?: string,
  ) => void | Promise<unknown>;
  avatar?: ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  allowAttachments?: boolean;
  attachmentAriaLabel?: string;
  disabled?: boolean;
  submitting?: boolean;
  autoFocus?: boolean;
  errorMessage?: ReactNode;
  className?: string;
}

export interface PlatformCommentCardProps {
  author: ReactNode;
  timestamp?: ReactNode;
  avatar?: ReactNode;
  content: ReactNode;
  replies?: readonly PlatformCommentReply[];
  replyComposer?: PlatformCommentReplyComposerProps;
  actions?: PlatformCommentActions;
  className?: string;
}

import type { ReactNode } from "react";

export interface PlatformCommentReply {
  id: string;
  author: ReactNode;
  timestamp?: ReactNode;
  avatar?: ReactNode;
  content: ReactNode;
}

export interface PlatformCommentReplyComposerProps {
  onSubmit: (value: string) => void | Promise<void>;
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

export interface PlatformCommentComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (files: readonly File[]) => void | Promise<unknown>;
  avatar?: ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  allowAttachments?: boolean;
  attachmentAriaLabel?: string;
  disabled?: boolean;
  submitting?: boolean;
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

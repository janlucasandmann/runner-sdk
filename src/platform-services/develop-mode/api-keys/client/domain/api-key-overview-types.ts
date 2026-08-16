export interface DevelopApiKeyOverviewRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: number;
  createdLabel: string;
  lastUsedAt: number;
  lastUsedLabel: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  permissionsLabel: string;
  isStandard: boolean;
  canReveal: boolean;
  canRevoke: boolean;
  searchText: string;
}

export interface DevelopApiKeyCreatedNotice {
  keyValue: string;
  copied?: boolean;
  onCopy: () => void;
  onDismiss: () => void;
}

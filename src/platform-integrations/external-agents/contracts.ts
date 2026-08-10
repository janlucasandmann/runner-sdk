export type ExternalAgentProvider = "jira" | "linear";

export type ExternalAgentTransport =
  | "jira_webhook"
  | "jira_rovo"
  | "linear_webhook"
  | "linear_agent";

export type ExternalAgentTrigger = "mention" | "assignment" | "command";

export interface ExternalAgentActor {
  providerUserId: string;
  displayName?: string;
  email?: string;
  isApplication?: boolean;
}

export interface ExternalAgentResource {
  type: "issue" | "task";
  id: string;
  key?: string;
  title?: string;
  url?: string;
  projectId?: string;
}

export interface ExternalAgentEventEnvelope {
  schemaVersion: 1;
  eventId: string;
  provider: ExternalAgentProvider;
  transport: ExternalAgentTransport;
  installationId: string;
  tenantId: string;
  eventType: string;
  trigger: ExternalAgentTrigger;
  occurredAt: string;
  conversationKey: string;
  actor: ExternalAgentActor;
  resource: ExternalAgentResource;
  visibleMessage: string;
  providerContext: Readonly<Record<string, unknown>>;
}

export interface ExternalAgentInstallation {
  id: string;
  organizationId: string;
  provider: ExternalAgentProvider;
  tenantId: string;
  displayName: string;
  credentialId?: string;
  siteUrl?: string;
  secretRef?: string;
  appActorId?: string;
  mentionAliases?: readonly string[];
  enabled: boolean;
  nativeTransportEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalAgentBinding {
  id: string;
  organizationId: string;
  installationId: string;
  provider: ExternalAgentProvider;
  externalProjectId?: string;
  displayName?: string;
  agentId: string;
  agentName?: string;
  environmentId?: string;
  projectId?: string;
  triggerModes: readonly ExternalAgentTrigger[];
  permissionMode: "linked_member" | "external_requester";
  allowedExternalUserIds?: readonly string[];
  allowedOrganizationRoles?: readonly string[];
  allowedConnectorActions?: readonly string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalAgentIdentity {
  id: string;
  organizationId: string;
  installationId: string;
  provider: ExternalAgentProvider;
  providerUserId: string;
  platformUserId: string;
  verifiedAt: string;
  displayName?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalAgentConversation {
  id: string;
  organizationId: string;
  installationId: string;
  bindingId: string;
  conversationKey: string;
  threadId: string;
  providerResourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalAgentEventRecord {
  id: string;
  organizationId: string;
  envelope: ExternalAgentEventEnvelope;
  status: "pending" | "processing" | "completed" | "failed" | "denied";
  attempts: number;
  threadId?: string;
  errorCode?: string;
  errorMessage?: string;
  receivedAt: string;
  updatedAt: string;
}

export interface ExternalAgentDeliveryRecord {
  id: string;
  organizationId: string;
  installationId: string;
  bindingId: string;
  eventId: string;
  kind: "completion" | "failure";
  provider: ExternalAgentProvider;
  threadId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

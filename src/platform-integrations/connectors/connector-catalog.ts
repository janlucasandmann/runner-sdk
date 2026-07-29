import { PLATFORM_CONNECTOR_CAPABILITIES } from "./connector-capability-catalog.js";
import type {
  PlatformConnectorCatalogEntry,
  PlatformConnectorFeature,
  PlatformConnectorKind,
} from "./connector-types.js";

export const PLATFORM_CONNECTOR_IDS = [
  "github",
  "gitlab",
  "notion",
  "google-drive",
  "gmail",
  "one-drive",
  "jira",
  "discord",
  "telegram",
  "email",
] as const;

export type PlatformConnectorId = (typeof PLATFORM_CONNECTOR_IDS)[number];

type ConnectorDefinition = Omit<
  PlatformConnectorCatalogEntry<PlatformConnectorId>,
  "permissionSubjectType" | "permissionTeamSubjectType" | "capabilities"
>;

const pluginSubject = (id: PlatformConnectorId) =>
  `${id.replaceAll("-", "_")}_plugin`;
const tagSubject = (id: PlatformConnectorId) =>
  `${id.replaceAll("-", "_")}_tag`;

function feature(
  id: string,
  title: string,
  kind: string,
  description: string,
  iconKey: PlatformConnectorFeature["iconKey"],
): PlatformConnectorFeature {
  return Object.freeze({ id, title, kind, description, iconKey });
}

const DEFINITIONS: Readonly<Record<PlatformConnectorId, ConnectorDefinition>> =
  Object.freeze({
    github: {
      id: "github",
      kind: "plugin",
      label: "GitHub",
      shortLabel: "GH",
      description:
        "Browse repositories, review changes, manage issues, and ship code with authorized GitHub accounts.",
      category: "Source control",
      categoryLabel: "Workspace Integration",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
      authentication: "oauth2",
      authenticationLabel: "OAuth 2.0",
      functionsLabel: "Browse, Review, Build",
      samplePrompt:
        "Inspect open pull requests, triage issues, debug failing checks, and prepare a reviewed code change.",
      whenToUse:
        "Use GitHub when agents need repository context or must perform auditable development work in GitHub.",
      websiteUrl: "https://github.com/",
      termsUrl:
        "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service",
      privacyUrl:
        "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
      features: [
        feature(
          "github-repositories",
          "Repository operations",
          "App",
          "Read and update repositories, branches, commits, issues, and pull requests.",
          "app",
        ),
        feature(
          "github-reviews",
          "Review workflows",
          "Skill",
          "Inspect review context and create or resolve pull request feedback.",
          "skill",
        ),
        feature(
          "github-security",
          "Repository security",
          "Skill",
          "Run targeted secret scans before changes are published.",
          "skill",
        ),
      ],
    },
    gitlab: {
      id: "gitlab",
      kind: "plugin",
      label: "GitLab",
      shortLabel: "GL",
      description:
        "Work with GitLab projects, repositories, issues, merge requests, pipelines, and webhooks.",
      category: "Source control",
      categoryLabel: "Workspace Integration",
      logoUrl: "/img/04-skills/gitlab.svg",
      authentication: "webhook",
      authenticationLabel: "OAuth 2.0 or webhook",
      functionsLabel: "Browse, Review, Automate",
      samplePrompt:
        "Inspect a failed pipeline, update the affected branch, and prepare a merge request follow-up.",
      whenToUse:
        "Use GitLab for repository work and event-driven automation across GitLab projects.",
      websiteUrl: "https://about.gitlab.com/",
      termsUrl: "https://about.gitlab.com/terms/",
      privacyUrl: "https://about.gitlab.com/privacy/",
      features: [
        feature(
          "gitlab-projects",
          "Project operations",
          "App",
          "Read and update projects, repositories, issues, and merge requests.",
          "app",
        ),
        feature(
          "gitlab-pipelines",
          "Pipeline context",
          "Skill",
          "Inspect pipeline and job state while diagnosing delivery failures.",
          "skill",
        ),
        feature(
          "gitlab-webhooks",
          "Event automation",
          "Workflow",
          "Trigger agent work from verified GitLab webhook events.",
          "workflow",
        ),
      ],
    },
    notion: {
      id: "notion",
      kind: "plugin",
      label: "Notion",
      shortLabel: "NT",
      description:
        "Search and manage authorized Notion pages, databases, blocks, comments, and users.",
      category: "Knowledge",
      categoryLabel: "Workspace Integration",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
      authentication: "oauth2",
      authenticationLabel: "OAuth 2.0",
      functionsLabel: "Search, Reference, Update",
      samplePrompt:
        "Find the current product brief, summarize unresolved decisions, and update the project status page.",
      whenToUse:
        "Use Notion when agents need live workspace knowledge or should maintain structured documents and databases.",
      websiteUrl: "https://www.notion.com/",
      termsUrl: "https://www.notion.so/product/terms-and-privacy",
      privacyUrl: "https://www.notion.so/privacy",
      features: [
        feature(
          "notion-pages",
          "Page context",
          "App",
          "Search, retrieve, create, and update authorized pages and blocks.",
          "app",
        ),
        feature(
          "notion-databases",
          "Structured knowledge",
          "Skill",
          "Query and update authorized database records.",
          "skill",
        ),
        feature(
          "notion-comments",
          "Collaboration",
          "Workflow",
          "Read and add comments to shared workspace content.",
          "workflow",
        ),
      ],
    },
    "google-drive": {
      id: "google-drive",
      kind: "plugin",
      label: "Google Drive",
      shortLabel: "GD",
      description:
        "Search, import, create, update, organize, and share files in authorized Google Drives.",
      category: "Storage",
      categoryLabel: "Workspace Integration",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
      authentication: "oauth2",
      authenticationLabel: "OAuth 2.0",
      functionsLabel: "Browse, Import, Organize",
      samplePrompt:
        "Find the current product brief, import it into the workspace, and organize the generated deliverables.",
      whenToUse:
        "Use Google Drive when agents need cloud documents as context or must manage shared deliverables.",
      websiteUrl: "https://workspace.google.com/products/drive/",
      termsUrl: "https://policies.google.com/terms",
      privacyUrl: "https://policies.google.com/privacy",
      features: [
        feature(
          "drive-files",
          "Drive files",
          "App",
          "Browse and retrieve authorized files and folders.",
          "app",
        ),
        feature(
          "drive-import",
          "Workspace import",
          "Skill",
          "Bring selected Drive content into active agent work.",
          "skill",
        ),
        feature(
          "drive-sharing",
          "Sharing controls",
          "Workflow",
          "Create, organize, and share generated artifacts.",
          "workflow",
        ),
      ],
    },
    gmail: {
      id: "gmail",
      kind: "plugin",
      label: "Gmail",
      shortLabel: "GM",
      description:
        "Search conversations, read messages, manage drafts, labels, and approved outbound email.",
      category: "Communication",
      categoryLabel: "Communication Integration",
      logoUrl: "/img/plugins/gmail.svg",
      authentication: "oauth2",
      authenticationLabel: "OAuth 2.0",
      functionsLabel: "Read, Draft, Send",
      samplePrompt:
        "Find recent customer replies, summarize what needs action, and draft a concise follow-up.",
      whenToUse:
        "Use Gmail when agents need inbox context or should prepare and send approved email.",
      websiteUrl: "https://mail.google.com/",
      termsUrl: "https://policies.google.com/terms",
      privacyUrl: "https://policies.google.com/privacy",
      features: [
        feature(
          "gmail-inbox",
          "Inbox context",
          "App",
          "Search and retrieve authorized conversations and attachments.",
          "app",
        ),
        feature(
          "gmail-drafts",
          "Draft workflows",
          "Skill",
          "Create and update drafts before messages are sent.",
          "skill",
        ),
        feature(
          "gmail-send",
          "Outbound email",
          "Workflow",
          "Send approved messages and replies through a connected account.",
          "workflow",
        ),
      ],
    },
    "one-drive": {
      id: "one-drive",
      kind: "plugin",
      label: "OneDrive",
      shortLabel: "OD",
      description:
        "Search, import, create, update, organize, and share authorized Microsoft files.",
      category: "Storage",
      categoryLabel: "Workspace Integration",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microsoft_OneDrive_Icon_%282025_-_present%29.svg",
      authentication: "oauth2",
      authenticationLabel: "OAuth 2.0",
      functionsLabel: "Browse, Import, Organize",
      samplePrompt:
        "Load the current planning deck, extract unresolved decisions, and save the resulting task list.",
      whenToUse:
        "Use OneDrive when agents need Microsoft-hosted documents as context or must manage shared deliverables.",
      websiteUrl:
        "https://www.microsoft.com/microsoft-365/onedrive/online-cloud-storage",
      termsUrl: "https://www.microsoft.com/servicesagreement",
      privacyUrl: "https://privacy.microsoft.com/privacystatement",
      features: [
        feature(
          "onedrive-files",
          "OneDrive files",
          "App",
          "Browse and retrieve authorized Microsoft files and folders.",
          "app",
        ),
        feature(
          "onedrive-import",
          "Workspace import",
          "Skill",
          "Bring selected OneDrive content into agent work.",
          "skill",
        ),
        feature(
          "onedrive-sharing",
          "Sharing controls",
          "Workflow",
          "Create, organize, and share generated artifacts.",
          "workflow",
        ),
      ],
    },
    jira: {
      id: "jira",
      kind: "plugin",
      label: "Jira",
      shortLabel: "JI",
      description:
        "Search and manage Jira projects, issues, comments, worklogs, sprints, and attachments.",
      category: "Project management",
      categoryLabel: "Workspace Integration",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/8/8a/Jira_Logo.svg",
      authentication: "oauth2",
      authenticationLabel: "OAuth 2.0",
      functionsLabel: "Search, Triage, Update",
      samplePrompt:
        "Triage open issues for the current sprint, identify blockers, and update the relevant tickets.",
      whenToUse:
        "Use Jira when agents need authoritative work-item context or should maintain project delivery records.",
      websiteUrl: "https://www.atlassian.com/software/jira",
      termsUrl: "https://www.atlassian.com/legal/cloud-terms-of-service",
      privacyUrl: "https://www.atlassian.com/legal/privacy-policy",
      features: [
        feature(
          "jira-issues",
          "Issue operations",
          "App",
          "Search, inspect, create, and update authorized Jira issues.",
          "app",
        ),
        feature(
          "jira-projects",
          "Project context",
          "Skill",
          "Read project, user, field, sprint, and board context.",
          "skill",
        ),
        feature(
          "jira-collaboration",
          "Delivery workflows",
          "Workflow",
          "Manage comments, transitions, worklogs, and attachments.",
          "workflow",
        ),
      ],
    },
    discord: {
      id: "discord",
      kind: "tag",
      label: "Discord",
      shortLabel: "DS",
      description:
        "Start and continue agent work from authorized Discord channels.",
      category: "Channels",
      categoryLabel: "External Agent Channel",
      iconKey: "channel",
      authentication: "bot",
      authenticationLabel: "Bot authorization",
      functionsLabel: "Chat, Trigger, Notify",
      samplePrompt:
        "Ask an agent from Discord to run a task and return the completed result to the same channel.",
      whenToUse:
        "Use Discord when teams should invoke and follow agent work from an external chat surface.",
      websiteUrl: "https://discord.com/",
      termsUrl: "https://discord.com/terms",
      privacyUrl: "https://discord.com/privacy",
      features: [
        feature(
          "discord-channel",
          "Discord channel",
          "Channel",
          "Start and continue agent threads from linked channels.",
          "channel",
        ),
        feature(
          "discord-attachments",
          "Attachment ingestion",
          "Workflow",
          "Bring Discord files into the current agent turn.",
          "workflow",
        ),
        feature(
          "discord-delivery",
          "Result delivery",
          "Workflow",
          "Send progress, summaries, and output files back to Discord.",
          "workflow",
        ),
      ],
    },
    telegram: {
      id: "telegram",
      kind: "tag",
      label: "Telegram",
      shortLabel: "TG",
      description:
        "Start and continue agent work from authorized Telegram chats.",
      category: "Channels",
      categoryLabel: "External Agent Channel",
      iconKey: "channel",
      authentication: "bot",
      authenticationLabel: "Bot verification",
      functionsLabel: "Chat, Trigger, Notify",
      samplePrompt:
        "Message the agent bot to start a run, continue its thread, and receive the final files.",
      whenToUse:
        "Use Telegram for lightweight external agent invocation, follow-up, and delivery.",
      websiteUrl: "https://telegram.org/",
      termsUrl: "https://telegram.org/tos",
      privacyUrl: "https://telegram.org/privacy",
      features: [
        feature(
          "telegram-chat",
          "Telegram chat",
          "Channel",
          "Start and continue agent threads from linked chats.",
          "channel",
        ),
        feature(
          "telegram-attachments",
          "Attachment ingestion",
          "Workflow",
          "Bring Telegram files into the current agent turn.",
          "workflow",
        ),
        feature(
          "telegram-delivery",
          "Result delivery",
          "Workflow",
          "Send progress, summaries, and output files back to Telegram.",
          "workflow",
        ),
      ],
    },
    email: {
      id: "email",
      kind: "tag",
      label: "Email",
      shortLabel: "EM",
      description:
        "Start and continue professional agent threads through dedicated email addresses.",
      category: "Channels",
      categoryLabel: "External Agent Channel",
      iconKey: "mail",
      authentication: "email",
      authenticationLabel: "Email verification",
      functionsLabel: "Inbox, Reply, Attachments",
      samplePrompt:
        "Send a task by email, attach the source material, and continue the same agent thread by replying.",
      whenToUse:
        "Use Email when work should begin and continue from a conventional inbox.",
      websiteUrl: "https://computer-agents.com/",
      termsUrl: "https://computer-agents.com/terms",
      privacyUrl: "https://computer-agents.com/privacy",
      features: [
        feature(
          "email-inbox",
          "Agent inbox",
          "Channel",
          "Start agent work through a dedicated email address.",
          "channel",
        ),
        feature(
          "email-replies",
          "Reply continuation",
          "Workflow",
          "Continue the same thread without exposing quoted history.",
          "workflow",
        ),
        feature(
          "email-delivery",
          "Professional delivery",
          "Workflow",
          "Return rendered summaries and current-turn output files.",
          "workflow",
        ),
      ],
    },
  });

function createEntry(id: PlatformConnectorId): PlatformConnectorCatalogEntry<PlatformConnectorId> {
  const definition = DEFINITIONS[id];
  const subjectPrefix =
    definition.kind === "tag" ? tagSubject(id) : pluginSubject(id);
  return Object.freeze({
    ...definition,
    permissionSubjectType: subjectPrefix,
    permissionTeamSubjectType: `${subjectPrefix}_team_role`,
    capabilities: PLATFORM_CONNECTOR_CAPABILITIES[id],
    features: Object.freeze([...definition.features]),
  });
}

export const PLATFORM_CONNECTOR_CATALOG: Readonly<
  Record<PlatformConnectorId, PlatformConnectorCatalogEntry<PlatformConnectorId>>
> = Object.freeze(
  Object.fromEntries(
    PLATFORM_CONNECTOR_IDS.map((id) => [id, createEntry(id)]),
  ) as Record<PlatformConnectorId, PlatformConnectorCatalogEntry<PlatformConnectorId>>,
);

export function isPlatformConnectorId(value: string): value is PlatformConnectorId {
  return Object.hasOwn(PLATFORM_CONNECTOR_CATALOG, String(value || "").trim().toLowerCase());
}

export function getPlatformConnectorCatalogEntry(
  id: string,
): PlatformConnectorCatalogEntry<PlatformConnectorId> | undefined {
  const normalizedId = String(id || "").trim().toLowerCase();
  return isPlatformConnectorId(normalizedId)
    ? PLATFORM_CONNECTOR_CATALOG[normalizedId]
    : undefined;
}

export function listPlatformConnectorCatalogEntries(
  kind?: PlatformConnectorKind,
): readonly PlatformConnectorCatalogEntry<PlatformConnectorId>[] {
  const entries = PLATFORM_CONNECTOR_IDS.map(
    (id) => PLATFORM_CONNECTOR_CATALOG[id],
  );
  return kind ? entries.filter((entry) => entry.kind === kind) : entries;
}

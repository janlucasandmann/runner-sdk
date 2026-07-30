const READ_ONLY = "read_only";
const FULL_ACCESS = "full_access";
const NO_ACCESS = "no_access";

const PROVIDER_SCOPE_POLICIES = Object.freeze({
  github: {
    read: ["repo", "public_repo"],
    write: ["repo", "public_repo"],
    actions: {
      get_me: { read: ["read:user", "user", "repo", "public_repo"] },
      get_teams: { read: ["read:org", "admin:org"] },
      get_team_members: { read: ["read:org", "admin:org"] },
    },
  },
  jira: {
    read: ["read:jira-work", "read:jira-user"],
    write: ["write:jira-work"],
    actions: {
      confluence_get_current_user: {
        read: ["read:confluence-user"],
      },
      confluence_list_spaces: {
        read: ["read:confluence-space.summary"],
      },
      confluence_get_space: {
        read: ["read:confluence-space.summary"],
      },
      confluence_search_content: {
        read: ["search:confluence"],
      },
      confluence_get_page: {
        read: [
          "read:confluence-content.all",
          "read:confluence-content.summary",
        ],
      },
      confluence_get_page_children: {
        read: [
          "read:confluence-content.all",
          "read:confluence-content.summary",
        ],
      },
      confluence_list_comments: {
        read: ["read:confluence-content.all"],
      },
      confluence_list_attachments: {
        read: ["read:confluence-content.all"],
      },
      confluence_create_page: {
        write: ["write:confluence-content"],
      },
      confluence_update_page: {
        write: ["write:confluence-content"],
      },
      confluence_delete_page: {
        write: ["write:confluence-content"],
      },
      confluence_add_comment: {
        write: ["write:confluence-content"],
      },
      confluence_update_comment: {
        write: ["write:confluence-content"],
      },
      confluence_delete_comment: {
        write: ["write:confluence-content"],
      },
      confluence_add_attachment: {
        write: ["write:confluence-file"],
      },
    },
  },
  linear: {
    read: ["read", "write", "admin"],
    write: ["write", "issues:create", "comments:create", "admin"],
    actions: {
      create_issue: {
        write: ["issues:create", "write", "admin"],
      },
      update_issue: {
        write: ["write", "admin"],
      },
      add_issue_comment: {
        write: ["comments:create", "write", "admin"],
      },
      create_project: {
        write: ["write", "admin"],
      },
      update_project: {
        write: ["write", "admin"],
      },
    },
  },
  box: {
    read: ["root_readonly", "root_readwrite"],
    write: ["root_readwrite"],
  },
  "google-calendar": {
    read: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events.readonly",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar",
    ],
    write: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar",
    ],
    actions: {
      list_calendars: {
        read: [
          "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
          "https://www.googleapis.com/auth/calendar.calendarlist",
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      get_calendar: {
        read: [
          "https://www.googleapis.com/auth/calendar.calendars.readonly",
          "https://www.googleapis.com/auth/calendar.calendars",
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      list_events: {
        read: [
          "https://www.googleapis.com/auth/calendar.events.readonly",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      get_event: {
        read: [
          "https://www.googleapis.com/auth/calendar.events.readonly",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      query_free_busy: {
        read: [
          "https://www.googleapis.com/auth/calendar.freebusy",
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      create_event: {
        write: [
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      update_event: {
        write: [
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
      delete_event: {
        write: [
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar",
        ],
      },
    },
  },
  bigquery: {
    read: [
      "https://www.googleapis.com/auth/bigquery.readonly",
      "https://www.googleapis.com/auth/cloud-platform.read-only",
      "https://www.googleapis.com/auth/bigquery",
      "https://www.googleapis.com/auth/cloud-platform",
    ],
    write: [
      "https://www.googleapis.com/auth/bigquery",
      "https://www.googleapis.com/auth/cloud-platform",
    ],
  },
  outlook: {
    read: ["mail.readbasic", "mail.read", "mail.readwrite"],
    write: ["mail.readwrite"],
    actions: {
      get_profile: { read: ["user.read"] },
      create_draft: { write: ["mail.readwrite"] },
      update_draft: { write: ["mail.readwrite"] },
      send_draft: { write: ["mail.send"] },
      reply_to_message: { write: ["mail.send"] },
      forward_message: { write: ["mail.send"] },
      move_message: { write: ["mail.readwrite"] },
      delete_message: { write: ["mail.readwrite"] },
    },
  },
  "outlook-calendar": {
    read: ["calendars.readbasic", "calendars.read", "calendars.readwrite"],
    write: ["calendars.readwrite"],
    actions: {
      create_event: { write: ["calendars.readwrite"] },
      update_event: { write: ["calendars.readwrite"] },
      cancel_event: { write: ["calendars.readwrite"] },
      delete_event: { write: ["calendars.readwrite"] },
    },
  },
  sharepoint: {
    read: [
      "files.read",
      "files.read.all",
      "files.readwrite",
      "files.readwrite.all",
      "sites.read.all",
      "sites.readwrite.all",
      "sites.selected",
    ],
    write: [
      "files.readwrite",
      "files.readwrite.all",
      "sites.readwrite.all",
      "sites.selected",
    ],
    actions: {
      search_sites: {
        read: ["sites.read.all", "sites.readwrite.all", "sites.selected"],
      },
      get_site: {
        read: ["sites.read.all", "sites.readwrite.all", "sites.selected"],
      },
      list_site_lists: {
        read: ["sites.read.all", "sites.readwrite.all", "sites.selected"],
      },
      list_list_items: {
        read: ["sites.read.all", "sites.readwrite.all", "sites.selected"],
      },
      list_drives: {
        read: [
          "files.read",
          "files.read.all",
          "files.readwrite",
          "files.readwrite.all",
          "sites.read.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      list_drive_items: {
        read: [
          "files.read",
          "files.read.all",
          "files.readwrite",
          "files.readwrite.all",
          "sites.read.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      get_drive_item: {
        read: [
          "files.read",
          "files.read.all",
          "files.readwrite",
          "files.readwrite.all",
          "sites.read.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      download_drive_item: {
        read: [
          "files.read",
          "files.read.all",
          "files.readwrite",
          "files.readwrite.all",
          "sites.read.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      upload_file: {
        write: [
          "files.readwrite",
          "files.readwrite.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      create_folder: {
        write: [
          "files.readwrite",
          "files.readwrite.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      delete_drive_item: {
        write: [
          "files.readwrite",
          "files.readwrite.all",
          "sites.readwrite.all",
          "sites.selected",
        ],
      },
      update_list_item: {
        write: ["sites.readwrite.all", "sites.selected"],
      },
    },
  },
  "microsoft-teams": {
    read: [
      "team.readbasic.all",
      "channel.readbasic.all",
      "channelmessage.read.all",
      "chat.read",
      "chat.readwrite",
      "group.read.all",
      "group.readwrite.all",
      "teammember.read.all",
    ],
    write: [
      "channelmessage.send",
      "chat.readwrite",
      "group.readwrite.all",
      "channel.create",
      "channelsettings.readwrite.all",
      "channel.delete.all",
    ],
    actions: {
      list_joined_teams: { read: ["team.readbasic.all"] },
      get_team: { read: ["team.readbasic.all"] },
      list_channels: { read: ["channel.readbasic.all"] },
      list_channel_messages: { read: ["channelmessage.read.all"] },
      get_channel_message: { read: ["channelmessage.read.all"] },
      list_team_members: { read: ["teammember.read.all"] },
      post_channel_message: { write: ["channelmessage.send"] },
      reply_to_channel_message: { write: ["channelmessage.send"] },
      create_channel: { write: ["channel.create"] },
      update_channel: { write: ["channelsettings.readwrite.all"] },
      delete_channel: { write: ["channel.delete.all"] },
    },
  },
  slack: {
    read: [
      "channels:read",
      "channels:history",
      "groups:read",
      "groups:history",
      "im:read",
      "im:history",
      "mpim:read",
      "mpim:history",
      "search:read",
      "users:read",
    ],
    write: [
      "chat:write",
      "files:write",
      "reactions:write",
    ],
    actions: {
      list_channels: {
        read: ["channels:read", "groups:read", "im:read", "mpim:read"],
      },
      get_channel_history: {
        read: [
          "channels:history",
          "groups:history",
          "im:history",
          "mpim:history",
        ],
      },
      get_thread_replies: {
        read: [
          "channels:history",
          "groups:history",
          "im:history",
          "mpim:history",
        ],
      },
      search_messages: { read: ["search:read"] },
      list_users: { read: ["users:read"] },
      post_message: { write: ["chat:write"] },
      update_message: { write: ["chat:write"] },
      delete_message: { write: ["chat:write"] },
      upload_file: { write: ["files:write"] },
      add_reaction: { write: ["reactions:write"] },
    },
  },
  dropbox: {
    read: [
      "account_info.read",
      "files.metadata.read",
      "files.content.read",
      "sharing.read",
    ],
    write: [
      "files.metadata.write",
      "files.content.write",
      "sharing.write",
    ],
    actions: {
      get_current_account: { read: ["account_info.read"] },
      list_folder: { read: ["files.metadata.read"] },
      search_files: { read: ["files.metadata.read"] },
      get_metadata: { read: ["files.metadata.read"] },
      download_file: { read: ["files.content.read"] },
      list_revisions: { read: ["files.metadata.read"] },
      upload_file: { write: ["files.content.write"] },
      create_folder: { write: ["files.metadata.write"] },
      move_item: { write: ["files.metadata.write"] },
      delete_item: { write: ["files.metadata.write"] },
      create_shared_link: { write: ["sharing.write"] },
    },
  },
  asana: {
    read: ["default"],
    write: ["default"],
  },
  stripe: {
    read: ["read_only", "read_write"],
    write: ["read_write"],
  },
  figma: {
    read: [
      "current_user:read",
      "file_content:read",
      "file_metadata:read",
      "file_comments:read",
      "file_versions:read",
      "projects:read",
    ],
    write: ["file_comments:write", "webhooks:write"],
    actions: {
      get_current_user: { read: ["current_user:read"] },
      get_file: {
        read: ["file_content:read", "file_metadata:read"],
      },
      get_file_nodes: { read: ["file_content:read"] },
      render_images: { read: ["file_content:read"] },
      list_comments: { read: ["file_comments:read"] },
      list_versions: { read: ["file_versions:read"] },
      list_team_projects: { read: ["projects:read"] },
      list_project_files: { read: ["projects:read"] },
      create_comment: { write: ["file_comments:write"] },
      delete_comment: { write: ["file_comments:write"] },
      create_webhook: { write: ["webhooks:write"] },
      delete_webhook: { write: ["webhooks:write"] },
    },
  },
  supabase: {
    read: ["all", "read", "projects:read"],
    write: ["all", "write", "projects:write"],
  },
});

export function resolveProviderGrantAccess(connectorId, capability, token) {
  if (!hasProviderSecret(token)) return NO_ACCESS;

  const capabilityId = normalizeCapabilityId(capability?.capabilityId);
  if (!capabilityId) return NO_ACCESS;
  const interactive = capability?.interactive === true;
  const explicitGrant = resolveExplicitActionGrant(token, capabilityId);
  if (explicitGrant.present) {
    return interactive && explicitGrant.access !== FULL_ACCESS
      ? NO_ACCESS
      : explicitGrant.access;
  }

  const policy = PROVIDER_SCOPE_POLICIES[normalizeConnectorId(connectorId)];
  if (!policy) return NO_ACCESS;
  const scopes = normalizeProviderScopes(
    token.scope
      || token.scopes
      || token.grantedScopes
      || token.granted_scopes,
  );
  if (!scopes.size) return NO_ACCESS;

  const actionPolicy = policy.actions?.[capabilityId] || {};
  const requiredScopes = interactive
    ? actionPolicy.write || policy.write || []
    : actionPolicy.read || policy.read || [];
  if (!requiredScopes.some((scope) => scopes.has(normalizeScope(scope)))) {
    return NO_ACCESS;
  }
  return interactive ? FULL_ACCESS : READ_ONLY;
}

export function normalizeProviderScopes(value) {
  const values = Array.isArray(value)
    ? value
    : String(value || "").split(/[\s,]+/);
  return new Set(
    values
      .map(normalizeScope)
      .filter(Boolean),
  );
}

function resolveExplicitActionGrant(token, capabilityId) {
  const rawGrants =
    token.actionGrants
    || token.action_grants
    || token.allowedActions
    || token.allowed_actions
    || token.grants;
  if (isRecord(rawGrants)) {
    const value = rawGrants[capabilityId] ?? rawGrants["*"];
    return {
      present: true,
      access: normalizeExplicitAccess(value) || NO_ACCESS,
    };
  }
  if (rawGrants !== undefined && rawGrants !== null && rawGrants !== "") {
    const grants = Array.isArray(rawGrants)
      ? rawGrants
      : String(rawGrants).split(/[\s,]+/);
    const normalized = new Set(
      grants.map((grant) => String(grant || "").trim()).filter(Boolean),
    );
    return {
      present: true,
      access:
        normalized.has(capabilityId) || normalized.has("*")
          ? FULL_ACCESS
          : NO_ACCESS,
    };
  }
  const accessClass = normalizeExplicitAccess(
    token.permissionClass
      || token.permission_class
      || token.accessClass
      || token.access_class,
  );
  return {
    present: Boolean(accessClass),
    access: accessClass || NO_ACCESS,
  };
}

function normalizeExplicitAccess(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (
    normalized === "full_access"
    || normalized === "read_write"
    || normalized === "write"
    || normalized === "all"
  ) {
    return FULL_ACCESS;
  }
  if (normalized === "read_only" || normalized === "read") {
    return READ_ONLY;
  }
  return "";
}

function hasProviderSecret(token) {
  if (!isRecord(token)) return false;
  if (
    token.serviceAccount
    && isRecord(token.serviceAccount)
    && String(token.serviceAccount.private_key || "").trim()
    && String(token.serviceAccount.client_email || "").trim()
  ) {
    return true;
  }
  return Boolean(
    String(
      token.accessToken
        || token.access_token
        || token.apiKey
        || token.api_key
        || token.bearerToken
        || token.bearer_token
        || token.serviceAccountJson
        || token.service_account_json
        || "",
    ).trim(),
  );
}

function normalizeScope(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeConnectorId(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeCapabilityId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(normalized)
    ? normalized
    : "";
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export const CONNECTOR_PROVIDER_SCOPE_POLICIES = PROVIDER_SCOPE_POLICIES;

import {
  ConnectorRuntimeError,
  clampInteger,
  compactObject,
  createOAuthCredentialRuntime,
  createProviderRequestError,
  defineRuntimeTools,
  encodePath,
  invalidInput,
  isRecord,
  normalizeCursorUrl,
  normalizeOptionalEnum,
  numberSchema,
  objectSchema,
  readJsonResponse,
  readString,
  requireString,
  requireStringArray,
  stringArraySchema,
  stringSchema,
} from "./connector-runtime-utils.mjs";

const MICROSOFT_GRAPH_ORIGIN = "https://graph.microsoft.com";
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

const pagination = {
  cursor: stringSchema("Opaque Microsoft Graph pagination cursor."),
  limit: numberSchema("Maximum results.", { minimum: 1, maximum: 100 }),
};

const OUTLOOK_TOOLS = defineRuntimeTools("Outlook", [
  {
    name: "get_profile",
    description: "Get the connected Microsoft account profile.",
  },
  {
    name: "list_mail_folders",
    description: "List Outlook mail folders.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "list_messages",
    description: "List messages in an Outlook mail folder.",
    inputSchema: objectSchema({
      folderId: stringSchema("Mail folder ID. Omit for the inbox."),
      query: stringSchema("Optional Microsoft Graph search expression."),
      ...pagination,
    }),
  },
  {
    name: "get_message",
    description: "Get an Outlook message and its metadata.",
    inputSchema: objectSchema({ messageId: stringSchema("Microsoft Graph message ID.") }, [
      "messageId",
    ]),
  },
  {
    name: "list_message_attachments",
    description: "List attachments for an Outlook message.",
    inputSchema: objectSchema({ messageId: stringSchema("Microsoft Graph message ID.") }, [
      "messageId",
    ]),
  },
  {
    name: "create_draft",
    access: "interactive",
    description: "Create a draft Outlook message.",
    inputSchema: objectSchema(
      {
        subject: stringSchema("Message subject."),
        body: stringSchema("Message body."),
        bodyType: stringSchema("Body format.", {
          enum: ["text", "html"],
        }),
        to: stringArraySchema("To recipient email addresses."),
        cc: stringArraySchema("CC recipient email addresses."),
      },
      ["subject", "body", "to"],
    ),
  },
  {
    name: "update_draft",
    access: "interactive",
    description: "Update an existing Outlook draft.",
    inputSchema: objectSchema(
      {
        messageId: stringSchema("Draft message ID."),
        subject: stringSchema("Updated subject."),
        body: stringSchema("Updated body."),
        bodyType: stringSchema("Updated body format.", {
          enum: ["text", "html"],
        }),
        to: stringArraySchema("Updated To recipients."),
        cc: stringArraySchema("Updated CC recipients."),
      },
      ["messageId"],
    ),
  },
  {
    name: "send_draft",
    access: "interactive",
    description: "Send an existing Outlook draft.",
    inputSchema: objectSchema({ messageId: stringSchema("Draft message ID.") }, ["messageId"]),
  },
  {
    name: "reply_to_message",
    access: "interactive",
    description: "Reply to an Outlook message.",
    inputSchema: objectSchema(
      {
        messageId: stringSchema("Outlook message ID."),
        body: stringSchema("Reply body."),
      },
      ["messageId", "body"],
    ),
  },
  {
    name: "forward_message",
    access: "interactive",
    description: "Forward an Outlook message.",
    inputSchema: objectSchema(
      {
        messageId: stringSchema("Outlook message ID."),
        to: stringArraySchema("Forward recipient email addresses."),
        comment: stringSchema("Optional forwarding comment."),
      },
      ["messageId", "to"],
    ),
  },
  {
    name: "move_message",
    access: "interactive",
    description: "Move an Outlook message to another folder.",
    inputSchema: objectSchema(
      {
        messageId: stringSchema("Outlook message ID."),
        destinationFolderId: stringSchema("Destination mail folder ID."),
      },
      ["messageId", "destinationFolderId"],
    ),
  },
  {
    name: "delete_message",
    access: "interactive",
    description: "Delete an Outlook message.",
    inputSchema: objectSchema({ messageId: stringSchema("Outlook message ID.") }, ["messageId"]),
  },
]);

const CALENDAR_TOOLS = defineRuntimeTools("Outlook Calendar", [
  {
    name: "list_calendars",
    description: "List calendars available to the connected Microsoft account.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "get_calendar",
    description: "Get an Outlook calendar.",
    inputSchema: objectSchema({ calendarId: stringSchema("Microsoft Graph calendar ID.") }, [
      "calendarId",
    ]),
  },
  {
    name: "list_events",
    description: "List Outlook events in a calendar and time range.",
    inputSchema: objectSchema(
      {
        calendarId: stringSchema("Optional calendar ID. Omit for the default calendar."),
        startDateTime: stringSchema("ISO 8601 range start."),
        endDateTime: stringSchema("ISO 8601 range end."),
        timeZone: stringSchema("Preferred response time zone."),
        ...pagination,
      },
      ["startDateTime", "endDateTime"],
    ),
  },
  {
    name: "get_event",
    description: "Get an Outlook calendar event.",
    inputSchema: objectSchema({ eventId: stringSchema("Microsoft Graph event ID.") }, ["eventId"]),
  },
  {
    name: "find_meeting_times",
    description: "Find available meeting times for a set of attendees.",
    inputSchema: objectSchema(
      {
        attendees: stringArraySchema("Attendee email addresses."),
        startDateTime: stringSchema("ISO 8601 range start."),
        endDateTime: stringSchema("ISO 8601 range end."),
        duration: stringSchema("ISO 8601 meeting duration."),
        timeZone: stringSchema("IANA or Windows time zone."),
      },
      ["attendees", "startDateTime", "endDateTime", "duration"],
    ),
  },
  {
    name: "create_event",
    access: "interactive",
    description: "Create an event in an Outlook calendar.",
    inputSchema: objectSchema(
      {
        calendarId: stringSchema("Optional target calendar ID."),
        subject: stringSchema("Event title."),
        body: stringSchema("Event description."),
        startDateTime: stringSchema("ISO 8601 event start."),
        endDateTime: stringSchema("ISO 8601 event end."),
        timeZone: stringSchema("Event time zone."),
        attendees: stringArraySchema("Attendee email addresses."),
      },
      ["subject", "startDateTime", "endDateTime"],
    ),
  },
  {
    name: "update_event",
    access: "interactive",
    description: "Update an Outlook calendar event.",
    inputSchema: objectSchema(
      {
        eventId: stringSchema("Microsoft Graph event ID."),
        subject: stringSchema("Updated title."),
        body: stringSchema("Updated description."),
        startDateTime: stringSchema("Updated ISO 8601 start."),
        endDateTime: stringSchema("Updated ISO 8601 end."),
        timeZone: stringSchema("Updated event time zone."),
        attendees: stringArraySchema("Updated attendee email addresses."),
      },
      ["eventId"],
    ),
  },
  {
    name: "cancel_event",
    access: "interactive",
    description: "Cancel an Outlook meeting and notify attendees.",
    inputSchema: objectSchema(
      {
        eventId: stringSchema("Microsoft Graph event ID."),
        comment: stringSchema("Cancellation message."),
      },
      ["eventId"],
    ),
  },
  {
    name: "delete_event",
    access: "interactive",
    description: "Delete an Outlook calendar event.",
    inputSchema: objectSchema({ eventId: stringSchema("Microsoft Graph event ID.") }, ["eventId"]),
  },
]);

const TEAMS_TOOLS = defineRuntimeTools("Microsoft Teams", [
  {
    name: "list_joined_teams",
    description: "List Microsoft Teams joined by the connected user.",
    inputSchema: objectSchema(pagination),
  },
  {
    name: "get_team",
    description: "Get a Microsoft Team and its settings.",
    inputSchema: objectSchema({ teamId: stringSchema("Microsoft Team ID.") }, ["teamId"]),
  },
  {
    name: "list_channels",
    description: "List channels in a Microsoft Team.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        ...pagination,
      },
      ["teamId"],
    ),
  },
  {
    name: "list_channel_messages",
    description: "List messages in a Microsoft Teams channel.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        channelId: stringSchema("Microsoft Teams channel ID."),
        ...pagination,
      },
      ["teamId", "channelId"],
    ),
  },
  {
    name: "get_channel_message",
    description: "Get a Microsoft Teams channel message and replies.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        channelId: stringSchema("Microsoft Teams channel ID."),
        messageId: stringSchema("Microsoft Teams message ID."),
      },
      ["teamId", "channelId", "messageId"],
    ),
  },
  {
    name: "list_team_members",
    description: "List members of a Microsoft Team.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        ...pagination,
      },
      ["teamId"],
    ),
  },
  {
    name: "post_channel_message",
    access: "interactive",
    description: "Post a message to a Microsoft Teams channel.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        channelId: stringSchema("Microsoft Teams channel ID."),
        body: stringSchema("Message body in HTML."),
      },
      ["teamId", "channelId", "body"],
    ),
  },
  {
    name: "reply_to_channel_message",
    access: "interactive",
    description: "Reply to a Microsoft Teams channel message.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        channelId: stringSchema("Microsoft Teams channel ID."),
        messageId: stringSchema("Parent message ID."),
        body: stringSchema("Reply body in HTML."),
      },
      ["teamId", "channelId", "messageId", "body"],
    ),
  },
  {
    name: "create_channel",
    access: "interactive",
    description: "Create a channel in a Microsoft Team.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        displayName: stringSchema("Channel display name."),
        description: stringSchema("Channel description."),
        membershipType: stringSchema("Channel membership type.", {
          enum: ["standard", "private", "shared"],
        }),
      },
      ["teamId", "displayName"],
    ),
  },
  {
    name: "update_channel",
    access: "interactive",
    description: "Update a Microsoft Teams channel.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        channelId: stringSchema("Microsoft Teams channel ID."),
        displayName: stringSchema("Updated display name."),
        description: stringSchema("Updated description."),
      },
      ["teamId", "channelId"],
    ),
  },
  {
    name: "delete_channel",
    access: "interactive",
    description: "Delete a Microsoft Teams channel.",
    inputSchema: objectSchema(
      {
        teamId: stringSchema("Microsoft Team ID."),
        channelId: stringSchema("Microsoft Teams channel ID."),
      },
      ["teamId", "channelId"],
    ),
  },
]);

export function createOutlookConnectorAdapter(options = {}) {
  return createMicrosoftAdapter({
    id: "outlook",
    aliases: ["outlook"],
    tools: OUTLOOK_TOOLS,
    execute: invokeOutlookAction,
    options,
  });
}

export function createOutlookCalendarConnectorAdapter(options = {}) {
  return createMicrosoftAdapter({
    id: "outlook-calendar",
    aliases: ["outlook-calendar"],
    tools: CALENDAR_TOOLS,
    execute: invokeCalendarAction,
    options,
  });
}

export function createMicrosoftTeamsConnectorAdapter(options = {}) {
  return createMicrosoftAdapter({
    id: "microsoft-teams",
    aliases: ["microsoft-teams", "teams"],
    tools: TEAMS_TOOLS,
    execute: invokeTeamsAction,
    options,
  });
}

function createMicrosoftAdapter({ id, aliases, tools, execute, options }) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const credentials = createOAuthCredentialRuntime({
    provider: id,
    clientIdEnv: "MICROSOFT_CONNECTOR_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_CONNECTOR_CLIENT_SECRET",
    tokenUrl: MICROSOFT_TOKEN_URL,
    ...options,
    fetchImpl,
  });

  async function invoke({ grant, name, arguments: rawArguments }) {
    const definition = tools.get(name);
    if (!definition) throw unknownAction(id);
    const args = isRecord(rawArguments) ? rawArguments : {};
    return credentials.invoke(grant, ({ accessToken }) =>
      execute(
        createGraphClient({
          accessToken,
          fetchImpl,
          provider: id,
        }),
        definition.name,
        args,
      ),
    );
  }

  return Object.freeze({
    id,
    aliases: Object.freeze(aliases),
    invoke,
    listCapabilities: () => tools.capabilities(),
    listTools: (actionIds) => tools.list(actionIds),
  });
}

async function invokeOutlookAction(client, name, args) {
  switch (name) {
    case "get_profile":
      return client.request("/v1.0/me", {
        query: {
          $select: "id,displayName,givenName,surname,mail,userPrincipalName,preferredLanguage",
        },
      });
    case "list_mail_folders":
      return graphCollection(
        await client.requestCursor(args.cursor, "/v1.0/me/mailFolders", {
          query: {
            $top: clampInteger(args.limit, 1, 100, 50),
            $select:
              "id,displayName,parentFolderId,childFolderCount,totalItemCount,unreadItemCount,isHidden",
            includeHiddenFolders: true,
          },
        }),
      );
    case "list_messages": {
      const folderId = readString(args.folderId) || "inbox";
      const query = readString(args.query);
      return graphCollection(
        await client.requestCursor(
          args.cursor,
          `/v1.0/me/mailFolders/${encodePath(folderId)}/messages`,
          {
            query: compactObject({
              $top: clampInteger(args.limit, 1, 100, 50),
              $select:
                "id,subject,bodyPreview,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,createdDateTime,lastModifiedDateTime,hasAttachments,isRead,importance,conversationId,internetMessageId,webLink",
              $orderby: query ? undefined : "receivedDateTime desc",
              $search: query || undefined,
            }),
            headers: query
              ? {
                  ConsistencyLevel: "eventual",
                }
              : undefined,
          },
        ),
      );
    }
    case "get_message":
      return client.request(
        `/v1.0/me/messages/${encodePath(requireString(args.messageId, "Outlook messageId"))}`,
        {
          query: {
            $select:
              "id,subject,body,bodyPreview,from,sender,toRecipients,ccRecipients,bccRecipients,replyTo,receivedDateTime,sentDateTime,createdDateTime,lastModifiedDateTime,hasAttachments,isRead,isDraft,importance,conversationId,internetMessageId,internetMessageHeaders,webLink",
          },
        },
      );
    case "list_message_attachments":
      return graphCollection(
        await client.request(
          `/v1.0/me/messages/${encodePath(
            requireString(args.messageId, "Outlook messageId"),
          )}/attachments`,
          {
            query: {
              $select: "id,name,contentType,size,isInline,lastModifiedDateTime",
            },
          },
        ),
      );
    case "create_draft":
      return client.request("/v1.0/me/messages", {
        method: "POST",
        body: {
          subject: requireString(args.subject, "Outlook subject"),
          body: {
            contentType: normalizeBodyType(args.bodyType),
            content: requireString(args.body, "Outlook message body"),
          },
          toRecipients: emailRecipients(requireStringArray(args.to, "Outlook to recipients")),
          ccRecipients: emailRecipients(
            normalizeOptionalEmailArray(args.cc, "Outlook cc recipients"),
          ),
        },
      });
    case "update_draft": {
      const body = compactObject({
        subject: args.subject === undefined ? undefined : readString(args.subject),
        body:
          args.body === undefined
            ? undefined
            : {
                contentType: normalizeBodyType(args.bodyType),
                content: readString(args.body),
              },
        toRecipients:
          args.to === undefined
            ? undefined
            : emailRecipients(normalizeOptionalEmailArray(args.to, "Outlook to recipients")),
        ccRecipients:
          args.cc === undefined
            ? undefined
            : emailRecipients(normalizeOptionalEmailArray(args.cc, "Outlook cc recipients")),
      });
      if (!Object.keys(body).length) {
        throw invalidInput("At least one Outlook draft field must be supplied.");
      }
      return client.request(
        `/v1.0/me/messages/${encodePath(requireString(args.messageId, "Outlook messageId"))}`,
        {
          method: "PATCH",
          body,
        },
      );
    }
    case "send_draft":
      return client.request(
        `/v1.0/me/messages/${encodePath(requireString(args.messageId, "Outlook messageId"))}/send`,
        { method: "POST" },
      );
    case "reply_to_message":
      return client.request(
        `/v1.0/me/messages/${encodePath(requireString(args.messageId, "Outlook messageId"))}/reply`,
        {
          method: "POST",
          body: {
            comment: requireString(args.body, "Outlook reply body"),
          },
        },
      );
    case "forward_message":
      return client.request(
        `/v1.0/me/messages/${encodePath(
          requireString(args.messageId, "Outlook messageId"),
        )}/forward`,
        {
          method: "POST",
          body: {
            comment: readString(args.comment),
            toRecipients: emailRecipients(
              requireStringArray(args.to, "Outlook forward recipients"),
            ),
          },
        },
      );
    case "move_message":
      return client.request(
        `/v1.0/me/messages/${encodePath(requireString(args.messageId, "Outlook messageId"))}/move`,
        {
          method: "POST",
          body: {
            destinationId: requireString(args.destinationFolderId, "Outlook destinationFolderId"),
          },
        },
      );
    case "delete_message":
      return client.request(
        `/v1.0/me/messages/${encodePath(requireString(args.messageId, "Outlook messageId"))}`,
        { method: "DELETE" },
      );
    default:
      throw unknownAction("outlook");
  }
}

async function invokeCalendarAction(client, name, args) {
  switch (name) {
    case "list_calendars":
      return graphCollection(
        await client.requestCursor(args.cursor, "/v1.0/me/calendars", {
          query: {
            $top: clampInteger(args.limit, 1, 100, 50),
            $select:
              "id,name,color,hexColor,isDefaultCalendar,canEdit,canShare,canViewPrivateItems,owner,changeKey",
          },
        }),
      );
    case "get_calendar":
      return client.request(
        `/v1.0/me/calendars/${encodePath(requireString(args.calendarId, "Outlook calendarId"))}`,
      );
    case "list_events": {
      const calendarId = readString(args.calendarId);
      const timeZone = readString(args.timeZone);
      return graphCollection(
        await client.requestCursor(
          args.cursor,
          calendarId
            ? `/v1.0/me/calendars/${encodePath(calendarId)}/calendarView`
            : "/v1.0/me/calendarView",
          {
            query: {
              startDateTime: normalizeDateTime(args.startDateTime, "Outlook startDateTime"),
              endDateTime: normalizeDateTime(args.endDateTime, "Outlook endDateTime"),
              $top: clampInteger(args.limit, 1, 100, 50),
              $orderby: "start/dateTime",
              $select:
                "id,subject,bodyPreview,start,end,location,locations,organizer,attendees,isAllDay,isCancelled,isOnlineMeeting,onlineMeeting,onlineMeetingProvider,responseStatus,showAs,sensitivity,importance,webLink,createdDateTime,lastModifiedDateTime",
            },
            headers: timeZone
              ? {
                  Prefer: `outlook.timezone="${escapeHeaderValue(timeZone)}"`,
                }
              : undefined,
          },
        ),
      );
    }
    case "get_event":
      return client.request(
        `/v1.0/me/events/${encodePath(requireString(args.eventId, "Outlook eventId"))}`,
      );
    case "find_meeting_times": {
      const timeZone = readString(args.timeZone) || "UTC";
      return client.request("/v1.0/me/findMeetingTimes", {
        method: "POST",
        body: {
          attendees: emailRecipients(
            requireStringArray(args.attendees, "Outlook meeting attendees"),
          ).map(({ emailAddress }) => ({
            type: "required",
            emailAddress,
          })),
          timeConstraint: {
            activityDomain: "work",
            timeSlots: [
              {
                start: {
                  dateTime: normalizeDateTime(args.startDateTime, "Outlook startDateTime"),
                  timeZone,
                },
                end: {
                  dateTime: normalizeDateTime(args.endDateTime, "Outlook endDateTime"),
                  timeZone,
                },
              },
            ],
          },
          meetingDuration: normalizeDuration(args.duration),
          returnSuggestionReasons: true,
          minimumAttendeePercentage: 100,
        },
      });
    }
    case "create_event": {
      const calendarId = readString(args.calendarId);
      return client.request(
        calendarId ? `/v1.0/me/calendars/${encodePath(calendarId)}/events` : "/v1.0/me/events",
        {
          method: "POST",
          body: createEventBody(args, { requireCore: true }),
        },
      );
    }
    case "update_event": {
      const body = createEventBody(args);
      if (!Object.keys(body).length) {
        throw invalidInput("At least one Outlook event field must be supplied.");
      }
      return client.request(
        `/v1.0/me/events/${encodePath(requireString(args.eventId, "Outlook eventId"))}`,
        {
          method: "PATCH",
          body,
        },
      );
    }
    case "cancel_event":
      return client.request(
        `/v1.0/me/events/${encodePath(requireString(args.eventId, "Outlook eventId"))}/cancel`,
        {
          method: "POST",
          body: {
            comment: readString(args.comment),
          },
        },
      );
    case "delete_event":
      return client.request(
        `/v1.0/me/events/${encodePath(requireString(args.eventId, "Outlook eventId"))}`,
        { method: "DELETE" },
      );
    default:
      throw unknownAction("outlook-calendar");
  }
}

async function invokeTeamsAction(client, name, args) {
  switch (name) {
    case "list_joined_teams": {
      const payload = await client.request("/v1.0/me/joinedTeams");
      const items = Array.isArray(payload?.value) ? payload.value : [];
      const start = clampInteger(args.cursor, 0, Number.MAX_SAFE_INTEGER, 0);
      const limit = clampInteger(args.limit, 1, 100, 100);
      const selected = items.slice(start, start + limit);
      const next = start + selected.length;
      return {
        items: selected,
        cursor: next < items.length ? String(next) : "",
        hasMore: next < items.length,
      };
    }
    case "get_team":
      return client.request(
        `/v1.0/teams/${encodePath(requireString(args.teamId, "Microsoft Teams teamId"))}`,
      );
    case "list_channels":
      return graphCollection(
        await client.requestCursor(
          args.cursor,
          `/v1.0/teams/${encodePath(
            requireString(args.teamId, "Microsoft Teams teamId"),
          )}/channels`,
          {
            query: {
              $top: clampInteger(args.limit, 1, 100, 50),
            },
          },
        ),
      );
    case "list_channel_messages":
      return graphCollection(
        await client.requestCursor(args.cursor, teamsChannelPath(args, "/messages"), {
          query: {
            $top: clampInteger(args.limit, 1, 50, 50),
          },
        }),
      );
    case "get_channel_message": {
      const messagePath = `${teamsChannelPath(args, "/messages")}/${encodePath(
        requireString(args.messageId, "Microsoft Teams messageId"),
      )}`;
      const [message, replies] = await Promise.all([
        client.request(messagePath),
        client.request(`${messagePath}/replies`, {
          query: { $top: 50 },
        }),
      ]);
      return {
        ...message,
        replies: Array.isArray(replies?.value) ? replies.value : [],
        repliesCursor: readString(replies?.["@odata.nextLink"]),
      };
    }
    case "list_team_members":
      return graphCollection(
        await client.requestCursor(
          args.cursor,
          `/v1.0/teams/${encodePath(requireString(args.teamId, "Microsoft Teams teamId"))}/members`,
          {
            query: {
              $top: clampInteger(args.limit, 1, 100, 100),
            },
          },
        ),
      );
    case "post_channel_message":
      return client.request(teamsChannelPath(args, "/messages"), {
        method: "POST",
        body: teamsMessageBody(args.body),
      });
    case "reply_to_channel_message":
      return client.request(
        `${teamsChannelPath(args, "/messages")}/${encodePath(
          requireString(args.messageId, "Microsoft Teams messageId"),
        )}/replies`,
        {
          method: "POST",
          body: teamsMessageBody(args.body),
        },
      );
    case "create_channel": {
      const membershipType =
        normalizeOptionalEnum(
          args.membershipType,
          ["standard", "private", "shared"],
          "Microsoft Teams membershipType",
        ) || "standard";
      const body = {
        displayName: requireString(args.displayName, "Microsoft Teams channel displayName"),
        description: readString(args.description),
        membershipType,
      };
      if (membershipType !== "standard") {
        const profile = await client.request("/v1.0/me", {
          query: { $select: "id" },
        });
        body.members = [
          {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            roles: ["owner"],
            "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${encodeODataString(
              requireString(profile?.id, "Microsoft user ID"),
            )}')`,
          },
        ];
      }
      return client.request(
        `/v1.0/teams/${encodePath(requireString(args.teamId, "Microsoft Teams teamId"))}/channels`,
        {
          method: "POST",
          body,
        },
      );
    }
    case "update_channel": {
      const body = compactObject({
        displayName: args.displayName === undefined ? undefined : readString(args.displayName),
        description: args.description === undefined ? undefined : readString(args.description),
      });
      if (!Object.keys(body).length) {
        throw invalidInput("At least one Microsoft Teams channel field must be supplied.");
      }
      return client.request(teamsChannelPath(args), {
        method: "PATCH",
        body,
      });
    }
    case "delete_channel":
      return client.request(teamsChannelPath(args), {
        method: "DELETE",
      });
    default:
      throw unknownAction("microsoft-teams");
  }
}

function createGraphClient({ accessToken, fetchImpl, provider }) {
  async function request(pathname, { method = "GET", query, body, headers } = {}) {
    const url = new URL(pathname, MICROSOFT_GRAPH_ORIGIN);
    if (url.origin !== MICROSOFT_GRAPH_ORIGIN) {
      throw invalidInput("Microsoft Graph pagination cursor is invalid.");
    }
    Object.entries(compactObject(query || {})).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    const response = await fetchImpl(url, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(headers || {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw createProviderRequestError(provider, response, payload);
    }
    if (response.status === 202) {
      return {
        accepted: true,
        status: 202,
      };
    }
    if (response.status === 204) {
      return {
        success: true,
        status: 204,
      };
    }
    return payload;
  }

  function requestCursor(cursor, pathname, options) {
    const cursorUrl = readString(cursor) ? normalizeCursorUrl(cursor, MICROSOFT_GRAPH_ORIGIN) : "";
    return request(
      cursorUrl || pathname,
      cursorUrl
        ? {
            headers: options?.headers,
          }
        : options,
    );
  }

  return Object.freeze({ request, requestCursor });
}

function graphCollection(payload) {
  const cursor = readString(payload?.["@odata.nextLink"]);
  return {
    items: Array.isArray(payload?.value) ? payload.value : [],
    cursor,
    hasMore: Boolean(cursor),
    count: payload?.["@odata.count"] === undefined ? undefined : Number(payload["@odata.count"]),
  };
}

function emailRecipients(addresses) {
  return (addresses || []).map((address) => ({
    emailAddress: {
      address: normalizeEmail(address),
    },
  }));
}

function normalizeEmail(value) {
  const email = readString(value);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 320) {
    throw invalidInput(`Invalid email address: ${email || "(empty)"}.`);
  }
  return email;
}

function normalizeOptionalEmailArray(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw invalidInput(`${label} must be an array.`);
  return value.map(normalizeEmail);
}

function normalizeBodyType(value) {
  const normalized =
    normalizeOptionalEnum(readString(value).toLowerCase(), ["text", "html"], "Outlook bodyType") ||
    "html";
  return normalized === "text" ? "Text" : "HTML";
}

function normalizeDateTime(value, label) {
  const normalized = requireString(value, label);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw invalidInput(`${label} must be a valid ISO 8601 date-time.`);
  }
  return normalized;
}

function normalizeDuration(value) {
  const normalized = requireString(value, "Outlook meeting duration");
  if (!/^P(?=\d|T\d)(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/.test(normalized)) {
    throw invalidInput("Outlook meeting duration must be an ISO 8601 duration.");
  }
  return normalized;
}

function createEventBody(args, { requireCore = false } = {}) {
  const timeZone = readString(args.timeZone) || "UTC";
  const start =
    args.startDateTime === undefined && !requireCore
      ? undefined
      : {
          dateTime: normalizeDateTime(args.startDateTime, "Outlook startDateTime"),
          timeZone,
        };
  const end =
    args.endDateTime === undefined && !requireCore
      ? undefined
      : {
          dateTime: normalizeDateTime(args.endDateTime, "Outlook endDateTime"),
          timeZone,
        };
  return compactObject({
    subject:
      args.subject === undefined && !requireCore
        ? undefined
        : requireString(args.subject, "Outlook event subject"),
    body:
      args.body === undefined
        ? undefined
        : {
            contentType: "HTML",
            content: readString(args.body),
          },
    start,
    end,
    attendees:
      args.attendees === undefined
        ? undefined
        : emailRecipients(
            normalizeOptionalEmailArray(args.attendees, "Outlook event attendees"),
          ).map(({ emailAddress }) => ({
            type: "required",
            emailAddress,
          })),
  });
}

function teamsChannelPath(args, suffix = "") {
  return `/v1.0/teams/${encodePath(
    requireString(args.teamId, "Microsoft Teams teamId"),
  )}/channels/${encodePath(requireString(args.channelId, "Microsoft Teams channelId"))}${suffix}`;
}

function teamsMessageBody(value) {
  return {
    body: {
      contentType: "html",
      content: requireString(value, "Microsoft Teams message body"),
    },
  };
}

function escapeHeaderValue(value) {
  return readString(value).replace(/["\r\n]/g, "");
}

function encodeODataString(value) {
  return readString(value).replaceAll("'", "''");
}

function unknownAction(provider) {
  return new ConnectorRuntimeError(`Unknown ${provider} action.`, {
    code: "connector_action_unknown",
    statusCode: 404,
  });
}

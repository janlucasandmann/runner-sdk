import {
  defineCapabilities,
  defineConnectorProvider,
  paginationFields,
  stringArrayField,
  stringField,
} from "../shared.js";

const capabilities = defineCapabilities([
  {
    id: "list_calendars",
    description: "List calendars visible to the connected Google account.",
    access: "read-only",
    properties: paginationFields,
  },
  {
    id: "get_calendar",
    description: "Get metadata for a Google calendar.",
    access: "read-only",
    properties: { calendarId: stringField("Google Calendar ID.") },
    required: ["calendarId"],
  },
  {
    id: "list_events",
    description: "List events in a Google calendar and time range.",
    access: "read-only",
    properties: {
      calendarId: stringField("Google Calendar ID."),
      timeMin: stringField("Inclusive RFC 3339 range start."),
      timeMax: stringField("Exclusive RFC 3339 range end."),
      query: stringField("Optional free-text query."),
      ...paginationFields,
    },
    required: ["calendarId"],
  },
  {
    id: "get_event",
    description: "Get one Google Calendar event.",
    access: "read-only",
    properties: {
      calendarId: stringField("Google Calendar ID."),
      eventId: stringField("Google Calendar event ID."),
    },
    required: ["calendarId", "eventId"],
  },
  {
    id: "query_free_busy",
    description: "Query availability across authorized Google calendars.",
    access: "read-only",
    properties: {
      calendarIds: stringArrayField("Calendar IDs to query."),
      timeMin: stringField("RFC 3339 range start."),
      timeMax: stringField("RFC 3339 range end."),
      timeZone: stringField("Optional IANA time zone."),
    },
    required: ["calendarIds", "timeMin", "timeMax"],
  },
  {
    id: "create_event",
    description: "Create an event in a Google calendar.",
    access: "interactive",
    properties: {
      calendarId: stringField("Google Calendar ID."),
      summary: stringField("Event title."),
      description: stringField("Event description."),
      start: stringField("RFC 3339 event start."),
      end: stringField("RFC 3339 event end."),
      timeZone: stringField("IANA time zone."),
      attendees: stringArrayField("Attendee email addresses."),
    },
    required: ["calendarId", "summary", "start", "end"],
  },
  {
    id: "update_event",
    description: "Update an existing Google Calendar event.",
    access: "interactive",
    properties: {
      calendarId: stringField("Google Calendar ID."),
      eventId: stringField("Event ID."),
      summary: stringField("Updated title."),
      description: stringField("Updated description."),
      start: stringField("Updated RFC 3339 start."),
      end: stringField("Updated RFC 3339 end."),
      attendees: stringArrayField("Updated attendee email addresses."),
    },
    required: ["calendarId", "eventId"],
  },
  {
    id: "delete_event",
    description: "Delete an event from a Google calendar.",
    access: "interactive",
    properties: {
      calendarId: stringField("Google Calendar ID."),
      eventId: stringField("Event ID."),
    },
    required: ["calendarId", "eventId"],
  },
]);

export const GOOGLE_CALENDAR_CONNECTOR_PROVIDER = defineConnectorProvider({
  id: "google-calendar",
  label: "Google Calendar",
  shortLabel: "GC",
  description: "Inspect availability and manage events in authorized Google calendars.",
  category: "Calendar",
  logoUrl: "https://cdn.simpleicons.org/googlecalendar/4285F4",
  functionsLabel: "Schedule, Inspect, Coordinate",
  samplePrompt: "Find a free slot for the project review and schedule the team.",
  whenToUse: "Use Google Calendar for scheduling and availability on behalf of a connected user.",
  websiteUrl: "https://calendar.google.com/",
  termsUrl: "https://policies.google.com/terms",
  privacyUrl: "https://policies.google.com/privacy",
}, capabilities);


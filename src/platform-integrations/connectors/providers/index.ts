import { ASANA_CONNECTOR_PROVIDER } from "./asana/index.js";
import { BIGQUERY_CONNECTOR_PROVIDER } from "./bigquery/index.js";
import { BOX_CONNECTOR_PROVIDER } from "./box/index.js";
import { DROPBOX_CONNECTOR_PROVIDER } from "./dropbox/index.js";
import { FIGMA_CONNECTOR_PROVIDER } from "./figma/index.js";
import { GOOGLE_CALENDAR_CONNECTOR_PROVIDER } from "./google-calendar/index.js";
import { LINEAR_CONNECTOR_PROVIDER } from "./linear/index.js";
import { MICROSOFT_TEAMS_CONNECTOR_PROVIDER } from "./microsoft-teams/index.js";
import { OUTLOOK_CONNECTOR_PROVIDER } from "./outlook/index.js";
import { OUTLOOK_CALENDAR_CONNECTOR_PROVIDER } from "./outlook-calendar/index.js";
import { SHAREPOINT_CONNECTOR_PROVIDER } from "./sharepoint/index.js";
import { SLACK_CONNECTOR_PROVIDER } from "./slack/index.js";
import { STRIPE_CONNECTOR_PROVIDER } from "./stripe/index.js";
import { SUPABASE_CONNECTOR_PROVIDER } from "./supabase/index.js";

export {
  ASANA_CONNECTOR_PROVIDER,
  BIGQUERY_CONNECTOR_PROVIDER,
  BOX_CONNECTOR_PROVIDER,
  DROPBOX_CONNECTOR_PROVIDER,
  FIGMA_CONNECTOR_PROVIDER,
  GOOGLE_CALENDAR_CONNECTOR_PROVIDER,
  LINEAR_CONNECTOR_PROVIDER,
  MICROSOFT_TEAMS_CONNECTOR_PROVIDER,
  OUTLOOK_CONNECTOR_PROVIDER,
  OUTLOOK_CALENDAR_CONNECTOR_PROVIDER,
  SHAREPOINT_CONNECTOR_PROVIDER,
  SLACK_CONNECTOR_PROVIDER,
  STRIPE_CONNECTOR_PROVIDER,
  SUPABASE_CONNECTOR_PROVIDER,
};

export const ADDITIONAL_CONNECTOR_PROVIDERS = Object.freeze([
  LINEAR_CONNECTOR_PROVIDER,
  BOX_CONNECTOR_PROVIDER,
  GOOGLE_CALENDAR_CONNECTOR_PROVIDER,
  OUTLOOK_CONNECTOR_PROVIDER,
  OUTLOOK_CALENDAR_CONNECTOR_PROVIDER,
  BIGQUERY_CONNECTOR_PROVIDER,
  SLACK_CONNECTOR_PROVIDER,
  SHAREPOINT_CONNECTOR_PROVIDER,
  STRIPE_CONNECTOR_PROVIDER,
  DROPBOX_CONNECTOR_PROVIDER,
  ASANA_CONNECTOR_PROVIDER,
  MICROSOFT_TEAMS_CONNECTOR_PROVIDER,
  FIGMA_CONNECTOR_PROVIDER,
  SUPABASE_CONNECTOR_PROVIDER,
] as const);

export type AdditionalConnectorId =
  (typeof ADDITIONAL_CONNECTOR_PROVIDERS)[number]["id"];

export const ADDITIONAL_CONNECTOR_IDS = Object.freeze(
  ADDITIONAL_CONNECTOR_PROVIDERS.map((provider) => provider.id),
) as readonly AdditionalConnectorId[];

export const ADDITIONAL_CONNECTOR_PROVIDER_BY_ID = Object.freeze(
  Object.fromEntries(
    ADDITIONAL_CONNECTOR_PROVIDERS.map((provider) => [provider.id, provider]),
  ),
) as Readonly<
  Record<AdditionalConnectorId, (typeof ADDITIONAL_CONNECTOR_PROVIDERS)[number]>
>;

export const ADDITIONAL_CONNECTOR_CAPABILITIES = Object.freeze(
  Object.fromEntries(
    ADDITIONAL_CONNECTOR_PROVIDERS.map((provider) => [
      provider.id,
      provider.capabilities,
    ]),
  ),
) as Readonly<
  Record<
    AdditionalConnectorId,
    (typeof ADDITIONAL_CONNECTOR_PROVIDERS)[number]["capabilities"]
  >
>;

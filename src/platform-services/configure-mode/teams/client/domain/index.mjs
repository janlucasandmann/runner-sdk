import { TEAMS_MEMBER_IDENTITY_SCRIPT } from "./member-identity.mjs";
import { TEAMS_RESOURCE_SHARING_DOMAIN_SCRIPT } from "./resource-sharing.mjs";

export const TEAMS_DOMAIN_SCRIPT_FRAGMENTS = Object.freeze({
  memberIdentity: TEAMS_MEMBER_IDENTITY_SCRIPT,
  resourceSharing: TEAMS_RESOURCE_SHARING_DOMAIN_SCRIPT,
});


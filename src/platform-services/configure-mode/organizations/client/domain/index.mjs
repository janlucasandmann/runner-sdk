import { ORGANIZATIONS_CONSTANTS_SCRIPT } from "./constants.mjs";
import { ORGANIZATIONS_IDENTITY_SCRIPT } from "./organization-identity.mjs";
import { ORGANIZATIONS_INVITATION_NOTIFICATIONS_SCRIPT } from "./invitation-notifications.mjs";
import { ORGANIZATIONS_ROLE_PERMISSIONS_SCRIPT } from "./role-permissions.mjs";
import { ORGANIZATIONS_ROLE_DEFINITIONS_SCRIPT } from "./role-definitions.mjs";
import { ORGANIZATIONS_ROLE_IDENTITY_SCRIPT } from "./role-identity.mjs";
import { ORGANIZATIONS_STORAGE_SCRIPT } from "./storage.mjs";

export const ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS = Object.freeze({
  constants: ORGANIZATIONS_CONSTANTS_SCRIPT,
  invitationNotifications: ORGANIZATIONS_INVITATION_NOTIFICATIONS_SCRIPT,
  storage: ORGANIZATIONS_STORAGE_SCRIPT,
  roleDefinitions: ORGANIZATIONS_ROLE_DEFINITIONS_SCRIPT,
  roleIdentity: ORGANIZATIONS_ROLE_IDENTITY_SCRIPT,
  rolePermissions: ORGANIZATIONS_ROLE_PERMISSIONS_SCRIPT,
  organizationIdentity: ORGANIZATIONS_IDENTITY_SCRIPT,
});

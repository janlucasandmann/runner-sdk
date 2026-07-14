import { TEAMS_ADMINISTRATION_ACTIONS_SCRIPT } from "./administration.mjs";
import { TEAMS_DELETE_ACTION_SCRIPT } from "./delete-team.mjs";
import { TEAMS_LOADING_SCRIPT } from "./loading.mjs";
import { TEAMS_MEMBERSHIP_ACTIONS_SCRIPT } from "./membership.mjs";
import { TEAMS_PERMISSION_ACTIONS_SCRIPT } from "./permissions.mjs";
import { TEAMS_SHARING_ACTIONS_SCRIPT } from "./sharing.mjs";

export const TEAMS_RUNTIME_SCRIPT_FRAGMENTS = Object.freeze({
  loading: TEAMS_LOADING_SCRIPT,
  membership: TEAMS_MEMBERSHIP_ACTIONS_SCRIPT,
  administration: TEAMS_ADMINISTRATION_ACTIONS_SCRIPT,
  permissions: TEAMS_PERMISSION_ACTIONS_SCRIPT,
  deleteTeam: TEAMS_DELETE_ACTION_SCRIPT,
  sharing: TEAMS_SHARING_ACTIONS_SCRIPT,
});


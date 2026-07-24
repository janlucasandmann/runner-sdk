export const API_KEY_SCOPE_PRESETS = Object.freeze([
  Object.freeze({
    id: "full",
    label: "Full Access",
    description: "Read, write, execute, and admin access.",
    permissions: Object.freeze(["*"]),
  }),
  Object.freeze({
    id: "execute",
    label: "Execute Only",
    description: "Run tasks and inspect results.",
    permissions: Object.freeze(["threads:read", "threads:write", "execute"]),
  }),
  Object.freeze({
    id: "read",
    label: "Read Only",
    description: "View projects, threads, repository security, verified evidence, and billing data.",
    permissions: Object.freeze(["projects:read", "threads:read", "security:read", "evidence:read", "billing:read"]),
  }),
] as const);

export type ApiKeyScopePresetId = (typeof API_KEY_SCOPE_PRESETS)[number]["id"];

export function getApiKeyScopePreset(presetId: ApiKeyScopePresetId) {
  return API_KEY_SCOPE_PRESETS.find((preset) => preset.id === presetId) ?? API_KEY_SCOPE_PRESETS[0];
}

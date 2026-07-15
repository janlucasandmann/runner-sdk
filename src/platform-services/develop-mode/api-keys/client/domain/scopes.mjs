export const API_KEYS_SCOPE_PRESETS_SCRIPT = `      const SETTINGS_API_KEY_SCOPE_PRESETS = {
        full: {
          label: "Full Access",
          description: "Read, write, execute, and admin access.",
          permissions: ["*"],
        },
        execute: {
          label: "Execute Only",
          description: "Run tasks and inspect results.",
          permissions: ["threads:read", "threads:write", "execute"],
        },
        read: {
          label: "Read Only",
          description: "View projects, threads, and billing data.",
          permissions: ["projects:read", "threads:read", "billing:read"],
        },
      };
`;

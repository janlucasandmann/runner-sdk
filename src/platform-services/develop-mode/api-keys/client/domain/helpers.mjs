export const API_KEYS_HELPERS_SCRIPT = `      function getSettingsApiKeyScopeLabel(permissions) {
        const items = Array.isArray(permissions) ? permissions : [];
        for (const preset of Object.values(SETTINGS_API_KEY_SCOPE_PRESETS)) {
          if (
            preset.permissions.length === items.length &&
            preset.permissions.every((permission) => items.includes(permission))
          ) {
            return preset.label;
          }
        }
        return items.length ? "Custom" : "Default";
      }

      function isSettingsSystemManagedKey(apiKeyRecord) {
        const metadata = apiKeyRecord?.metadata && typeof apiKeyRecord.metadata === "object" && !Array.isArray(apiKeyRecord.metadata)
          ? apiKeyRecord.metadata
          : {};
        return metadata.isDefault === true || typeof metadata.createdBy === "string" && metadata.createdBy.includes("provisioner");
      }
`;

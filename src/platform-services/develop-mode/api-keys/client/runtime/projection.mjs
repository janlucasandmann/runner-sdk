export const API_KEYS_PROJECTION_SCRIPT = `        const settingsManagedApiKeys = useMemo(() => settingsApiKeys.filter((apiKeyRecord) => isSettingsSystemManagedKey(apiKeyRecord)), [settingsApiKeys]);
        const settingsDeveloperApiKeys = useMemo(() => settingsApiKeys.filter((apiKeyRecord) => !isSettingsSystemManagedKey(apiKeyRecord)), [settingsApiKeys]);
`;

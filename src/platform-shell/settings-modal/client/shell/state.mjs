export const SETTINGS_MODAL_STATE_SCRIPT = String.raw`        const settingsMarketingEmailsAvailable = platformDeploymentProfile.topology !== "on_prem";
        const SETTINGS_NOTIFICATION_PREFERENCE_FALLBACK_ROWS = Object.freeze([
          { id: "agentRuns", title: "Agent runs", description: "Run completions and failures for threads, schedules, triggers, and workflows.", defaultEnabled: true },
          { id: "permissionRequests", title: "Permission requests", description: "When an agent needs approval or additional tool access.", defaultEnabled: true },
          { id: "assignedWork", title: "Assigned work and reviews", description: "Tasks assigned to you and review requests that need attention.", defaultEnabled: true },
          { id: "taskActivity", title: "Ticket activity", description: "Comments and changes on tickets you follow.", defaultEnabled: true },
          { id: "mentions", title: "Mentions", description: "When someone mentions you in a project update or ticket comment.", defaultEnabled: true },
          { id: "invitations", title: "Invitations", description: "Team and organization invitations.", defaultEnabled: true },
          { id: "productUpdates", title: "Product updates", description: "Important product announcements and release information.", defaultEnabled: true },
        ]);
        const SETTINGS_NOTIFICATION_PREFERENCE_DEFAULTS = Object.freeze(
          Object.fromEntries(SETTINGS_NOTIFICATION_PREFERENCE_FALLBACK_ROWS.map((row) => [row.id, row.defaultEnabled !== false]))
        );
        const SETTINGS_NOTIFICATION_PREFERENCE_KEYS = Object.freeze(
          Object.keys(SETTINGS_NOTIFICATION_PREFERENCE_DEFAULTS)
        );
        function normalizeSettingsNotificationPreferences(value) {
          const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
          return SETTINGS_NOTIFICATION_PREFERENCE_KEYS.reduce((preferences, key) => {
            preferences[key] = typeof source[key] === "boolean"
              ? source[key]
              : SETTINGS_NOTIFICATION_PREFERENCE_DEFAULTS[key];
            return preferences;
          }, {});
        }
        function buildSettingsNotificationPreferenceStorageKey(userId, email) {
          const identity = String(userId || email || "anonymous").trim().toLowerCase() || "anonymous";
          return "computer_agents_notification_preferences_v1:" + identity;
        }
        function readStoredSettingsNotificationPreferences(storageKey) {
          try {
            return normalizeSettingsNotificationPreferences(JSON.parse(localStorage.getItem(storageKey) || "{}"));
          } catch {
            return normalizeSettingsNotificationPreferences(null);
          }
        }
        function writeStoredSettingsNotificationPreferences(storageKey, preferences) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(normalizeSettingsNotificationPreferences(preferences)));
          } catch {}
        }
        const settingsNotificationPreferenceStorageKey = useMemo(() => (
          buildSettingsNotificationPreferenceStorageKey(sessionState.userId, sessionState.email)
        ), [sessionState.email, sessionState.userId]);
        const [settingsNotificationPreferences, setSettingsNotificationPreferences] = useState(() => (
          readStoredSettingsNotificationPreferences(
            buildSettingsNotificationPreferenceStorageKey(sessionState.userId, sessionState.email)
          )
        ));
        const [settingsNotificationPreferencesLoading, setSettingsNotificationPreferencesLoading] = useState(false);
        const [settingsNotificationPreferenceRows, setSettingsNotificationPreferenceRows] = useState(
          SETTINGS_NOTIFICATION_PREFERENCE_FALLBACK_ROWS
        );
        const [settingsNotificationPreferenceSavingKey, setSettingsNotificationPreferenceSavingKey] = useState("");
        const [settingsNotificationPreferencesError, setSettingsNotificationPreferencesError] = useState("");
        const [settingsDataControlCategory, setSettingsDataControlCategory] = useState("");
        const [settingsDataControlSuccess, setSettingsDataControlSuccess] = useState("");
        const [settingsSection, setSettingsSection] = useState("profile");
        const [settingsModalOpen, setSettingsModalOpen] = useState(false);
`;

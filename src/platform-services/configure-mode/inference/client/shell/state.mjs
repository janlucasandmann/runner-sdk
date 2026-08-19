export const INFERENCE_APP_STATE_SCRIPT = `        const [settingsInferenceEndpoints, setSettingsInferenceEndpoints] = useState(() => readDemoSettingsPlatformConfig().inferenceEndpoints);
        const [settingsInferenceSettings, setSettingsInferenceSettings] = useState(() => getDefaultDemoInferenceEndpoint(readDemoSettingsPlatformConfig().inferenceEndpoints));
        const [settingsInferenceSelectedEndpointId, setSettingsInferenceSelectedEndpointId] = useState("");
        const [settingsInferenceDetailTab, setSettingsInferenceDetailTab] = useState("general");
        const [settingsInferenceAnalyticsTimeframe, setSettingsInferenceAnalyticsTimeframe] = useState("month");
        const [settingsInferenceSelectedVersionId, setSettingsInferenceSelectedVersionId] = useState("");
        const [settingsInferenceVersionsOpen, setSettingsInferenceVersionsOpen] = useState(false);
        const [settingsInferencePublishMenuOpen, setSettingsInferencePublishMenuOpen] = useState(false);
        const [settingsInferenceVersionSaveDialog, setSettingsInferenceVersionSaveDialog] = useState({
          open: false,
          initialMode: "new",
          instanceKey: 0,
          error: "",
        });
        const [settingsInferenceModelInput, setSettingsInferenceModelInput] = useState("");
        const [settingsInferenceApiKeyInput, setSettingsInferenceApiKeyInput] = useState("");
        const [settingsClearInferenceApiKey, setSettingsClearInferenceApiKey] = useState(false);
        const [settingsInferenceApiKeyEditing, setSettingsInferenceApiKeyEditing] = useState(false);
        const [settingsLocalRunnersReloadToken, setSettingsLocalRunnersReloadToken] = useState(0);
        const [settingsLocalRunnerOnboardingOpen, setSettingsLocalRunnerOnboardingOpen] = useState(false);
        const [settingsLocalRunnerPairingState, setSettingsLocalRunnerPairingState] = useState({
          status: "idle",
          token: "",
          pairingToken: null,
          error: "",
          success: "",
        });
        const [settingsLocalBindingFormOpen, setSettingsLocalBindingFormOpen] = useState(false);
        const [settingsLocalBindingSubmitting, setSettingsLocalBindingSubmitting] = useState(false);
        const [settingsLocalBindingError, setSettingsLocalBindingError] = useState("");
        const [settingsLocalBindingSuccess, setSettingsLocalBindingSuccess] = useState("");
        const [settingsLocalBindingForm, setSettingsLocalBindingForm] = useState({
          deviceId: "",
          environmentId: "",
          projectId: "",
          name: "",
          localPath: "",
          syncRoot: "",
          syncMode: "manual",
          executionMode: "bridge_local",
        });
        const [settingsLocalRunnersState, setSettingsLocalRunnersState] = useState({
          status: "idle",
          error: "",
          bridgeEnabled: null,
          runtimeTargets: [],
          devices: [],
          bindings: [],
          loadedAt: "",
        });
`;

export const API_KEYS_DATA_STATE_SCRIPT = `        const [settingsApiKeys, setSettingsApiKeys] = useState([]);
        const [settingsApiKeysLoading, setSettingsApiKeysLoading] = useState(false);
        const [settingsApiKeysError, setSettingsApiKeysError] = useState("");
        const settingsApiKeysSnapshotRef = useRef({ keys: [], loadedAt: 0, scopeKey: "" });
        const settingsApiKeysLoadPromiseRef = useRef(null);
        const [settingsApiKeyDialogOpen, setSettingsApiKeyDialogOpen] = useState(false);
        const [settingsNewKeyName, setSettingsNewKeyName] = useState("");
        const [settingsNewKeyDescription, setSettingsNewKeyDescription] = useState("");
        const [settingsNewKeyScopePreset, setSettingsNewKeyScopePreset] = useState("full");
        const [settingsCreateKeyLoading, setSettingsCreateKeyLoading] = useState(false);
        const [settingsNewlyCreatedKey, setSettingsNewlyCreatedKey] = useState("");
        const [settingsRevokingKeyId, setSettingsRevokingKeyId] = useState("");
        const [developApiKeysAnalyticsPeriod, setDevelopApiKeysAnalyticsPeriod] = useState("month");
        const [developApiKeysAnalyticsRefreshToken, setDevelopApiKeysAnalyticsRefreshToken] = useState(0);
        const [developApiKeysAnalyticsState, setDevelopApiKeysAnalyticsState] = useState(() => ({
          scopeKey: "",
          dataByPeriod: {},
          loadingPeriod: "",
          errorsByPeriod: {},
        }));
`;

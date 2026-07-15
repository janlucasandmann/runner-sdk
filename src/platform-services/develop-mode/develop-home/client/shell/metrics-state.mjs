export const DEVELOP_HOME_METRICS_STATE_SCRIPT = `        const [developQuickstartLanguage, setDevelopQuickstartLanguage] = useState("javascript");
        const [developServerOperationalMetrics, setDevelopServerOperationalMetrics] = useState(null);
        const [developServerOperationalMetricsLoading, setDevelopServerOperationalMetricsLoading] = useState(false);
        const [developServerOperationalMetricsError, setDevelopServerOperationalMetricsError] = useState("");
        const [developServerOperationalMetricsPeriod, setDevelopServerOperationalMetricsPeriod] = useState("month");
        const developServerOperationalMetricsLoadSequenceRef = useRef(0);
        const developServerOperationalMetricsAbortRef = useRef(null);
        const developServerOperationalMetricsRequestKeyRef = useRef("");
`;

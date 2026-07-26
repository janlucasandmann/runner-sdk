export const FINE_TUNING_APP_STATE_SCRIPT = String.raw`        const [fineTuningJobs, setFineTuningJobs] = useState([]);
        const [selectedFineTuningJobId, setSelectedFineTuningJobId] = useState("");
        const [fineTuningPageMode, setFineTuningPageMode] = useState("overview");
        const [fineTuningCreateModalOpen, setFineTuningCreateModalOpen] = useState(false);
        const [fineTuningCreateForm, setFineTuningCreateForm] = useState({
          name: "",
          targetAgentId: "",
          fineTunerAgentId: "",
          environmentId: "",
          evaluationSetIds: [],
          evaluationRunIds: {},
          evaluationBaselineModes: {},
          objectiveMode: "evaluation_targets",
          targetScorePercent: 80,
          targetPassRatePercent: 80,
          maximumCostIncreasePercent: "",
          maximumLatencyIncreasePercent: "",
          maxIterations: 3,
          budgetUsd: 10,
          maxDurationMinutes: 120,
          maxTransientRetries: 2,
          plateauIterations: 2,
          minimumIterationImprovementPercent: 1,
          publicationMode: "manual",
          publishBestOnLimit: false,
          instructions: "",
        });
`;

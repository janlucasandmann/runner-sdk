export const FINE_TUNING_APP_STATE_SCRIPT = String.raw`        const [fineTuningJobs, setFineTuningJobs] = useState([]);
        const [selectedFineTuningJobId, setSelectedFineTuningJobId] = useState("");
        const [fineTuningPageMode, setFineTuningPageMode] = useState("overview");
        const [fineTuningSearchQuery, setFineTuningSearchQuery] = useState("");
        const [fineTuningCreateModalOpen, setFineTuningCreateModalOpen] = useState(false);
        const [fineTuningCreateForm, setFineTuningCreateForm] = useState({
          name: "",
          agentId: "",
          environmentId: "",
          evaluationSetIds: [],
          instructions: "",
        });
`;


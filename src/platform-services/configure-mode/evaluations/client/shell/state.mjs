export const EVALUATIONS_APP_STATE_SCRIPT = `        const [evaluationSets, setEvaluationSets] = useState([]);
        const [selectedEvaluationSetId, setSelectedEvaluationSetId] = useState("");
        const [selectedEvaluationRunId, setSelectedEvaluationRunId] = useState("");
        const [selectedEvaluationCaseId, setSelectedEvaluationCaseId] = useState("");
        const [evaluationRunReturnTarget, setEvaluationRunReturnTarget] = useState(null);
        const [evaluationsPageMode, setEvaluationsPageMode] = useState("overview");
        const [evaluationDetailTab, setEvaluationDetailTab] = useState("general");
        const [evaluationCaseDetailTab, setEvaluationCaseDetailTab] = useState("code");
        const [evaluationRunsSearchQuery, setEvaluationRunsSearchQuery] = useState("");
        const [evaluationRunsFilterMode, setEvaluationRunsFilterMode] = useState("all");
        const [evaluationCreateModalOpen, setEvaluationCreateModalOpen] = useState(false);
        const [evaluationCreateForm, setEvaluationCreateForm] = useState({
          name: "",
          targetAgentId: "",
          environmentId: "",
          passThreshold: "80",
          evaluatorType: "agent",
          evaluatorAgentId: "",
          evaluatorCode: "",
        });
        const [evaluationRunModalOpen, setEvaluationRunModalOpen] = useState(false);
        const [evaluationRunForm, setEvaluationRunForm] = useState({
          setId: "",
          name: "",
          targetAgentId: "",
          environmentKey: "",
          evaluatorType: "agent",
          evaluatorAgentId: "",
          evaluatorCode: "",
        });
        const [evaluationJsonlImportOpen, setEvaluationJsonlImportOpen] = useState(false);
        const [evaluationJsonlImportValue, setEvaluationJsonlImportValue] = useState("");
        const [evaluationJsonlImportError, setEvaluationJsonlImportError] = useState("");
        const [evaluationVersionsSidebarRequestToken, setEvaluationVersionsSidebarRequestToken] = useState(0);
`;

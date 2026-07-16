export const EVALUATIONS_AGENT_STATE_SCRIPT = `        const [agentDetailEvaluationSearchQuery, setAgentDetailEvaluationSearchQuery] = useState("");
        const [agentDetailEvaluationFilterMode, setAgentDetailEvaluationFilterMode] = useState("all");
        const [agentDetailEvaluationRunFilterMode, setAgentDetailEvaluationRunFilterMode] = useState("all");
        const [agentDetailEvaluationSelectedSetId, setAgentDetailEvaluationSelectedSetId] = useState("");
        const [agentDetailEvaluationRunModalOpen, setAgentDetailEvaluationRunModalOpen] = useState(false);
        const [agentDetailEvaluationRunForm, setAgentDetailEvaluationRunForm] = useState({
          setId: "",
          name: "",
          environmentKey: "",
        });
        const [agentDetailEvaluationRunModalVisible, setAgentDetailEvaluationRunModalVisible] = useState(false);
        const [agentDetailEvaluationRunModalClosing, setAgentDetailEvaluationRunModalClosing] = useState(false);
        const [agentDetailEvaluationRunState, setAgentDetailEvaluationRunState] = useState({
          status: "idle",
          error: "",
        });
`;

export const EVALUATIONS_AGENT_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (!agentDetailEvaluationRunModalOpen) {
            if (!agentDetailEvaluationRunModalClosing) {
              setAgentDetailEvaluationRunModalVisible(false);
            }
            return undefined;
          }
          setAgentDetailEvaluationRunModalClosing(false);
          setAgentDetailEvaluationRunModalVisible(false);
          if (agentEvaluationRunModalFrameRef.current) {
            window.cancelAnimationFrame(agentEvaluationRunModalFrameRef.current);
          }
          agentEvaluationRunModalFrameRef.current = window.requestAnimationFrame(() => {
            agentEvaluationRunModalFrameRef.current = window.requestAnimationFrame(() => {
              agentEvaluationRunModalFrameRef.current = null;
              setAgentDetailEvaluationRunModalVisible(true);
            });
          });
          return () => {
            if (agentEvaluationRunModalFrameRef.current) {
              window.cancelAnimationFrame(agentEvaluationRunModalFrameRef.current);
              agentEvaluationRunModalFrameRef.current = null;
            }
          };
        }, [agentDetailEvaluationRunModalOpen, agentDetailEvaluationRunModalClosing]);
`;

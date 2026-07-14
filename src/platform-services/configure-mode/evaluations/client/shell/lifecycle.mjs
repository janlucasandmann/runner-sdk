export const EVALUATIONS_APP_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (activePage !== "evaluations") {
            return;
          }
          if (selectedEvaluationSetId && evaluationSets.some((set) => set.id === selectedEvaluationSetId)) {
            return;
          }
          setSelectedEvaluationSetId(evaluationSets[0]?.id || "");
          setSelectedEvaluationRunId("");
          if (evaluationsPageMode !== "overview") {
            setEvaluationsPageMode(evaluationSets[0]?.id ? "detail" : "overview");
          }
        }, [activePage, evaluationSets, evaluationsPageMode, selectedEvaluationSetId]);
        useEffect(() => {
          if (activePage === "evaluations" || !evaluationRunReturnTarget) {
            return;
          }
          setEvaluationRunReturnTarget(null);
        }, [activePage, evaluationRunReturnTarget]);
`;

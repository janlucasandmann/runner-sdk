export const MODELS_APP_RESOLVED_CATALOG_SCRIPT = `        const resolvedModelsPageAgentModelOptions = useMemo(() => (
          Array.isArray(modelsPageAgentModelOptions) && modelsPageAgentModelOptions.length > 0
            ? modelsPageAgentModelOptions
            : PLAYGROUND_AGENT_MODEL_OPTIONS
        ), [modelsPageAgentModelOptions]);
`;

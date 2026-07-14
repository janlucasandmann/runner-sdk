export const MODELS_AGENT_RESOLVED_CATALOG_SCRIPT = `        const resolvedAgentModelOptions = useMemo(() => (
          Array.isArray(agentModelOptions) && agentModelOptions.length > 0
            ? agentModelOptions
            : PLAYGROUND_AGENT_MODEL_OPTIONS
        ), [agentModelOptions]);
`;

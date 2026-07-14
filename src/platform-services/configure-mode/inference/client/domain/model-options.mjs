export const INFERENCE_DOMAIN_MODEL_OPTIONS_SCRIPT = `      function buildDemoInferenceModelOptions(providerType, defaultModel) {
        const normalizedDefaultModel = String(defaultModel || "").trim();
        const presetModels = providerType === "vllm"
          ? ["qwen2.5-coder-32b", "llama-3.3-70b-instruct"]
          : providerType === "tgi"
            ? ["mistral-small-3.1", "qwen2.5-72b-instruct"]
            : providerType === "ollama"
              ? ["llama3.3", "qwen2.5-coder:32b"]
              : providerType === "custom"
                ? ["primary-model"]
                : ["gpt-oss-120b", "claude-compatible-primary"];
        return Array.from(new Set([normalizedDefaultModel, ...presetModels].filter(Boolean))).slice(0, 12);
      }
`;


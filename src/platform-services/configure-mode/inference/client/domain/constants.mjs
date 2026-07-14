export const INFERENCE_DOMAIN_CONSTANTS_SCRIPT = `      const SETTINGS_DEFAULT_INFERENCE_SETTINGS = {
        enabled: false,
        providerType: "openai-compatible",
        baseUrl: "",
        defaultModel: "",
        availableModels: [],
        apiKeyConfigured: false,
        apiKeyPreview: "",
        lastValidatedAt: "",
        healthStatus: "idle",
        lastError: "",
      };
      const SETTINGS_INFERENCE_PROVIDER_OPTIONS = [
        { value: "openai-compatible", label: "OpenAI-Compatible" },
        { value: "vllm", label: "vLLM" },
        { value: "tgi", label: "Hugging Face TGI" },
        { value: "ollama", label: "Ollama" },
        { value: "custom", label: "Custom" },
      ];
`;


import type { PlatformSelectorOption } from "../../../../../platform-ui/components/ui/selector/index.js";

export const INFERENCE_PROVIDER_OPTIONS: readonly PlatformSelectorOption<string>[] = [
  {
    value: "openai-compatible",
    label: "OpenAI-Compatible",
    description: "OpenAI-compatible chat and models APIs",
  },
  {
    value: "vllm",
    label: "vLLM",
    description: "High-throughput self-hosted inference",
  },
  {
    value: "tgi",
    label: "Hugging Face TGI",
    description: "Text Generation Inference",
  },
  {
    value: "ollama",
    label: "Ollama",
    description: "Local model runtime",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Custom compatible endpoint",
  },
];

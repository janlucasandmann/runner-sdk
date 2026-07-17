import type {
  ModelOverviewProviderIcon,
  ModelsOverviewRow,
} from "./model-overview-types.js";

export type ModelsCategory =
  | "agent"
  | "image"
  | "video"
  | "deep_research";

export interface ModelCatalogRow extends ModelsOverviewRow {
  id: string;
  label: string;
  description: string;
  category: ModelsCategory;
  provider?: string;
  providerType?: string;
  source?: string;
  intelligence?: string;
  contextWindow?: string;
  speed?: string;
  mode?: string;
  maxDuration?: string;
  resolutions?: string;
  inputModalities?: string;
  pricingLabel?: string;
  pricingRank?: number;
  baseModelId?: string;
  subrowRank?: number;
  qualityId?: string;
  locked?: boolean;
  availability?: Readonly<Record<string, unknown>>;
  capabilities?: readonly string[];
  documentationUrl?: string;
  runtimeModelId?: string;
  location?: string;
  hosting?: string;
  dataHandling?: string;
}

interface AgentPrice {
  input: number | null;
  cached: number | null;
  output: number | null;
}

type AgentSeed = readonly [
  id: string,
  label: string,
  description: string,
  intelligence: string,
  contextWindow: string,
  speed: string,
  providerType?: string,
];

const AGENT_SEEDS: readonly AgentSeed[] = [
  ["claude-opus-4-8", "Claude Opus 4.8", "Latest Anthropic flagship for complex reasoning, long-horizon coding, and high-autonomy agent work.", "Highest", "1M", "Medium"],
  ["claude-opus-4-7", "Claude Opus 4.7", "Anthropic flagship for complex reasoning and agentic coding.", "Highest", "1M", "Medium"],
  ["claude-opus-4-6", "Claude Opus 4.6", "Previous-generation Anthropic flagship for complex reasoning.", "Highest", "1M", "Medium"],
  ["claude-sonnet-4-5", "Claude Sonnet 4.5", "Balanced flagship model for everyday coding work.", "High", "200k", "Fast"],
  ["claude-haiku-4-5", "Claude Haiku 4.5", "Fast and efficient for quick iterations.", "Good", "200k", "Very Fast"],
  ["gpt-5.5-pro", "GPT-5.5 Pro", "OpenAI highest-accuracy model on Clawcode for the hardest professional and agentic work.", "Highest", "1M", "Medium"],
  ["gpt-5.5", "GPT-5.5", "OpenAI frontier model on Clawcode for coding, professional work, and long-context agents.", "Highest", "1M", "Fast"],
  ["gpt-5.4", "GPT-5.4", "OpenAI flagship model running through Clawcode for advanced coding and planning.", "Highest", "1M", "Fast"],
  ["gpt-5.4-mini", "GPT-5.4 mini", "OpenAI mini model on Clawcode for coding, subagents, and computer use.", "High", "400k", "Fast"],
  ["gpt-5.4-nano", "GPT-5.4 nano", "OpenAI nano model on Clawcode for lightweight, high-volume workflows.", "Good", "400k", "Very Fast"],
  ["grok-4.5", "Grok 4.5", "xAI frontier model for coding, agentic tasks, and knowledge work.", "Highest", "500k", "Fast", "xai"],
  ["gemini-3-flash", "Gemini 3 Flash", "Fast default model for broad agent execution.", "Good", "1M", "Very Fast"],
  ["gemini-3-1-flash", "Gemini 3.1 Flash", "Fast Gemini tier for high-volume agent execution.", "Good", "1M", "Very Fast"],
  ["gemini-3-1-pro", "Gemini 3.1 Pro", "Long-context reasoning for deeper planning.", "High", "1M", "Fast"],
  ["deepseek-v4-pro", "DeepSeek V4 Pro", "DeepSeek flagship on Clawcode for agentic coding and long-context reasoning.", "High", "1M", "Fast"],
  ["deepseek-v4-flash", "DeepSeek V4 Flash", "Fast DeepSeek V4 model on Clawcode for efficient agent execution.", "High", "1M", "Very Fast"],
  ["minimax-m3", "MiniMax M3", "MiniMax long-context model via Cloudflare for efficient coding, tool use, and digital work.", "High", "1M", "Fast", "minimax"],
  ["kimi-k2.6", "Kimi K2.6", "Moonshot flagship via Cloudflare Workers AI for long-horizon coding.", "High", "262k", "Fast", "kimi"],
  ["kimi-k2.7-code", "Kimi K2.7 Code", "Moonshot coding model via Cloudflare Workers AI for long-horizon software engineering.", "High", "262k", "Fast", "kimi"],
  ["glm-5.2", "ZAI GLM 5.2", "Z.ai flagship agentic coding model via Cloudflare Workers AI.", "Highest", "262k", "Very Fast", "zai"],
  ["qwen3.5-397b-a17b", "Qwen 3.5 397B A17B", "Alibaba Qwen mixture-of-experts model for reasoning, coding, and multimodal agent work.", "High", "262k", "Fast", "qwen"],
];

export const FALLBACK_AGENT_MODELS: readonly ModelCatalogRow[] = Object.freeze(
  AGENT_SEEDS.map(([
    id,
    label,
    description,
    intelligence,
    contextWindow,
    speed,
    providerType,
  ]) => Object.freeze({
    id,
    label,
    description,
    intelligence,
    contextWindow,
    speed,
    ...(providerType ? { providerType } : {}),
    category: "agent" as const,
    source: "managed",
  })),
);

export const AGENT_MODEL_PRICING: Readonly<Record<string, AgentPrice>> =
  Object.freeze({
    "claude-haiku-4-5": { input: 1, cached: 0.1, output: 5 },
    "claude-sonnet-4-5": { input: 3, cached: 0.3, output: 15 },
    "claude-opus-4-6": { input: 5, cached: 0.5, output: 25 },
    "claude-opus-4-7": { input: 5, cached: 0.5, output: 25 },
    "claude-opus-4-8": { input: 5, cached: 0.5, output: 25 },
    "gpt-5.5-pro": { input: 30, cached: null, output: 180 },
    "gpt-5.5": { input: 5, cached: 0.5, output: 30 },
    "gpt-5.4": { input: 2.5, cached: 0.25, output: 15 },
    "gpt-5.4-mini": { input: 0.75, cached: 0.075, output: 4.5 },
    "gpt-5.4-nano": { input: 0.2, cached: 0.02, output: 1.25 },
    "grok-4.5": { input: 2, cached: 2, output: 6 },
    "gemini-3-flash": { input: 0.5, cached: 0.05, output: 3 },
    "gemini-3-1-flash": { input: 0.5, cached: 0.05, output: 3 },
    "gemini-3-1-pro": { input: 2, cached: 0.2, output: 12 },
    "deepseek-v4-pro": { input: 0.435, cached: 0.003625, output: 0.87 },
    "deepseek-v4-flash": { input: 0.14, cached: 0.0028, output: 0.28 },
    "minimax-m3": { input: 0.6, cached: 0.12, output: 2.4 },
    "kimi-k2.6": { input: 0.95, cached: 0.16, output: 4 },
    "kimi-k2.7-code": { input: 0.95, cached: 0.19, output: 4 },
    "glm-5.2": { input: 1.4, cached: 0.26, output: 4.4 },
    "qwen3.5-397b-a17b": { input: 0.6, cached: 0.6, output: 3.6 },
  });

export const AGENT_MODEL_TPS: Readonly<Record<string, number | null>> =
  Object.freeze({
    "claude-haiku-4-5": 97.7,
    "claude-sonnet-4-5": 41.9,
    "claude-opus-4-6": 39.4,
    "claude-opus-4-7": 56.4,
    "claude-opus-4-8": 58.3,
    "gpt-5.5-pro": null,
    "gpt-5.5": 95.6,
    "gpt-5.4": 174.5,
    "gpt-5.4-mini": 180.6,
    "gpt-5.4-nano": 147,
    "grok-4.5": 85,
    "gemini-3-flash": 176.9,
    "gemini-3-1-flash": 176.9,
    "gemini-3-1-pro": 132.2,
    "deepseek-v4-pro": 46,
    "deepseek-v4-flash": 116.4,
    "minimax-m3": 41.1,
    "kimi-k2.6": 60.1,
    "kimi-k2.7-code": null,
    "glm-5.2": 206.8,
    "qwen3.5-397b-a17b": 137.9,
  });

export const STATIC_IMAGE_MODELS: readonly ModelCatalogRow[] = Object.freeze([
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    provider: "OpenAI",
    description: "Highest-fidelity OpenAI image generation and editing.",
    mode: "Image generation and editing",
    contextWindow: "Auto",
    speed: "Fast",
    pricingLabel: "Quality-based pricing",
    pricingRank: 10.56,
    category: "image",
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Gemini 3.1 Flash Image",
    provider: "Google DeepMind",
    description: "Fast multimodal image generation and editing preview.",
    mode: "Image generation and editing",
    contextWindow: "Auto",
    speed: "Very Fast",
    pricingLabel: "$0.07 / image",
    pricingRank: 7,
    category: "image",
  },
]);

export const STATIC_VIDEO_MODELS: readonly ModelCatalogRow[] = Object.freeze([
  {
    id: "grok-imagine-video",
    label: "Grok Imagine Video",
    provider: "xAI",
    description: "Imaginative video generation and stylized motion clips.",
    maxDuration: "15s",
    resolutions: "480p, 720p",
    inputModalities: "Text, Image, Video",
    pricingLabel: "$0.055 / sec",
    pricingRank: 5.5,
    category: "video",
  },
  {
    id: "seedance-2.0-fast",
    label: "Seedance 2.0 Fast",
    provider: "ByteDance",
    description: "Fast video generation with reference media support.",
    maxDuration: "12s",
    resolutions: "480p, 720p",
    inputModalities: "Text, Image, Video",
    pricingLabel: "$0.088 / sec",
    pricingRank: 8.8,
    category: "video",
  },
  {
    id: "seedance-2.0",
    label: "Seedance 2.0",
    provider: "ByteDance",
    description: "Higher-quality video generation with 1080p output support.",
    maxDuration: "12s",
    resolutions: "480p, 720p, 1080p",
    inputModalities: "Text, Image, Video",
    pricingLabel: "Resolution-based pricing",
    pricingRank: 24.2,
    category: "video",
  },
]);

export const STATIC_RESEARCH_MODELS: readonly ModelCatalogRow[] =
  Object.freeze([
    {
      id: "gemini-3-flash-preview",
      label: "Gemini 3.1 Flash",
      provider: "Google",
      description: "Faster deep research path tuned for speed and lower cost.",
      mode: "Fast research",
      contextWindow: "Web, files, sources",
      speed: "Very Fast",
      pricingLabel: "Lower cost / research run",
      pricingRank: 1,
      category: "deep_research",
    },
    {
      id: "gemini-3-pro-preview",
      label: "Gemini 3.1 Pro",
      provider: "Google",
      description: "Higher-depth deep research path tuned for stronger coverage.",
      mode: "Higher-depth research",
      contextWindow: "Web, files, sources",
      speed: "Fast",
      pricingLabel: "Higher cost / research run",
      pricingRank: 2,
      category: "deep_research",
    },
  ]);

export const MODEL_PROVIDER_ICONS: Readonly<
  Record<string, ModelOverviewProviderIcon>
> = Object.freeze({
  anthropic: {
    src: "/img/05-model-provider-icons/claude.png",
    alt: "Anthropic",
  },
  google: {
    src: "/img/05-model-provider-icons/gemini.png",
    alt: "Google",
  },
  openai: {
    src: "/img/05-model-provider-icons/openai.svg",
    alt: "OpenAI",
    className: "is-openai",
  },
  xai: {
    src: "/img/05-model-provider-icons/xai.svg",
    alt: "xAI",
    className: "is-openai",
  },
  deepseek: {
    src: "/img/05-model-provider-icons/deepseek.png",
    alt: "DeepSeek",
  },
  minimax: {
    src: "/img/05-model-provider-icons/minimax.svg",
    alt: "MiniMax",
  },
  kimi: {
    src: "/img/05-model-provider-icons/kimi.png",
    alt: "Moonshot",
  },
  zai: {
    src: "/img/05-model-provider-icons/zai.webp",
    alt: "ZAI",
  },
  qwen: {
    src: "/img/05-model-provider-icons/qwen.svg",
    alt: "Qwen",
    className: "is-openai",
  },
  bytedance: {
    src: "/img/05-model-provider-icons/bytedance.svg",
    alt: "ByteDance",
  },
});

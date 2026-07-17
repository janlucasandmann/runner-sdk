import {
  Brain as LucideBrain,
  Calculator as LucideCalculator,
  Calendar as LucideCalendar,
  Cloud as LucideCloud,
  Code as LucideCode,
  Cpu as LucideCpu,
  Database as LucideDatabase,
  FileText as LucideFileText,
  GitBranch as LucideGitBranch,
  Globe as LucideGlobe,
  ImageIcon as LucideImageIcon,
  ListTodo as LucideListTodo,
  Mail as LucideMail,
  MessageSquare as LucideMessageSquare,
  Monitor as LucideMonitor,
  Package as LucidePackage,
  Palette as LucidePalette,
  PenTool as LucidePenTool,
  Server as LucideServer,
  Shield as LucideShield,
  Sparkles as LucideSparkles,
  Telescope as LucideTelescope,
  Terminal as LucideTerminal,
  Wand2 as LucideWand2,
  Zap as LucideZap,
} from "lucide-react";

export interface RunnerChatSkill {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  icon?: string | null;
  isCustom?: boolean;
}

export interface RunnerChatSkillDefaults {
  deepResearch?: {
    model?: string;
  };
  imageGeneration?: {
    model?: string;
    quality?: string;
    computeTokensPerImage?: number;
  };
  videoGeneration?: {
    model?: string;
  };
}

export const DEFAULT_COMPUTER_AGENT_SKILLS: RunnerChatSkill[] = [
  { id: "image_generation", name: "Image Generation", enabled: true },
  { id: "video_generation", name: "Video Generation", enabled: true },
  { id: "web_search", name: "Web Search", enabled: true },
  { id: "deep_research", name: "Deep Research", enabled: true },
  { id: "browser", name: "Browser", enabled: true },
  { id: "pdf", name: "Document Parsing", enabled: true },
  { id: "frontend_design", name: "Frontend Design", enabled: true },
  { id: "pptx", name: "PowerPoint/PPTX", enabled: true },
  { id: "memory", name: "Memory", enabled: true },
  { id: "task_management", name: "Task Management", enabled: true },
  { id: "computer_agents", name: "Computer Agents", enabled: true },
  { id: "email", name: "Email", enabled: true },
];

const DEFAULT_ENABLED_SKILL_IDS = [
  "image_generation",
  "video_generation",
  "web_search",
  "deep_research",
  "browser",
  "memory",
  "task_management",
  "computer_agents",
  "email",
] as const;

const RUNNER_CHAT_SKILL_ID_ALIASES: Record<string, string> = {
  videoGeneration: "video_generation",
  video_generation: "video_generation",
  "video-generation": "video_generation",
  deepResearch: "deep_research",
  deep_research: "deep_research",
  "deep-research": "deep_research",
  research: "deep_research",
  documentParsing: "pdf",
  document_parsing: "pdf",
  "document-parsing": "pdf",
  parse: "pdf",
  gmail: "email",
  mail: "email",
};

const RUNNER_CHAT_ENABLED_SKILLS_STORAGE_KEY_PREFIX = "tb_runner_chat_enabled_skills_v3";

export function normalizeRunnerSkillId(skillId: unknown): string {
  const rawSkillId = String(skillId || "").trim();
  return RUNNER_CHAT_SKILL_ID_ALIASES[rawSkillId] || rawSkillId;
}

export function normalizeComputerAgentSkills(skills: RunnerChatSkill[]): RunnerChatSkill[] {
  const input = skills.length > 0 ? skills : DEFAULT_COMPUTER_AGENT_SKILLS;
  const normalizedInput = input
    .filter((skill): skill is RunnerChatSkill => Boolean(skill?.id))
    .map((skill) => ({
      ...skill,
      id: normalizeRunnerSkillId(skill.id),
    }))
    .filter((skill) => skill.id);
  const byId = new Map(normalizedInput.map((skill) => [skill.id, skill] as const));
  const core = DEFAULT_COMPUTER_AGENT_SKILLS.map((skill) => ({
    ...skill,
    ...byId.get(skill.id),
  }));
  const coreIds = new Set(DEFAULT_COMPUTER_AGENT_SKILLS.map((skill) => skill.id));
  const custom = normalizedInput.filter((skill) => !coreIds.has(skill.id));
  return [...core, ...custom];
}

export function buildEnabledSkillsStorageKey(appId: string): string {
  return `${RUNNER_CHAT_ENABLED_SKILLS_STORAGE_KEY_PREFIX}:${appId || "runner-web-sdk"}`;
}

export function loadPersistedEnabledSkillIds(storageKey: string): string[] | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const normalized = parsed
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map(normalizeRunnerSkillId);
    return normalized.length > 0 ? [...new Set(normalized)] : [];
  } catch {
    return null;
  }
}

export function normalizeEnabledSkillIdList(
  skillIds?: string[] | null,
): string[] | null {
  if (!Array.isArray(skillIds)) {
    return null;
  }
  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const skillId of skillIds) {
    const normalizedSkillId = normalizeRunnerSkillId(skillId);
    if (!normalizedSkillId || seen.has(normalizedSkillId)) {
      continue;
    }
    seen.add(normalizedSkillId);
    normalized.push(normalizedSkillId);
  }
  return normalized;
}

export function persistEnabledSkillIds(storageKey: string, skillIds: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...new Set(skillIds)]));
  } catch {
    // Persistence is opportunistic; the in-memory selector remains usable.
  }
}

export function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}

export function defaultEnabledSkillIds(skills: RunnerChatSkill[]): string[] {
  const defaultIds = new Set<string>(DEFAULT_ENABLED_SKILL_IDS);
  return skills
    .filter((skill) => !skill.isCustom && defaultIds.has(skill.id))
    .map((skill) => skill.id);
}

export function customSkillIconComponent(icon?: string | null) {
  const iconKey = (icon || "default").toLowerCase();
  const iconMap = {
    default: LucideWand2,
    sparkles: LucideSparkles,
    brain: LucideBrain,
    zap: LucideZap,
    telescope: LucideTelescope,
    search: LucideGlobe,
    image: LucideImageIcon,
    code: LucideCode,
    terminal: LucideTerminal,
    "file-text": LucideFileText,
    database: LucideDatabase,
    "pen-tool": LucidePenTool,
    palette: LucidePalette,
    message: LucideMessageSquare,
    mail: LucideMail,
    calendar: LucideCalendar,
    calculator: LucideCalculator,
    shield: LucideShield,
    lock: LucideShield,
    cloud: LucideCloud,
    server: LucideServer,
    cpu: LucideCpu,
    monitor: LucideMonitor,
    git: LucideGitBranch,
    package: LucidePackage,
    list: LucideListTodo,
  } as const;
  return iconMap[iconKey as keyof typeof iconMap] || LucideWand2;
}

export function buildEnabledSkillsPayload(
  enabledSkillIds: string[],
  displayedSkills: RunnerChatSkill[],
  skillDefaults?: RunnerChatSkillDefaults,
): Record<string, unknown> {
  const enabled = new Set(enabledSkillIds);
  const defaultSkillMap: Record<string, string> = {
    image_generation: "imageGeneration",
    video_generation: "videoGeneration",
    web_search: "webSearch",
    deep_research: "deepResearch",
    browser: "browser",
    pdf: "pdf",
    frontend_design: "frontendDesign",
    pptx: "pptx",
    memory: "memory",
    task_management: "taskManagement",
    email: "email",
  };

  const payload: Record<string, unknown> = {};
  for (const [id, key] of Object.entries(defaultSkillMap)) {
    payload[key] = enabled.has(id);
  }
  payload.documentParsing = enabled.has("pdf");

  if (enabled.has("image_generation") && skillDefaults?.imageGeneration) {
    const imageGeneration = skillDefaults.imageGeneration;
    const normalizedModel =
      typeof imageGeneration.model === "string" ? imageGeneration.model.trim() : "";
    const normalizedQuality =
      typeof imageGeneration.quality === "string" ? imageGeneration.quality.trim() : "";
    const normalizedComputeTokens = Number(imageGeneration.computeTokensPerImage);
    const imageGenerationConfig: Record<string, unknown> = {};
    if (normalizedModel) {
      imageGenerationConfig.model = normalizedModel;
      payload.imageGenerationModel = normalizedModel;
    }
    if (normalizedQuality) {
      imageGenerationConfig.quality = normalizedQuality;
      payload.imageGenerationQuality = normalizedQuality;
    }
    if (Number.isFinite(normalizedComputeTokens) && normalizedComputeTokens > 0) {
      const computeTokensPerImage = Math.max(0, Math.round(normalizedComputeTokens));
      imageGenerationConfig.computeTokensPerImage = computeTokensPerImage;
      payload.imageGenerationComputeTokensPerImage = computeTokensPerImage;
    }
    if (Object.keys(imageGenerationConfig).length > 0) {
      payload.imageGenerationConfig = imageGenerationConfig;
    }
  }

  if (enabled.has("video_generation") && skillDefaults?.videoGeneration) {
    const normalizedModel =
      typeof skillDefaults.videoGeneration.model === "string"
        ? skillDefaults.videoGeneration.model.trim()
        : "";
    if (normalizedModel) {
      payload.videoGenerationModel = normalizedModel;
      payload.videoGenerationConfig = { model: normalizedModel };
    }
  }

  if (enabled.has("deep_research") && skillDefaults?.deepResearch) {
    const normalizedModel =
      typeof skillDefaults.deepResearch.model === "string"
        ? skillDefaults.deepResearch.model.trim()
        : "";
    if (normalizedModel) {
      payload.deepResearchModel = normalizedModel;
      payload.deepResearchConfig = { model: normalizedModel };
    }
  }

  if (enabled.has("computer_agents")) {
    payload.computerAgents = true;
  }

  const customSkills = displayedSkills
    .filter((skill) => skill.isCustom)
    .map((skill) => skill.id)
    .filter((id) => enabled.has(id));
  if (customSkills.length > 0) {
    payload.customSkills = customSkills;
  }

  return payload;
}

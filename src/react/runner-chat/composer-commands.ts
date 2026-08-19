import {
  getRecordNumber,
  getRecordString,
  normalizeRecordObject,
} from "./record-utils.js";

interface BaseStagedBacklogCommand {
  label: string;
}

export interface StagedBacklogSubtaskCommand extends BaseStagedBacklogCommand {
  action: "subtask";
  ticketNumber: string;
}

export interface StagedBacklogMissionControlCommand extends BaseStagedBacklogCommand {
  action: "mission_control";
}

export type StagedBacklogCommand =
  | StagedBacklogSubtaskCommand
  | StagedBacklogMissionControlCommand;

export type RunnerResourceCreationCommandType = "computer" | "app" | "function";
export type RunnerAgentCreationCommandType = "agent" | "team";
export type RunnerSkillCreationCommandType = "skill";
export type RunnerAdCreationStyleId = "clean" | "bold" | "premium" | "social";
export type RunnerAdCreationQualityId = "low" | "medium" | "high";
export type RunnerAdCreationAspectRatioId = "1:1" | "4:5" | "9:16" | "16:9";
export type RunnerAdCreationVariantCount = 1 | 2 | 4;

export interface RunnerAdCreationSettings {
  style: RunnerAdCreationStyleId;
  quality: RunnerAdCreationQualityId;
  aspectRatio: RunnerAdCreationAspectRatioId;
  variants: RunnerAdCreationVariantCount;
}

export const RUNNER_AD_CREATION_DEFAULT_SETTINGS: RunnerAdCreationSettings = {
  style: "premium",
  quality: "medium",
  aspectRatio: "1:1",
  variants: 1,
};

export const RUNNER_AD_STYLE_OPTIONS: Array<{
  id: RunnerAdCreationStyleId;
  label: string;
  description: string;
}> = [
  { id: "premium", label: "Premium", description: "Polished brand ad" },
  { id: "bold", label: "Bold", description: "High contrast campaign" },
  { id: "clean", label: "Clean", description: "Minimal product focus" },
  { id: "social", label: "Social", description: "Native feed creative" },
];

export const RUNNER_AD_QUALITY_OPTIONS: Array<{
  id: RunnerAdCreationQualityId;
  label: string;
  description: string;
  outputTokens: number;
}> = [
  { id: "low", label: "Low", description: "Fast draft", outputTokens: 272 },
  { id: "medium", label: "Medium", description: "Balanced detail", outputTokens: 1056 },
  { id: "high", label: "High", description: "Highest detail", outputTokens: 4160 },
];

export const RUNNER_AD_ASPECT_RATIO_OPTIONS: Array<{
  id: RunnerAdCreationAspectRatioId;
  label: string;
  description: string;
}> = [
  { id: "1:1", label: "1:1", description: "Square" },
  { id: "4:5", label: "4:5", description: "Social feed" },
  { id: "9:16", label: "9:16", description: "Story" },
  { id: "16:9", label: "16:9", description: "Wide" },
];

export const RUNNER_AD_VARIANT_OPTIONS: Array<{
  id: RunnerAdCreationVariantCount;
  label: string;
  description: string;
}> = [
  { id: 1, label: "1", description: "Single concept" },
  { id: 2, label: "2", description: "Two variants" },
  { id: 4, label: "4", description: "Small set" },
];

export interface StagedResourceCreationCommand extends BaseStagedBacklogCommand {
  action: RunnerResourceCreationCommandType;
}

export interface StagedAgentCreationCommand extends BaseStagedBacklogCommand {
  action: RunnerAgentCreationCommandType;
}

export interface StagedSkillCreationCommand extends BaseStagedBacklogCommand {
  action: RunnerSkillCreationCommandType;
}

export interface StagedSlideCreationCommand extends BaseStagedBacklogCommand {
  action: "slides";
}

export interface StagedResearchCreationCommand extends BaseStagedBacklogCommand {
  action: "research";
}

export interface StagedScrapeCreationCommand extends BaseStagedBacklogCommand {
  action: "scrape";
}

export interface StagedParseCreationCommand extends BaseStagedBacklogCommand {
  action: "parse";
}

export interface StagedBatchCreationCommand extends BaseStagedBacklogCommand {
  action: "batch";
}

export interface StagedAdCreationCommand extends BaseStagedBacklogCommand {
  action: "ad";
  style?: RunnerAdCreationStyleId;
  quality?: RunnerAdCreationQualityId;
  aspectRatio?: RunnerAdCreationAspectRatioId;
  variants?: RunnerAdCreationVariantCount;
  computeTokensPerImage?: number;
}

export interface RunnerSlashCommandInputState {
  query: string;
  prompt: string;
}

export const RUNNER_COMPUTE_TOKENS_PER_DOLLAR = 100;
const RUNNER_AD_GPT_IMAGE_2_OUTPUT_USD_PER_MILLION = 30;

export function normalizeRunnerAdCreationSettings(
  value?: Partial<RunnerAdCreationSettings> | null
): RunnerAdCreationSettings {
  const style = RUNNER_AD_STYLE_OPTIONS.some((option) => option.id === value?.style)
    ? value?.style
    : RUNNER_AD_CREATION_DEFAULT_SETTINGS.style;
  const quality = RUNNER_AD_QUALITY_OPTIONS.some((option) => option.id === value?.quality)
    ? value?.quality
    : RUNNER_AD_CREATION_DEFAULT_SETTINGS.quality;
  const aspectRatio = RUNNER_AD_ASPECT_RATIO_OPTIONS.some((option) => option.id === value?.aspectRatio)
    ? value?.aspectRatio
    : RUNNER_AD_CREATION_DEFAULT_SETTINGS.aspectRatio;
  const variants = RUNNER_AD_VARIANT_OPTIONS.some((option) => option.id === value?.variants)
    ? value?.variants
    : RUNNER_AD_CREATION_DEFAULT_SETTINGS.variants;

  return {
    style: style || RUNNER_AD_CREATION_DEFAULT_SETTINGS.style,
    quality: quality || RUNNER_AD_CREATION_DEFAULT_SETTINGS.quality,
    aspectRatio: aspectRatio || RUNNER_AD_CREATION_DEFAULT_SETTINGS.aspectRatio,
    variants: variants || RUNNER_AD_CREATION_DEFAULT_SETTINGS.variants,
  };
}

export function getRunnerAdCreationQualityComputeTokensPerImage(
  quality: RunnerAdCreationQualityId
): number {
  const option =
    RUNNER_AD_QUALITY_OPTIONS.find((entry) => entry.id === quality) ||
    RUNNER_AD_QUALITY_OPTIONS[1];
  const dollars =
    ((option?.outputTokens || 0) / 1_000_000) *
    RUNNER_AD_GPT_IMAGE_2_OUTPUT_USD_PER_MILLION;
  return Math.max(1, Math.round(dollars * RUNNER_COMPUTE_TOKENS_PER_DOLLAR));
}

export function formatRunnerAdCreationComputeTokens(value: number): string {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return "$0.00";
  }
  const dollars = normalized / RUNNER_COMPUTE_TOKENS_PER_DOLLAR;
  const smallValue = dollars > 0 && dollars < 0.01;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: smallValue ? 4 : 2,
    maximumFractionDigits: smallValue ? 4 : 2,
  }).format(dollars);
}

export function buildStagedRunnerAdCreationCommand(
  settings?: Partial<RunnerAdCreationSettings> | null
): StagedAdCreationCommand {
  const normalizedSettings = normalizeRunnerAdCreationSettings(settings);
  return {
    action: "ad",
    label: buildRunnerAdCreationLabel(),
    ...normalizedSettings,
    computeTokensPerImage: getRunnerAdCreationQualityComputeTokensPerImage(
      normalizedSettings.quality
    ),
  };
}

export function buildRunnerAdEnabledSkillsPayload(
  adCreationCommand: StagedAdCreationCommand | null | undefined,
  enabledSkills: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!adCreationCommand) {
    return enabledSkills;
  }
  const settings = normalizeRunnerAdCreationSettings(adCreationCommand);
  const computeTokensPerImage =
    getRunnerAdCreationQualityComputeTokensPerImage(settings.quality);
  return {
    ...(enabledSkills || {}),
    imageGeneration: true,
    imageGenerationModel: "gpt-image-2",
    imageGenerationQuality: settings.quality,
    imageGenerationComputeTokensPerImage: computeTokensPerImage,
    imageGenerationConfig: {
      ...(
        enabledSkills &&
        typeof enabledSkills.imageGenerationConfig === "object" &&
        enabledSkills.imageGenerationConfig &&
        !Array.isArray(enabledSkills.imageGenerationConfig)
          ? (enabledSkills.imageGenerationConfig as Record<string, unknown>)
          : {}
      ),
      model: "gpt-image-2",
      quality: settings.quality,
      computeTokensPerImage,
    },
  };
}

export function buildRunnerScrapeEnabledSkillsPayload(
  scrapeCreationCommand: StagedScrapeCreationCommand | null | undefined,
  enabledSkills: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!scrapeCreationCommand) {
    return enabledSkills;
  }
  return {
    ...(enabledSkills || {}),
    webSearch: true,
  };
}

export function buildRunnerParseEnabledSkillsPayload(
  parseCreationCommand: StagedParseCreationCommand | null | undefined,
  enabledSkills: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!parseCreationCommand) {
    return enabledSkills;
  }
  return {
    ...(enabledSkills || {}),
    pdf: true,
    documentParsing: true,
  };
}

export function normalizeSlideCreationCommandFromMetadata(
  logMetadata: unknown
): StagedSlideCreationCommand | null {
  const metadata = normalizeRecordObject(logMetadata);
  if (!metadata) {
    return null;
  }

  const commandRecord = normalizeRecordObject(metadata.slideCreationCommand);
  if (commandRecord) {
    const action = getRecordString(commandRecord, ["action", "type"]).trim().toLowerCase();
    const label = getRecordString(commandRecord, ["label", "command"]).trim().toLowerCase();
    if (action === "slides" || label === "/slides") {
      return { action: "slides", label: buildRunnerSlideCreationLabel() };
    }
  }

  const mode = getRecordString(
    metadata,
    ["composerMode", "mode", "slashCommand", "command"]
  ).trim().toLowerCase();
  if (mode === "slides" || mode === "/slides") {
    return { action: "slides", label: buildRunnerSlideCreationLabel() };
  }

  return null;
}

export function normalizeResearchCreationCommandFromMetadata(
  logMetadata: unknown
): StagedResearchCreationCommand | null {
  const metadata = normalizeRecordObject(logMetadata);
  if (!metadata) {
    return null;
  }

  const commandRecord = normalizeRecordObject(metadata.researchCreationCommand);
  if (commandRecord) {
    const action = getRecordString(commandRecord, ["action", "type"]).trim().toLowerCase();
    const label = getRecordString(commandRecord, ["label", "command"]).trim().toLowerCase();
    if (action === "research" || label === "/research") {
      return { action: "research", label: buildRunnerResearchCreationLabel() };
    }
  }

  const mode = getRecordString(
    metadata,
    ["composerMode", "mode", "slashCommand", "command"]
  ).trim().toLowerCase();
  if (mode === "research" || mode === "/research") {
    return { action: "research", label: buildRunnerResearchCreationLabel() };
  }

  return null;
}

export function normalizeScrapeCreationCommandFromMetadata(
  logMetadata: unknown
): StagedScrapeCreationCommand | null {
  const metadata = normalizeRecordObject(logMetadata);
  if (!metadata) {
    return null;
  }

  const commandRecord = normalizeRecordObject(metadata.scrapeCreationCommand);
  if (commandRecord) {
    const action = getRecordString(commandRecord, ["action", "type"]).trim().toLowerCase();
    const label = getRecordString(commandRecord, ["label", "command"]).trim().toLowerCase();
    if (action === "scrape" || label === "/scrape") {
      return { action: "scrape", label: buildRunnerScrapeCreationLabel() };
    }
  }

  const mode = getRecordString(
    metadata,
    ["composerMode", "mode", "slashCommand", "command"]
  ).trim().toLowerCase();
  if (mode === "scrape" || mode === "/scrape") {
    return { action: "scrape", label: buildRunnerScrapeCreationLabel() };
  }

  return null;
}

export function normalizeParseCreationCommandFromMetadata(
  logMetadata: unknown
): StagedParseCreationCommand | null {
  const metadata = normalizeRecordObject(logMetadata);
  if (!metadata) {
    return null;
  }

  const commandRecord = normalizeRecordObject(metadata.parseCreationCommand);
  if (commandRecord) {
    const action = getRecordString(commandRecord, ["action", "type"]).trim().toLowerCase();
    const label = getRecordString(commandRecord, ["label", "command"]).trim().toLowerCase();
    if (action === "parse" || label === "/parse") {
      return { action: "parse", label: buildRunnerParseCreationLabel() };
    }
  }

  const mode = getRecordString(
    metadata,
    ["composerMode", "mode", "slashCommand", "command"]
  ).trim().toLowerCase();
  if (mode === "parse" || mode === "/parse") {
    return { action: "parse", label: buildRunnerParseCreationLabel() };
  }

  return null;
}

export function normalizeAdCreationCommandFromMetadata(
  logMetadata: unknown
): StagedAdCreationCommand | null {
  const metadata = normalizeRecordObject(logMetadata);
  if (!metadata) {
    return null;
  }

  const commandRecord = normalizeRecordObject(metadata.adCreationCommand);
  if (commandRecord) {
    const action = getRecordString(commandRecord, ["action", "type"]).trim().toLowerCase();
    const label = getRecordString(commandRecord, ["label", "command"]).trim().toLowerCase();
    if (action === "ad" || label === "/ad") {
      const variants = getRecordNumber(commandRecord, [
        "variants",
        "variantCount",
        "variant_count",
      ]);
      return buildStagedRunnerAdCreationCommand({
        style: getRecordString(commandRecord, ["style"]) as RunnerAdCreationStyleId,
        quality: getRecordString(commandRecord, ["quality"]) as RunnerAdCreationQualityId,
        aspectRatio: getRecordString(commandRecord, [
          "aspectRatio",
          "aspect_ratio",
        ]) as RunnerAdCreationAspectRatioId,
        variants: (variants as RunnerAdCreationVariantCount | null) || undefined,
      });
    }
  }

  const mode = getRecordString(
    metadata,
    ["composerMode", "mode", "slashCommand", "command"]
  ).trim().toLowerCase();
  if (mode === "ad" || mode === "/ad") {
    return buildStagedRunnerAdCreationCommand();
  }

  return null;
}

export function normalizeRunnerBacklogTicketNumber(value: string): string {
  const digits = String(value || "").replace(/\D+/g, "");
  if (!digits) {
    return "";
  }
  return digits.slice(-3).padStart(3, "0");
}

export function buildRunnerBacklogSubtaskLabel(ticketNumber: string): string {
  const normalizedTicketNumber = normalizeRunnerBacklogTicketNumber(ticketNumber);
  return normalizedTicketNumber
    ? `Subtask to ${normalizedTicketNumber}`
    : "Subtask";
}

export function buildRunnerMissionControlLabel(): string {
  return "Mission Control";
}

export function buildRunnerResourceCreationLabel(
  commandType: RunnerResourceCreationCommandType
): string {
  return `/${commandType}`;
}

export function buildRunnerAgentCreationLabel(
  commandType: RunnerAgentCreationCommandType
): string {
  return `/${commandType}`;
}

export function buildRunnerSkillCreationLabel(
  commandType: RunnerSkillCreationCommandType
): string {
  return `/${commandType}`;
}

export function buildRunnerSlideCreationLabel(): string {
  return "/slides";
}

export function buildRunnerSlideCreationHiddenPrompt(): string {
  return [
    "The user selected /slides. Treat the visible user request as a request to create PowerPoint-ready slide output.",
    "Use the image generation skill whenever a visual slide, slide background, diagram, illustration, or polished slide image would improve the result.",
    "Produce very high quality 16:9 slide assets suitable for use in PowerPoint: clear information hierarchy, crisp readable typography, strong spacing, consistent styling, and presentation-ready composition.",
    "If the user asks for multiple slides, create a coherent slide set with consistent visual language and clear filenames. Save generated slide assets in the workspace when possible, and summarize what was created.",
  ].join("\n");
}

export function buildRunnerResearchCreationLabel(): string {
  return "/research";
}

export function buildRunnerResearchCreationHiddenPrompt(): string {
  return [
    "The user selected /research. Treat the visible user request as a request for rigorous research.",
    "Use the research or deep research skill whenever it is available and appropriate. Prefer primary sources, collect concrete facts, and keep a clear source trail.",
    "Create a well-structured research summary file in the workspace with concise findings, methodology, sources, and next-step recommendations.",
    "Include supporting images in the report by default. If research produces images, charts, diagrams, screenshots, or generated visual summaries, embed them directly in the markdown report instead of only listing them separately.",
    "Use the image generation skill when useful to create supporting images, charts, diagrams, or visual summaries for the research file. Save generated assets with clear filenames and reference them from the summary.",
    "When embedding local workspace images in markdown, use either a path relative to the report file or a workspace-absolute path such as /workspace/research/image.png so the report preview can resolve the image.",
  ].join("\n");
}

export function buildRunnerScrapeCreationLabel(): string {
  return "/scrape";
}

export function buildRunnerScrapeCreationHiddenPrompt(): string {
  return [
    "The user selected /scrape. Treat the visible user request as a request to use Firecrawl-backed web search and scraping.",
    "Use the web-search skill's Firecrawl functionality. Start with the native WebSearch tool when you need to discover URLs; it is backed by Firecrawl and returns cited web or news sources plus images when available.",
    "For the most relevant result pages, follow up with Firecrawl scrape via `python3 /workspace/.claude/skills/web-search/scripts/web-search.py --scrape-url \"https://example.com/page\"` to read clean markdown.",
    "If the user asks for structured fields, tables, products, pricing, contact details, or extracted data, use JSON extraction mode with `--json-prompt` and a concise schema when useful.",
    "Use location, category, include domains, and exclude domains naturally when the user request benefits from those filters. Cite source URLs and summarize which pages were scraped.",
    "Do not write ad hoc scraping code unless Firecrawl is unavailable.",
  ].join("\n");
}

export function buildRunnerParseCreationLabel(): string {
  return "/parse";
}

export function buildRunnerBatchCreationLabel(): string {
  return "/Batch";
}

export function buildRunnerParseCreationHiddenPrompt(): string {
  return [
    "The user selected /parse. Treat the visible user request as a request to parse documents with the Document Parsing skill.",
    "Use the Firecrawl Parse utility for local or non-public documents: `python3 /workspace/.scripts/document-parse.py \"/path/to/document.pdf\"`.",
    "Use it for PDFs, DOCX, XLSX, HTML, DOC, ODT, RTF, scanned PDFs, forms, reports, invoices, contracts, and other document files.",
    "Return Markdown by default. If the user asks for fields, tables, invoices, contacts, entities, or other structured data, use `--json-prompt` or `--json-schema`.",
    "Use `--pdf-mode ocr` for scanned or image-only PDFs and `--max-pages` to bound very large documents.",
    "Do not write ad hoc document parsing, PDF extraction, OCR, or spreadsheet parsing code unless Firecrawl Parse is unavailable.",
  ].join("\n");
}

export function buildRunnerAdCreationLabel(): string {
  return "/ad";
}

export function buildRunnerAdCreationHiddenPrompt(
  command?: StagedAdCreationCommand | null
): string {
  const settings = normalizeRunnerAdCreationSettings(command || null);
  const styleLabel =
    RUNNER_AD_STYLE_OPTIONS.find((option) => option.id === settings.style)?.label ||
    settings.style;
  const aspectRatioLabel =
    RUNNER_AD_ASPECT_RATIO_OPTIONS.find(
      (option) => option.id === settings.aspectRatio
    )?.label || settings.aspectRatio;
  const qualityLabel =
    RUNNER_AD_QUALITY_OPTIONS.find((option) => option.id === settings.quality)?.label ||
    settings.quality;
  const computeTokensPerImage =
    getRunnerAdCreationQualityComputeTokensPerImage(settings.quality);
  return [
    "The user selected /ad. Treat the visible user request as a request to create a high quality advertisement.",
    `Ad generation settings: style ${styleLabel}, GPT Image 2 quality ${qualityLabel} (${formatRunnerAdCreationComputeTokens(computeTokensPerImage)} / image), aspect ratio ${aspectRatioLabel}, ${settings.variants} image variant${settings.variants === 1 ? "" : "s"}.`,
    "Use the image generation skill to produce a polished ad creative whenever possible. Prioritize strong visual hierarchy, clear product or offer focus, professional composition, readable typography, and production-ready brand feel.",
    "Respect the selected style, image quality, aspect ratio, and variant count unless the user's visible request explicitly overrides them.",
    "Create ad assets suitable for real campaign use. If the user does not specify a format, choose a practical primary format and mention any assumptions.",
    "Save generated ad images in the workspace with clear filenames, and summarize the creative direction, intended audience, format, and files created.",
  ].join("\n");
}

export function parseAutoStageBacklogSubtaskCommand(
  input: string
): { ticketNumber: string; prompt: string } | null {
  const match = input.match(/^\/subtask\s+(\d{3})(?:\s+([\s\S]*))$/i);
  if (!match) {
    return null;
  }
  const ticketNumber = normalizeRunnerBacklogTicketNumber(match[1] || "");
  if (!ticketNumber) {
    return null;
  }
  return { ticketNumber, prompt: match[2] || "" };
}

export function parseAutoStageBacklogMissionControlCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/mission-control(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function parseAutoStageResourceCreationCommand(
  input: string
): { action: RunnerResourceCreationCommandType; prompt: string } | null {
  const match = input.match(/^\/(computer|app|function)(?:\s+([\s\S]*))?$/i);
  if (!match) {
    return null;
  }
  const action = String(match[1] || "").trim().toLowerCase() as RunnerResourceCreationCommandType;
  if (action !== "computer" && action !== "app" && action !== "function") {
    return null;
  }
  return { action, prompt: match[2] || "" };
}

export function parseAutoStageAgentCreationCommand(
  input: string
): { action: RunnerAgentCreationCommandType; prompt: string } | null {
  const match = input.match(/^\/(agent|team)(?:\s+([\s\S]*))?$/i);
  if (!match) {
    return null;
  }
  const action = String(match[1] || "").trim().toLowerCase() as RunnerAgentCreationCommandType;
  if (action !== "agent" && action !== "team") {
    return null;
  }
  return { action, prompt: match[2] || "" };
}

export function parseAutoStageSkillCreationCommand(
  input: string
): { action: RunnerSkillCreationCommandType; prompt: string } | null {
  const match = input.match(/^\/(skill)(?:\s+([\s\S]*))?$/i);
  return match ? { action: "skill", prompt: match[2] || "" } : null;
}

export function parseAutoStageSlideCreationCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/slides(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function parseAutoStageResearchCreationCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/research(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function parseAutoStageScrapeCreationCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/scrape(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function parseAutoStageParseCreationCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/parse(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function parseAutoStageBatchCreationCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/batch(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function parseAutoStageAdCreationCommand(
  input: string
): { prompt: string } | null {
  const match = input.match(/^\/ad(?:\s+([\s\S]*))?$/i);
  return match ? { prompt: match[1] || "" } : null;
}

export function resolveRunnerSlashCommandInputState(
  input: string,
  cursorIndex: number
): RunnerSlashCommandInputState | null {
  const value = String(input || "");
  if (!value) {
    return null;
  }

  const cursor = Math.min(
    Math.max(
      0,
      Number.isFinite(cursorIndex) ? Math.round(cursorIndex) : value.length
    ),
    value.length
  );
  const slashIndex = value.slice(0, cursor).lastIndexOf("/");
  if (slashIndex < 0) {
    return null;
  }

  const tokenRemainder = value.slice(slashIndex + 1);
  const tokenSeparatorMatch = tokenRemainder.match(/\s/);
  const tokenEndIndex = tokenSeparatorMatch
    ? slashIndex + 1 + (tokenSeparatorMatch.index ?? 0)
    : value.length;
  if (cursor > tokenEndIndex) {
    return null;
  }

  const query = value
    .slice(slashIndex + 1, tokenEndIndex)
    .trim()
    .toLowerCase();
  const promptParts = [
    value.slice(0, slashIndex).trim(),
    value.slice(tokenEndIndex).trim(),
  ].filter(Boolean);

  return {
    query,
    prompt: promptParts.join(" "),
  };
}

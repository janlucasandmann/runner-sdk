import { useMemo, useState } from "react";
import { Code2, FileSearch, Globe } from "lucide-react";
import type { RunnerLog } from "../../types.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  type RunnerPreviewAttachment,
  type RunnerWebSearchPreviewData,
} from "../runner-document-preview.js";
import { stripRunnerSystemTags } from "../runner-markdown.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import { buildCompactLogPreviewId } from "./preview-id.js";
import { parseStructuredCommandExecutionOutput } from "./structured-command-output.js";

type WebSearchResult = { url: string; title: string; domain?: string; snippet?: string; thumbnail?: string };
type WebSearchImage = { url: string; thumbnail?: string; title?: string; source?: string };

export function isWebSearchCommand(command?: string): boolean {
  if (!command) return false;
  if (isWebScrapeCommand(command)) return false;
  return (
    command.includes("/workspace/.scripts/web-search.py") ||
    command.includes("web-search.py") ||
    command.includes(".claude/skills/web-search/") ||
    /^searching web:\s+/i.test(command.trim())
  );
}

export function isWebSearchOutput(output?: string): boolean {
  if (!output) return false;
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(output);
  const candidate = structuredCommandOutput
    ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
    : output;
  return (
    candidate.includes("Web search results for query:") ||
    candidate.includes("Links: [{") ||
    (/(?:^|\n)##?\s*Search Results/i.test(candidate) && /(?:^|\n)##?\s*Sources/i.test(candidate)) ||
    (candidate.includes("SUMMARY:") && candidate.includes("SOURCES:")) ||
    (/^\s*\{[\s\S]*"query"\s*:\s*".+?"[\s\S]*"results"\s*:/i.test(candidate))
  );
}

function extractSearchQuery(command?: string): string | null {
  if (!command) return null;
  const searchingWeb = command.match(/^searching web:\s+(.+)$/i);
  if (searchingWeb?.[1]) return sanitizeWebSearchQuery(searchingWeb[1]);
  const quoted = command.match(/web-search\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return sanitizeWebSearchQuery(quoted[1]);
  const unquoted = command.match(/web-search\.py\s+(\S+)/);
  return unquoted?.[1] ? sanitizeWebSearchQuery(unquoted[1]) : null;
}

function sanitizeWebSearchQuery(value?: string | null): string | null {
  const normalized = String(value || "")
    .replace(/^Firecrawl\s+search\s+results\s+for\s+/i, "")
    .replace(/^Web\s+search\s+results\s+for\s+query:\s*/i, "")
    .replace(/\s+include\s+a\s+sources?\s+section[\s\S]*$/i, "")
    .replace(/\s+with\s+sources?\s*\.?$/i, "")
    .trim()
    .replace(/^["'“”]+|["'“”.,:;]+$/g, "")
    .trim();
  return normalized || null;
}

function extractWebSearchQueryFromPayload(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return sanitizeWebSearchQuery(
      typeof record.query === "string"
        ? record.query
        : typeof record.search_query === "string"
          ? record.search_query
          : null
    );
  }
  const text = String(value || "");
  if (!text.trim()) return null;
  if (text.trim().startsWith("{")) {
    try {
      return extractWebSearchQueryFromPayload(JSON.parse(text));
    } catch {
      // Fall through to text patterns.
    }
  }
  const quotedSearchResults = text.match(/(?:Firecrawl\s+)?search\s+results\s+for\s+["“]([^"”]+)["”]/i);
  if (quotedSearchResults?.[1]) return sanitizeWebSearchQuery(quotedSearchResults[1]);
  const queryLine = text.match(/Web\s+search\s+results\s+for\s+query:\s*([^\n]+)/i);
  if (queryLine?.[1]) return sanitizeWebSearchQuery(queryLine[1]);
  return null;
}

function stripWebSearchSummaryLead(text: string): string {
  let cleaned = String(text || "").trim();
  cleaned = cleaned
    .replace(/^(?:Firecrawl\s+)?search\s+results\s+for\s+(?:"[^"]+"|“[^”]+”|[^.\n]+)\.\s*/i, "")
    .replace(/^Include\s+a\s+Sources?\s+section\s+in\s+(?:the\s+)?final\s+answer\.?\s*/i, "")
    .trim();
  return cleaned;
}

function cleanSummaryText(text: string): string {
  const cleaned = stripWebSearchSummaryLead(text)
    .replace(/^[\s-]+/, "")
    .replace(/^(?:Firecrawl\s+)?search\s+results\s+for\s+["“][^"”]+["”]\.?\s*(?:Include\s+a\s+Sources?\s+section\s+in\s+(?:the\s+)?final\s+answer\.?\s*)?/i, "")
    .replace(/^Web\s+search\s+results\s+for\s+query:\s*[^\n]*\n+/i, "")
    .replace(/^-+\s*/gm, "")
    .replace(/REMINDER:.*?markdown hyperlinks\.?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(/^[\s\S]*?\}]\s*/m, "")
    .replace(/^,?"url":"[^"]*"\},?/gm, "")
    .replace(/^\{"title":"[^"]*","url":"[^"]*"\},?/gm, "")
    .trim();
  return stripWebSearchSummaryLead(cleaned);
}

function formatWebSearchDisplaySummary(text?: string | null): string | null {
  const cleaned = cleanSummaryText(String(text || ""))
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned || null;
}

function extractJsonStringFieldFromText(text: string, fieldName: string): string | null {
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`"${escapedFieldName}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i"));
  if (!match?.[1]) {
    return null;
  }
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, "\"")
      .replace(/\\\\/g, "\\");
  }
}

function extractJsonArrayFieldFromText(text: string, fieldName: string): unknown[] | null {
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fieldMatch = new RegExp(`"${escapedFieldName}"\\s*:\\s*\\[`, "i").exec(text);
  if (!fieldMatch) {
    return null;
  }
  const arrayStart = text.indexOf("[", fieldMatch.index);
  if (arrayStart < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = arrayStart; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(text.slice(arrayStart, index + 1));
          return Array.isArray(parsed) ? parsed : null;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function extractWebSearchSummaryFromLooseJsonText(text: string): string | null {
  const summaryField = extractJsonStringFieldFromText(text, "summary");
  if (summaryField) {
    const cleanedSummary = formatWebSearchDisplaySummary(summaryField);
    if (cleanedSummary) {
      return cleanedSummary;
    }
  }

  const firstResultField = text.match(/"results"\s*:\s*\[\s*"((?:\\.|[^"\\])*)"/i);
  if (firstResultField?.[1]) {
    try {
      const firstResultText = JSON.parse(`"${firstResultField[1]}"`);
      const cleanedResult = formatWebSearchDisplaySummary(firstResultText);
      if (cleanedResult) {
        return cleanedResult;
      }
    } catch {
      const cleanedResult = formatWebSearchDisplaySummary(firstResultField[1]);
      if (cleanedResult) {
        return cleanedResult;
      }
    }
  }

  const firecrawlStart = text.search(/(?:Firecrawl\s+)?search\s+results\s+for\s+(?:"[^"]+"|“[^”]+”|[^.\n]+)\.?/i);
  if (firecrawlStart >= 0) {
    const sliced = text.slice(firecrawlStart);
    const beforeStructuredPayload = sliced
      .split(/\n\s*"(?:search_results|organic_results|image_results|images|results)"\s*:/i)[0]
      ?.trim();
    const cleanedSummary = formatWebSearchDisplaySummary(beforeStructuredPayload || sliced);
    if (cleanedSummary) {
      return cleanedSummary;
    }
  }

  return null;
}

function extractWebSearchSummaryFromRawOutput(value: unknown): string | null {
  const text = stripRunnerSystemTags(String(value || "")).trim();
  if (!text) {
    return null;
  }

  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const parsedJson = JSON.parse(text);
      if (parsedJson && typeof parsedJson === "object") {
        const record = parsedJson as Record<string, unknown>;
        if (typeof record.summary === "string") {
          const cleanedSummary = formatWebSearchDisplaySummary(record.summary);
          if (cleanedSummary) {
            return cleanedSummary;
          }
        }
        const nestedRawOutput = extractWebSearchSummaryFromRawOutput(record.raw_output || record.rawOutput || record.output);
        if (nestedRawOutput) {
          return nestedRawOutput;
        }
      }
    } catch {
      const looseSummary = extractWebSearchSummaryFromLooseJsonText(text);
      if (looseSummary) {
        return looseSummary;
      }
    }
  }

  const looseSummary = extractWebSearchSummaryFromLooseJsonText(text);
  if (looseSummary) {
    return looseSummary;
  }

  const markdownSection = text.match(
    /##?\s*Search Results[^\n]*\n+([\s\S]*?)(?=\n##?\s*(?:Sources|Images)\b|$)/i
  );
  const firecrawlSection = text.match(
    /^\s*(?:Firecrawl\s+)?search\s+results\s+for\s+(?:"[^"]+"|“[^”]+”|[^.\n]+)\.?\s*(?:Include\s+a\s+Sources?\s+section\s+in\s+(?:the\s+)?final\s+answer\.?\s*)?([\s\S]*?)(?=\n?Links:\s*\[|\n##?\s*(?:Sources|Images)\b|\nSOURCES:|\nIMAGES:|\nJSON OUTPUT:|$)/i
  );
  const summaryCandidate = markdownSection?.[1] || firecrawlSection?.[1] || text;
  const cleaned = formatWebSearchDisplaySummary(summaryCandidate);
  if (!cleaned) {
    return null;
  }
  return cleaned;
}

function isLikelyImageUrl(value?: string | null): boolean {
  if (!value) return false;
  const normalized = value.split(/[?#]/, 1)[0]?.toLowerCase() || "";
  return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".avif"].some((extension) => normalized.endsWith(extension));
}

function buildWebSearchImageEntry(title?: string, thumbnail?: string, source?: string): WebSearchImage | null {
  const normalizedThumbnail = thumbnail?.trim() || "";
  const normalizedSource = source?.trim() || undefined;
  const previewUrl = normalizedThumbnail || (isLikelyImageUrl(normalizedSource) ? normalizedSource : "");
  if (!previewUrl) {
    return null;
  }
  return {
    url: previewUrl,
    thumbnail: normalizedThumbnail || undefined,
    title: title?.trim() || undefined,
    source: normalizedSource,
  };
}

function buildWebSearchSourceEntry(title?: string, url?: string, domain?: string, snippet?: string, thumbnail?: string): WebSearchResult | null {
  const normalizedUrl = (url?.trim() || "")
    .replace(/\\n[\s\S]*$/g, "")
    .replace(/\n[\s\S]*$/g, "")
    .replace(/\)+$/g, "");
  if (!normalizedUrl) {
    return null;
  }
  let normalizedDomain = domain?.trim() || undefined;
  if (!normalizedDomain) {
    try {
      normalizedDomain = new URL(normalizedUrl).hostname.replace(/^www\./, "");
    } catch {
      normalizedDomain = undefined;
    }
  }
  return {
    url: normalizedUrl,
    title: title?.trim() || normalizedUrl,
    domain: normalizedDomain,
    snippet: snippet?.trim() || undefined,
    thumbnail: thumbnail?.trim() || undefined,
  };
}

function dedupeWebSearchSources(sources: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  const deduped: WebSearchResult[] = [];
  for (const source of sources) {
    const key = source.url.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(source);
  }
  return deduped;
}

function dedupeWebSearchImages(images: WebSearchImage[]): WebSearchImage[] {
  const seen = new Set<string>();
  const deduped: WebSearchImage[] = [];
  for (const image of images) {
    const key = image.url.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(image);
  }
  return deduped;
}

function extractFallbackWebSearchSources(text: string): WebSearchResult[] {
  const sources: WebSearchResult[] = [];

  const markdownLinkPattern = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let markdownMatch: RegExpExecArray | null = null;
  while ((markdownMatch = markdownLinkPattern.exec(text)) !== null) {
    const source = buildWebSearchSourceEntry(markdownMatch[1], markdownMatch[2]);
    if (source) {
      sources.push(source);
    }
  }

  const bareUrlPattern = /(https?:\/\/[^\s"'<>]+)(?![^[]*\])/g;
  let bareUrlMatch: RegExpExecArray | null = null;
  while ((bareUrlMatch = bareUrlPattern.exec(text)) !== null) {
    const url = bareUrlMatch[1];
    if (isLikelyImageUrl(url)) {
      continue;
    }
    const source = buildWebSearchSourceEntry(undefined, url);
    if (source) {
      sources.push(source);
    }
  }

  return dedupeWebSearchSources(sources);
}

function buildWebSearchSummaryFromResultItems(resultItems: unknown[]): string | null {
  const lines = resultItems
    .map((item) => {
      if (typeof item === "string") {
        const trimmed = item.trim();
        return trimmed && !/^https?:\/\//i.test(trimmed) ? formatWebSearchDisplaySummary(trimmed) || "" : "";
      }
      if (!item || typeof item !== "object") {
        return "";
      }
      const entry = item as Record<string, unknown>;
      const title = typeof entry.title === "string"
        ? entry.title.trim()
        : typeof entry.name === "string"
          ? entry.name.trim()
          : "";
      const snippet = typeof entry.snippet === "string"
        ? entry.snippet.trim()
        : typeof entry.description === "string"
          ? entry.description.trim()
          : "";
      const url = typeof entry.url === "string"
        ? entry.url.trim()
        : typeof entry.link === "string"
          ? entry.link.trim()
          : "";
      const label = title || snippet || url;
      if (!label) {
        return "";
      }
      return `- ${formatWebSearchDisplaySummary(label) || label}`;
    })
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines.join("\n\n") : null;
}

function getWebSearchResultItemsFromRecord(record: Record<string, unknown>): unknown[] {
  const nestedData = record.data && typeof record.data === "object" && !Array.isArray(record.data)
    ? record.data as Record<string, unknown>
    : null;
  if (nestedData) {
    return [
      ...getWebSearchResultItemsFromRecord(nestedData),
      ...(Array.isArray(nestedData.web) ? nestedData.web : []),
      ...(Array.isArray(nestedData.news) ? nestedData.news : []),
    ];
  }
  return Array.isArray(record.search_results)
    ? record.search_results
    : Array.isArray(record.results)
      ? record.results
      : Array.isArray(record.organic_results)
        ? record.organic_results
        : Array.isArray(record.sources)
          ? record.sources
          : [];
}

function getWebSearchImageItemsFromRecord(record: Record<string, unknown>): unknown[] {
  const nestedData = record.data && typeof record.data === "object" && !Array.isArray(record.data)
    ? record.data as Record<string, unknown>
    : null;
  if (nestedData) {
    return [
      ...getWebSearchImageItemsFromRecord(nestedData),
      ...(Array.isArray(nestedData.images) ? nestedData.images : []),
    ];
  }
  return Array.isArray(record.images)
    ? record.images
    : Array.isArray(record.image_results)
      ? record.image_results
      : [];
}

function parseWebSearchSourcesFromItems(resultItems: unknown[]): WebSearchResult[] {
  return resultItems
    .map((item) => {
      if (typeof item === "string") {
        return /^https?:\/\//i.test(item.trim()) ? buildWebSearchSourceEntry(undefined, item) : null;
      }
      if (!item || typeof item !== "object") {
        return null;
      }
      const entry = item as Record<string, unknown>;
      return buildWebSearchSourceEntry(
        typeof entry.title === "string" ? entry.title : typeof entry.name === "string" ? entry.name : undefined,
        typeof entry.url === "string" ? entry.url : typeof entry.link === "string" ? entry.link : undefined,
        typeof entry.domain === "string" ? entry.domain : typeof entry.source === "string" ? entry.source : undefined,
        typeof entry.snippet === "string" ? entry.snippet : typeof entry.description === "string" ? entry.description : undefined,
        typeof entry.thumbnail === "string" ? entry.thumbnail : undefined,
      );
    })
    .filter((item): item is WebSearchResult => Boolean(item));
}

function parseWebSearchImagesFromItems(imageItems: unknown[]): WebSearchImage[] {
  return imageItems
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const entry = item as Record<string, unknown>;
      return buildWebSearchImageEntry(
        typeof entry.title === "string" ? entry.title : typeof entry.alt === "string" ? entry.alt : undefined,
        typeof entry.imageUrl === "string"
          ? entry.imageUrl
          : typeof entry.thumbnail === "string"
          ? entry.thumbnail
          : typeof entry.thumbnailUrl === "string"
            ? entry.thumbnailUrl
            : typeof entry.thumb === "string"
              ? entry.thumb
              : undefined,
        typeof entry.url === "string"
          ? entry.url
          : typeof entry.original === "string"
            ? entry.original
            : typeof entry.link === "string"
              ? entry.link
              : typeof entry.source === "string"
                ? entry.source
                : typeof entry.domain === "string"
                  ? entry.domain
                  : undefined,
      );
    })
    .filter((item): item is WebSearchImage => Boolean(item));
}

function parseWebSearchRawOutputData(value: unknown): { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] } {
  const text = stripRunnerSystemTags(String(value || "")).trim();
  if (!text) {
    return { summary: null, sources: [], images: [] };
  }

  const looseSummary = extractWebSearchSummaryFromLooseJsonText(text);
  const looseSearchResults = extractJsonArrayFieldFromText(text, "search_results")
    || extractJsonArrayFieldFromText(text, "organic_results")
    || extractJsonArrayFieldFromText(text, "sources")
    || [];
  const looseImages = extractJsonArrayFieldFromText(text, "images")
    || extractJsonArrayFieldFromText(text, "image_results")
    || [];

  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const parsedJson = JSON.parse(text);
      if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
        const record = parsedJson as Record<string, unknown>;
        const resultItems = getWebSearchResultItemsFromRecord(record);
        const imageItems = getWebSearchImageItemsFromRecord(record);
        return {
          summary:
            (typeof record.summary === "string" ? formatWebSearchDisplaySummary(record.summary) : null)
            || (typeof record.text === "string" ? formatWebSearchDisplaySummary(record.text) : null)
            || looseSummary,
          sources: dedupeWebSearchSources([
            ...parseWebSearchSourcesFromItems(resultItems),
            ...parseWebSearchSourcesFromItems(looseSearchResults),
          ]),
          images: dedupeWebSearchImages([
            ...parseWebSearchImagesFromItems(imageItems),
            ...parseWebSearchImagesFromItems(looseImages),
          ]),
        };
      }
    } catch {
      // The raw output can include valid arrays followed by a truncated tool_result object.
    }
  }

  return {
    summary: looseSummary,
    sources: dedupeWebSearchSources(parseWebSearchSourcesFromItems(looseSearchResults)),
    images: dedupeWebSearchImages(parseWebSearchImagesFromItems(looseImages)),
  };
}

function parseWebSearchStructuredPayload(value: unknown): { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] } {
  if (!value || typeof value !== "object") {
    return { summary: null, sources: [], images: [] };
  }

  const record = value as Record<string, unknown>;
  const rawOutputData = mergeParsedWebSearchData(
    parseWebSearchRawOutputData(record.raw_output),
    parseWebSearchRawOutputData(record.rawOutput),
    parseWebSearchRawOutputData(record.output),
  );
  const rawOutputSummary = rawOutputData.summary;
  const summaryCandidates = [
    typeof record.summary === "string" ? formatWebSearchDisplaySummary(record.summary) : null,
    typeof record.text === "string" ? formatWebSearchDisplaySummary(record.text) : null,
    rawOutputSummary,
  ];
  const summary = summaryCandidates.find((candidate) => candidate && candidate.trim()) || null;

  const resultItems = getWebSearchResultItemsFromRecord(record);
  const imageItems = getWebSearchImageItemsFromRecord(record);
  const sources = dedupeWebSearchSources([
    ...parseWebSearchSourcesFromItems(resultItems),
    ...rawOutputData.sources,
  ]);
  const images = dedupeWebSearchImages([
    ...parseWebSearchImagesFromItems(imageItems),
    ...rawOutputData.images,
  ]);

  return {
    summary:
      summary ||
      buildWebSearchSummaryFromResultItems(resultItems) ||
      resultItems
        .find((item) => typeof item === "string" && !/^https?:\/\//i.test(item.trim()))
        ?.toString()
        ?.trim() ||
      null,
    sources: dedupeWebSearchSources(sources),
    images: dedupeWebSearchImages(images),
  };
}

function mergeParsedWebSearchData(...entries: Array<{ summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] }>): {
  summary: string | null;
  sources: WebSearchResult[];
  images: WebSearchImage[];
} {
  let summary: string | null = null;
  const mergedSources: WebSearchResult[] = [];
  const mergedImages: WebSearchImage[] = [];

  for (const entry of entries) {
    if (!summary && entry.summary) {
      summary = entry.summary;
    }
    mergedSources.push(...entry.sources);
    mergedImages.push(...entry.images);
  }

  return {
    summary,
    sources: dedupeWebSearchSources(mergedSources),
    images: dedupeWebSearchImages(mergedImages),
  };
}

function getWebSearchSourceDomain(source: WebSearchResult): string | undefined {
  if (source.domain?.trim()) {
    return source.domain.trim();
  }
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getWebSearchFaviconUrl(domain?: string): string | null {
  if (!domain) return null;
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=32`;
}

function parseWebSearchOutput(output?: string): { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] } {
  if (!output) return { summary: null, sources: [], images: [] };
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(output);
  const candidateOutput = stripRunnerSystemTags(
    structuredCommandOutput
      ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
      : output
  ).trim();
  if (!candidateOutput) {
    return { summary: null, sources: [], images: [] };
  }

  if (candidateOutput.startsWith("{") || candidateOutput.startsWith("[")) {
    try {
      const parsedJson = JSON.parse(candidateOutput);
      const parsedStructured = parseWebSearchStructuredPayload(parsedJson);
      if (parsedStructured.summary || parsedStructured.sources.length > 0 || parsedStructured.images.length > 0) {
        return parsedStructured;
      }
    } catch {
      // Fall through to legacy text parsing.
    }
  }

  let summary: string | null = null;
  let sources: WebSearchResult[] = [];
  let images: WebSearchImage[] = [];

  if (candidateOutput.includes("Web search results for query:")) {
    try {
      const linkPattern = /\{"title":"([^"]*?)","url":"([^"]*?)"\}/g;
      let match: RegExpExecArray | null = null;
      while ((match = linkPattern.exec(candidateOutput)) !== null) {
        const source = buildWebSearchSourceEntry(match[1] || match[2], match[2]);
        if (source) {
          sources.push(source);
        }
      }

      const imagesMatch = candidateOutput.match(/##?\s*Images\s*\n([\s\S]*?)$/i);
      if (imagesMatch) {
        const imagePattern = /(?:[-*]|\d+\.)\s*!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
        let imageMatch: RegExpExecArray | null = null;
        while ((imageMatch = imagePattern.exec(imagesMatch[1])) !== null) {
          const image = buildWebSearchImageEntry(imageMatch[1], imageMatch[2], imageMatch[3]);
          if (image) {
            images.push(image);
          }
        }
      }

      const linksStart = candidateOutput.indexOf("Links:");
      if (linksStart !== -1) {
        const afterLinks = candidateOutput.slice(linksStart);
        const arrayEnd = afterLinks.match(/\}]\s*([\s\S]*?)(?=##?\s*Images|$)/i);
        if (arrayEnd?.[1]) {
          const candidate = arrayEnd[1].trim();
          if (candidate.length > 10 && !candidate.startsWith("{") && !candidate.startsWith("[")) {
            summary = formatWebSearchDisplaySummary(candidate);
          }
        }
      }

      if (!summary) {
        const directArrayEndMatch = candidateOutput.match(/\}]\s*([A-Z][^{}\[\]]{10,}?)(?=##?\s*Images|$)/i);
        if (directArrayEndMatch?.[1]) {
          summary = formatWebSearchDisplaySummary(directArrayEndMatch[1].trim());
        }
      }

      if (!summary) {
        const beforeLinksMatch = candidateOutput.match(/Web search results for query:[^\n]*\n\n([\s\S]*?)(?=Links:|$)/);
        if (beforeLinksMatch?.[1]?.trim()) {
          summary = formatWebSearchDisplaySummary(beforeLinksMatch[1]);
        }
      }

      if (summary || sources.length > 0 || images.length > 0) {
        return { summary, sources, images };
      }
    } catch (error) {
      console.warn("Failed to parse native web search output", error);
    }
  }

  const markdownResults = candidateOutput.match(/##?\s*Search Results[^\n]*\n([\s\S]*?)(?=##?\s*Sources|##?\s*Images|$)/i);
  const markdownSources = candidateOutput.match(/##?\s*Sources\s*\n([\s\S]*?)(?=##?\s*Images|$)/i);
  const markdownImages = candidateOutput.match(/##?\s*Images\s*\n([\s\S]*?)$/i);
  if (markdownResults) {
    summary = formatWebSearchDisplaySummary(markdownResults[1]);
    if (markdownSources) {
      const pattern = /(?:[-*]|\d+\.)\s*\[([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
      let match: RegExpExecArray | null = null;
      while ((match = pattern.exec(markdownSources[1])) !== null) {
        const source = buildWebSearchSourceEntry(match[1], match[2], match[3]);
        if (source) {
          sources.push(source);
        }
      }
    }
    if (markdownImages) {
      const imagePattern = /(?:[-*]|\d+\.)\s*!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
      let match: RegExpExecArray | null = null;
      while ((match = imagePattern.exec(markdownImages[1])) !== null) {
        const image = buildWebSearchImageEntry(match[1], match[2], match[3]);
        if (image) {
          images.push(image);
        }
      }
    }
    if (summary || sources.length > 0 || images.length > 0) {
      return { summary, sources, images };
    }
  }

  const jsonPatterns = [
    /---\s*JSON OUTPUT\s*---\s*(\{[\s\S]*\})/i,
    /JSON OUTPUT:\s*```json?\s*([\s\S]*?)```/i,
    /JSON OUTPUT:\s*\n?\s*(\{[\s\S]*\})/i,
    /```json\s*([\s\S]*?)```/i,
    /(\{[\s\S]*"search_results"[\s\S]*\})/i,
    /(\{[\s\S]*"summary"[\s\S]*\})/i,
  ];

  for (const pattern of jsonPatterns) {
    const match = candidateOutput.match(pattern);
    if (!match?.[1]) {
      continue;
    }
    try {
      const jsonData = JSON.parse(match[1]) as {
        summary?: string;
        search_results?: Array<Record<string, unknown>>;
        results?: Array<Record<string, unknown>>;
        organic_results?: Array<Record<string, unknown>>;
        images?: Array<Record<string, unknown>>;
        image_results?: Array<Record<string, unknown>>;
      };

      if (jsonData.summary) {
        summary = formatWebSearchDisplaySummary(String(jsonData.summary));
      }

      const resultItems = jsonData.search_results || jsonData.results || jsonData.organic_results || [];
      if (Array.isArray(resultItems) && resultItems.length > 0) {
        sources = resultItems
          .map((result) =>
            buildWebSearchSourceEntry(
              typeof result.title === "string" ? result.title : typeof result.name === "string" ? result.name : typeof result.url === "string" ? result.url : typeof result.link === "string" ? result.link : undefined,
              typeof result.url === "string" ? result.url : typeof result.link === "string" ? result.link : undefined,
              undefined,
              typeof result.snippet === "string" ? result.snippet : typeof result.description === "string" ? result.description : undefined,
              typeof result.thumbnail === "string" ? result.thumbnail : undefined,
            ),
          )
          .filter((result): result is WebSearchResult => Boolean(result));
      }

      const imageItems = jsonData.images || jsonData.image_results || [];
      if (Array.isArray(imageItems) && imageItems.length > 0) {
        images = imageItems
          .map((image) =>
            buildWebSearchImageEntry(
              typeof image.title === "string" ? image.title : typeof image.alt === "string" ? image.alt : undefined,
              typeof image.imageUrl === "string"
                ? image.imageUrl
                : typeof image.thumbnail === "string"
                ? image.thumbnail
                : typeof image.thumbnailUrl === "string"
                  ? image.thumbnailUrl
                  : typeof image.thumb === "string"
                    ? image.thumb
                    : undefined,
              typeof image.url === "string"
                ? image.url
                : typeof image.original === "string"
                  ? image.original
                  : typeof image.link === "string"
                    ? image.link
                    : typeof image.source === "string"
                      ? image.source
                      : typeof image.domain === "string"
                        ? image.domain
                        : undefined,
            ),
          )
          .filter((image): image is WebSearchImage => Boolean(image));
      }

      if (summary || sources.length > 0 || images.length > 0) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (!summary) {
    const firecrawlSummaryMatch = candidateOutput.match(
      /^\s*(?:Firecrawl\s+)?search\s+results\s+for\s+(?:"[^"]+"|“[^”]+”|[^.\n]+)\.?\s*([\s\S]*?)(?=Links:|##?\s*Sources|##?\s*Images|SOURCES:|IMAGES:|JSON OUTPUT:|$)/i
    );
    if (firecrawlSummaryMatch?.[0]) {
      summary = formatWebSearchDisplaySummary(firecrawlSummaryMatch[0]);
    }
  }

  if (!summary) {
    const summaryMatch = candidateOutput.match(/SUMMARY:\s*([\s\S]*?)(?=SOURCES:|JSON OUTPUT:|IMAGES:|$)/i);
    if (summaryMatch?.[1]) {
      summary = formatWebSearchDisplaySummary(summaryMatch[1]);
    }
  }

  if (sources.length === 0) {
    const sourcesMatch = candidateOutput.match(/SOURCES:\s*-*\s*([\s\S]*?)(?=JSON OUTPUT:|IMAGES:|$)/i);
    if (sourcesMatch?.[1]) {
      const lines = sourcesMatch[1].split("\n");
      let currentTitle: string | null = null;
      for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line.trim() || /^-+$/.test(line.trim())) {
          continue;
        }
        const titleMatch = line.match(/^\[(\d+)\]\s+(.+)/);
        if (titleMatch) {
          currentTitle = titleMatch[2].trim();
          continue;
        }
        const indentedUrlMatch = line.match(/^\s+URL:\s*(https?:\/\/\S+)/);
        if (indentedUrlMatch && currentTitle) {
          const source = buildWebSearchSourceEntry(currentTitle, indentedUrlMatch[1]);
          if (source) {
            sources.push(source);
          }
          currentTitle = null;
          continue;
        }
        const singleLineUrlTitleMatch = line.match(/\[\d+\]\s+(https?:\/\/\S+)\s*-\s*(.+)/);
        if (singleLineUrlTitleMatch) {
          const source = buildWebSearchSourceEntry(singleLineUrlTitleMatch[2].trim(), singleLineUrlTitleMatch[1]);
          if (source) {
            sources.push(source);
          }
          continue;
        }
        const singleLineTitleUrlMatch = line.match(/\[\d+\]\s+(.+?)\s+\((https?:\/\/\S+)\)/);
        if (singleLineTitleUrlMatch) {
          const source = buildWebSearchSourceEntry(singleLineTitleUrlMatch[1].trim(), singleLineTitleUrlMatch[2]);
          if (source) {
            sources.push(source);
          }
          continue;
        }
        const bareUrlMatch = line.match(/^\s*(https?:\/\/\S+)\s*$/);
        if (bareUrlMatch) {
          const source = buildWebSearchSourceEntry(bareUrlMatch[1], bareUrlMatch[1]);
          if (source) {
            sources.push(source);
          }
        }
      }
    }
  }

  if (images.length === 0) {
    const imageUrlPattern = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|avif|bmp)(?:\?[^\s"'<>]*)?)/gi;
    const imageMatches = candidateOutput.match(imageUrlPattern);
    if (imageMatches) {
      images = Array.from(new Set(imageMatches))
        .slice(0, 10)
        .map((url) => buildWebSearchImageEntry(undefined, url, url))
        .filter((image): image is WebSearchImage => Boolean(image));
    }
  }

  return { summary, sources, images };
}

function WebSearchSourceChip({ source }: { source: WebSearchResult }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const domain = getWebSearchSourceDomain(source);
  const faviconUrl = faviconFailed ? null : getWebSearchFaviconUrl(domain);
  const label = source.title || domain || source.url;

  return (
    <a className="tb-log-web-search-source-link" href={source.url} target="_blank" rel="noopener noreferrer">
      {faviconUrl ? (
        <img
          src={faviconUrl}
          alt=""
          className="tb-log-web-search-source-favicon"
          onError={() => setFaviconFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <Globe className="tb-log-web-search-source-icon" strokeWidth={1.5} />
      )}
      <span className="tb-log-web-search-source-label" title={label}>
        {label}
      </span>
    </a>
  );
}

function buildWebSearchRawJsonText(params: {
  query: string | null;
  parsed: { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] };
  rawOutput: string;
  output: string;
  resultValue: unknown;
  fullReport: string;
}): string {
  const { query, parsed, rawOutput, output, resultValue, fullReport } = params;
  if (resultValue && typeof resultValue === "object") {
    try {
      return JSON.stringify(resultValue, null, 2);
    } catch {}
  }
  const candidate = String(output || rawOutput || "").trim();
  if (candidate.startsWith("{") || candidate.startsWith("[")) {
    try {
      return JSON.stringify(JSON.parse(candidate), null, 2);
    } catch {}
  }
  return JSON.stringify({
    query,
    summary: parsed.summary,
    search_results: parsed.sources,
    images: parsed.images,
    raw_output: candidate || undefined,
    full_report: fullReport || undefined,
  }, null, 2);
}

function WebSearchSourceCountButton({
  sources,
  expanded,
  onClick,
}: {
  sources: WebSearchResult[];
  expanded: boolean;
  onClick: () => void;
}) {
  const visibleSources = sources.slice(0, 3);
  return (
    <button
      type="button"
      className={`tb-log-web-search-source-count ${expanded ? "is-expanded" : ""}`.trim()}
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={expanded ? "Hide web search sources" : "Show web search sources"}
    >
      <span className="tb-log-web-search-source-count-icons" aria-hidden="true">
        {visibleSources.map((source, index) => {
          const domain = getWebSearchSourceDomain(source);
          const faviconUrl = getWebSearchFaviconUrl(domain);
          return faviconUrl ? (
            <img
              key={`${source.url}-${index}`}
              src={faviconUrl}
              alt=""
              className="tb-log-web-search-source-count-favicon"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Globe key={`${source.url}-${index}`} className="tb-log-web-search-source-count-icon" strokeWidth={1.5} />
          );
        })}
      </span>
      <span>{sources.length} {sources.length === 1 ? "source" : "sources"}</span>
    </button>
  );
}

function WebSearchSourceCountBadge({ sources }: { sources: WebSearchResult[] }) {
  const visibleSources = sources.slice(0, 3);
  return (
    <span className="tb-log-web-search-source-count tb-log-web-search-source-count-badge" aria-hidden="true">
      <span className="tb-log-web-search-source-count-icons">
        {visibleSources.map((source, index) => {
          const domain = getWebSearchSourceDomain(source);
          const faviconUrl = getWebSearchFaviconUrl(domain);
          return faviconUrl ? (
            <img
              key={`${source.url}-${index}`}
              src={faviconUrl}
              alt=""
              className="tb-log-web-search-source-count-favicon"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Globe key={`${source.url}-${index}`} className="tb-log-web-search-source-count-icon" strokeWidth={1.5} />
          );
        })}
      </span>
      <span>{sources.length} {sources.length === 1 ? "source" : "sources"}</span>
    </span>
  );
}

function buildWebSearchDisplaySummaryFromSources(sources: WebSearchResult[]): string | null {
  const lines = sources
    .map((source) => {
      const title = String(source.title || source.snippet || source.url || "").trim();
      const url = String(source.url || "").trim();
      if (!title) {
        return "";
      }
      return url ? `- [${title}](${url})` : `- ${title}`;
    })
    .filter(Boolean);
  return lines.length > 0 ? lines.join("\n") : null;
}

function buildWebSearchPreviewAttachmentId(query: string | null, rawJsonText: string): string {
  const source = `${query || ""}:${String(rawJsonText || "").slice(0, 4096)}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return `web-search-preview:${Math.abs(hash).toString(36) || "0"}`;
}

function buildWebSearchPreviewAttachment(params: {
  query: string | null;
  parsed: { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] };
  displaySummary: string | null;
  rawJsonText: string;
  isError: boolean;
  errorMessage: string;
}): RunnerPreviewAttachment {
  const { query, parsed, displaySummary, rawJsonText, isError, errorMessage } = params;
  const webSearchPreview: RunnerWebSearchPreviewData = {
    query,
    summary: displaySummary,
    sources: parsed.sources,
    images: parsed.images,
    rawJsonText,
    isError,
    errorMessage,
  };
  return {
    ...buildRunnerPreviewAttachmentFromPath("/workspace/web-search-results.html", {
      idPrefix: "web-search-preview",
    }),
    id: buildWebSearchPreviewAttachmentId(query, rawJsonText),
    filename: "Web Search",
    mimeType: "application/x.computer-agents.web-search",
    type: "document",
    previewKindOverride: "web-search",
    webSearchPreview,
  };
}

export function WebSearchLogBox({
  log,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const rawOutput = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(rawOutput);
  const output = structuredCommandOutput
    ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
    : rawOutput;
  const resultValue = log.metadata?.result;
  const query =
    extractSearchQuery(log.metadata?.command || "") ||
    extractWebSearchQueryFromPayload(resultValue) ||
    extractWebSearchQueryFromPayload(output) ||
    extractWebSearchQueryFromPayload(log.message);
  const fullReport = typeof (log.metadata as Record<string, unknown> | undefined)?.fullReport === "string"
    ? String((log.metadata as Record<string, unknown>).fullReport)
    : "";
  const parsed = useMemo(() => {
    const parsedOutput = parseWebSearchOutput(output);
    const parsedResult =
      typeof resultValue === "string"
        ? parseWebSearchOutput(resultValue)
        : parseWebSearchStructuredPayload(resultValue);
    const parsedReport = fullReport ? parseWebSearchOutput(fullReport) : { summary: null, sources: [], images: [] };
    const parsedMessage = isWebSearchOutput(log.message) ? parseWebSearchOutput(log.message) : { summary: null, sources: [], images: [] };
    const structuredParsed = mergeParsedWebSearchData(parsedOutput, parsedResult, parsedReport, parsedMessage);
    const fallbackText = [output, typeof resultValue === "string" ? resultValue : "", fullReport, log.message].filter(Boolean).join("\n");
    const fallbackSources = structuredParsed.sources.length === 0 && fallbackText ? extractFallbackWebSearchSources(fallbackText) : [];
    return mergeParsedWebSearchData(structuredParsed, {
      summary: null,
      sources: fallbackSources,
      images: [],
    });
  }, [fullReport, log.message, output, resultValue]);
  const displaySummary = useMemo(() =>
    parsed.summary ||
    extractWebSearchSummaryFromRawOutput(rawOutput) ||
    extractWebSearchSummaryFromRawOutput(output) ||
    (typeof resultValue === "string" ? extractWebSearchSummaryFromRawOutput(resultValue) : null) ||
    buildWebSearchDisplaySummaryFromSources(parsed.sources),
  [output, parsed.sources, parsed.summary, rawOutput, resultValue]);
  const isRunning = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const errorMessage = stripRunnerSystemTags(output || rawOutput).trim();
  const rawJsonText = useMemo(() => buildWebSearchRawJsonText({
    query,
    parsed: { ...parsed, summary: displaySummary },
    rawOutput,
    output,
    resultValue,
    fullReport,
  }), [displaySummary, fullReport, output, parsed, query, rawOutput, resultValue]);
  const previewAttachment = useMemo(() => buildWebSearchPreviewAttachment({
    query,
    parsed: { ...parsed, summary: displaySummary },
    displaySummary,
    rawJsonText,
    isError,
    errorMessage,
  }), [displaySummary, errorMessage, isError, parsed, query, rawJsonText]);

  return (
    <button
      type="button"
      className="tb-log-web-search-compact"
      onClick={() => onPreviewDocument?.(previewAttachment)}
      aria-label={query ? `Open web search results for ${query}` : "Open web search results"}
    >
      <span className="tb-log-web-search-compact-main">
        <Globe className="tb-log-web-search-compact-icon" strokeWidth={1.6} />
        <span className="tb-log-web-search-compact-title">Web Search</span>
        {query ? <span className="tb-log-web-search-compact-query">{query}</span> : null}
        {parsed.sources.length > 0 ? <WebSearchSourceCountBadge sources={parsed.sources} /> : null}
        {isRunning ? <span className="tb-log-web-search-compact-status">searching...</span> : null}
      </span>
    </button>
  );
}

type WebScrapeParsed = {
  title: string | null;
  url: string | null;
  markdown: string;
  json: unknown;
  rawText: string;
  mode: "markdown" | "json";
};

export function isWebScrapeCommand(command?: string): boolean {
  if (!command) return false;
  const normalized = command.toLowerCase();
  return (
    /\bweb_scrape\b/i.test(command) ||
    normalized.includes("--scrape-url") ||
    normalized.includes("/v2/scrape") ||
    normalized.includes("firecrawl.dev/v2/scrape")
  );
}

export function isWebScrapeJsonCommand(command?: string): boolean {
  if (!command) return false;
  const normalized = command.toLowerCase();
  return (
    normalized.includes("--json-prompt") ||
    normalized.includes("--json-schema") ||
    /\bmode\s*[:=]\s*["']?json/i.test(command)
  );
}

export function isWebScrapeOutput(output?: string): boolean {
  if (!output) return false;
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(output);
  const candidate = structuredCommandOutput
    ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
    : output;
  return /(?:^|\n)#\s*(?:Scraped Page|Extracted Data):/i.test(candidate);
}

function extractWebScrapeUrlFromCommand(command?: string): string | null {
  if (!command) return null;
  const flagMatch = command.match(/--scrape-url(?:=|\s+)(["'])(.*?)\1/i)
    || command.match(/--scrape-url(?:=|\s+)(\S+)/i);
  const value = flagMatch?.[2] || flagMatch?.[1];
  return value ? value.trim() : null;
}

function parseWebScrapeStructuredPayload(value: unknown, fallbackUrl?: string | null): WebScrapeParsed | null {
  if (!value) return null;
  if (typeof value === "string") {
    const text = stripRunnerSystemTags(value).trim();
    if (!text) return null;
    if (text.startsWith("{")) {
      try {
        return parseWebScrapeStructuredPayload(JSON.parse(text), fallbackUrl);
      } catch {
        // Fall through to markdown text parsing.
      }
    }
    return parseWebScrapeTextOutput(text, fallbackUrl);
  }
  if (typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  const data = record.data && typeof record.data === "object" && !Array.isArray(record.data)
    ? record.data as Record<string, unknown>
    : record;
  const metadata = data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
    ? data.metadata as Record<string, unknown>
    : {};
  const url = typeof metadata.sourceURL === "string"
    ? metadata.sourceURL
    : typeof record.url === "string"
      ? record.url
      : fallbackUrl || null;
  const title = typeof metadata.title === "string"
    ? metadata.title
    : typeof record.title === "string"
      ? record.title
      : url;
  const jsonValue = data.json;
  if (jsonValue !== undefined) {
    return {
      title: title || null,
      url,
      markdown: "",
      json: jsonValue,
      rawText: JSON.stringify(value, null, 2),
      mode: "json",
    };
  }
  const markdown = typeof data.markdown === "string"
    ? data.markdown
    : typeof data.summary === "string"
      ? data.summary
      : "";
  if (markdown.trim()) {
    return {
      title: title || null,
      url,
      markdown,
      json: null,
      rawText: JSON.stringify(value, null, 2),
      mode: "markdown",
    };
  }
  return null;
}

function parseWebScrapeTextOutput(text: string, fallbackUrl?: string | null): WebScrapeParsed | null {
  const normalized = stripRunnerSystemTags(text).trim();
  if (!normalized) return null;
  const titleMatch = normalized.match(/(?:^|\n)#\s*(Scraped Page|Extracted Data):\s*([^\n]+)/i);
  const isJson = titleMatch?.[1]?.toLowerCase().includes("extracted") || /```json/i.test(normalized);
  const sourceMatch = normalized.match(/(?:^|\n)Source:\s*(\S+)/i);
  const title = titleMatch?.[2]?.trim() || null;
  const url = sourceMatch?.[1]?.trim() || fallbackUrl || null;

  if (isJson) {
    const jsonFence = normalized.match(/```json\s*([\s\S]*?)```/i);
    let jsonValue: unknown = null;
    if (jsonFence?.[1]) {
      try {
        jsonValue = JSON.parse(jsonFence[1]);
      } catch {
        jsonValue = jsonFence[1].trim();
      }
    }
    return {
      title,
      url,
      markdown: "",
      json: jsonValue,
      rawText: normalized,
      mode: "json",
    };
  }

  const sourceLineIndex = sourceMatch ? normalized.indexOf(sourceMatch[0]) + sourceMatch[0].length : -1;
  const markdown = sourceLineIndex >= 0
    ? normalized.slice(sourceLineIndex).trim()
    : normalized.replace(/(?:^|\n)#\s*Scraped Page:[^\n]+\n?/i, "").trim();
  return {
    title,
    url,
    markdown: markdown || normalized,
    json: null,
    rawText: normalized,
    mode: "markdown",
  };
}

export function parseWebScrapeLog(log: RunnerLog): WebScrapeParsed | null {
  const command = log.metadata?.command || "";
  const rawOutput = String(log.metadata?.output || "");
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(rawOutput);
  const output = structuredCommandOutput
    ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
    : rawOutput;
  const fallbackUrl = extractWebScrapeUrlFromCommand(command);
  const resultValue = log.metadata?.result;
  return (
    parseWebScrapeStructuredPayload(resultValue, fallbackUrl) ||
    parseWebScrapeStructuredPayload(output, fallbackUrl) ||
    parseWebScrapeStructuredPayload(rawOutput, fallbackUrl) ||
    parseWebScrapeStructuredPayload(log.message, fallbackUrl)
  );
}

function formatWebScrapeTitle(parsed: WebScrapeParsed | null, fallbackUrl?: string | null): string {
  const candidate = parsed?.title || parsed?.url || fallbackUrl || "Web page";
  try {
    if (/^https?:\/\//i.test(candidate)) {
      return new URL(candidate).hostname.replace(/^www\./, "");
    }
  } catch {}
  return candidate;
}

export function WebScrapeMarkdownLogBox({
  log,
  timeLabel,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  void timeLabel;
  const parsed = parseWebScrapeLog(log);
  const commandUrl = extractWebScrapeUrlFromCommand(log.metadata?.command || "");
  const markdown = parsed?.markdown || "";
  const title = formatWebScrapeTitle(parsed, commandUrl);
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const output = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const previewAttachment: RunnerPreviewAttachment = {
    ...buildRunnerPreviewAttachmentFromPath("/workspace/firecrawl-scrape.md", {
      idPrefix: "firecrawl-scrape-markdown",
    }),
    id: buildCompactLogPreviewId("firecrawl-scrape-markdown", markdown || output || title),
    filename: "firecrawl-scrape.md",
    mimeType: "text/markdown",
    type: "document",
    previewKindOverride: "markdown",
    url: `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
    previewUrl: `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
  };

  return (
    <CompactActionLogLine
      icon={<FileSearch className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Scraped Page"
      detail={isError ? "failed" : title}
      onClick={!isError && markdown && onPreviewDocument ? () => onPreviewDocument(previewAttachment) : undefined}
    />
  );
}

function formatJsonTableCell(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function buildJsonExtractTable(value: unknown): { columns: string[]; rows: string[][] } {
  if (Array.isArray(value)) {
    const objectRows = value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as Record<string, unknown>[];
    if (objectRows.length > 0) {
      const columns = Array.from(new Set(objectRows.flatMap((item) => Object.keys(item)))).slice(0, 8);
      return {
        columns,
        rows: objectRows.slice(0, 50).map((item) => columns.map((column) => formatJsonTableCell(item[column]))),
      };
    }
    return {
      columns: ["Index", "Value"],
      rows: value.slice(0, 50).map((item, index) => [String(index + 1), formatJsonTableCell(item)]),
    };
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const arrayProperty = Object.entries(record)
      .filter(([, item]) => Array.isArray(item) && item.some((row) => row && typeof row === "object" && !Array.isArray(row)))
      .sort((left, right) => (right[1] as unknown[]).length - (left[1] as unknown[]).length)[0];
    if (arrayProperty) {
      return buildJsonExtractTable(arrayProperty[1]);
    }
    return {
      columns: ["Field", "Value"],
      rows: Object.entries(record).map(([key, item]) => [key, formatJsonTableCell(item)]),
    };
  }

  return {
    columns: ["Value"],
    rows: [[formatJsonTableCell(value)]],
  };
}

export function WebScrapeJsonLogBox({
  log,
  timeLabel,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  void timeLabel;
  const parsed = parseWebScrapeLog(log);
  const commandUrl = extractWebScrapeUrlFromCommand(log.metadata?.command || "");
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;

  return (
    <CompactActionLogLine
      icon={<Code2 className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Extracted Data"
      detail={isError ? "failed" : formatWebScrapeTitle(parsed, commandUrl)}
    />
  );
}

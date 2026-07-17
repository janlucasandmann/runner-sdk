import {
  buildRunnerPreviewHeaders,
  getRunnerPreviewHeaderValue,
} from "../runner-document-preview.js";

export function sanitizeBackendUrl(url: string): string {
  return String(url || "").trim().replace(/\/+$/, "");
}

export function getHeaderValue(
  headers: HeadersInit | undefined,
  name: string
): string {
  return getRunnerPreviewHeaderValue(headers, name);
}

export function buildRunnerHeaders(
  requestHeaders: HeadersInit | undefined,
  apiKey: string
): Headers {
  return buildRunnerPreviewHeaders(requestHeaders, apiKey);
}

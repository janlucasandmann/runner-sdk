export type RunnerPresentationFormat = "pptx" | "keynote" | "unknown";

export function getRunnerPresentationExtension(filename?: string | null): string {
  const normalized = String(filename || "").trim().toLowerCase();
  return normalized.includes(".") ? normalized.split(".").pop() || "" : "";
}

export function getRunnerPresentationFormat(filename?: string | null, mimeType?: string | null): RunnerPresentationFormat {
  const extension = getRunnerPresentationExtension(filename);
  if (extension === "pptx") return "pptx";
  if (extension === "key") return "keynote";

  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  if (normalizedMimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    return "pptx";
  }
  if (
    normalizedMimeType === "application/vnd.apple.keynote" ||
    normalizedMimeType === "application/x-iwork-keynote-sffkey"
  ) {
    return "keynote";
  }

  return "unknown";
}

export function isRunnerPowerPointPresentationFile(filename?: string | null, mimeType?: string | null): boolean {
  return getRunnerPresentationFormat(filename, mimeType) === "pptx";
}

export function isRunnerKeynotePresentationFile(filename?: string | null, mimeType?: string | null): boolean {
  return getRunnerPresentationFormat(filename, mimeType) === "keynote";
}

export function isRunnerPresentationFile(filename?: string | null, mimeType?: string | null): boolean {
  return getRunnerPresentationFormat(filename, mimeType) !== "unknown";
}

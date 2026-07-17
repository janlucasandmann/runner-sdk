export type RunnerFileBrowserSource =
  | "workspace"
  | "google-drive"
  | "one-drive"
  | "github"
  | "notion";

export function normalizeRunnerFileBrowserSource(
  source: unknown,
): RunnerFileBrowserSource {
  const normalized = String(source || "").trim().toLowerCase();
  if (
    normalized === "google-drive"
    || normalized === "google_drive"
    || normalized === "drive"
  ) {
    return "google-drive";
  }
  if (
    normalized === "one-drive"
    || normalized === "onedrive"
    || normalized === "one_drive"
  ) {
    return "one-drive";
  }
  if (normalized === "github") return "github";
  if (normalized === "notion") return "notion";
  return "workspace";
}

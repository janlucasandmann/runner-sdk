/**
 * Returns whether a runtime-reported file-change target is a concrete path.
 *
 * Shell instrumentation can occasionally mistake comparison expressions inside
 * heredocs (for example `if index > 30:`) for output redirects. Those values
 * are not files and must never enter the file-change UI or diff pipeline.
 */
export function isPlausibleRunnerFileChangePath(value?: string | null): boolean {
  const normalized = String(value || "")
    .trim()
    .replace(/^[\'\"`]+|[\'\"`]+$/g, "");

  if (!normalized) return false;
  if (
    normalized === "/" ||
    normalized === "." ||
    normalized === ".." ||
    normalized === "-" ||
    normalized === "/dev/null" ||
    normalized === "dev/null"
  ) {
    return false;
  }

  // Python/JavaScript block headers and source line markers are the common
  // false positives produced by a naive `>` redirect parser.
  if (!/[\\/]/.test(normalized) && /:$/.test(normalized)) {
    return false;
  }
  if (/^&?\d+$/.test(normalized)) {
    return false;
  }
  if (/[\r\n\0<>|]/.test(normalized)) {
    return false;
  }

  return true;
}

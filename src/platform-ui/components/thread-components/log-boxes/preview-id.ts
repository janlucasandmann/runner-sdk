export function buildCompactLogPreviewId(
  prefix: string,
  content: string,
): string {
  const source = String(content || "").slice(0, 8192);
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return `${prefix}:${Math.abs(hash).toString(36) || "0"}`;
}

export function shouldRewriteLocalOauthRedirectUri(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return [
      "localhost",
      "127.0.0.1",
      "::1",
    ].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeNotionAuthUrl(authUrl, callbackUri) {
  if (!authUrl || !callbackUri) return authUrl;
  try {
    const parsed = new URL(authUrl);
    const currentRedirectUri = parsed.searchParams.get("redirect_uri") || "";
    if (shouldRewriteLocalOauthRedirectUri(currentRedirectUri)) {
      parsed.searchParams.set("redirect_uri", callbackUri);
    }
    return parsed.toString();
  } catch {
    return authUrl;
  }
}

export function validateNotionAuthUrl(authUrl) {
  if (!authUrl) {
    return { valid: false, message: "The Notion authorization URL is missing." };
  }
  try {
    const parsed = new URL(authUrl);
    const clientId = String(parsed.searchParams.get("client_id") || "").trim();
    const redirectUri = String(parsed.searchParams.get("redirect_uri") || "").trim();
    if (parsed.protocol !== "https:" || parsed.hostname !== "api.notion.com") {
      return { valid: false, message: "The Notion authorization URL has an unexpected origin." };
    }
    if (!clientId || /\s/.test(clientId) || clientId.length < 16) {
      return { valid: false, message: "The Notion authorization URL has a missing or invalid client ID." };
    }
    if (!redirectUri) {
      return { valid: false, message: "The Notion authorization URL has no redirect URI." };
    }
    new URL(redirectUri);
    return { valid: true, message: "" };
  }
  catch {
    return { valid: false, message: "The Notion authorization URL is invalid." };
  }
}

export function normalizeCustomSkillRecord(skill) {
  if (!skill || typeof skill !== "object") return null;
  const codeFiles = Array.isArray(skill.codeFiles)
    ? skill.codeFiles
    : Array.isArray(skill.files)
      ? skill.files
      : [];
  return {
    ...skill,
    codeFiles: codeFiles
      .filter((file) => (
        file
        && typeof file === "object"
        && typeof file.name === "string"
        && file.name.trim()
      ))
      .map((file) => ({
        name: String(file.name || "").trim(),
        content: typeof file.content === "string" ? file.content : "",
        language: typeof file.language === "string" ? file.language : undefined,
      })),
    isCustom: true,
  };
}

export function mergeCustomSkillLists(...lists) {
  const merged = new Map();
  lists.flat().forEach((skill) => {
    const normalized = normalizeCustomSkillRecord(skill);
    if (normalized?.id) merged.set(normalized.id, normalized);
  });
  return Array.from(merged.values());
}

export function renderBriefingPreviewHtml(html, publicUrl) {
  const escapedBaseHref = String(publicUrl || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const baseTag = `<base href="${escapedBaseHref}" />`;
  const shellStyles = '<style>html,body{margin:0;padding:0;background:#fff;color:#111;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}img,svg,video,canvas,iframe{max-width:100%;height:auto;}pre{white-space:pre-wrap;word-break:break-word;}table{max-width:100%;border-collapse:collapse;}*{box-sizing:border-box;}</style>';
  const source = String(html || "");
  if (/<head[\s>]/i.test(source)) {
    return source.replace(
      /<head(\s[^>]*)?>/i,
      (match) => `${match}${baseTag}${shellStyles}`,
    );
  }
  if (/<html[\s>]/i.test(source)) {
    return source.replace(
      /<html(\s[^>]*)?>/i,
      (match) => `${match}<head>${baseTag}${shellStyles}</head>`,
    );
  }
  return `<!doctype html><html><head><meta charset="utf-8" />${baseTag}${shellStyles}</head><body>${source}</body></html>`;
}

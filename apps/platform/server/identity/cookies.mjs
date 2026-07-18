export function readCookies(request) {
  const entries = String(request?.headers?.cookie || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("=");
      if (separator < 0) return [entry, ""];
      const name = entry.slice(0, separator).trim();
      const rawValue = entry.slice(separator + 1);
      try {
        return [name, decodeURIComponent(rawValue)];
      } catch {
        return [name, rawValue];
      }
    });
  return new Map(entries);
}

export function readCookie(request, name) {
  return readCookies(request).get(name) || "";
}

export function serializeCookie(name, value, options = {}) {
  const parts = [
    `${name}=${encodeURIComponent(String(value || ""))}`,
    `Path=${options.path || "/"}`,
    `SameSite=${options.sameSite || "Lax"}`,
  ];
  if (Number.isFinite(options.maxAge)) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(name, options = {}) {
  return serializeCookie(name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

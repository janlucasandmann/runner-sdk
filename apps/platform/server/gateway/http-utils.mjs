export const PLATFORM_SESSION_API_KEY_SENTINEL = "__runner_playground_session__";

export function normalizeBackendUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) {
    throw new Error("Upstream backend URL is required");
  }
  return trimmed.replace(/\/+$/, "");
}

export function normalizePlatformApiKey(value) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized === PLATFORM_SESSION_API_KEY_SENTINEL) {
    return "";
  }
  return normalized;
}

export function readHeader(req, name) {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return (value[0] || "").trim();
  return String(value || "").trim();
}

export function isUnauthorizedHttpStatus(status) {
  return status === 401 || status === 403;
}

export async function readRequestBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

export async function readRawRequestBuffer(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function sendJson(res, status, payload, extraHeaders = {}) {
  if (!res || res.destroyed || res.writableEnded || res.headersSent) {
    return false;
  }
  const body = JSON.stringify(payload);
  try {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(body),
      "Cache-Control": "no-store",
      ...(extraHeaders && typeof extraHeaders === "object" ? extraHeaders : {}),
    });
    res.end(body);
    return true;
  } catch (error) {
    const errorCode = String(error?.code || "");
    if (["ECONNRESET", "EPIPE", "ERR_STREAM_WRITE_AFTER_END"].includes(errorCode)) {
      return false;
    }
    throw error;
  }
}

export async function readResponseJson(response) {
  const text = await response.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

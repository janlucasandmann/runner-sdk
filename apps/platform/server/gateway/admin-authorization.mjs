import fs from "node:fs/promises";
import { readResponseJson } from "./http-utils.mjs";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function extractEmail(payload) {
  const candidates = [
    payload?.email,
    payload?.user?.email,
    payload?.profile?.email,
    payload?.authProfile?.email,
    payload?.data?.email,
    payload?.data?.profile?.email,
  ];
  for (const candidate of candidates) {
    const email = normalizeEmail(candidate);
    if (email) return email;
  }
  return "";
}

export function readPlatformCookie(req, name) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) return "";
  const cookieHeader = req.headers.cookie || "";
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    if (key !== normalizedName) continue;
    const value = part.slice(index + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return "";
}

export function extractPlatformIdToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  return readPlatformCookie(req, "__session")
    || readPlatformCookie(req, "tb_id_token");
}

export function createAdminAuthorization({
  aiosOrigin,
  feedbackSummaryAdminEnvFileCandidates,
  fetchAiosApi,
  hasAiosSession,
  platformOrigin,
  port,
}) {
  let cachedFeedbackSummaryAdminKey = null;
  let cachedContactSalesApiToken = null;

  function readAdminKey(req) {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice("Bearer ".length).trim();
    }
    const headerValue = req.headers["x-admin-key"];
    if (typeof headerValue === "string") return headerValue.trim();
    if (Array.isArray(headerValue) && typeof headerValue[0] === "string") {
      return headerValue[0].trim();
    }
    return "";
  }

  async function readRuntimeEnvValue(key, fileCandidates = []) {
    const directValue = typeof process.env[key] === "string"
      ? process.env[key].trim()
      : "";
    if (directValue) return directValue;
    for (const candidatePath of fileCandidates) {
      try {
        const text = await fs.readFile(candidatePath, "utf8");
        for (const line of text.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (
            !trimmed
            || trimmed.startsWith("#")
            || !trimmed.includes("=")
          ) {
            continue;
          }
          const index = trimmed.indexOf("=");
          const rawKey = trimmed.slice(0, index).trim().replace(/^export\s+/, "");
          if (rawKey !== key) continue;
          let value = trimmed.slice(index + 1).trim();
          if (
            (value.startsWith("\"") && value.endsWith("\""))
            || (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          return value.trim();
        }
      } catch {
        // Try the next configured runtime environment file.
      }
    }
    return "";
  }

  async function readFeedbackSummaryAdminKey() {
    if (cachedFeedbackSummaryAdminKey === null) {
      cachedFeedbackSummaryAdminKey = await readRuntimeEnvValue(
        "ADMIN_API_KEY",
        feedbackSummaryAdminEnvFileCandidates,
      );
    }
    return cachedFeedbackSummaryAdminKey;
  }

  async function readContactSalesApiToken() {
    if (cachedContactSalesApiToken === null) {
      cachedContactSalesApiToken = await readRuntimeEnvValue(
        "CONTACT_SALES_API_TOKEN",
        feedbackSummaryAdminEnvFileCandidates,
      );
    }
    return cachedContactSalesApiToken;
  }

  async function verifyTokenEmail(req) {
    const idToken = extractPlatformIdToken(req);
    if (!idToken) return "";
    const apiKey = (
      process.env.FIREBASE_REST_API_KEY
      || process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      || "AIzaSyC_aSR8bjU02Kb1ROYUA7Yki_2Fogvs6-o"
    ).trim();
    if (!apiKey) return "";
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        },
      );
      if (!response.ok) return "";
      const payload = await response.json().catch(() => ({}));
      const user = Array.isArray(payload?.users) ? payload.users[0] : null;
      return normalizeEmail(user?.email);
    } catch {
      return "";
    }
  }

  async function fetchSessionEmail(req) {
    if (!hasAiosSession(req)) return { status: 401, email: "" };
    const verifiedTokenEmail = await verifyTokenEmail(req);
    if (verifiedTokenEmail) return { status: 200, email: verifiedTokenEmail };
    try {
      let lastStatus = 401;
      for (const path of ["/api/user/profile", "/api/user/email"]) {
        const response = await fetchAiosApi(req, path, { method: "GET" });
        lastStatus = response.status || lastStatus;
        const payload = await readResponseJson(response);
        const email = extractEmail(payload);
        if (response.ok && email) return { status: 200, email };
        if (response.status === 401 || response.status === 403) {
          return { status: response.status, email: "" };
        }
      }
      return { status: lastStatus, email: "" };
    } catch {
      return { status: 401, email: "" };
    }
  }

  function buildLoginUrl(req, pagePath, options = {}) {
    const normalizedPagePath = String(pagePath || "/feedback-summary")
      .startsWith("/")
      ? String(pagePath || "/feedback-summary")
      : `/${String(pagePath || "feedback-summary")}`;
    const requestUrl = new URL(
      req.url || normalizedPagePath,
      `http://localhost:${port}`,
    );
    const redirectUrl = new URL(normalizedPagePath, platformOrigin);
    if (requestUrl.search) redirectUrl.search = requestUrl.search;
    const loginUrl = new URL("/login", aiosOrigin);
    loginUrl.searchParams.set("redirect", redirectUrl.toString());
    if (options?.signedOut) loginUrl.searchParams.set("signed_out", "1");
    return loginUrl.toString();
  }

  function redirectToLogin(req, res, pagePath, options = {}) {
    res.writeHead(302, {
      Location: buildLoginUrl(req, pagePath, options),
      "Cache-Control": "no-store",
    });
    res.end();
  }

  return Object.freeze({
    buildFeedbackSummaryLoginUrl(req, options = {}) {
      return buildLoginUrl(req, "/feedback-summary", options);
    },
    buildUsageSummaryLoginUrl(req, options = {}) {
      return buildLoginUrl(req, "/usage-summary", options);
    },
    extractIdToken: extractPlatformIdToken,
    fetchSessionEmail,
    readAdminKey,
    readContactSalesApiToken,
    readFeedbackSummaryAdminKey,
    redirectToFeedbackSummaryLogin(req, res, options = {}) {
      redirectToLogin(req, res, "/feedback-summary", options);
    },
    redirectToUsageSummaryLogin(req, res, options = {}) {
      redirectToLogin(req, res, "/usage-summary", options);
    },
  });
}

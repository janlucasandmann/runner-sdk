const GITHUB_API_BASE = "https://api.github.com";

export async function fetchGithubJson(
  pathname,
  accessToken,
  { fetchImpl = globalThis.fetch } = {},
) {
  const normalizedToken = String(accessToken || "").trim();
  if (!normalizedToken) {
    throw new TypeError("A GitHub access token is required.");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required.");
  }

  const target = new URL(String(pathname || "/"), GITHUB_API_BASE);
  if (target.origin !== GITHUB_API_BASE) {
    throw new TypeError("GitHub API requests must target api.github.com.");
  }

  const response = await fetchImpl(target.toString(), {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${normalizedToken}`,
      "User-Agent": "computer-agents-platform",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  const text = await response.text().catch(() => "");
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }
  if (!response.ok) {
    const error = new Error(
      typeof payload === "string"
        ? payload
        : payload?.message || response.statusText || "GitHub request failed.",
    );
    error.status = response.status;
    error.code = "github_api_request_failed";
    throw error;
  }
  return payload;
}

export async function validateGithubCredential(
  accessToken,
  options = {},
) {
  try {
    return {
      state: "valid",
      profile: await fetchGithubJson("/user", accessToken, options),
    };
  } catch (error) {
    return Number(error?.status) === 401
      ? { state: "invalid", error }
      : { state: "unavailable", error };
  }
}

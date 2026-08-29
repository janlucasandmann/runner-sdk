const REQUEST_TIMEOUT_MS = 5_000;

export function isApplianceConnectorDocumentStoreEnabled(
  env = process.env,
) {
  return String(env.DEPLOYMENT_TOPOLOGY || "").trim().toLowerCase()
    === "on_prem";
}

export function createApplianceConnectorDocumentStore({
  env = process.env,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!isApplianceConnectorDocumentStoreEnabled(env)) return null;
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Appliance connector storage requires fetch.");
  }
  const controlOrigin = resolveControlOrigin(env.RUNNER_UPSTREAM_ORIGIN);
  const secret = String(env.PLATFORM_CONTROL_PLANE_SECRET || "");
  if (!controlOrigin || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "Appliance connector storage requires the local control origin and control-plane secret.",
    );
  }

  async function request(pathname, init = {}) {
    const target = new URL(pathname, controlOrigin);
    const headers = new Headers(init.headers || {});
    headers.set("Accept", "application/json");
    headers.set("X-Computer-Agents-Control-Secret", secret);
    if (init.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetchImpl(target, {
      ...init,
      headers,
      signal: init.signal || AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (response.status === 404) return null;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        String(payload?.error || payload?.message || "Connector storage request failed."),
      );
      error.statusCode = response.status;
      error.code = String(payload?.code || "connector_storage_request_failed");
      throw error;
    }
    return payload;
  }

  return Object.freeze({
    async getDocument(path) {
      const payload = await request(
        `/internal/connector-storage/documents?path=${encodeURIComponent(path)}`,
      );
      return payload?.document || null;
    },
    async listDocuments(path) {
      const payload = await request(
        `/internal/connector-storage/documents/list?path=${encodeURIComponent(path)}`,
      );
      return Array.isArray(payload?.documents)
        ? payload.documents.map((entry) => entry?.document).filter(Boolean)
        : [];
    },
    async patchDocument(path, fields, updateFieldPaths = []) {
      const payload = await request(
        "/internal/connector-storage/documents",
        {
          method: "PATCH",
          body: { path, fields, updateFieldPaths },
        },
      );
      return payload?.document || null;
    },
    async deleteDocument(path) {
      await request("/internal/connector-storage/documents", {
        method: "DELETE",
        body: { path },
      });
    },
    async consumeDocument(path) {
      const payload = await request(
        "/internal/connector-storage/documents/consume",
        { method: "POST", body: { path } },
      );
      return payload?.document || null;
    },
  });
}

function resolveControlOrigin(value) {
  try {
    const url = new URL(String(value || ""));
    url.pathname = url.pathname.replace(/\/v1\/?$/, "/");
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

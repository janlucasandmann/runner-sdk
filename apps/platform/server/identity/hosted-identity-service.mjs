import { createBrowserAuthModuleSource } from "./browser-auth-module.mjs";
import { verifyConnectorRequestUser } from "../integrations/connector-oauth-core.mjs";

export function createHostedIdentityService(config = {}, dependencies = {}) {
  const verifyRequestUser =
    dependencies.verifyRequestUser || verifyConnectorRequestUser;
  return Object.freeze({
    provider: "firebase",
    hasSession(request) {
      return Boolean(
        String(request.headers.cookie || "").trim()
        || String(request.headers.authorization || "").trim(),
      );
    },
    async readPrincipal(request) {
      const verified = await verifyRequestUser(
        request,
        config.connectorOauthEnvFileCandidates || [],
      );
      return Object.freeze({
        provider: "firebase",
        userId: verified.uid,
        uid: verified.uid,
        email: verified.email || "",
      });
    },
    handleRequest(request, response, url) {
      if (
        request.method !== "GET"
        || url.pathname !== "/api/platform/auth/browser-module.js"
      ) {
        return false;
      }
      const source = createBrowserAuthModuleSource("firebase");
      response.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Content-Length": Buffer.byteLength(source),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(source);
      return true;
    },
  });
}

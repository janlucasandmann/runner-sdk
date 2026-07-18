import { createBrowserAuthModuleSource } from "./browser-auth-module.mjs";

export function createHostedIdentityService() {
  return Object.freeze({
    provider: "firebase",
    hasSession(request) {
      return Boolean(
        String(request.headers.cookie || "").trim()
        || String(request.headers.authorization || "").trim(),
      );
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

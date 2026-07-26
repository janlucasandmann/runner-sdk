import { createTestsRuntime } from "./runtime.mjs";

const REQUIRED_ADAPTERS = [
  "fetchAiosApi",
  "hasAiosSession",
  "parseUpstreamUrl",
  "proxyUpstreamJsonRequest",
  "readOptionalApiKey",
  "withProxyOrganizationHeader",
];

/** Creates the Tests service and its durable runner execution boundary. */
export function createTestsService(adapters = {}) {
  for (const adapterName of REQUIRED_ADAPTERS) {
    if (typeof adapters[adapterName] !== "function") {
      throw new TypeError(`Tests service requires the ${adapterName} adapter.`);
    }
  }
  const runtime = createTestsRuntime(adapters);
  return Object.freeze({
    runs: runtime.runs,
    handleRequest(request, response, url) {
      if (
        url.pathname === "/api/real/test-plans"
        || url.pathname.startsWith("/api/real/test-plans/")
      ) {
        const suffix = url.pathname.slice("/api/real/test-plans".length);
        void adapters.proxyUpstreamJsonRequest(
          request,
          response,
          "/test-plans" + suffix + url.search,
          request.method,
        );
        return true;
      }
      return false;
    },
  });
}

export { createTestsRuntime } from "./runtime.mjs";

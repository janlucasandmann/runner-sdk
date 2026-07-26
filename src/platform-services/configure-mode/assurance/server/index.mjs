/** Creates the Assurance API boundary for platform and Mission Control clients. */
export function createAssuranceService(adapters = {}) {
  if (typeof adapters.proxyUpstreamJsonRequest !== "function") {
    throw new TypeError(
      "Assurance service requires the proxyUpstreamJsonRequest adapter.",
    );
  }
  return Object.freeze({
    handleRequest(request, response, url) {
      if (
        url.pathname === "/api/real/assurance"
        || url.pathname.startsWith("/api/real/assurance/")
      ) {
        const suffix = url.pathname.slice("/api/real/assurance".length);
        void adapters.proxyUpstreamJsonRequest(
          request,
          response,
          "/assurance" + suffix + url.search,
          request.method,
        );
        return true;
      }
      return false;
    },
  });
}

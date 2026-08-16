/** Strict same-origin gateway for externally authenticated Computer Agents API calls. */
export function createPublicApiRoutes(bindings) {
  const { publicApiEnabled, proxyPublicApiRequest } = bindings;
  return function handlePublicApiRoutes(request, response, url) {
    if (!publicApiEnabled) return false;
    if (url.pathname !== "/v1" && !url.pathname.startsWith("/v1/")) {
      return false;
    }
    void proxyPublicApiRequest(request, response, url);
    return true;
  };
}

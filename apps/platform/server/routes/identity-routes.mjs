/** Authentication routes owned by the configured platform identity adapter. */
export function createIdentityRoutes(bindings) {
  const { identityService } = bindings;
  return function handleIdentityRoutes(request, response, url) {
    return Boolean(identityService.handleRequest(request, response, url));
  };
}

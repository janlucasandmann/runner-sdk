function requireAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Imagine service requires a ${name} adapter.`);
  }
  return adapters[name];
}

/** Owns the authenticated Imagine preference proxy surface. */
export function createImagineRequestHandler(adapters) {
  const proxyAiosJsonRequest = requireAdapter(adapters, "proxyAiosJsonRequest");

  return function handleImagineRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    if (
      url.pathname === "/api/aios/user/imagine-preferences"
      && (method === "GET" || method === "PATCH" || method === "DELETE")
    ) {
      void proxyAiosJsonRequest(req, res, "/api/user/imagine-preferences", method);
      return true;
    }
    return false;
  };
}

import { createAiosAndAdminRoutes } from "./routes/aios-and-admin-routes.mjs";
import { createPageAndStaticRoutes } from "./routes/page-and-static-routes.mjs";
import { createRequestRouter } from "./routes/request-router.mjs";
import { createResourceRoutes } from "./routes/resource-routes.mjs";
import { createServiceRoutes } from "./routes/service-routes.mjs";
import { createThreadRoutes } from "./routes/thread-routes.mjs";

export function createPlatformRequestHandler(bindings) {
  const router = createRequestRouter([
    createServiceRoutes(bindings),
    createPageAndStaticRoutes(bindings),
    createAiosAndAdminRoutes(bindings),
    createThreadRoutes(bindings),
    createResourceRoutes(bindings),
  ]);
  const port = Number(bindings.port || 4177);

  return function platformRequestHandler(req, res) {
    const handleRequestStreamError = (error) => {
      const errorCode = String(error?.code || "");
      if (["ECONNRESET", "EPIPE", "ERR_STREAM_WRITE_AFTER_END"].includes(errorCode)) return;
      console.error("[platform] Request stream error", error);
    };
    req.on("error", handleRequestStreamError);
    res.on("error", handleRequestStreamError);

    const url = new URL(req.url || "/", `http://localhost:${port}`);
    if (router.handleRequest(req, res, url)) return;

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  };
}

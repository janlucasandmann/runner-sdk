import { createAdminHtmlRenderer } from "./render-admin-template.mjs";

export function createEnvironmentGuiPageRenderer() {
  const serveEnvironmentGuiViewerPage = createAdminHtmlRenderer(
    "environment-gui.html",
  );
  return serveEnvironmentGuiViewerPage;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlatformClient } from "./platform-client.js";

export interface MountPlatformClientOptions {
  apiBaseUrl?: string;
  appOrigin?: string;
  platformHostUrl?: string;
}

export function mountPlatformClient(
  element: HTMLElement,
  options: MountPlatformClientOptions = {},
) {
  const appOrigin = String(options.appOrigin || "").trim()
    || `${window.location.protocol}//${window.location.hostname}:4177`;
  const apiOrigin = String(options.apiBaseUrl || "").trim()
    || `${appOrigin.replace(/\/+$/, "")}/api/real`;

  const root = createRoot(element);
  root.render(
    <StrictMode>
      <PlatformClient
        platformHostUrl={options.platformHostUrl || appOrigin}
        runtime={{
          apiOrigin,
          appOrigin,
          environment: import.meta.env.DEV ? "development" : "production",
        }}
      />
    </StrictMode>,
  );
  return root;
}

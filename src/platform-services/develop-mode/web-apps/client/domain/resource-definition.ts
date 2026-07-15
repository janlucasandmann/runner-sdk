import { Globe } from "lucide-react";
import type { DevelopResourceDefinition } from "../../../shared/client/domain/index.js";

export const WEB_APPS_RESOURCE_DEFINITION = Object.freeze({
  kind: "web_app",
  singular: "Web App",
  plural: "Web Apps",
  resourceCountKey: "webApps",
  documentationPath: "/developers/libraries/web-apps",
  icon: Globe,
  activityMetrics: [
    { id: "hosting-requests", key: "hostingRequests", label: "Hosting Requests", color: "#8fc4ff" },
  ],
} satisfies DevelopResourceDefinition);

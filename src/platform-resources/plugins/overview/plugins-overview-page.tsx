import type { ComponentProps } from "react";
import { ConnectionOverviewPage } from "../../shared/connections/connection-overview-page.js";

export type PluginsOverviewPageProps = Omit<ComponentProps<typeof ConnectionOverviewPage>, "kind" | "onCreate">;

export function PluginsOverviewPage(props: PluginsOverviewPageProps) {
  return <ConnectionOverviewPage {...props} kind="plugins" />;
}

import type { ComponentProps } from "react";
import { ConnectionOverviewPage } from "../../shared/connections/connection-overview-page.js";

export type TagsOverviewPageProps = Omit<ComponentProps<typeof ConnectionOverviewPage>, "kind">;

export function TagsOverviewPage(props: TagsOverviewPageProps) {
  return <ConnectionOverviewPage {...props} kind="tags" />;
}

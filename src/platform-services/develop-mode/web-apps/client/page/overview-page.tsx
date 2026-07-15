import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { WEB_APPS_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopWebAppsOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={WEB_APPS_RESOURCE_DEFINITION} {...props} />;
}

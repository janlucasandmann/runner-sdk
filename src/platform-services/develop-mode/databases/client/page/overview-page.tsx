import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { DATABASES_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopDatabasesOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={DATABASES_RESOURCE_DEFINITION} {...props} />;
}

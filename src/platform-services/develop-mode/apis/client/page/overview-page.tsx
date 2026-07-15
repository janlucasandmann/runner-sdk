import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { APIS_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopApisOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={APIS_RESOURCE_DEFINITION} {...props} />;
}

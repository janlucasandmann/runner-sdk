import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { FUNCTIONS_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopFunctionsOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={FUNCTIONS_RESOURCE_DEFINITION} {...props} />;
}

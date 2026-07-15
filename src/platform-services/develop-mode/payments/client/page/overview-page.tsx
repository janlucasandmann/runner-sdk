import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { PAYMENTS_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopPaymentsOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={PAYMENTS_RESOURCE_DEFINITION} {...props} />;
}

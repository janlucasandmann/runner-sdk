import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { AUTHENTICATION_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopAuthenticationOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={AUTHENTICATION_RESOURCE_DEFINITION} {...props} />;
}

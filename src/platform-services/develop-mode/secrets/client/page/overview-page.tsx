import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { SECRETS_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopSecretsOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={SECRETS_RESOURCE_DEFINITION} {...props} />;
}

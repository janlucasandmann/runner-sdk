import type { DevelopResourceOverviewServicePageProps } from "../../../shared/client/domain/index.js";
import { DevelopResourceOverviewSurface } from "../../../shared/client/page/index.js";
import { AGENT_RUNTIME_RESOURCE_DEFINITION } from "../domain/index.js";

export function DevelopAgentRuntimeOverviewPage(props: DevelopResourceOverviewServicePageProps) {
  return <DevelopResourceOverviewSurface definition={AGENT_RUNTIME_RESOURCE_DEFINITION} {...props} />;
}

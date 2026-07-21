import {
  PlatformVersionPublishControl,
  type PlatformVersionPublishAction,
  type PlatformVersionPublishControlProps,
} from "../../../platform-ui/components/composite/versioning/index.js";

export type AgentPublishAction = PlatformVersionPublishAction;

export interface AgentPublishControlProps
  extends PlatformVersionPublishControlProps {}

export function AgentPublishControl({
  publishAriaLabel = "Save and publish agent changes",
  className = "",
  popupClassName = "",
  ...props
}: AgentPublishControlProps) {
  return (
    <PlatformVersionPublishControl
      {...props}
      publishAriaLabel={publishAriaLabel}
      className={`agent-publish-control${className ? ` ${className}` : ""}`}
      popupClassName={`agent-publish-control__menu${popupClassName ? ` ${popupClassName}` : ""}`}
    />
  );
}

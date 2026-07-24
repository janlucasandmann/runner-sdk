import type { ReactNode } from "react";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import {
  ResourceDetailPage,
  type ResourceDetailPageProps,
} from "../../../../../platform-ui/pages/details/index.js";

function appendClassName(baseClassName: string, className = ""): string {
  return className ? `${baseClassName} ${className}` : baseClassName;
}

export function SecurityDetailPageFrame({ children }: { children: ReactNode }) {
  return (
    <section
      className="playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page playground-agents-detail-assistant-page develop-security-detail-page-frame"
      data-security-detail-page-frame="true"
    >
      <div className="playground-agents-detail-layout">
        <div className="playground-agents-detail-main-pane">
          <div className="playground-environments-detail-scroll playground-settings-detail-scroll">
            <div className="playground-resources-detail-content">
              <div className="playground-environments-editor-main playground-tasks-detail-main">
                <div className="playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll">
                  <div className="playground-agents-detail-content is-agent-overview-general develop-security-detail-page-frame__content">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SecurityDetailLoadingState({
  message = "Loading security agent…",
}: {
  message?: ReactNode;
}) {
  return (
    <SecurityDetailPageFrame>
      <PlatformLoadingState
        centered
        className="develop-security-detail-loading-state"
        message={message}
      />
    </SecurityDetailPageFrame>
  );
}

export function SecurityResourceDetailPage<TTab extends string>({
  className = "",
  tabBarClassName = "",
  tabBarActionsClassName = "",
  contentClassName = "",
  sidebarClassName = "",
  ...props
}: ResourceDetailPageProps<TTab>) {
  return (
    <ResourceDetailPage<TTab>
      {...props}
      className={appendClassName(
        "playground-project-overview-layout playground-agents-detail-overview-layout develop-security-resource-detail",
        className,
      )}
      tabBarClassName={appendClassName(
        "playground-agents-overview-tabs playground-agents-detail-tabs develop-security-detail-tabs",
        tabBarClassName,
      )}
      tabBarActionsClassName={appendClassName(
        "playground-agents-detail-tab-actions develop-security-detail-tab-actions",
        tabBarActionsClassName,
      )}
      contentClassName={appendClassName(
        "playground-project-overview-main playground-agents-detail-overview-main develop-security-detail-content",
        contentClassName,
      )}
      sidebarClassName={appendClassName(
        "playground-project-overview-sidebar playground-agents-detail-sidebar develop-security-detail-sidebar",
        sidebarClassName,
      )}
    />
  );
}

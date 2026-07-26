import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import {
  DevelopServerDetailPage,
  type DevelopServerDetailPageProps,
} from "../../../shared/client/page/index.js";

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
              <div className="playground-environments-editor-main playground-tasks-detail-main playground-managed-data-detail-main playground-security-agent-detail-main">
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

export function SecurityDetailHeaderActionsPortal({
  portalId,
  children,
}: {
  portalId?: string;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(
      typeof document !== "undefined" && portalId
        ? document.getElementById(portalId)
        : null,
    );
  }, [portalId]);

  return target ? createPortal(children, target) : null;
}

export function SecurityResourceDetailPage<TTab extends string>({
  className = "",
  tabBarClassName = "",
  tabBarActionsClassName = "",
  contentClassName = "",
  sidebarClassName = "",
  ...props
}: DevelopServerDetailPageProps<TTab>) {
  return (
    <DevelopServerDetailPage<TTab>
      {...props}
      className={appendClassName(
        "is-security-agent-server-detail develop-security-resource-detail",
        className,
      )}
      tabBarClassName={appendClassName(
        "develop-security-detail-tabs",
        tabBarClassName,
      )}
      tabBarActionsClassName={appendClassName(
        "develop-security-detail-tab-actions",
        tabBarActionsClassName,
      )}
      contentClassName={appendClassName(
        "playground-server-detail-content playground-security-agent-detail-content develop-security-detail-content",
        contentClassName,
      )}
      sidebarClassName={appendClassName(
        "playground-security-agent-detail-sidebar develop-security-detail-sidebar",
        sidebarClassName,
      )}
    />
  );
}

import type { ReactNode } from "react";
import { ResourceDetailPage } from "./resource-detail-page.js";

export type FileResourceDetailTab = "code" | "settings";

export interface FileResourceDetailPageProps {
  activeTab: FileResourceDetailTab;
  metadata?: ReactNode;
  notice?: ReactNode;
  code: ReactNode;
  settings: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
  contentClassName?: string;
  codeClassName?: string;
  metadataClassName?: string;
  noticeClassName?: string;
  workspaceClassName?: string;
  settingsClassName?: string;
  sidebarClassName?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export function FileResourceDetailPage({
  activeTab,
  metadata,
  notice,
  code,
  settings,
  sidebar,
  sidebarCollapsed = false,
  ariaLabel = "File resource details",
  sidebarAriaLabel = "Resource properties",
  className = "",
  contentClassName = "",
  codeClassName = "",
  metadataClassName = "",
  noticeClassName = "",
  workspaceClassName = "",
  settingsClassName = "",
  sidebarClassName = "",
}: FileResourceDetailPageProps) {
  const normalizedTab: FileResourceDetailTab =
    activeTab === "settings" ? "settings" : "code";

  return (
    <ResourceDetailPage<FileResourceDetailTab>
      tabs={[]}
      activeTab={normalizedTab}
      onTabChange={() => undefined}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={["code"]}
      ariaLabel={ariaLabel}
      sidebarAriaLabel={sidebarAriaLabel}
      className={joinClassNames(
        "file-resource-detail-page",
        `is-${normalizedTab}-tab`,
        className,
      )}
      contentClassName={joinClassNames(
        "file-resource-detail-page__content",
        `is-${normalizedTab}-tab`,
        contentClassName,
      )}
      sidebarClassName={sidebarClassName}
    >
      {normalizedTab === "settings" ? (
        <div
          className={joinClassNames(
            "file-resource-detail-page__settings",
            settingsClassName,
          )}
        >
          {settings}
        </div>
      ) : (
        <div
          className={joinClassNames(
            "file-resource-detail-page__code",
            codeClassName,
          )}
        >
          {metadata !== undefined && metadata !== null ? (
            <div
              className={joinClassNames(
                "file-resource-detail-page__metadata",
                metadataClassName,
              )}
            >
              {metadata}
            </div>
          ) : null}
          {notice !== undefined && notice !== null ? (
            <div
              className={joinClassNames(
                "file-resource-detail-page__notice",
                noticeClassName,
              )}
            >
              {notice}
            </div>
          ) : null}
          <div
            className={joinClassNames(
              "file-resource-detail-page__workspace",
              workspaceClassName,
            )}
          >
            {code}
          </div>
        </div>
      )}
    </ResourceDetailPage>
  );
}

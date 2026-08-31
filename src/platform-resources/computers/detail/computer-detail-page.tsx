import type { ReactNode } from "react";
import {
  PlatformCodeEditorWorkspace,
  PlatformMonacoCodeEditor,
} from "../../../platform-ui/components/composite/code-editor-workspace/index.js";
import {
  MarkdownResourceDetailPage,
  PlatformServiceDetailFrame,
  PlatformServiceDetailPage,
  ResourceDetailPage,
} from "../../../platform-ui/pages/details/index.js";
import type { PlatformResourceSettingsPageProps } from "../../../platform-ui/pages/settings/index.js";

export type ComputerDetailTab = "general" | "runtime" | "settings";

export interface ComputerRuntimeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  dirty?: boolean;
  loading?: boolean;
  loadingMessage?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export interface ComputerDetailPageProps {
  activeTab: ComputerDetailTab;
  general: ReactNode;
  metadata?: ReactNode;
  runtime: ComputerRuntimeEditorProps;
  settings: PlatformResourceSettingsPageProps;
  notice?: ReactNode;
  sidebarCollapsed?: boolean;
  ariaLabel?: string;
  className?: string;
}

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

/**
 * Canonical Computer runtime source editor.
 *
 * Computer persistence remains owned by the route adapter; this component
 * owns the shared editor workspace, file presentation, and Monaco defaults.
 */
export function ComputerRuntimeEditor({
  value,
  onChange,
  readOnly = false,
  dirty = false,
  loading = false,
  loadingMessage = "Loading Dockerfile...",
  ariaLabel = "Computer Dockerfile editor",
  className = "",
}: ComputerRuntimeEditorProps) {
  const dockerfileId = "computer-runtime-dockerfile";
  return (
    <PlatformCodeEditorWorkspace
      files={[
        {
          id: dockerfileId,
          label: "Dockerfile",
          editableLabel: "Dockerfile",
          tabLabel: "Dockerfile",
          ariaLabel: "Dockerfile",
          dirty,
          renameDisabled: true,
          deleteDisabled: true,
          moveDisabled: true,
        },
      ]}
      activeFileId={dockerfileId}
      isLoadingFiles={loading}
      loadingFilesMessage={loadingMessage}
      variant="full-screen"
      ariaLabel={ariaLabel}
      className={joinClassNames("computer-runtime-editor", className)}
      editor={
        <PlatformMonacoCodeEditor
          path="Dockerfile"
          language="dockerfile"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          ariaLabel="Edit computer Dockerfile"
          className="computer-runtime-editor__editor"
          options={{
            wordWrap: "off",
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      }
    />
  );
}

export function ComputerDetailPage({
  activeTab,
  general,
  metadata,
  runtime,
  settings,
  notice,
  sidebarCollapsed = false,
  ariaLabel = "Computer details",
  className = "",
}: ComputerDetailPageProps) {
  const normalizedTab: ComputerDetailTab = [
    "general",
    "runtime",
    "settings",
  ].includes(activeTab)
    ? activeTab
    : "general";

  if (normalizedTab === "general") {
    return (
      <ResourceDetailPage
        tabs={[]}
        activeTab="general"
        onTabChange={() => undefined}
        sidebar={null}
        sidebarCollapsed
        ariaLabel={ariaLabel}
        className={joinClassNames(
          "computer-detail-page",
          "is-general-tab",
          className,
        )}
        contentClassName="computer-detail-page__content is-general-tab"
      >
        {general}
      </ResourceDetailPage>
    );
  }

  if (normalizedTab === "settings") {
    return (
      <PlatformServiceDetailFrame className="computer-detail-page__settings-frame">
        <PlatformServiceDetailPage
          settings={settings}
          sidebarCollapsed={sidebarCollapsed}
          ariaLabel={ariaLabel}
          sidebarAriaLabel="Computer details"
          className={joinClassNames(
            "computer-detail-page",
            "is-settings-tab",
            className,
          )}
          contentClassName="computer-detail-page__content is-settings-tab"
          sidebarClassName="computer-detail-page__sidebar"
        >
          {null}
        </PlatformServiceDetailPage>
      </PlatformServiceDetailFrame>
    );
  }

  return (
    <MarkdownResourceDetailPage
      activeTab="code"
      metadata={metadata}
      notice={notice}
      code={<ComputerRuntimeEditor {...runtime} />}
      settings={null}
      sidebar={null}
      sidebarCollapsed
      ariaLabel={ariaLabel}
      sidebarAriaLabel="Computer details"
      className={joinClassNames(
        "computer-detail-page",
        "is-runtime-tab",
        className,
      )}
      contentClassName="computer-detail-page__content is-runtime-tab"
      codeClassName="computer-detail-page__runtime"
      metadataClassName="computer-detail-page__metadata"
      noticeClassName="computer-detail-page__notice"
      workspaceClassName="computer-detail-page__runtime-workspace"
    />
  );
}

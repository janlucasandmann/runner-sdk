import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS,
  COMPUTE_RESOURCES_PAGE_SCRIPT,
} from "./source.mjs";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));
const developServerDetailPageCss = await fs.readFile(
  path.resolve(
    domainRoot,
    "../../../../../../src/platform-services/develop-mode/shared/client/page/develop-server-detail-page.css",
  ),
  "utf8",
);
const sourceDeployableServerDetailPageSource = await fs.readFile(
  path.resolve(
    domainRoot,
    "../../../../../../src/platform-services/develop-mode/shared/client/page/source-deployable-server-detail-page.tsx",
  ),
  "utf8",
);
const mutationsAndDataSource = await fs.readFile(
  path.resolve(domainRoot, "controller/mutations-and-data.js"),
  "utf8",
);
const bootstrapAndEffectsSource = await fs.readFile(
  path.resolve(domainRoot, "controller/bootstrap-and-effects.js"),
  "utf8",
);
const catalogAndLifecycleSource = await fs.readFile(
  path.resolve(domainRoot, "controller/catalog-and-lifecycle.js"),
  "utf8",
);
const databaseDetailViewSource = await fs.readFile(
  path.resolve(domainRoot, "controller/database-detail-view.js"),
  "utf8",
);
const databaseBrowserCssSource = await fs.readFile(
  path.resolve(
    domainRoot,
    "../../../../../../src/platform-services/create-mode/projects/client/styles/core/03-dialogs-and-mission-control.mjs",
  ),
  "utf8",
);
const platformTemplateSource = await fs.readFile(
  path.resolve(domainRoot, "../../templates/platform.template.js"),
  "utf8",
);

assert.equal(COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length, 12);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function PlaygroundEnvironmentsPage/);
const environmentsHomeThreadStartSource = COMPUTE_RESOURCES_PAGE_SCRIPT.match(
  /const handleEnvironmentsHomeThreadStartRequest = \(runRequest\) => \{[\s\S]*?(?=\n\s*function EnvironmentsHomeResponsiveSvgShared)/,
)?.[0] || "";
assert.match(
  environmentsHomeThreadStartSource,
  /connectors: runRequest\.connectors \|\| null/,
  "The Compute Resources home handoff must preserve selected connectors.",
);
assert.match(
  bootstrapAndEffectsSource,
  /const PLAYGROUND_COMPUTE_EMPTY_LIST = Object\.freeze\(\[\]\);[\s\S]{0,1800}resourceTemplatePreviewResources = PLAYGROUND_COMPUTE_EMPTY_LIST/,
  "Compute resource list defaults must keep stable identities across renders.",
);
assert.match(
  catalogAndLifecycleSource,
  /if \(!selectedDatabaseId \|\| selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID\) \{[\s\S]{0,180}databaseSeededSelectionRef\.current === selectedDatabaseId[\s\S]{0,120}return;/,
  "Database editor resets must run once per selected database identity.",
);
const cachedDatabaseDocumentsBranch = catalogAndLifecycleSource.match(
  /const existingDocuments = databaseDocumentsByCollectionKeyRef\.current\[loadingKey\];[\s\S]*?const templatePreviewDocuments =/,
)?.[0] || "";
assert.match(
  cachedDatabaseDocumentsBranch,
  /nextDocumentId !== currentSelectedDocumentId[\s\S]{0,240}setSelectedDatabaseDocumentId\(nextDocumentId\)/,
  "Cached database documents must synchronize selection only when its identity changes.",
);
assert.doesNotMatch(
  cachedDatabaseDocumentsBranch,
  /applyDocumentList\(existingDocuments/,
  "Cached database documents must not be reapplied into React state on loader identity changes.",
);
assert.match(
  databaseDetailViewSource,
  /PLAYGROUND_DATABASE_BROWSER_INITIAL_ROW_LIMIT = 50/,
  "Database browser lists must initially expose up to 50 rows.",
);
assert.match(
  databaseDetailViewSource,
  /PLAYGROUND_DATABASE_BROWSER_LOAD_MORE_COUNT = 20/,
  "Database browser lists must reveal 20 additional rows per continuation.",
);
assert.match(
  databaseDetailViewSource,
  /handlePlaygroundDatabaseBrowserRowKeyDown[\s\S]{0,800}\["ArrowDown", "ArrowUp"\][\s\S]{0,1600}options\.onSelect\(nextRow\)/,
  "Database collection and document rows must support adjacent Arrow key selection.",
);
assert.match(
  databaseDetailViewSource,
  /onScroll: handleDatabaseCollectionsScroll/,
  "The database Collections pane must progressively reveal more rows from its own scroll container.",
);
assert.match(
  databaseDetailViewSource,
  /onScroll: handleDatabaseDocumentsScroll/,
  "The database Documents pane must progressively reveal more rows from its own scroll container.",
);
assert.match(
  databaseDetailViewSource,
  /loadingMoreDatabaseDocumentsKey === databaseDocumentListKey\s*\? React\.createElement\(PlatformLoadingState, \{[\s\S]{0,220}className: "playground-database-browser-pagination-loading",[\s\S]{0,160}message: "Loading more documents\.\.\."/,
  "Database document continuation must expose the centralized loading indicator at the end of the loaded rows.",
);
assert.match(
  databaseBrowserCssSource,
  /\.playground-database-browser-pagination-loading \{[\s\S]{0,180}width: 100%;[\s\S]{0,180}justify-content: center;/,
  "The database continuation indicator must occupy and center within the bottom row of its list.",
);
assert.match(
  catalogAndLifecycleSource,
  /loadDatabaseDocuments\(selectedDatabaseId, selectedDatabaseCollectionId, \{ limit: 50 \}\)/,
  "Database documents must start with the shared 50-row initial limit.",
);
assert.match(
  catalogAndLifecycleSource,
  /current\[documentListKey\] === 50[\s\S]{0,420}databaseDocumentListRequestRef\.current\.has\(documentListKey\)/,
  "Database document bootstrap must be idempotent across rerenders and deduplicated while pending.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /serverCreationRequestToken = 0,[\s\S]{0,100}serverCreationRequestKind = ""/,
  "Develop Home creation actions must enter compute resources through an explicit request contract.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /serverCreationRequestRef[\s\S]{0,1800}openServerComposer\(normalizedCreationKind\)/,
  "Tokenized server creation requests must open the existing resource composer exactly once.",
);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentServerEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentDatabaseEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentEnvironmentEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderEmbeddedResourcesOverviewSection/);
const currentServerEditorStart = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "function renderCurrentServerEditor()",
);
const serverKindLabelDeclarationIndex = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "const serverKindLabel =",
  currentServerEditorStart,
);
const sourceUsageActivityRendererIndex = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "const renderSourceServerUsageActivityTable =",
  currentServerEditorStart,
);
assert.ok(
  serverKindLabelDeclarationIndex > currentServerEditorStart
    && serverKindLabelDeclarationIndex < sourceUsageActivityRendererIndex,
  "Shared source-resource metadata must initialize before Web App and Function detail consumers.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(PlatformCodeEditorWorkspace, \{[\s\S]{0,600}variant: isSourceDeployableServer \? "full-screen" : "default"/,
  "Function and Web App Code must share the centralized full-screen workspace.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const isEmbeddedServerCodeTab = Boolean\([\s\S]{0,260}\["function", "web_app"\]\.includes\(embeddedActiveServerKind\)[\s\S]{0,100}serverDetailTab === "code"/,
  "Source-deployable Code must derive one shared outer route scope.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const isSourcePreviewOpen = resourceMode === "servers"[\s\S]{0,100}&& !isSourceDeployableResourcesDetail[\s\S]{0,120}serverDetailTab !== "code"/,
  "Source-deployable details must never hide app-header controls by masquerading as a side preview.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isEmbeddedServerCodeTab \? " is-source-server-code-tab" : ""/,
  "Source-deployable Code must propagate its shared edge-to-edge route class through the outer layout.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const isEmbeddedSourceServerUsageTab = Boolean\([\s\S]{0,260}\["function", "web_app"\]\.includes\(embeddedActiveServerKind\)[\s\S]{0,100}serverDetailTab === "usage"/,
  "Function and Web App Usage must derive one shared outer route scope.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isEmbeddedSourceServerUsageTab \? " is-source-server-usage-tab" : ""/,
  "Source-deployable Usage must propagate its shared route class through the outer layout.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-resources-page\.is-develop-server-kind-page:has\([\s\S]{0,120}\.playground-source-server-detail-main\.is-source-server-code-tab[\s\S]{0,180}> \.playground-environments-detail-scroll\.playground-settings-detail-scroll \{[\s\S]{0,240}padding: 0;[\s\S]{0,100}overflow: hidden;/,
  "Source-deployable Code must remove the standard details-page padding and own the content viewport.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-resources-detail-content\.is-source-server-code-tab,[\s\S]{0,1600}width: 100%;[\s\S]{0,100}max-width: none;[\s\S]{0,180}height: 100%;/,
  "Source-deployable Code must remove centered max-width constraints throughout the editor layout.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-resources-page\.is-develop-server-kind-page[\s\S]{0,120}\.playground-server-detail-content\.is-code-tab\.is-source-server-code-tab,[\s\S]{0,280}width: 100%;[\s\S]{0,100}max-width: none;/,
  "Source-deployable Code must directly clear the shared server-detail content width and max-width.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-content-body:has\(\.platform-code-editor-workspace\.is-full-screen\)[\s\S]{0,1700}width: 100% !important;[\s\S]{0,100}max-width: none !important;[\s\S]{0,180}padding: 0 !important;/,
  "The rendered full-screen editor must directly clear every legacy ancestor constraint.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /disabled: isServerPublishControlDisabled,[\s\S]{0,100}menuDisabled: isServerPublishControlDisabled/,
  "Resource save controls must disable their action and menu halves together.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function updateDraftEnvironment\(updater\)[\s\S]{0,800}stringifyPlaygroundVersionComparableValue\(next\)[\s\S]{0,300}editorDirtyRef\.current = true;[\s\S]{0,120}environmentVersionDraftTouchedRef\.current = true;/,
  "Computer draft callbacks must only mark a resource dirty when they change its hydrated value.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /rememberEnvironmentVersionBaseline\(nextEnvironment, \{ force: true \}\)[\s\S]*?rememberEnvironmentVersionBaseline\(normalizedSeedEnvironment, \{ force: true \}\)[\s\S]*?rememberEnvironmentVersionBaseline\(selectedEnvironment, \{ force: true \}\)/,
  "Computer detail, seed, and version hydration must replace provisional baselines.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /historyControls: \{[\s\S]{0,220}onUndo: handleServerFileEditorUndo,[\s\S]{0,120}onRedo: handleServerFileEditorRedo/,
  "Source code workspaces must expose real Undo and Redo controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isLoadingFiles: isLoadingCurrentServerFiles,[\s\S]{0,120}loadingFilesMessage: "Loading files\.\.\."/,
  "Source code workspaces must delegate file loading feedback to the shared workspace.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /onCreateFile: handleCreateServerFile,[\s\S]{0,120}onUploadFiles: openServerFileUploadPicker,[\s\S]{0,120}onCreateFolder: handleCreateServerFolder/,
  "Source code workspaces must delegate file and folder creation to the shared workspace header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /async function handleCreateServerFolder\(\)[\s\S]*?const markerPath = normalizeHistoryPath\(normalizedPath \+ "\/\.gitkeep"\);/,
  "Source code workspaces must persist newly created folders through a hidden marker file.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /async function handleCreateServerFolder\(\)[\s\S]*?setServerSourceExpandedFolders\(\(current\) => \{/,
  "Source code workspaces must reveal newly created folders after persistence.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /normalizePlaygroundEnvironmentInventory\([\s\S]{0,120}includeFolderMarkers: true/,
  "Source code inventories must retain hidden folder markers while building the file tree.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /async function handleServerEntriesMove\(entries, destinationFolder = null\)[\s\S]*?formData\.append\("path", getServerSourcePathParent\(move\.targetPath\)\)/,
  "Source code drag moves must preserve nested binary file paths.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /onFilesMove: \(\{ files, destinationFolder \}\) => handleServerEntriesMove/,
  "Source code workspaces must persist shared drag-and-drop move operations.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /sourceServerCodeTabBarActions|tabBarActions: sourceServerCodeTabBarActions/,
  "Source code workspaces must not recreate the removed editor tab bar actions.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-servers-code-editor-status-actions"/,
  "Source code tabs must not recreate the legacy Revert and Save footer.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /if \(!\["function", "web_app"\]\.includes\(activeServerKind\)\)[\s\S]{0,500}void loadServerContext\(selectedServerId\)/,
  "Connectable server details must load their runtime context before Settings is opened.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverDetailsRequestRef = useRef\(new Map\(\)\);[\s\S]*?const authoritativeServerDetailIdsRef = useRef\(new Set\(\)\);[\s\S]*?ttlMs: 0,[\s\S]*?priority: "high"/,
  "Server details must use a race-safe, uncached, high-priority request path.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverVersionApiClient = useMemo\(\(\) => new RunnerClient\([\s\S]*?cache: "no-store",[\s\S]*?priority: "high"/,
  "Function source versions must load through an uncached, high-priority client.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /buildPlaygroundServerBindingsUrl[\s\S]{0,300}cache: "no-store",[\s\S]{0,120}priority: "high"[\s\S]*?buildPlaygroundServerContextUrl[\s\S]{0,300}cache: "no-store",[\s\S]{0,120}priority: "high"/,
  "Function connections and runtime context must load uncached at high priority.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /if \(authoritativeServerDetailIdsRef\.current\.has\(server\.id\)\) return;/,
  "Overview payloads must not overwrite an authoritative server detail snapshot.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authoritativeServerListScopesRef = useRef\(new Set\(\)\);[\s\S]*?authoritativeServerListScopesRef\.current\.add\(requestScopeKey\);[\s\S]*?const authoritativeCatalogReady = authoritativeServerListScopesRef\.current\.has\(metricScopeKey\)/,
  "Analytics previews must not replace an authoritative server catalog.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const useOverviewCatalog = Boolean\([\s\S]{0,500}\/servers\/analytics\/overview\?kind=[\s\S]{0,1800}staleWhileRevalidate: false/,
  "Server catalogs must reuse overview analytics while awaiting revalidation for fresh rows.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const requestUrl = useOverviewCatalog[\s\S]{0,300}\/servers\/analytics\/overview\?kind=[\s\S]{0,2200}const overviewResources = useOverviewCatalog/,
  "Develop server overviews must hydrate their table and analytics from one aggregate response.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const useOverviewCatalog = options\?\.useOverviewCatalog === true;[\s\S]{0,700}\/databases\/analytics\/overview\?period=/,
  "Database overviews must hydrate their table and analytics from one aggregate response.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authoritativeCatalogReady =[\s\S]{0,300}if \(authoritativeCatalogReady \|\| metricServers\.length === 0\) \{[\s\S]{0,500}Analytics can make the first paint useful, but the catalog loader owns readiness\./,
  "Empty analytics snapshots must not mark a resource catalog as loaded.",
);
assert.equal(
  (COMPUTE_RESOURCES_PAGE_SCRIPT.match(/setHasLoadedServers\(true\)/g) || []).length,
  1,
  "Only the authoritative server-list response may mark the catalog as loaded.",
);
assert.equal(
  (COMPUTE_RESOURCES_PAGE_SCRIPT.match(/setLoadedServerListScope\(requestScopeKey\)/g) || [])
    .length,
  1,
  "Only the authoritative server-list response may commit a loaded catalog scope.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const expectedServerCatalogScope =[\s\S]{0,200}const isCurrentServerCatalogLoaded = hasLoadedServers[\s\S]{0,160}loadedServerListScope === expectedServerCatalogScope/,
  "Develop resource loading state must be scoped to the current server kind.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /loadServerAnalytics\(selectedServerId[\s\S]{0,160}\.finally\(\(\) => loadServerDetails\(selectedServerId\)\)/,
  "Operational analytics must never gate the authoritative server configuration.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /void loadServerDetails\(selectedServerId\);[\s\S]{0,500}void loadServerBindings\(selectedServerId\);/,
  "Server details and bindings must start independently on resource selection.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /if \(\["api", "auth", "agent_runtime", "function", "payments", "secrets", "web_app"\]\.includes\(seedServerKind\)\) \{\s*void loadServerDetailBootstrap\(selectedServerId, seedServerKind\);/,
  "Managed Develop details must use the shared bootstrap request instead of serial resource calls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /\/servers\/" \+ encodeURIComponent\(normalizedServerId\)[\s\S]{0,120}\/bootstrap\?" \+ query\.toString\(\)/,
  "The shared detail bootstrap must request only the selected resource bundle.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /if \(isSourceDeployableServer && serverDetailTab !== "usage"\) \{\s*return;\s*\}[\s\S]{0,1400}void loadServerAnalytics\(selectedServerId, \{ period: analyticsPeriod \}\);/,
  "Operational analytics must remain lazy until the Usage tab is visible.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerDetailTabs = \[[\s\S]{0,200}\{ id: "usage", label: "Usage"[\s\S]{0,200}\{ id: "code", label: "Code"[\s\S]{0,200}\{ id: "settings", label: "Settings"/,
  "Function and Web App details must share Usage, Code, and Settings navigation.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT.match(/const serverDetailKpis = isSourceDeployableServer[\s\S]{0,1100}/)?.[0] || "",
  /label: "Errors"/,
  "Source-deployable Usage must share the compact four-KPI composition.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(SourceDeployableServerDetailPage, \{[\s\S]{0,180}resourceKind: isFunctionServer \? "function" : "web-app"[\s\S]{0,180}contentByTab: sourceServerDetailContentByTab/,
  "Function and Web App details must use the shared source-deployable detail module.",
);
assert.match(
  sourceDeployableServerDetailPageSource,
  /tabs=\{\[\]\}[\s\S]{0,500}sidebarAutoCollapseTabs=\{\["code"\]\}/,
  "The shared source-deployable detail module must keep section navigation in the app header and auto-collapse Code.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /\.\.\.\(isSourceDeployableResourcesDetail\s*\?\s*\{[\s\S]{0,180}activeSection: \["usage", "code", "settings"\]\.includes\(serverDetailTab\)[\s\S]{0,700}handleSourceServerDetailTabChange\(normalizedNextSection\)/,
  "Function and Web App details must publish controlled section navigation to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderSourceServerUsageActivityTable = \(\) => \{[\s\S]{0,700}tabs: \[\s*\{ id: "logs", label: "Logs" \},\s*\{ id: "history", label: "History" \}[\s\S]{0,700}variant: "minimal"[\s\S]{0,1800}embedded: true/,
  "Source-deployable Usage must expose Logs and History through one centralized minimal table switch.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-source-server-usage-tab-content" \},\s*serverUsageTabContent,\s*renderSourceServerUsageActivityTable\(\)/,
  "Source-deployable Usage must render analytics and the combined activity table inside one full-height layout.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Server deployments",[\s\S]{0,300}layout: embedded \? "fill" : "content",[\s\S]{0,220}pagination: embedded/,
  "Source deployment history must use the centralized fill-layout table and its integrated footer.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /rows: embedded \? displayedServerLogList : visibleServerLogList,[\s\S]{0,9000}layout: embedded \? "fill" : "content",[\s\S]{0,220}pagination: embedded/,
  "Source logs must paginate the complete filtered result set inside the centralized fill-layout table.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-detail-page\.is-source-deployable-server-detail\.is-source-server-usage-tab \{[\s\S]{0,160}grid-template-rows: minmax\(0, 1fr\);/,
  "Source Usage must reserve its full detail-page row for analytics and activity.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-detail-page\.is-source-deployable-server-detail\.is-code-tab \{[\s\S]{0,100}grid-template-rows: minmax\(0, 1fr\);/,
  "Function and Web App Code must fill the complete remaining detail-page height.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-source-server-usage-activity-table \{[\s\S]{0,120}flex: 1 1 0;[\s\S]{0,100}overflow: hidden;[\s\S]*?\.playground-source-server-usage-activity-table[\s\S]{0,700}\.platform-data-table__scroll \{[\s\S]{0,160}flex: 1 1 0;/,
  "Source Usage must keep body scrolling inside the activity table while the table reaches the viewport bottom.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-resources-page\.is-develop-server-kind-page\.is-source-server-usage-tab\s*>\s*\.playground-environments-detail-scroll\.playground-settings-detail-scroll\.is-source-server-usage-tab\s*\{[\s\S]{0,80}padding-bottom: 10px;/,
  "Only the outer source Usage detail scroll may use the compact 10px bottom padding.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderServerLogStatusLabel = \(label, tone\) => React\.createElement\(PlatformLabel, \{[\s\S]{0,120}variant: getServerLogStatusLabelVariant\(tone\)/,
  "Function activity statuses must use the centralized label component.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderServerLogStatusPill|playground-servers-analytics-log-pill/,
  "Function activity tables must not recreate legacy status pills.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /controlsLeading: embedded \? logsRefreshButton : undefined/,
  "Embedded source logs must place Refresh before the search control.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /serverDeploymentMapSection,\s*descriptionSection,\s*isFunctionServer \? functionInvokeSection : null,\s*serverSettingsResourcesTable,\s*connectionsSection/,
  "Source settings must share deployment, description, resources, and connections while retaining Function invocation.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const functionInvokeSection = isFunctionInvokeCapableServer[\s\S]{0,500}React\.createElement\("div", \{ className: "playground-server-invoke-auth-note" \}/,
  "The shared invoke section must begin with its authentication context instead of a redundant title row.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-invoke-title" \}, "Invoke function"/,
  "Agent Runtime usage must not render the redundant Invoke function title.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-code-preview-state playground-server-invoke-code-editor"[\s\S]{0,300}React\.createElement\(PlatformLoadingState, \{[\s\S]{0,180}message: "Loading code example\.\.\."[\s\S]{0,120}centered: true/,
  "Invoke code loading must use the centralized loading indicator.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-agent-runtime-detail-content \.playground-server-invoke-card \{[\s\S]{0,180}border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]{0,120}border-radius: 15px;[\s\S]{0,120}background: rgba\(255, 255, 255, 0\.075\);/,
  "Agent Runtime invoke code must use the shared neutral bordered surface.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-agent-runtime-detail-content \.playground-server-invoke-card::before \{\s*content: none;\s*display: none;/,
  "Agent Runtime invoke code must remove the legacy decorative pseudo-element.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-settings-tab\.is-source-deployable-settings-tab[\s\S]{0,100}\.playground-server-settings-description-section \{\s*border-bottom: 1px solid rgba\(255, 255, 255, 0\.1\);/,
  "The shared source Settings instructions section must render the requested bottom divider.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-settings-tab\.is-function-settings-tab[\s\S]{0,100}\.playground-server-invoke-card \{[\s\S]{0,180}border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]{0,100}border-radius: 15px;[\s\S]{0,100}background: rgba\(255, 255, 255, 0\.075\);/,
  "The Function Settings invoke code card must use the flat 7.5% bordered surface.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-settings-tab\.is-function-settings-tab[\s\S]{0,100}\.playground-server-invoke-card::before \{\s*content: none;\s*display: none;/,
  "The Function Settings invoke code card must not render legacy pseudo-element decoration.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverDangerSection = !isFunctionServer && !isServerTemplatePreview && isOperationalDetailServer/,
  "Function Settings must not render the shared server delete section.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /playground-database-danger-section|databaseDangerSection/,
  "Database Settings must not render a delete section.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /sourceServerConnectionsSidebar|playground-server-detail-connections-card/,
  "Function details must not duplicate Connections in the properties sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const usesCentralServerDescription = isSourceDeployableServer \|\| isAuthServer \|\| isAgentRuntimeServer \|\| isSecretsServer \|\| isPaymentsServer;[\s\S]{0,160}const descriptionSection = usesCentralServerDescription\s*\? React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,700}title: "Description"[\s\S]{0,500}variant: "minimalistic-ui"[\s\S]{0,1200}playground-server-settings-description-section/,
  "Managed resource Settings must use the centralized minimal instructions editor for Description.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverDeploymentMapSection = isSourceDeployableServer \|\| isAuthServer \|\| isAgentRuntimeServer \|\| isSecretsServer \|\| isPaymentsServer[\s\S]{0,1600}playground-payments-deployment-map/,
  "Managed resource Settings must reuse the centralized deployment map.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /regionCode: isAuthServer \|\| isAgentRuntimeServer \|\| isSecretsServer \|\| isPaymentsServer[\s\S]{0,160}draftServer\.location \|\| "eur3"[\s\S]{0,120}draftServer\.region \|\| "europe-west1"/,
  "The shared deployment map must resolve managed and source deployment regions from their authoritative fields.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-settings-tab"[\s\S]{0,900}serverDeploymentMapSection,\s*descriptionSection,/,
  "Managed server Settings must render Deployment region before Description.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerSettingsTableTabs = React\.createElement\(PlatformDetailTabBar, \{[\s\S]{0,320}tabs: \[\s*\{ id: "access", label: "Manage Access" \},\s*\{ id: "domains", label: "Custom Domains" \}[\s\S]{0,320}variant: "minimal"/,
  "Source Settings must switch between Manage Access and Custom Domains through one centralized table tab bar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerSettingsResourcesTable = normalizedSourceServerSettingsTableTab === "domains"\s*\? renderCustomDomainSection\(\{[\s\S]{0,220}toolbarLeading: sourceServerSettingsTableTabs,[\s\S]{0,180}toolbarTitle: null,[\s\S]{0,180}: React\.cloneElement\(serverTeamAccessTable, \{[\s\S]{0,180}leading: sourceServerSettingsTableTabs,[\s\S]{0,120}title: null/,
  "Source Settings must reuse centralized Custom Domains and Manage Access tables inside the shared surface.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const isSourceServerUsageActivity = serverDetailTab === "usage";[\s\S]{0,300}const activityTab = serverUsageActivityTab;[\s\S]{0,300}loadServerDeployments\(selectedServerId\)/,
  "Function and Web App activity must lazy-load according to the active Logs or History tab.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /onOpenChange: \(nextOpen\) => \{[\s\S]{0,500}popoverId === "server-connection-database"[\s\S]{0,300}void loadDatabases\(\);[\s\S]{0,500}popoverId === "agent-runtime-agent"[\s\S]{0,300}void loadServerAgentOptions\(\);/,
  "Connection catalogs must load on selector demand instead of every detail-page visit.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /authoritativeServerBindingIdsRef\.current\.add\(normalizedServerId\);[\s\S]*?if \(!authoritativeServerBindingIdsRef\.current\.has\(normalizedServerId\)\)/,
  "Runtime context must not replace a dedicated authoritative bindings response.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function preserveAuthoritativeServerOperationalState[\s\S]*?serviceUrl: authoritative\.serviceUrl,[\s\S]*?status: authoritative\.status,[\s\S]*?function mergeAuthoritativeServerRecordWithLoadedVersions/,
  "Version hydration must preserve authoritative deployment state.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const latestServer = current\[normalizedServerId\] \|\| initialServer;[\s\S]*?preserveAuthoritativeServerOperationalState\([\s\S]*?createServerVersionSelectedResource\(\s*current,/,
  "Late version responses must merge with the latest server record instead of a captured list snapshot.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const abortController = new AbortController\(\);[\s\S]*?fetchServerVersionsApi\(normalizedServerId,[\s\S]*?signal: abortController\.signal[\s\S]*?abortController\.abort\(\)/,
  "Obsolete Function source version requests must be cancelled on navigation.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Custom domains",[\s\S]{0,220}variant: "minimalistic-ui",[\s\S]{0,220}pagination: false/,
  "Function and web app custom domains must use the embedded minimal PlatformDataTable.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: \{\s*leading: toolbarLeading,\s*title: toolbarTitle,\s*primaryAction: \{\s*label: "Add Domain"/,
  "Custom domains must keep their add action in the centralized table toolbar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-custom-domain-card"/,
  "Custom domains must not recreate legacy card rows outside PlatformDataTable.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverTeamAccessTable = React\.createElement\(PlatformResourceAccessTable, \{[\s\S]{0,240}resourceLabel: serverKindLabel/,
  "Managed Develop resource access management must use the centralized resource access table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(PlatformResourceAccessSettings, \{[\s\S]{0,800}resourceLabel: "Computer"[\s\S]{0,800}subjectType: "computer",[\s\S]{0,120}teamSubjectType: "computer_team_role"/,
  "Computer access settings must render team-role permissions through the Computer resource catalog.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const handleEnvironmentAccessPrincipalChange[\s\S]{0,700}isPlatformSystemAccessPrincipalId[\s\S]{0,700}setEnvironmentDetailsCollapsed\(true\)/,
  "Opening a physical Computer access team must make room for the centralized role sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const restoreEnvironmentDetailSidebarAfterAccess[\s\S]{0,500}environmentDetailsCollapsedBeforeAccessRef\.current = null/,
  "Leaving Computer team permissions must restore the previous detail-sidebar state.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function updateEnvironmentTeamRoleAccessPermissionSet[\s\S]{0,900}normalizePlaygroundPermissionSet\(permissionSet, "computer_team_role"\)[\s\S]{0,500}queueEnvironmentPermissionSave\(nextEnvironment, normalizedTeamId\)/,
  "Computer role edits must queue the affected team with the resource permission update.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /async function flushQueuedEnvironmentPermissionSave[\s\S]{0,1300}for \(const teamId of teamIds\) \{\s*await syncEnvironmentTeamResourceShare\(savedEnvironment, teamId\)/,
  "Computer permission saves must synchronize every affected team resource share.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function getServerPermissionSubjectType\(server\) \{[\s\S]{0,260}\["web_app", "function", "auth", "secrets", "payments", "agent_runtime"\]\.includes\(kind\)[\s\S]{0,80}: "server"/,
  "Every managed Develop resource must resolve to its dedicated permission subject.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function getServerPermissionSet\(server\) \{[\s\S]{0,220}getServerPermissionSubjectType\(server\)/,
  "Managed resource policies must normalize through their concrete resource subject.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function getServerTeamRolePermissionSets\(server, teamId\)[\s\S]{0,900}normalizePlaygroundRolePermissionSet\([\s\S]{0,160}subjectType,[\s\S]{0,80}role\.id/,
  "Managed resource team roles must inherit resource-specific role presets.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function updateServerPermissionActionRing\(actionId, ringId\)[\s\S]{0,260}if \(!definition\?\.subjectTypes\?\.includes\(subjectType\)\) return;/,
  "Managed resource permission updates must reject actions outside the resource catalog.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /selectedServerSystemPrincipal[\s\S]{0,120}React\.createElement\(PlatformPermissionsPage, \{[\s\S]{0,520}subjectType: serverPermissionSubjectType/,
  "Managed resource permission pages must render the concrete resource catalog.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderServerDetailSelectControl = \([\s\S]{0,1800}React\.createElement\(PlatformSelector,[\s\S]{0,2400}popupClassName: "playground-server-detail-selector-popup"/,
  "Function connection controls must use the centralized selector and its minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverOwnerSelectorControl = React\.createElement\(PlatformSelector,[\s\S]{0,3000}popupClassName: "playground-agents-detail-owner-menu playground-server-owner-selector-popup"/,
  "Function ownership must use the centralized avatar selector and its minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /alignment: isOperationalDetailServer \? "end" : "start"/,
  "Managed Develop resource owner selectors must align their Properties values to the right.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-settings-tab"[\s\S]{0,240}isSourceDeployableServer \? " is-source-deployable-settings-tab"[\s\S]{0,240}isWebAppServer \? " is-web-app-settings-tab"/,
  "Web App settings must expose shared and resource-specific scopes.",
);
assert.match(
  sourceDeployableServerDetailPageSource,
  /resourceClassName = resourceKind === "function" \? "function" : "web-app"[\s\S]{0,500}`is-\$\{resourceClassName\}-server-detail`/,
  "Function and Web App detail pages must expose resource-specific centralized scopes.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverOwnerSelectorControl = renderPlaygroundPlatformPopup/,
  "Function ownership must not recreate the legacy popup shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const usesCentralServerAccessTable = isOperationalDetailServer;[\s\S]{0,160}const serverTeamAccessTable = React\.createElement\(PlatformResourceAccessTable/,
  "Function, web app, authentication, and Secrets access management must share the centralized table without legacy wrappers.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverTeamAccessPlatformSection = usesCentralServerAccessTable\s*\? serverTeamAccessTable/,
  "Managed Develop resource access surfaces must render the centralized table directly.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverAddTeamsControl = React\.createElement\(PlatformButtonSelector,[\s\S]{0,350}buttonVariant: "secondary"[\s\S]{0,1200}popupVariant: "minimal"/,
  "Function and web app access tables must use the centralized secondary Add Teams selector.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /selectedIds: selectedServerAccessTeamIds,[\s\S]{0,100}onSelectedIdsChange: setSelectedServerAccessTeamIds/,
  "Function and web app access tables must delegate row selection to the centralized table checkbox component.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerPropertiesSidebar =[\s\S]{0,7000}renderSourceServerSidebarRow\("Creator", serverCreatorValue,[\s\S]{0,5000}renderSourceServerSidebarRow\("Updated",[\s\S]{0,400}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Function and web app Properties sidebars must keep creator provenance separate and place Owner last.",
);
const sourceServerPropertiesSidebarSource =
  COMPUTE_RESOURCES_PAGE_SCRIPT.match(
    /const sourceServerPropertiesSidebar = isSourceDeployableServer[\s\S]*?const sourceServerDetailSidebar =/,
  )?.[0] || "";
assert.doesNotMatch(
  sourceServerPropertiesSidebarSource,
  /renderSourceServerSidebarRow\("Resource ID"/,
  "Function and web app details must omit Resource ID from the shared properties sidebar.",
);
assert.doesNotMatch(
  sourceServerPropertiesSidebarSource,
  /renderSourceServerSidebarRow\("Region"/,
  "Web App details must omit Region from the shared properties sidebar.",
);
assert.match(
  sourceServerPropertiesSidebarSource,
  /!isWebAppServer && sourceServerSourceLabel[\s\S]{0,120}renderSourceServerSidebarRow\("Source"/,
  "Web App details must omit Source while preserving it for other source-resource variants.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-detail-page\.is-source-deployable-server-detail[\s\S]{0,120}\.playground-server-detail-sidebar-url-link,[\s\S]{0,260}\.playground-server-detail-sidebar-url-link:hover \{\s*color: #fff;/,
  "Function and Web App sidebar URLs must remain white in default and hover states.",
);
assert.equal(
  (
    COMPUTE_RESOURCES_PAGE_SCRIPT.match(
      /renderSourceServerSidebarRow\("Creator", serverCreatorValue/g,
    ) || []
  ).length,
  5,
  "Every managed server detail sidebar must expose Creator provenance.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl,[\s\S]{0,250}playground-server-detail-sidebar-owner-cell/,
  "Function and web app Properties sidebars must expose the shared owner selector.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverUsageTabContent = isOperationalDetailServer\s*\? isSourceDeployableServer \|\| isAuthServer \|\| isSecretsServer \|\| isPaymentsServer \|\| isAgentRuntimeServer\s*\? React\.createElement\(PlatformAnalyticsSection,[\s\S]{0,220}variant: "default"/,
  "Managed resource Usage must share unframed centralized analytics.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /title: serverUsageMetricConfig\.title,\s*timeframe: undefined/,
  "Managed resource Usage must delegate its timeframe control to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerUsageTimeframeControl = isSourceServerUsageTab\s*\? React\.createElement\(PlatformSwitch, \{[\s\S]{0,320}options: serverDetailTimescaleOptions,[\s\S]{0,180}onValueChange: setServerDetailChartTimescale/,
  "Function and Web App Usage must render the centralized timeframe switch in the app header.",
);
const sourceServerSidebarDeployControlStart = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "const sourceServerSidebarDeployControl =",
);
const sourceServerSidebarDeployControlEnd = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "const sourceServerPropertiesSidebar =",
  sourceServerSidebarDeployControlStart,
);
assert.ok(
  sourceServerSidebarDeployControlStart >= 0
    && sourceServerSidebarDeployControlEnd > sourceServerSidebarDeployControlStart,
  "The shared source deployment control must be present.",
);
const sourceServerSidebarDeployControlSource = COMPUTE_RESOURCES_PAGE_SCRIPT.slice(
  sourceServerSidebarDeployControlStart,
  sourceServerSidebarDeployControlEnd,
);
assert.match(
  sourceServerSidebarDeployControlSource,
  /mode: "split-action"[\s\S]*buttonVariant: "primary"[\s\S]*label: "Deploy"[\s\S]*fullWidth: true/,
  "Source Properties must expose Deploy through the centralized full-width primary split button.",
);
assert.match(
  sourceServerSidebarDeployControlSource,
  /onAction: \(\) => handleDeployServer\(\)[\s\S]*isWebAppServer[\s\S]*"Open App"[\s\S]*"Test Invoke"/,
  "The shared Deploy selector must preserve the resource-specific Open App or Test Invoke action.",
);
assert.match(
  sourceServerSidebarDeployControlSource,
  /decommissionActiveSourceServerDeployment\(\)[\s\S]{0,1600}"Decommission"/,
  "The shared Deploy selector must expose Decommission as a deployment lifecycle action.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /async function unpublishAuthoritativeServerVersionApi\(serverId, versionId\)[\s\S]{0,700}serverVersionApiClient\.unpublishServerVersion/,
  "Function decommissioning must use the authoritative server-version unpublish API.",
);
const sourceServerDecommissionSource =
  COMPUTE_RESOURCES_PAGE_SCRIPT.match(
    /async function decommissionActiveSourceServerDeployment\(\) \{[\s\S]*?\n\s*async function deleteAuthoritativeServerVersion/,
  )?.[0] || "";
assert.match(
  sourceServerDecommissionSource,
  /\["function", "web_app"\]\.includes\(normalizedServerKind\)/,
  "Source decommissioning must support both Function and Web App resources.",
);
assert.match(
  sourceServerDecommissionSource,
  /hasDraftServerVersionChanges\(\)/,
  "Source decommissioning must reject unpublished draft changes.",
);
assert.match(
  sourceServerDecommissionSource,
  /loadingMessage: "Decommissioning " \+ resourceLabel \+ "\.\.\."[\s\S]*unpublishAuthoritativeServerVersionApi/,
  "Source decommissioning must unpublish the authoritative active version.",
);
assert.match(
  sourceServerDecommissionSource,
  /loadServerDeployments\(serverId, \{ force: true \}\)/,
  "Source decommissioning must preserve the resource and refresh authoritative deployment state.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerPropertiesSidebar = isSourceDeployableServer[\s\S]{0,240}cardTitle: undefined[\s\S]{0,4200}renderSourceServerSidebarRow\("Owner"[\s\S]{0,500}sourceServerSidebarDeployControl/,
  "Function and Web App Properties must share the title-free sidebar and place Deploy beneath Owner.",
);
const sourceServerTopNavActionsStart = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "const sourceServerTopNavActions =",
);
const sourceServerTopNavActionsEnd = COMPUTE_RESOURCES_PAGE_SCRIPT.indexOf(
  "const activeServerEditorContent =",
  sourceServerTopNavActionsStart,
);
assert.ok(
  sourceServerTopNavActionsStart >= 0 && sourceServerTopNavActionsEnd > sourceServerTopNavActionsStart,
  "Function app-header actions source must be present.",
);
const sourceServerTopNavActionsSource = COMPUTE_RESOURCES_PAGE_SCRIPT.slice(
  sourceServerTopNavActionsStart,
  sourceServerTopNavActionsEnd,
);
assert.doesNotMatch(
  sourceServerTopNavActionsSource,
  /Test Invoke|handleInvokeServer/,
  "Function Test Invoke must not remain as a standalone app-header action.",
);
assert.match(
  sourceServerTopNavActionsSource,
  /sourceServerUsageTimeframeControl,[\s\S]{0,200}renderServerPublishSplitButton\(\)/,
  "The shared app header must render the timeframe switch before Save & Publish.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-source-server-sidebar-deploy-selector \{\s*margin-top: 12px;\s*\}/,
  "The shared source sidebar must own spacing around the centralized full-width Deploy selector.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-settings-tab\.is-source-deployable-settings-tab[\s\S]{0,100}\.playground-environments-connections-section \{\s*margin-bottom: 42px;/,
  "Source Settings must reserve 42px below Connections.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authDetailWorkspace = React\.createElement\(DevelopServerDetailPage, \{\s*tabs: \[\],[\s\S]{0,500}sidebarAutoCollapseTabs: \["users"\]/,
  "Authentication details must use the headerless shared detail shell and auto-collapse Details on Users.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authDetailTabs = \[/,
  "Authentication details must not duplicate app-header navigation with an in-page tab bar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,220}cardTitle: undefined,[\s\S]{0,1800}renderSourceServerSidebarRow\("Updated",[\s\S]{0,400}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Authentication details must use the title-free shared sidebar and place ownership last.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authDetailSidebar[\s\S]{0,1800}renderSourceServerSidebarRow\("Resource ID"/,
  "Authentication details must not duplicate the resource ID in the sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authUsageTimeframeControl = normalizedAuthDetailTab === "usage"[\s\S]{0,500}React\.createElement\(PlatformSwitch,[\s\S]{0,300}options: serverDetailTimescaleOptions/,
  "Authentication Usage must render the centralized timeframe switch in the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authAddUserAction = React\.createElement\(PlatformPrimaryButton, \{\s*type: "button",\s*size: "small",[\s\S]{0,500}onClick: openServerAuthUserComposer[\s\S]{0,300}"Add User"[\s\S]{0,500}const authTopNavActions = topNavActionsContainer[\s\S]{0,300}authUsageTimeframeControl,[\s\S]{0,120}authAddUserAction/,
  "Authentication details must expose the centralized 28px Add User action from the app header on every tab.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isAuthenticationResourcesDetail[\s\S]{0,500}activeSection: \["users", "usage", "settings"\]\.includes\(authDetailTab\)[\s\S]{0,700}setAuthDetailTab\(normalizedNextSection\)/,
  "Authentication details must publish their active section and navigation handler to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverSettingsResourcesTable = isSourceDeployableServer\s*\? sourceServerSettingsResourcesTable\s*: serverTeamAccessPlatformSection/,
  "Authentication Settings must reuse the centralized Manage Access table without source-only Custom Domains.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-detail-page\.is-headerless\.is-tabless\.is-managed-data-list-tab \{\s*grid-template-rows: minmax\(0, 1fr\);/,
  "Header-owned managed-data details must fill the available height without reserving removed header or tab rows.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-server-settings-tab:is\(\.is-auth-settings-tab, \.is-agent-runtime-settings-tab, \.is-secrets-settings-tab, \.is-payments-settings-tab\)[\s\S]{0,220}:is\(\.playground-auth-description-section, \.playground-agent-runtime-description-section, \.playground-secrets-description-section, \.playground-payments-description-section\)[\s\S]{0,100}\.platform-instructions-editor__title \{\s*font-size: 14px;/,
  "Managed resource Settings must use the shared 14px Description heading.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Authentication users",[\s\S]{0,250}variant: "minimalistic-ui",[\s\S]{0,100}layout: "fill"/,
  "Authentication Users must use the centralized full-height minimal table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authUsersSurface = React\.createElement\(PlatformUiCard,[\s\S]{0,220}className: "playground-managed-data-list-surface playground-auth-users-surface"/,
  "Authentication Users must use the shared UI card as their outer surface.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverResourceDetailBackButton = !isSourceDeployableServer\s*&& !isAuthServer\s*&& !isSecretsServer\s*&& !isPaymentsServer\s*&& !isAgentRuntimeServer/,
  "Managed Develop resource detail titles must not render the inline back arrow.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Authentication users",[\s\S]{0,500}selection: \{\s*enabled: true,[\s\S]{0,120}ariaLabel: \(user\) => "Select "/,
  "Authentication Users must expose the centralized table checkbox selection controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: \{\s*title: "All Users",\s*filters: \[\{\s*id: "provider"/,
  "Authentication Users must use the shared All Users toolbar and provider filter popup.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Authentication users",[\s\S]{0,1800}toolbar: \{[\s\S]{0,900}primaryAction: \{[\s\S]{0,200}label: "Add User"/,
  "Authentication Users must not duplicate the app-header Add User action in the table toolbar.",
);
assert.match(
  mutationsAndDataSource,
  /function renderServerAuthUserComposerModal\(\) \{[\s\S]{0,300}React\.createElement\(PlatformModal, \{[\s\S]{0,500}title: "Add User"[\s\S]{0,500}initialFocusRef: serverAuthUserEmailInputRef[\s\S]{0,1200}React\.createElement\(PlatformSecondaryButton,[\s\S]{0,500}React\.createElement\(PlatformPrimaryButton,/,
  "Authentication user creation must use the centralized modal and button components with deterministic input focus.",
);
assert.doesNotMatch(
  mutationsAndDataSource,
  /function renderServerAuthUserComposerModal\(\) \{[\s\S]{0,5000}React\.createElement\(PlatformModal(?:Backdrop|Surface)/,
  "Authentication user creation must not rebuild the centralized modal from backdrop or surface primitives.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Authentication users",[\s\S]{0,400}pagination: \{\s*defaultValue: \{ pageIndex: 0, pageSize: 20 \},\s*pageSizeOptions: \[20, 50, 100\]/,
  "Authentication Users must render the centralized table pagination footer.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverTeamAccessTable = React\.createElement\(PlatformResourceAccessTable, \{[\s\S]{0,2800}trailing: serverAddTeamsControl/,
  "Managed Develop resource access management must use the shared embedded table and Add Teams control.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsDetailWorkspace = React\.createElement\(DevelopServerDetailPage, \{\s*tabs: \[\],[\s\S]{0,500}sidebarAutoCollapseTabs: \["secrets"\]/,
  "Secrets details must use the headerless shared detail shell and auto-collapse Details on the Secrets table.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsDetailTabs = \[/,
  "Secrets details must not duplicate app-header navigation with an in-page tab bar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,220}cardTitle: undefined,[\s\S]{0,1800}renderSourceServerSidebarRow\("Creator", serverCreatorValue[\s\S]{0,1500}renderSourceServerSidebarRow\("Updated",[\s\S]{0,400}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Secrets details must use the title-free shared sidebar, expose creator provenance, and place transferable ownership last.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsDetailSidebar[\s\S]{0,1800}renderSourceServerSidebarRow\("Resource ID"/,
  "Secrets details must not duplicate the resource ID in the sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Server secrets",[\s\S]{0,300}variant: "minimalistic-ui",[\s\S]{0,100}layout: "fill"/,
  "Secrets must use the centralized full-height minimal table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsSurface = React\.createElement\(PlatformUiCard,[\s\S]{0,220}className: "playground-managed-data-list-surface playground-secrets-surface"/,
  "Secrets must use the shared UI card as their outer surface.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /playground-auth-users-secret-description/,
  "Secrets table rows must not render description subtitles beneath secret names.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Server secrets",[\s\S]{0,500}selection: \{\s*enabled: true,[\s\S]{0,120}ariaLabel: \(secret\) => "Select "/,
  "Secrets must expose centralized table checkbox selection controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: \{\s*title: "All Secrets",\s*search: \{/,
  "Secrets must use the shared All Secrets table toolbar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Server secrets",[\s\S]{0,1800}toolbar: \{[\s\S]{0,900}primaryAction: \{[\s\S]{0,200}label: "Add Secret"/,
  "Secrets must not duplicate the app-header Add Secret action in the table toolbar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsUsageTimeframeControl = normalizedSecretsDetailTab === "usage"[\s\S]{0,500}React\.createElement\(PlatformSwitch,[\s\S]{0,300}options: serverDetailTimescaleOptions/,
  "Secrets Usage must render the centralized timeframe switch in the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsAddSecretAction = React\.createElement\(PlatformPrimaryButton, \{\s*type: "button",\s*size: "small",[\s\S]{0,500}openServerSecretComposer\(null\)[\s\S]{0,300}"Add Secret"[\s\S]{0,500}const secretsTopNavActions = topNavActionsContainer[\s\S]{0,300}secretsUsageTimeframeControl,[\s\S]{0,120}secretsAddSecretAction/,
  "Secrets details must expose the centralized 28px Add Secret action from the app header on every tab.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isSecretsResourcesDetail[\s\S]{0,500}activeSection: \["secrets", "usage", "settings"\]\.includes\(secretsDetailTab\)[\s\S]{0,700}setSecretsDetailTab\(normalizedNextSection\)/,
  "Secrets details must publish their active section and navigation handler to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const usesCentralServerDescription = isSourceDeployableServer \|\| isAuthServer \|\| isAgentRuntimeServer \|\| isSecretsServer \|\| isPaymentsServer[\s\S]{0,700}variant: "minimalistic-ui"/,
  "Secrets Settings must reuse the centralized minimal instructions editor.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverDeploymentMapSection = isSourceDeployableServer \|\| isAuthServer \|\| isAgentRuntimeServer \|\| isSecretsServer \|\| isPaymentsServer/,
  "Secrets Settings must reuse the centralized deployment region map.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretComposerModal = React\.createElement\(PlatformModal, \{[\s\S]{0,800}initialFocusRef: serverSecretNameInputRef[\s\S]{0,1800}footer: React\.createElement\(React\.Fragment,[\s\S]{0,500}React\.createElement\(PlatformSecondaryButton,[\s\S]{0,500}React\.createElement\(PlatformPrimaryButton,/,
  "Secret creation and editing must use the centralized modal and button components with deterministic input focus.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretComposerModal = React\.createElement\(PlatformModal,[\s\S]{0,5000}React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,700}variant: "minimalistic-ui"/,
  "Secret creation and editing must use the centralized minimal instructions editor.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretComposerModal[\s\S]{0,5000}React\.createElement\(PlatformModal(?:Backdrop|Surface)/,
  "Secret creation and editing must not rebuild the centralized modal from backdrop or surface primitives.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /secretsMainTopbar|secretsDetailsSection|const secretsDetailTabs = React\.createElement|const secretsDetailHeader|const secretsDetailSidebarToggle/,
  "Secrets details must not retain the superseded metrics and bespoke navigation shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsDetailWorkspace = React\.createElement\(DevelopServerDetailPage, \{\s*tabs: \[\],[\s\S]{0,300}activeTab: normalizedPaymentsDetailTab/,
  "Payments details must use the headerless shared detail shell.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsDetailTabs = \[|const paymentsDetailHeader|const paymentsDetailSidebarToggle/,
  "Payments details must not duplicate app-header navigation or sidebar controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,220}cardTitle: undefined,[\s\S]{0,2600}renderSourceServerSidebarRow\("Creator", serverCreatorValue[\s\S]{0,2200}renderSourceServerSidebarRow\("Updated",[\s\S]{0,400}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Payments details must use the title-free shared sidebar, expose creator provenance, and place transferable ownership last.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsDetailSidebar[\s\S]{0,2600}renderSourceServerSidebarRow\("Resource ID"/,
  "Payments details must not duplicate the resource ID in the sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsUsageTimeframeControl = normalizedPaymentsDetailTab === "usage"[\s\S]{0,500}React\.createElement\(PlatformSwitch,[\s\S]{0,300}options: serverDetailTimescaleOptions/,
  "Payments Usage must render the centralized timeframe switch in the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsTopNavActions = topNavActionsContainer[\s\S]{0,300}paymentsUsageTimeframeControl,[\s\S]{0,1500}React\.createElement\(PlatformPrimaryButton, \{\s*size: "small"[\s\S]{0,1000}"Connect Stripe"/,
  "Payments details must publish the shared timeframe and compact Stripe setup controls through the centralized app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isPaymentsResourcesDetail[\s\S]{0,500}activeSection: \["usage", "settings"\]\.includes\(serverDetailTab\)[\s\S]{0,700}setServerDetailTab\(normalizedNextSection\)/,
  "Payments details must publish their active section and navigation handler to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Agent runtime threads",[\s\S]{0,320}variant: "minimalistic-ui",[\s\S]{0,120}layout: "fill"/,
  "Agent Runtime Threads must use the centralized full-height minimal table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeThreadsTabContent = agentRuntimeRunsSurface;/,
  "Agent Runtime Threads must render the centralized table without a redundant storage-location footer.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /title: "All Threads",[\s\S]{0,120}controlsLeading: React\.createElement\("button",[\s\S]{0,900}search: \{[\s\S]{0,120}placeholder: "Search threads"/,
  "Agent Runtime Threads must place Refresh before Search in the table toolbar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeRunsSurface = React\.createElement\(PlatformUiCard,[\s\S]{0,260}className: "playground-managed-data-list-surface playground-agent-runtime-runs-surface"/,
  "Agent Runtime Threads must use the shared UI card as their outer surface.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeDetailWorkspace = React\.createElement\(DevelopServerDetailPage, \{\s*tabs: \[\],[\s\S]{0,500}sidebarAutoCollapseTabs: \["threads"\]/,
  "Agent Runtime details must use the headerless shared detail shell and auto-collapse Details on Threads.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,220}cardTitle: undefined,[\s\S]{0,3200}renderSourceServerSidebarRow\("Updated",[\s\S]{0,400}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Agent Runtime details must use the title-free shared sidebar and place ownership last.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeDetailSidebar[\s\S]{0,3200}renderSourceServerSidebarRow\("Resource ID"/,
  "Agent Runtime details must not duplicate the resource ID in the sidebar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeDetailSidebar[\s\S]{0,3200}renderSourceServerSidebarRow\("(?:Completed|Failed|Running|Location)"/,
  "Agent Runtime details must omit derived run counters and location from the shared sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(PlatformPopup, \{\s*open: agentRuntimeSkillsPopoverOpen,[\s\S]{0,900}variant: "minimal"/,
  "Agent Runtime Skills must use the centralized minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /open: agentRuntimeSkillsPopoverOpen,[\s\S]{0,300}surfaceRef: agentRuntimeSkillsPopupSurfaceRef,[\s\S]{0,900}portal: true/,
  "Agent Runtime Skills must portal the popup above the Settings page stacking context.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /trigger: React\.createElement\(PlatformSecondaryButton, \{[\s\S]{0,1000}\}, "Manage Skills"\)/,
  "Agent Runtime Skills must use the centralized secondary button.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-agent-runtime-settings-card\.playground-server-details-card \{[\s\S]{0,220}border: 1px solid rgba\(255, 255, 255, 0\.075\);[\s\S]{0,160}background: rgba\(255, 255, 255, 0\.075\);/,
  "Agent Runtime configuration must use the shared neutral card treatment.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-agent-runtime-settings-card\.playground-server-details-card::before \{\s*content: none;\s*display: none;/,
  "Agent Runtime configuration must remove the legacy decorative pseudo-element.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeUsageTimeframeControl = normalizedAgentRuntimeDetailTab === "usage"[\s\S]{0,500}React\.createElement\(PlatformSwitch,[\s\S]{0,300}options: serverDetailTimescaleOptions/,
  "Agent Runtime Usage must render the centralized timeframe switch in the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeNewThreadAction = React\.createElement\(PlatformPrimaryButton,[\s\S]*?React\.createElement\("span", null, "New Thread"\)\s*\);/,
  "Agent Runtime details must expose the centralized compact New Thread action.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeTopNavActions = topNavActionsContainer[\s\S]*?agentRuntimeUsageTimeframeControl,[\s\S]*?agentRuntimeNewThreadAction[\s\S]*?topNavActionsContainer/,
  "Agent Runtime details must place the New Thread action in the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeEndpoint = String\(draftServer\.serviceUrl \|\| ""\)\.trim\(\);[\s\S]{0,240}const agentRuntimeIsDeployed = String\(draftServer\.status \|\| ""\)\.trim\(\)\.toLowerCase\(\) === "deployed"[\s\S]{0,120}Boolean\(agentRuntimeEndpoint\)/,
  "Agent Runtime readiness must require both deployed lifecycle state and its canonical endpoint.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeEndpointValue = agentRuntimeEndpoint[\s\S]{0,1800}copyTextToClipboard\(agentRuntimeEndpoint\)[\s\S]{0,900}"Copy Agent Runtime URL"/,
  "Agent Runtime details must expose a copy action beside the deployed endpoint.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderSourceServerSidebarRow\("Streaming"/,
  "Agent Runtime details must not expose the redundant Streaming property.",
);
assert.match(
  developServerDetailPageCss,
  /\.playground-agent-runtime-sidebar-deploy-selector \{\s*margin-top: 12px;/,
  "Agent Runtime deployment controls must be separated from the details rows.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /disabled: !agentRuntimeIsDeployed[\s\S]{0,180}title: agentRuntimeIsDeployed[\s\S]{0,140}"Deploy this Agent Runtime before starting a thread"/,
  "Agent Runtime thread creation must remain disabled until the deployment contract is active.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /backendUrl \+ "\/agent-runtimes\/" \+ encodeURIComponent\(serverToDeployId\) \+ "\/deploy"/,
  "Agent Runtime deployment must use the canonical runtime lifecycle endpoint.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /backendUrl \+ "\/agent-runtimes\/" \+ encodeURIComponent\(serverId\) \+ "\/decommission"/,
  "Agent Runtime decommissioning must use the canonical runtime lifecycle endpoint.",
);
assert.match(
  platformTemplateSource,
  /return backendUrl \+ "\/agent-runtimes\/" \+ encodeURIComponent\(serverId\) \+ "\/runs\?" \+ params\.toString\(\);/,
  "Agent Runtime invocation must use the canonical thread-backed run endpoint.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isAgentRuntimeResourcesDetail[\s\S]{0,500}activeSection: \["usage", "threads", "settings"\]\.includes\(agentRuntimeDetailTab\)[\s\S]{0,700}setAgentRuntimeDetailTab\(normalizedNextSection\)/,
  "Agent Runtime details must publish their active section and navigation handler to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeRunComposerModal = React\.createElement\(PlatformModal, \{[\s\S]{0,500}title: "New Thread"/,
  "Agent Runtime thread creation must use the centralized modal.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /historyKey: "agent-runtime-thread-prompt:"[\s\S]{0,180}className: "playground-agent-runtime-thread-prompt"/,
  "Agent Runtime thread creation must use the centralized minimal instructions editor.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeRunComposerModal[\s\S]{0,5000}React\.createElement\(PlatformModal(?:Backdrop|Surface)/,
  "Agent Runtime thread creation must not rebuild the centralized modal primitives.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /agentRuntimeMainTopbar|agentRuntimeAnalyticsSection|const agentRuntimeDetailTabs|const agentRuntimeDetailHeader|const agentRuntimeDetailSidebarToggle/,
  "Agent Runtime details must not retain the superseded analytics and bespoke navigation shell.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /serverAuthAnalyticsVisibility|authMainTopbar|authDetailsSection/,
  "Authentication details must not retain the superseded analytics and bespoke navigation shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseDetailsSection = React\.createElement\(PlatformAnalyticsSection, \{[\s\S]{0,100}variant: "default",[\s\S]{0,700}timeframe: \{[\s\S]{0,400}ariaLabel: "Database analytics time frame"/,
  "Database Usage must use the centralized unframed analytics presentation.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseOwnerSelectorControl = React\.createElement\(PlatformSelector,[\s\S]{0,3000}popupClassName: "playground-agents-detail-owner-menu playground-server-owner-selector-popup"/,
  "Database ownership must use the centralized avatar selector and minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderDatabaseSidebarRow\("Creator", databaseCreatorValue,[\s\S]{0,1800}renderDatabaseSidebarRow\("Updated",[\s\S]{0,400}renderDatabaseSidebarRow\("Owner", databaseOwnerSelectorControl/,
  "Database details must keep creator provenance separate and place Owner last.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderDatabaseSidebarRow\("Owner", databaseOwnerSelectorControl,[\s\S]{0,250}playground-server-detail-sidebar-owner-cell/,
  "Database details must expose ownership in the shared Properties sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseDetailWorkspace = React\.createElement\(DevelopServerDetailPage,[\s\S]{0,180}tabs: \[\],[\s\S]{0,700}sidebarAutoCollapseTabs: \["data"\]/,
  "Database details must use the tabless shared detail shell and auto-collapse its sidebar on Data.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseDetailTabs = \[/,
  "Database details must not duplicate app-header navigation with an in-page tab bar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /selectedResourcesDetailType === "database"[\s\S]{0,280}activeSection: \["data", "usage", "settings"\]\.includes\(databaseDetailTab\)[\s\S]{0,500}setDatabaseDetailTab\(normalizedNextSection\)/,
  "Database details must publish their active section and navigation handler to the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /databaseDetailTab !== "data"[\s\S]{0,400}setDatabaseDetailsCollapsed\(\(current\) => !current\)[\s\S]{0,600}renderDatabaseExportControl\(\)/,
  "Database Usage and Settings must preserve the properties toggle in the app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderDatabaseExportControl = \(\) => \{[\s\S]{0,1600}React\.createElement\(PlatformButtonSelector, \{[\s\S]{0,200}mode: "popup",[\s\S]{0,120}buttonVariant: "primary",[\s\S]{0,1000}openOnHover: true,[\s\S]{0,400}popupVariant: "minimal"/,
  "Database Export must use the centralized primary selector with a hover-opened minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderDatabaseTitleActionsControl = \(\) => \{[\s\S]{0,1800}React\.createElement\(PlatformPopup, \{[\s\S]{0,900}variant: "minimal",[\s\S]{0,120}portal: true,[\s\S]{0,120}placement: "bottom-start"/,
  "Database actions must use the centralized minimal popup beside the title.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseTitleActions = databaseTitleActionsContainer[\s\S]{0,300}createPortal\([\s\S]{0,100}renderDatabaseTitleActionsControl\(\),[\s\S]{0,100}databaseTitleActionsContainer/,
  "Database title actions must portal into the shared app-header breadcrumb target.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderServerTitleActionsControl = \(\) => \{[\s\S]{0,2200}React\.createElement\(PlatformPopup, \{[\s\S]{0,900}variant: "minimal",[\s\S]{0,120}portal: true,[\s\S]{0,120}placement: "bottom-start"/,
  "Managed server actions must use the centralized minimal popup beside the title.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverTitleActions = serverTitleActionsContainer[\s\S]{0,400}createPortal\([\s\S]{0,100}renderServerTitleActionsControl\(\),[\s\S]{0,100}serverTitleActionsContainer/,
  "Managed server title actions must portal into the shared app-header breadcrumb target.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /useLayoutEffect\(\(\) => \{[\s\S]{0,300}databaseTitleActionsPortalId[\s\S]{0,500}document\.getElementById\(databaseTitleActionsPortalId\)[\s\S]{0,300}current === nextContainer \? current : nextContainer[\s\S]{0,100}\}\);/,
  "The Database title action portal must re-resolve after its app-header target mounts.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /useLayoutEffect\(\(\) => \{[\s\S]{0,300}serverTitleActionsPortalId[\s\S]{0,500}document\.getElementById\(serverTitleActionsPortalId\)[\s\S]{0,300}current === nextContainer \? current : nextContainer[\s\S]{0,100}\}\);/,
  "The managed server title action portal must re-resolve after its app-header target mounts.",
);
assert.equal(
  (COMPUTE_RESOURCES_PAGE_SCRIPT.match(/renderCurrentResourceSettingsControl\(buttonClassName\)/g) || []).length,
  1,
  "The right-side app-header settings control must only remain on non-database server details.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /\["function", "web_app", "auth", "agent_runtime", "secrets", "payments"\]\.includes\(activeServerKind\)[\s\S]{0,80}return null;[\s\S]{0,120}renderCurrentResourceSettingsControl\(buttonClassName\)/,
  "Managed server actions must not be duplicated in the right-side app-header controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /databaseActionsPopoverRef\.current\?\.contains\(target\)[\s\S]{0,120}databaseActionsPopoverSurfaceRef\.current\?\.contains\(target\)/,
  "The portaled Database action popup must participate in outside-click containment.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /serverActionsPopoverRef\.current\?\.contains\(target\)[\s\S]{0,120}serverActionsPopoverSurfaceRef\.current\?\.contains\(target\)/,
  "The portaled Function action popup must participate in outside-click containment.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerTopNavActions = isSourceDeployableServer[\s\S]{0,2200}renderServerPublishSplitButton\(\)\s*\),\s*topNavActionsContainer/,
  "Function app-header actions must end with Save and Publish without a properties-sidebar toggle.",
);
assert.match(
  databaseDetailViewSource,
  /const databaseDescriptionSection = React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,700}variant: "minimalistic-ui",[\s\S]{0,200}className: "playground-database-description-section"/,
  "Database Settings must use the centralized minimal instructions editor for Description.",
);
assert.match(
  databaseDetailViewSource,
  /const databaseDeploymentMapSection = React\.createElement\(PlatformDeploymentMap, \{[\s\S]{0,300}regionCode: draftDatabase\.location \|\| "eur3"[\s\S]{0,250}className: "playground-database-deployment-map"/,
  "Database Settings must render the centralized deployment map for the configured location.",
);
assert.match(
  databaseDetailViewSource,
  /const databaseSettingsOverviewContent = React\.createElement\("section",[\s\S]{0,350}databaseDeploymentMapSection,[\s\S]{0,100}databaseDescriptionSection/,
  "Database Settings must render deployment geography before the editable description.",
);
assert.doesNotMatch(
  databaseDetailViewSource,
  /databaseStorageLocation|Data is stored in Location/,
  "Database Data must let the browser occupy the full tab height without a storage-location footer.",
);
assert.match(
  databaseDetailViewSource,
  /const renderDatabaseBrowserEmptyPane = \(\{ icon, title, description \}\) =>\s*React\.createElement\(PlatformEmptyState,/,
  "Database collection and document columns must use the centralized empty-state component.",
);
assert.match(
  databaseDetailViewSource,
  /title: "No fields yet",[\s\S]{0,240}primaryAction: isDatabaseTemplatePreview/,
  "The database fields column must use the centralized actionable empty state.",
);
assert.match(
  databaseDetailViewSource,
  /const renderDatabaseComposerModal = \([\s\S]{0,1800}React\.createElement\(PlatformModal, \{[\s\S]{0,1200}React\.createElement\(PlatformSecondaryButton,[\s\S]{0,500}React\.createElement\(PlatformPrimaryButton,/,
  "Database collection, document, and field composers must use the centralized modal and button components.",
);
assert.equal(
  (databaseDetailViewSource.match(/ComposerModal = renderDatabaseComposerModal\(/g) || []).length,
  3,
  "All three database data composers must use the shared centralized modal helper.",
);
assert.doesNotMatch(
  databaseDetailViewSource,
  /const database(?:Collection|Document|Field)ComposerModal = [\s\S]{0,120}PlatformModalBackdrop/,
  "Database data composers must not rebuild the low-level modal shell.",
);
assert.match(
  databaseDetailViewSource,
  /className: "playground-database-browser-add-field"[\s\S]{0,240}" is-layout-placeholder"[\s\S]{0,320}databaseDocumentViewMode !== "preview"/,
  "Database JSON mode must preserve a hidden, disabled Add Field layout placeholder.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(PlatformResourceAccessTable, \{\s*teams: databasePermissionTeams\.filter[\s\S]{0,180}resourceLabel: "Database"/,
  "Database access management must use the centralized resource access table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-database-access-platform-data-table",[\s\S]{0,220}selectedIds: selectedDatabaseAccessTeamIds,[\s\S]{0,180}trailing: databaseAddTeamsControl/,
  "Database access management must retain selection and Add Teams controls through the shared table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseAddTeamsControl = canManageDatabaseTeamAccess\s*\? React\.createElement\(PlatformPopup, \{\s*open: databaseTeamMenuId === "add-teams",\s*variant: "minimal"/,
  "Database access management must use the shared minimal popup and secondary Add Teams control.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /surfaceClassName: "playground-project-teams-add-menu playground-database-team-menu-scope",[\s\S]{0,1000}trigger: React\.createElement\(PlatformSecondaryButton/,
  "Database Add Teams must use the centralized secondary trigger.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /selectedIds: selectedDatabaseAccessTeamIds,[\s\S]{0,100}onSelectedIdsChange: setSelectedDatabaseAccessTeamIds/,
  "Database access management must preserve centralized row selection for bulk access removal.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseSettingsOverviewContent = React\.createElement\("section",[\s\S]{0,700}playground-database-access-section-header/,
  "Database access management must not recreate a separate legacy heading above the shared table toolbar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseOwnerSelectorRow =[\s\S]{0,500}renderPlaygroundPlatformPopup/,
  "Database ownership must not recreate the legacy popup shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderEnvironmentSidebarRow\("Creator", renderDevelopResourceIdentityValue\(environmentCreatorIdentity\)[\s\S]{0,5200}renderEnvironmentSidebarRow\("Owner", renderDevelopResourceIdentityValue\(environmentOwnerIdentity\)/,
  "Computer details must expose Creator and place Owner last in their shared Properties sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function initializeNewDevelopResourceRecord\(record\)[\s\S]{0,350}initializeDevelopResourceIdentityMetadata[\s\S]{0,300}\{ force: true \}/,
  "New Develop resources must persist immutable creator and initial owner metadata.",
);

const serverVersionControllerIndex = COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.indexOf(
  "controller/server-versioning-and-composers.js",
);
const authoritativeServerVersioningIndex = COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.indexOf(
  "controller/server-authoritative-versioning.js",
);
assert.ok(
  serverVersionControllerIndex >= 0 &&
    authoritativeServerVersioningIndex > serverVersionControllerIndex,
  "Authoritative server hooks must run after serverVersionController is initialized.",
);

for (const relativePath of COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS) {
  const source = await fs.readFile(path.join(domainRoot, relativePath), "utf8");
  const lineCount = source.split("\n").length;
  assert.ok(
    lineCount <= 7_200,
    `${relativePath} exceeded the 7,200-line compatibility budget (${lineCount}).`,
  );
}

console.log(
  `Compute compatibility controller assembled from ` +
    `${COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length} bounded fragments.`,
);

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS,
  COMPUTE_RESOURCES_PAGE_SCRIPT,
} from "./source.mjs";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

assert.equal(COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length, 12);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function PlaygroundEnvironmentsPage/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentServerEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentDatabaseEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentEnvironmentEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderEmbeddedResourcesOverviewSection/);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(PlatformCodeEditorWorkspace, \{[\s\S]{0,600}variant: "default"/,
  "Function and web app detail code tabs must use the centrally framed workspace variant.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /variant: isFunctionServer \? "default" : "full-screen"/,
  "Web app detail code tabs must not opt out of the shared workspace frame.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /disabled: isServerPublishControlDisabled,[\s\S]{0,100}menuDisabled: isServerPublishControlDisabled/,
  "Resource save controls must disable their action and menu halves together.",
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
  /const sourceServerCodeTabBarActions = React\.createElement\(PlatformButtonSelector,[\s\S]{0,500}label: "Add File"[\s\S]{0,500}buttonVariant: "primary"[\s\S]{0,300}buttonSize: "compact"[\s\S]{0,300}popupVariant: "minimal"/,
  "Source code workspaces must use the shared primary Add File selector and minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /tabBarActions: sourceServerCodeTabBarActions/,
  "The source-code Add File selector must render at the end of the shared editor tab bar.",
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
  /const requestUrl = backendUrl \+ "\/servers"[\s\S]{0,700}staleWhileRevalidate: false/,
  "Server catalogs must await stale-cache revalidation so fresh rows reach React.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authoritativeCatalogReady =[\s\S]{0,300}if \(authoritativeCatalogReady \|\| metricServers\.length === 0\) \{[\s\S]{0,500}Analytics can make the first paint useful, but only \/servers owns catalog readiness\./,
  "Empty analytics snapshots must not mark a resource catalog as loaded.",
);
assert.equal(
  (COMPUTE_RESOURCES_PAGE_SCRIPT.match(/setHasLoadedServers\(true\)/g) || []).length,
  1,
  "Only the authoritative server-list response may mark the catalog as loaded.",
);
assert.equal(
  (COMPUTE_RESOURCES_PAGE_SCRIPT.match(/setLoadedServerListScope\(requestScopeKey\)/g) || []).length,
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
  /toolbar: \{\s*title: "Custom Domains",\s*primaryAction: \{\s*label: "Add Domain"/,
  "Custom domains must keep their add action in the centralized table toolbar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-custom-domain-card"/,
  "Custom domains must not recreate legacy card rows outside PlatformDataTable.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: serverKindLabel \+ " team access",[\s\S]{0,900}variant: "minimalistic-ui",[\s\S]{0,180}pagination: false/,
  "Managed Develop resource access management must use the embedded minimal PlatformDataTable.",
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
  /React\.createElement\(PlatformPermissionsPage, \{[\s\S]{0,180}subjectType: serverPermissionSubjectType/,
  "Managed resource permission pages must render the concrete resource catalog.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const renderServerDetailSelectControl = \([\s\S]{0,1800}React\.createElement\(PlatformSelector,[\s\S]{0,900}popupClassName: "playground-server-detail-selector-popup"/,
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
  /className: "playground-server-settings-tab"[\s\S]{0,180}isWebAppServer \? " is-web-app-settings-tab"/,
  "Web app settings must expose a scoped surface for centralized connection controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: isFunctionServer \? "is-function-server-detail" : "is-web-app-server-detail"/,
  "Function and web app detail pages must expose resource-specific centralized detail scopes.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverOwnerSelectorControl = renderPlaygroundPlatformPopup/,
  "Function ownership must not recreate the legacy popup shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: isAuthServer[\s\S]{0,800}title: usesCentralServerAccessTable \? "Manage " \+ serverKindLabel \+ " Access" : null,[\s\S]{0,4000}const serverTeamAccessPlatformSection = usesCentralServerAccessTable\s*\? serverTeamAccessTable/,
  "Function, web app, authentication, and Secrets access management must share the centralized table without legacy wrappers.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverAddTeamsControl = React\.createElement\(PlatformButtonSelector,[\s\S]{0,350}buttonVariant: "secondary"[\s\S]{0,1200}popupVariant: "minimal"/,
  "Function and web app access tables must use the centralized secondary Add Teams selector.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /selection: \{\s*enabled: true,[\s\S]{0,300}onChange: \(\{ selectedIds \}\) => setSelectedServerAccessTeamIds\(new Set\(selectedIds\)\)/,
  "Function and web app access tables must delegate row selection to the centralized table checkbox component.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderSourceServerSidebarRow\("Creator", serverCreatorValue,[\s\S]{0,220}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Function and web app Properties sidebars must keep immutable creator provenance separate from ownership.",
);
assert.equal(
  (COMPUTE_RESOURCES_PAGE_SCRIPT.match(/renderSourceServerSidebarRow\("Creator", serverCreatorValue/g) || []).length,
  5,
  "Every managed server detail sidebar must expose Creator before Owner.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl,[\s\S]{0,250}playground-server-detail-sidebar-owner-cell/,
  "Function and web app Properties sidebars must expose the shared owner selector.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverUsageTabContent = isOperationalDetailServer\s*\? isSourceDeployableServer \|\| isAuthServer \|\| isSecretsServer \|\| isPaymentsServer \|\| isAgentRuntimeServer\s*\? React\.createElement\(PlatformAnalyticsSection,[\s\S]{0,500}variant: "framed"/,
  "Managed Develop resource Usage tabs must share the centralized framed analytics component.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authDetailTabs = \[[\s\S]{0,350}\{ id: "users", label: "Users", icon: Users \}[\s\S]{0,6000}const authDetailWorkspace = React\.createElement\(DevelopServerDetailPage,[\s\S]{0,500}sidebarAutoCollapseTabs: \["users"\]/,
  "Authentication details must use the shared detail shell and auto-collapse Properties on Users.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const authDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,700}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Authentication details must expose ownership in the shared Properties sidebar.",
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
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Authentication users",[\s\S]{0,400}pagination: \{\s*defaultValue: \{ pageIndex: 0, pageSize: 20 \},\s*pageSizeOptions: \[20, 50, 100\]/,
  "Authentication Users must render the centralized table pagination footer.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const usesCentralServerAccessTable = isOperationalDetailServer;[\s\S]{0,7000}toolbar: isAuthServer\s*\? \{\s*title: "Manage " \+ serverKindLabel \+ " Access",\s*trailing: serverAddTeamsControl/,
  "Managed Develop resource access management must use the shared embedded table and Add Teams control.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsDetailTabs = \[[\s\S]{0,350}\{ id: "secrets", label: "Secrets", icon: Key \}[\s\S]{0,6500}const secretsDetailWorkspace = React\.createElement\(DevelopServerDetailPage,[\s\S]{0,600}sidebarAutoCollapseTabs: \["secrets"\]/,
  "Secrets details must use the shared detail shell and auto-collapse Properties on the Secrets table.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const secretsDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,800}renderSourceServerSidebarRow\("Creator", serverCreatorValue[\s\S]{0,240}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Secrets details must expose immutable creator and transferable owner identities in the shared Properties sidebar.",
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
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Server secrets",[\s\S]{0,500}selection: \{\s*enabled: true,[\s\S]{0,120}ariaLabel: \(secret\) => "Select "/,
  "Secrets must expose centralized table checkbox selection controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: \{\s*title: "All Secrets",[\s\S]{0,400}primaryAction: \{\s*label: "Add Secret"/,
  "Secrets must use the shared table toolbar and primary creation action.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /secretsMainTopbar|secretsDetailsSection|const secretsDetailTabs = React\.createElement/,
  "Secrets details must not retain the superseded metrics and bespoke navigation shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsDetailTabs = \[[\s\S]{0,300}\{ id: "settings", label: "Settings", icon: Settings \}[\s\S]*?const paymentsDetailWorkspace = React\.createElement\(DevelopServerDetailPage/,
  "Payments details must use the shared detail shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,800}renderSourceServerSidebarRow\("Creator", serverCreatorValue[\s\S]{0,240}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Payments details must expose immutable creator and transferable owner identities in the shared Properties sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const paymentsTopNavActions = topNavActionsContainer[\s\S]*?React\.createElement\(PlatformPrimaryButton,[\s\S]*?"Connect Stripe"/,
  "Payments details must publish their setup controls through the centralized app header.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Agent runtime threads",[\s\S]{0,320}variant: "minimalistic-ui",[\s\S]{0,120}layout: "fill"/,
  "Agent Runtime Threads must use the centralized full-height minimal table.",
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
  /const agentRuntimeDetailTabs = \[[\s\S]{0,350}\{ id: "threads", label: "Threads", icon: MessageSquare \}[\s\S]*?const agentRuntimeDetailWorkspace = React\.createElement\(DevelopServerDetailPage,[\s\S]{0,700}sidebarAutoCollapseTabs: \["threads"\]/,
  "Agent Runtime details must use the shared detail shell and auto-collapse Properties on Threads.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const agentRuntimeDetailSidebar = React\.createElement\(PlatformUiCard,[\s\S]{0,650}renderSourceServerSidebarRow\("Owner", serverOwnerSelectorControl/,
  "Agent Runtime details must expose ownership in the shared Properties sidebar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /agentRuntimeMainTopbar|agentRuntimeAnalyticsSection|const agentRuntimeDetailTabs = React\.createElement/,
  "Agent Runtime details must not retain the superseded analytics and bespoke navigation shell.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /serverAuthAnalyticsVisibility|authMainTopbar|authDetailsSection/,
  "Authentication details must not retain the superseded analytics and bespoke navigation shell.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseDetailsSection = React\.createElement\(PlatformAnalyticsSection, \{[\s\S]{0,100}variant: "framed",[\s\S]{0,700}timeframe: \{[\s\S]{0,400}ariaLabel: "Database analytics time frame"/,
  "Database Usage must use the same centralized framed analytics component as source-backed services.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseOwnerSelectorControl = React\.createElement\(PlatformSelector,[\s\S]{0,3000}popupClassName: "playground-agents-detail-owner-menu playground-server-owner-selector-popup"/,
  "Database ownership must use the centralized avatar selector and minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderDatabaseSidebarRow\("Creator", databaseCreatorValue,[\s\S]{0,220}renderDatabaseSidebarRow\("Owner", databaseOwnerSelectorControl/,
  "Database details must keep immutable creator provenance separate from ownership.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /renderDatabaseSidebarRow\("Owner", databaseOwnerSelectorControl,[\s\S]{0,250}playground-server-detail-sidebar-owner-cell/,
  "Database details must expose ownership in the shared Properties sidebar.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const databaseDetailWorkspace = React\.createElement\(DevelopServerDetailPage,[\s\S]{0,700}sidebarAutoCollapseTabs: \["data"\]/,
  "Database details must use the shared detail shell and auto-collapse its sidebar on Data.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Database team access",[\s\S]{0,180}variant: "minimalistic-ui"/,
  "Database access management must use the same embedded minimal table and toolbar title as project access management.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-database-access-platform-data-table",[\s\S]{0,1000}toolbar: \{\s*title: "Manage Database Access"/,
  "Database access management must keep its title in the shared table toolbar.",
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
  /selection: \{\s*enabled: true,[\s\S]{0,300}onChange: \(\{ selectedIds \}\) => setSelectedDatabaseAccessTeamIds\(new Set\(selectedIds\)\)/,
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
  /renderEnvironmentSidebarRow\("Creator", renderDevelopResourceIdentityValue\(environmentCreatorIdentity\)[\s\S]{0,320}renderEnvironmentSidebarRow\("Owner", renderDevelopResourceIdentityValue\(environmentOwnerIdentity\)/,
  "Computer details must expose Creator and Owner in their shared Properties sidebar.",
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
  serverVersionControllerIndex >= 0
  && authoritativeServerVersioningIndex > serverVersionControllerIndex,
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
  `Compute compatibility controller assembled from `
  + `${COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length} bounded fragments.`,
);


        import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
        import { createPortal } from "react-dom";
        import { createRoot } from "react-dom/client";
  __PLATFORM_COMPATIBILITY_BINDING_061__
        import DOMPurify from "dompurify";
  __PLATFORM_COMPATIBILITY_BINDING_062__
        import ReactMarkdown from "react-markdown";
        import rehypeRaw from "rehype-raw";
        import remarkGfm from "remark-gfm";
        import { visit as unistVisit } from "unist-util-visit";
        import Chart from "chart.js/auto";
        import { addEdge, Background, BaseEdge, Controls, EdgeLabelRenderer, getSimpleBezierPath, Handle, MarkerType, NodeResizer, Position, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
        import { browserLocalPersistence, getApps, getAuth, GoogleAuthProvider, initializeApp, onIdTokenChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup, signOutFirebaseAuth } from "/api/platform/auth/browser-module.js";
  	      import { AlertCircle, ArrowDown, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, ArrowUpFromLine, ArrowUpRight, AudioLines, Award, Battery, BatteryFull, BatteryLow, BatteryMedium, Bell, Bold, BookOpen, Bookmark, Bot, Braces, Brain, Building2, Cable, Calendar as CalendarIcon, Calculator, Camera, ChartColumnIncreasing, ChartNoAxesColumnIncreasing, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Circle, CircleCheckBig, CircleHelp, Clapperboard, Clock, Cloud, Code, Code2, CodeXml, Coins, Copy, Cpu, Crop, Database, DollarSign, Download, Ellipsis, EllipsisVertical, Equal, ExternalLink, Eye, EyeOff, File, FilePlus2, FileText, Film, Filter, FingerprintPattern, Flame, Folder, FolderOpen, FunctionSquare, Ghost, GitBranch, GitBranchPlus, GitCommitHorizontal, GitFork, Globe, Grid3x3, Hand, HardDrive, Heart, History, House, Image as ImageIcon, Info, Italic, Key, KeyRound, LassoSelect, Layers, LayoutDashboard, LayoutGrid, LibraryBig, Lightbulb, Link2, List, ListFilter, ListOrdered, ListTodo, Loader2, LogIn, LogOut, Mail, MapPin, Maximize2, MessageCircle, MessageSquare, Metronome, Mic, Minimize2, Minus, Monitor, MousePointer2, Package, Paintbrush, PanelLeft, PanelLeftClose, PanelLeftOpen, PanelRight, Paperclip, PauseCircle, PenTool, PencilRuler, Pin, Play, Plus, ReceiptText, Redo2, RefreshCw, Rocket, RotateCcw, RotateCw, Save, Scan, Search, Server, Settings, Settings2, Shield, Slash, SlidersHorizontal, Sparkles, Split, Square, SquarePen, StickyNote, Tag, Telescope, Terminal, TestTubeDiagonal, Trash2, Underline, Undo2, Unlink, User, UserRound, Users, UsersRound, Wand2, Webhook, X, Zap } from "lucide-react";
	      import { RunnerClient } from "/dist/index.js";
	      import { RunnerChat, RunnerDocumentPreviewDrawer, RunnerFileDiffSurface, RunnerImagePreviewSurface } from "/dist/react/index.js";
	      import { PlatformAnalyticsSection } from "/dist/platform-ui/components/composite/analytics/index.js";
        import { PlatformAttachments } from "/dist/platform-ui/components/composite/attachments/index.js";
        import { PlatformCodeEditorWorkspace } from "/dist/platform-ui/components/composite/code-editor-workspace/index.js";
  	      import { PlatformCodePreviewBox } from "/dist/platform-ui/components/composite/code-preview-box/index.js";
  	      import { PlatformDataTable } from "/dist/platform-ui/components/composite/data-table/index.js";
  	      import { PlatformDetailTabBar } from "/dist/platform-ui/components/composite/detail-tab-bar/index.js";
        import { PlatformDiffViewer } from "/dist/platform-ui/components/composite/diff-viewer/index.js";
  	      import { PlatformEmptyState } from "/dist/platform-ui/components/composite/empty-state/index.js";
        import { PlatformVersionHistorySidebar, PlatformVersionLabel, PlatformVersionSaveDialog, formatPlatformVersionLabel, normalizePlatformVersionNumber } from "/dist/platform-ui/components/composite/versioning/index.js";
  	      import { PlatformInstructionsEditor } from "/dist/platform-ui/components/composite/instructions-editor/index.js";
  	      import { PlatformLoadingState } from "/dist/platform-ui/components/composite/loading-state/index.js";
        import { PlatformSettingsSection, PlatformSettingsSectionList } from "/dist/platform-ui/components/composite/settings-section/index.js";
        import { PlatformUiCard } from "/dist/platform-ui/components/composite/ui-card/index.js";
  	      import { PlatformButton, PlatformPrimaryButton, PlatformSecondaryButton } from "/dist/platform-ui/components/ui/button/index.js";
  	      import { PlatformLabel } from "/dist/platform-ui/components/ui/label/index.js";
  	      import { PlatformSearch } from "/dist/platform-ui/components/ui/search/index.js";
  	      import { PlatformButtonSelector, PlatformSelector } from "/dist/platform-ui/components/ui/selector/index.js";
  	      import { PlatformPopup, PlatformPopupDismissLayer, PlatformPopupSurface } from "/dist/platform-ui/components/composite/popup/index.js";
  	      import { PlatformModal, PlatformModalBackdrop, PlatformModalBody, PlatformModalFooter, PlatformModalHeader, PlatformModalSurface, PlatformUnsavedChangesModal } from "/dist/platform-ui/components/composite/modal/index.js";
        import { PlatformGlobalSearchModal } from "/dist/platform-shell/app-header/global-search-modal/index.js";
  	      import { PlatformSwitch } from "/dist/platform-ui/components/ui/switch/index.js";
  	      import { PlatformCalendarWidget, PlatformProjectWidget, PlatformProjectWidgetEmpty, PlatformProjectWidgetEmptyState, PlatformProjectWidgetTask, PlatformProjectWidgetTaskList, PlatformUsageWidget } from "/dist/platform-ui/components/composite/widgets/index.js";
  	      import {
  	        PlatformPermissionMiniRingIcon,
  	        PlatformPermissionsPage,
  	        PlatformRolePermissionsPage,
  	        PLATFORM_PERMISSION_ACCESS_OPTIONS as PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
  	        PLATFORM_PERMISSION_ACTION_DEFINITIONS as PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
  	        PLATFORM_PERMISSION_RING_DEFINITIONS as PLAYGROUND_PERMISSION_RING_DEFINITIONS,
  	        PLATFORM_PERMISSION_RING_IDS as PLAYGROUND_PERMISSION_RING_IDS,
  	        buildPlatformPermissionActionPolicy as buildPlaygroundPermissionActionPolicy,
  	        createPlatformDefaultPermissionActions as createPlaygroundDefaultPermissionActions,
  	        createPlatformDefaultPermissionRings as createPlaygroundDefaultPermissionRings,
  	        createPlatformDefaultPermissionSet as createPlaygroundDefaultPermissionSet,
  	        createPlatformFullAccessPermissionSet as createPlaygroundFullAccessPermissionSet,
  	        getPlatformPermissionAccessLabel as getPlaygroundPermissionAccessLabel,
  	        getPlatformPermissionActionDefinitionById as getPlaygroundPermissionActionDefinition,
  	        getPlatformPermissionActionExplicitAccessByDefinition as getPlaygroundPermissionActionExplicitAccess,
  	        getPlatformPermissionRingAccessById as getPlaygroundPermissionRingAccess,
  	        getPlatformPermissionRingDefinitionById as getPlaygroundPermissionRingDefinition,
  	        isPlatformPermissionRecord as isPlaygroundPermissionRecord,
  	        normalizePlatformPermissionAccessValue as normalizePlaygroundPermissionAccess,
  	        normalizePlatformPermissionRingId as normalizePlaygroundPermissionRingId,
  	        normalizePlatformPermissionSet as normalizePlaygroundPermissionSet,
  	      } from "/dist/platform-ui/pages/permissions/index.js";
  	      import { PlatformApplicationBoundary } from "/dist/platform-runtime/platform-application-boundary.js";
        import { AgentPermissionMeters, AgentPermissionRingIcons, AgentPublishControl, AgentsOverviewAnalyticsRequestError, ComputersOverviewAnalyticsRequestError, buildPlatformAgentListScopeKey as buildPlaygroundAgentListScopeKey, createAgentsOverviewAnalytics, createComputersOverviewAnalytics, deleteComputerResource, fetchAgentsOverviewAnalytics, fetchComputersOverviewAnalytics, getAgentPermissionSummary, invalidateAgentsOverviewAnalytics, invalidateComputersOverviewAnalytics, normalizeComputerOverviewRows, normalizePlatformAgentListRecords, readCachedAgentsOverviewAnalytics, readCachedComputersOverviewAnalytics, readCachedPlatformAgentList as readCachedPlaygroundAgentList, saveComputerResource, writeCachedPlatformAgentList as writeCachedPlaygroundAgentList } from "/dist/platform-shell/presentation/platform-resource-api.js";
  	      import { ApiKeysOverviewAnalyticsRequestError, createApiKeysOverviewAnalytics, createDevelopResourceOverviewRows, createDevelopVoiceAgentOverviewRows, deleteDevelopResource, fetchApiKeysOverviewAnalytics, invalidateApiKeysOverviewAnalytics, readCachedApiKeysOverviewAnalytics, saveDevelopResource } from "/dist/platform-shell/presentation/platform-develop-api.js";
        import { AgentDetailPage, AgentPermissionsPage, AgentsOverviewPage, ComputerDetailPage, ComputersOverviewPage, ConfigureHomeOverviewPage, DevelopApiKeysOverviewPage, DevelopHomeOverviewPage, DevelopResourceOverviewRoute, DevelopServerDetailPage, DevelopVoiceAgentsOverviewPage, DevelopWebhooksOverviewPage, EvaluationsOverviewPage, FineTuningOverviewPage, GuardrailsOverviewPage, InferenceEndpointDetailPage, InferenceOverviewPage, MarketplaceOverviewPage, MetronomesOverviewPage, ModelsFeaturedSection, ModelsOverviewPage, NotificationsOverviewPage, OrganizationsOverviewPage, ProjectDetailPage, SkillsOverviewPage, TagDetailPage, TagsOverviewPage, TeamsOverviewPage, TicketDetailPage } from "/dist/platform-shell/presentation/platform-pages.js";
  	      import { openGoogleDrivePicker } from "/dist/platform-integrations/google-drive/google-drive-picker.js";
  
  	      function getPlaygroundSafeIconComponent(Icon, fallbackIcon = Circle) {
  	        return typeof Icon === "function" || (Icon && typeof Icon === "object") ? Icon : fallbackIcon;
  	      }
  
  	      function PlaygroundDetailSectionHeader({
  	        title,
  	        children = null,
  	        presentation = "default",
  	        className = "",
  	      }) {
  	        const normalizedPresentation = presentation === "static-transparent"
  	          ? "static-transparent"
  	          : "default";
  	        return React.createElement("div", {
  	            className: "playground-tasks-detail-section-header"
  	              + (normalizedPresentation === "static-transparent" ? " is-static-transparent" : "")
  	              + (className ? " " + className : ""),
  	            "data-header-presentation": normalizedPresentation,
  	          },
  	          React.createElement("div", { className: "playground-tasks-detail-section-title" }, title),
  	          children
  	        );
  	      }
  
  __PLATFORM_COMPATIBILITY_BINDING_063__
        function PlaygroundSharedResourcesTab({
          rows = [],
          allRows = rows,
          searchQuery = "",
          onSearchQueryChange,
          toolbarPopover = "",
          onToolbarPopoverChange,
          filter = "all",
          onFilterChange,
          typeFilters = [],
          viewMode = "list",
          onViewModeChange,
          menuId = "",
          onMenuIdChange,
          getTypeMeta,
          getRowMenuId,
          renderIcon,
          renderCreator,
  	        renderSource,
  	        renderOwner,
  	        getRowActions,
  	        renderNewMenu,
          renderNewMenuItems,
  	        renderEmptyContent,
  	        onNewButtonClick,
  	        onRowOpen,
  	        onRowActionMenuOpen,
  	        onRowContextMenu,
  	        activeRowMenuId = "",
  	        searchPlaceholder = "Search resources",
          searchAriaLabel = "Search resources",
  	        newButtonLabel = "New",
  	        newButtonClassName = "",
  	        primaryHeader = "Resource",
          secondaryHeader = "Creator",
          sourceHeader = "Shared Through",
          tertiaryHeader = "Updated",
          ownerHeader = "Owner",
          emptyLabel = "No resources yet.",
          noMatchesLabel = "No resources match this view yet.",
          toolbarTitle = "",
          showNewButton = true,
          showFilterButton = true,
          showViewToggle = true,
          useCentralSearch = false,
          useCentralNewSelector = false,
          useCentralFilterPopup = false,
  	        showListSubtitle = false,
  	        metaCellsStopRowOpen = true,
  	        showSelectionColumn = false,
  	        selectedRowIds = new Set(),
  		        getSelectionId,
  		        onToggleRowSelection,
  		        onToggleVisibleSelection,
  		        sortKey = "",
  		        sortDirection = "asc",
  		        sortableColumns = [],
  		        onSortChange,
  		      }) {
          const visibleRows = Array.isArray(rows) ? rows : [];
          const availableRows = Array.isArray(allRows) ? allRows : visibleRows;
          const activeViewMode = viewMode === "grid" ? "grid" : "list";
          const activeToolbarPopover = String(toolbarPopover || "");
          const activeFilter = String(filter || "all").trim() || "all";
          const resourceTypeFilters = Array.isArray(typeFilters) && typeFilters.length
            ? typeFilters
            : [{ id: "all", label: "All" }];
          const defaultTypeMeta = { label: "Resource", Icon: Layers };
  	        const hasSourceColumn = typeof renderSource === "function";
  	        const hasOwnerColumn = typeof renderOwner === "function";
  	        const selectionEnabled = Boolean(showSelectionColumn && activeViewMode === "list");
  	        const selectedResourceRowIds = selectedRowIds instanceof Set
  	          ? selectedRowIds
  	          : new Set(Array.isArray(selectedRowIds) ? selectedRowIds.map((value) => String(value || "").trim()).filter(Boolean) : []);
  	        const getResourceSelectionId = (row) => {
  	          if (typeof getSelectionId === "function") {
  	            return String(getSelectionId(row) || "").trim();
  	          }
  	          return String(row?.key || row?.id || row?.title || "").trim();
  	        };
  	        const visibleSelectionIds = selectionEnabled
  	          ? visibleRows.map((row) => getResourceSelectionId(row)).filter(Boolean)
  	          : [];
  	        const activeSortKey = String(sortKey || "").trim();
  	        const activeSortDirection = String(sortDirection || "").toLowerCase() === "desc" ? "desc" : "asc";
  	        const sortableColumnSet = new Set((Array.isArray(sortableColumns) ? sortableColumns : [])
  	          .map((columnKey) => String(columnKey || "").trim())
  	          .filter(Boolean));
  
          const setToolbarPopover = (nextValue) => {
            if (typeof onToolbarPopoverChange === "function") {
              onToolbarPopoverChange(nextValue);
            }
          };
          const closeRowMenu = () => {
            if (typeof onMenuIdChange === "function") {
              onMenuIdChange("");
            }
          };
          const getMeta = (row) => {
            if (typeof getTypeMeta === "function") {
              return getTypeMeta(row?.type || row?.resourceType || "");
            }
            return defaultTypeMeta;
          };
          const getMenuId = (row) => {
            if (typeof getRowMenuId === "function") {
              return getRowMenuId(row);
            }
            return "resource:" + String(row?.key || row?.id || row?.title || "").trim();
          };
          const openRow = (row) => {
            if (typeof onRowOpen === "function") {
              onRowOpen(row);
            }
          };
          const renderSharedIcon = (row, meta) => {
            if (typeof renderIcon === "function") {
              return renderIcon(row, meta);
            }
            const ResourceIcon = meta?.Icon || Layers;
            return React.createElement("span", { className: "playground-project-resource-title-icon" },
              React.createElement(ResourceIcon, { width: 16, height: 16, strokeWidth: 1.8 })
            );
          };
          const renderSecondaryCell = (row) => {
            if (typeof renderCreator === "function") {
              return renderCreator(row);
            }
            return React.createElement("span", null, row?.secondaryLabel || "-");
          };
          const renderSourceCell = (row) => {
            if (typeof renderSource === "function") {
              return renderSource(row);
            }
            return React.createElement("span", null, row?.sourceLabel || "-");
          };
          const renderOwnerCell = (row) => {
            if (typeof renderOwner === "function") {
              return renderOwner(row);
            }
            return React.createElement("span", null, row?.ownerLabel || "-");
          };
          const getMetaCellProps = (className) => metaCellsStopRowOpen
            ? {
                className,
                onClick: (event) => event.stopPropagation(),
                onKeyDown: (event) => event.stopPropagation(),
              }
            : { className };
          const renderFilterOption = (type) => {
            const typeId = String(type?.id || "all").trim() || "all";
            const active = activeFilter === typeId;
            if (useCentralFilterPopup) {
              return React.createElement("button", {
                  key: typeId,
                  type: "button",
                  role: "menuitemradio",
                  "aria-checked": active ? "true" : "false",
                  className: "platform-data-table__menu-item",
                  onClick: () => {
                    closeRowMenu();
                    if (typeof onFilterChange === "function") {
                      onFilterChange(typeId);
                    }
                    setToolbarPopover("");
                  },
                },
                React.createElement("span", { className: "platform-data-table__menu-icon" },
                  active
                    ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
                    : null
                ),
                React.createElement("span", { className: "platform-data-table__menu-copy" },
                  React.createElement("span", { className: "platform-data-table__menu-label" }, type?.label || typeId),
                  type?.description
                    ? React.createElement("span", { className: "platform-data-table__menu-description" }, type.description)
                    : null
                )
              );
            }
            return React.createElement("button", {
                key: typeId,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick: () => {
                  closeRowMenu();
                  if (typeof onFilterChange === "function") {
                    onFilterChange(typeId);
                  }
                  setToolbarPopover("");
                },
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, type?.label || typeId),
                type?.description
                  ? React.createElement("span", null, type.description)
                  : null
              )
            );
          };
          const renderSharedFilterMenu = () => {
            if (activeToolbarPopover !== "filter") {
              return null;
            }
            return React.createElement(PlatformPopupSurface, {
                className: "playground-tasks-toolbar-popup-menu playground-project-resources-filter-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                onClick: (event) => event.stopPropagation(),
              },
              resourceTypeFilters.map(renderFilterOption)
            );
          };
          const renderSharedNewMenuItems = () => {
            if (typeof renderNewMenuItems === "function") {
              return renderNewMenuItems();
            }
            if (typeof onNewButtonClick !== "function") {
              return null;
            }
            return React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-project-team-menu-item",
                  onClick: () => {
                    setToolbarPopover("");
                    onNewButtonClick();
                  },
                },
                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Add resource")
              );
          };
          const renderSharedNewMenu = () => {
            if (activeToolbarPopover !== "new") {
              return null;
            }
            if (typeof renderNewMenu === "function") {
              return renderNewMenu();
            }
            const menuItems = renderSharedNewMenuItems();
            if (!menuItems) {
              return null;
            }
            return React.createElement(PlatformPopupSurface, {
                className: "playground-tasks-toolbar-popup-menu playground-project-resources-new-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                onClick: (event) => event.stopPropagation(),
              },
              menuItems
            );
          };
          const renderEmptyRows = () => {
            if (availableRows.length === 0 && typeof renderEmptyContent === "function") {
              return renderEmptyContent();
            }
            return React.createElement("div", { className: "playground-project-resources-empty" },
              availableRows.length === 0 ? emptyLabel : noMatchesLabel
            );
          };
          const renderRows = () => {
            if (!availableRows.length || !visibleRows.length) {
              return renderEmptyRows();
            }
            if (activeViewMode === "grid") {
              return React.createElement("div", { className: "playground-project-resources-grid" },
                visibleRows.map((row) => {
                  const meta = getMeta(row) || defaultTypeMeta;
                  return React.createElement("button", {
                      key: row?.key || row?.id || row?.title,
                      type: "button",
                      className: "playground-project-resources-grid-card",
                      onClick: () => openRow(row),
                    },
                    React.createElement("div", { className: "playground-project-resources-grid-card-top" },
                      renderSharedIcon(row, meta),
                      React.createElement("span", { className: "playground-project-resource-title-copy" },
                        React.createElement("span", { className: "playground-project-resource-title-main" }, row?.title || "Untitled resource"),
                        row?.subtitle
                          ? React.createElement("span", { className: "playground-project-resource-title-sub" }, row.subtitle)
                          : null
                      )
                    ),
                    React.createElement("div", { className: "playground-project-resources-grid-card-meta" },
                      React.createElement("span", { className: "playground-project-resources-cell" }, meta?.label || "Resource"),
                      React.createElement("span", { className: "playground-project-resources-cell" }, row?.updatedLabel || "-")
                    )
                  );
                })
              );
  	          }
            const listColumns = [
              {
                id: "resource",
                header: primaryHeader,
                accessor: (row) => row?.title || "Untitled resource",
                sortable: sortableColumnSet.has("resource"),
                width: "minmax(220px, 1.45fr)",
                cell: ({ row }) => {
                  const meta = getMeta(row) || defaultTypeMeta;
                  return React.createElement("div", { className: "playground-project-resource-title-cell" },
                    renderSharedIcon(row, meta),
                    React.createElement("span", { className: "playground-project-resource-title-copy" },
                      React.createElement("span", { className: "playground-project-resource-title-main" }, row?.title || "Untitled resource"),
                      showListSubtitle && row?.subtitle
                        ? React.createElement("span", { className: "playground-project-resource-title-sub" }, row.subtitle)
                        : null
                    )
                  );
                },
              },
              {
                id: "access",
                header: secondaryHeader,
                accessor: (row) => row?.secondaryLabel || row?.accessLabel || "",
                sortable: sortableColumnSet.has("access"),
                width: "minmax(120px, 0.78fr)",
                cell: ({ row }) => renderSecondaryCell(row),
              },
              ...(hasSourceColumn ? [{
                id: "source",
                header: sourceHeader,
                accessor: (row) => row?.sourceLabel || "",
                sortable: sortableColumnSet.has("source"),
                width: "minmax(135px, 0.82fr)",
                hideBelow: 820,
                cell: ({ row }) => renderSourceCell(row),
              }] : []),
              {
                id: "updated",
                header: tertiaryHeader,
                accessor: (row) => row?.updatedAt || row?.updatedLabel || "",
                sortable: sortableColumnSet.has("updated"),
                sortDescFirst: true,
                width: "minmax(120px, 0.72fr)",
                hideBelow: 680,
                cell: ({ row }) => row?.updatedLabel || "-",
              },
              ...(hasOwnerColumn ? [{
                id: "owner",
                header: ownerHeader,
                accessor: (row) => row?.ownerLabel || "",
                sortable: sortableColumnSet.has("owner"),
                width: "minmax(135px, 0.85fr)",
                hideBelow: 940,
                cell: ({ row }) => renderOwnerCell(row),
              }] : []),
            ];
            return React.createElement(PlatformDataTable, {
              rows: visibleRows,
              columns: listColumns,
              getRowId: getResourceSelectionId,
              ariaLabel: searchAriaLabel,
              className: "playground-shared-resources-platform-data-table",
              surface: "plain",
              sticky: false,
              sorting: activeSortKey ? {
                value: { id: activeSortKey, direction: activeSortDirection },
                manual: true,
                onChange: (next) => {
                  if (next && typeof onSortChange === "function") onSortChange(next.id, next.direction);
                },
              } : undefined,
              selection: selectionEnabled ? {
                enabled: true,
                value: selectedResourceRowIds,
                ariaLabel: (row) => "Select " + (row?.title || "resource"),
                onChange: ({ selectedIds, reason }) => {
                  if (reason === "visible" && typeof onToggleVisibleSelection === "function") {
                    const selectVisible = visibleSelectionIds.some((id) => selectedIds.has(id));
                    onToggleVisibleSelection(visibleSelectionIds, selectVisible);
                    return;
                  }
                  if (typeof onToggleRowSelection !== "function") return;
                  const changedIds = new Set([...selectedResourceRowIds, ...selectedIds]);
                  changedIds.forEach((selectionId) => {
                    if (selectedResourceRowIds.has(selectionId) === selectedIds.has(selectionId)) return;
                    const row = visibleRows.find((candidate) => getResourceSelectionId(candidate) === selectionId);
                    onToggleRowSelection(selectionId, row);
                  });
                },
              } : undefined,
              onRowActivate: typeof onRowOpen === "function" ? openRow : undefined,
  	          getRowActions: typeof getRowActions === "function" ? getRowActions : undefined,
  	          onRowActionTrigger: typeof onRowActionMenuOpen === "function"
  	            ? (event, row) => {
  	                setToolbarPopover("");
  	                onRowActionMenuOpen(event, row, { openLeft: true });
  	              }
  	            : undefined,
  	          isRowActionOpen: typeof onRowActionMenuOpen === "function"
  	            ? (row) => Boolean(activeRowMenuId && getMenuId(row) === activeRowMenuId)
  	            : undefined,
              onRowContextMenu: typeof onRowContextMenu === "function" ? onRowContextMenu : undefined,
              emptyState: renderEmptyRows(),
              noResultsState: noMatchesLabel,
            });
          };
          const normalizedToolbarTitle = String(toolbarTitle || "").trim();
          const renderSharedSearchControl = () => useCentralSearch
            ? React.createElement(PlatformSearch, {
                className: "playground-project-resources-central-search",
                value: searchQuery,
                onChange: (event) => typeof onSearchQueryChange === "function" && onSearchQueryChange(event.target.value),
                placeholder: searchPlaceholder,
                "aria-label": searchAriaLabel,
              })
            : React.createElement("label", { className: "playground-project-resources-search" },
                React.createElement(Search, { className: "playground-files-library-search-icon", strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: searchQuery,
                  onChange: (event) => typeof onSearchQueryChange === "function" && onSearchQueryChange(event.target.value),
                  className: "playground-project-resources-search-input",
                  placeholder: searchPlaceholder,
                  "aria-label": searchAriaLabel,
                })
              );
          const renderSharedNewControl = () => {
            if (!showNewButton) {
              return null;
            }
            if (useCentralNewSelector) {
              return React.createElement(PlatformButtonSelector, {
                  mode: "popup",
                  buttonVariant: "secondary",
                  buttonSize: "small",
                  label: newButtonLabel,
                  open: activeToolbarPopover === "new",
                  onOpenChange: (nextOpen) => {
                    closeRowMenu();
                    if (nextOpen) {
                      setToolbarPopover("new");
                    } else if (activeToolbarPopover === "new") {
                      setToolbarPopover("");
                    }
                  },
                  closeOnSelect: true,
                  popupAriaLabel: "Create project resource",
                  popupAlignment: "right",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupWidth: 230,
                  className: "playground-project-resources-new-selector",
                  buttonClassName: newButtonClassName,
                  popupClassName: "playground-project-resources-new-selector-menu",
                },
                renderSharedNewMenuItems()
              );
            }
            return React.createElement("div", {
                className: "playground-project-resources-new-shell playground-files-library-new-anchor playground-tasks-toolbar-popup-shell"
                  + (activeToolbarPopover === "new" ? " is-open" : ""),
              },
              React.createElement("button", {
                type: "button",
                className: "playground-files-library-new-button"
                  + (newButtonClassName ? " " + newButtonClassName : "")
                  + (activeToolbarPopover === "new" ? " is-active" : ""),
                onClick: (event) => {
                  event.stopPropagation();
                  closeRowMenu();
                  setToolbarPopover((current) => current === "new" ? "" : "new");
                },
              },
                React.createElement("span", null, newButtonLabel),
                React.createElement(ChevronDown, { width: 18, height: 18, strokeWidth: 1.8 })
              ),
              renderSharedNewMenu()
            );
          };
          const renderSharedFilterControl = () => {
            if (!showFilterButton) {
              return null;
            }
            if (useCentralFilterPopup) {
              return React.createElement(PlatformPopup, {
                  open: activeToolbarPopover === "filter",
                  rootClassName: "playground-project-resources-filter-shell is-central-popup",
                  surfaceClassName: "platform-data-table__floating-menu playground-project-resources-filter-menu is-central-popup",
                  surfaceProps: {
                    role: "menu",
                    "aria-label": "Filter resources",
                  },
                  animation: "down-in",
                  variant: "minimal",
                  placement: "bottom-start",
                  trigger: React.createElement("button", {
                    type: "button",
                    className: "platform-data-table__toolbar-button is-icon-only"
                      + (activeToolbarPopover === "filter" || activeFilter !== "all" ? " is-open" : ""),
                    onClick: (event) => {
                      event.stopPropagation();
                      closeRowMenu();
                      setToolbarPopover((current) => current === "filter" ? "" : "filter");
                    },
                    title: "Filter resources",
                    "aria-label": "Filter resources",
                    "aria-haspopup": "menu",
                    "aria-expanded": activeToolbarPopover === "filter" ? "true" : "false",
                  }, React.createElement(ListFilter, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })),
                },
                resourceTypeFilters.map(renderFilterOption)
              );
            }
            return React.createElement("div", {
                className: "playground-project-resources-filter-shell playground-files-library-control-anchor playground-tasks-toolbar-popup-shell"
                  + (activeToolbarPopover === "filter" ? " is-open" : ""),
              },
              React.createElement("button", {
                type: "button",
                className: "playground-files-library-icon-button"
                  + (activeToolbarPopover === "filter" || activeFilter !== "all" ? " is-active" : ""),
                onClick: (event) => {
                  event.stopPropagation();
                  closeRowMenu();
                  setToolbarPopover((current) => current === "filter" ? "" : "filter");
                },
                title: "Filter resources",
                "aria-label": "Filter resources",
              }, React.createElement(SlidersHorizontal, { width: 19, height: 19, strokeWidth: 1.8 })),
              renderSharedFilterMenu()
            );
          };
          const renderSharedViewToggle = () => showViewToggle
            ? React.createElement(React.Fragment, null,
                React.createElement("span", { className: "playground-files-library-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-icon-button" + (activeViewMode === "grid" ? " is-active" : ""),
                  onClick: () => {
                    closeRowMenu();
                    typeof onViewModeChange === "function" && onViewModeChange("grid");
                  },
                  title: "Grid view",
                  "aria-label": "Grid view",
                }, React.createElement(Grid3x3, { width: 20, height: 20, strokeWidth: 1.8 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-icon-button" + (activeViewMode === "list" ? " is-active" : ""),
                  onClick: () => {
                    closeRowMenu();
                    typeof onViewModeChange === "function" && onViewModeChange("list");
                  },
                  title: "List view",
                  "aria-label": "List view",
                }, React.createElement(List, { width: 21, height: 21, strokeWidth: 1.8 }))
              )
            : null;
          const renderSharedToolbar = () => normalizedToolbarTitle
            ? React.createElement("div", {
                className: "playground-project-resources-toolbar playground-files-library-title-row is-titled",
              },
              React.createElement("div", { className: "playground-project-resources-toolbar-title-group" },
                React.createElement("h2", { className: "playground-project-resources-toolbar-title" }, normalizedToolbarTitle),
                renderSharedFilterControl()
              ),
              React.createElement("div", { className: "playground-files-library-actions playground-project-resources-toolbar-actions" },
                renderSharedNewControl(),
                renderSharedSearchControl(),
                renderSharedViewToggle()
              )
            )
            : React.createElement("div", {
                className: "playground-project-resources-toolbar playground-files-library-title-row",
              },
              renderSharedSearchControl(),
              React.createElement("div", { className: "playground-files-library-actions playground-project-resources-toolbar-actions" },
                renderSharedNewControl(),
                renderSharedFilterControl(),
                renderSharedViewToggle()
              )
            );
  
          return React.createElement("div", { className: "playground-project-overview-resources-home" },
            React.createElement("section", { className: "playground-project-resources-table-card" },
              React.createElement("div", { className: "playground-project-resources-table-inner" },
                renderSharedToolbar(),
  	              activeViewMode === "list"
  	                ? React.createElement("div", { className: "playground-project-resources-list-shell" }, renderRows())
  	                : renderRows()
  			                  )
  			                )
  			          );
        }
  
        function remarkPlaygroundSoftbreaksToBreaks() {
          return (tree) => {
            unistVisit(tree, "text", (node, index, parent) => {
              if (!parent || typeof index !== "number") return;
              if (!node?.value || typeof node.value !== "string" || !node.value.includes("\n")) return;
  
              const parts = node.value.split("\n");
              const replacement = [];
              for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
                if (parts[partIndex]) replacement.push({ type: "text", value: parts[partIndex] });
                if (partIndex < parts.length - 1) replacement.push({ type: "break" });
              }
  
              parent.children.splice(index, 1, ...replacement);
              return index + replacement.length;
            });
          };
        }
  
        const playgroundMarkdownComponents = {
          p: ({ node, ...props }) => React.createElement("p", { className: "tb-message-markdown-paragraph", ...props }),
          strong: ({ node, ...props }) => React.createElement("strong", { className: "tb-message-markdown-strong", ...props }),
          em: ({ node, ...props }) => React.createElement("em", { className: "tb-message-markdown-em", ...props }),
          code: ({ node, className, ...props }) => React.createElement("code", {
            className: className ? "tb-message-markdown-code" : "tb-message-markdown-inline-code",
            ...props,
          }),
          pre: ({ node, ...props }) => React.createElement("pre", { className: "tb-message-markdown-pre", ...props }),
          ul: ({ node, ...props }) => React.createElement("ul", { className: "tb-message-markdown-list", ...props }),
          ol: ({ node, ...props }) => React.createElement("ol", { className: "tb-message-markdown-list tb-message-markdown-list-ordered", ...props }),
          li: ({ node, ...props }) => React.createElement("li", { className: "tb-message-markdown-list-item", ...props }),
          h1: ({ node, ...props }) => React.createElement("h1", { className: "tb-message-markdown-heading", ...props }),
          h2: ({ node, ...props }) => React.createElement("h2", { className: "tb-message-markdown-heading", ...props }),
          h3: ({ node, ...props }) => React.createElement("h3", { className: "tb-message-markdown-heading", ...props }),
          h4: ({ node, ...props }) => React.createElement("h4", { className: "tb-message-markdown-heading", ...props }),
          a: ({ node, ...props }) => React.createElement("a", { className: "tb-message-markdown-link", target: "_blank", rel: "noopener noreferrer", ...props }),
          blockquote: ({ node, ...props }) => React.createElement("blockquote", { className: "tb-message-markdown-quote", ...props }),
          table: ({ node, ...props }) => React.createElement("div", { className: "tb-message-markdown-table-wrap" },
            React.createElement("table", { className: "tb-message-markdown-table", ...props })
          ),
          thead: ({ node, ...props }) => React.createElement("thead", { className: "tb-message-markdown-thead", ...props }),
          tbody: ({ node, ...props }) => React.createElement("tbody", props),
          tr: ({ node, ...props }) => React.createElement("tr", { className: "tb-message-markdown-row", ...props }),
          th: ({ node, ...props }) => React.createElement("th", { className: "tb-message-markdown-th", ...props }),
          td: ({ node, ...props }) => React.createElement("td", { className: "tb-message-markdown-td", ...props }),
          hr: ({ node, ...props }) => React.createElement("hr", { className: "tb-message-markdown-rule", ...props }),
          img: ({ node, ...props }) => React.createElement("img", { className: "tb-message-markdown-image", ...props }),
          u: ({ node, ...props }) => React.createElement("u", { className: "playground-tasks-detail-markdown-underline", ...props }),
        };
  
        function escapePlaygroundMarkdownHtml(text) {
          return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        }
  
        function PlaygroundSubscriptionSuccessModal({
          open,
          planLabel = "paid plan",
          onClose,
          onOpenBilling,
        }) {
          if (!open) {
            return null;
          }
  
          const normalizedPlanLabel = String(planLabel || "").trim() || "Enterprise";
  
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-subscription-success-backdrop",
              onClick: () => {
                if (typeof onClose === "function") {
                  onClose();
                }
              },
            },
              React.createElement(PlatformModalSurface, {
                className: "playground-subscription-success-modal",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("img", {
                  className: "playground-subscription-success-image",
                  src: "/img/002-hero/inside-rocket.jpg",
                  alt: "Subscription active",
                }),
                React.createElement("div", { className: "playground-subscription-success-copy" },
                  React.createElement("h2", { className: "playground-subscription-success-title" }, "Congratulations!"),
                  React.createElement("p", { className: "playground-subscription-success-description" },
                    "Thank you for subscribing to computer agents ACP! Your ",
                    normalizedPlanLabel,
                    " subscription is now active."
                  )
                ),
                React.createElement("div", { className: "playground-subscription-success-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-subscription-success-button",
                    onClick: () => {
                      if (typeof onOpenBilling === "function") {
                        onOpenBilling();
                      }
                    },
                  }, "Open billing"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "playground-subscription-success-button is-primary",
                    onClick: () => {
                      if (typeof onClose === "function") {
                        onClose();
                      }
                    },
  		                }, "Go to platform")
  		              )
  		            )
  		          );
        }
  
        const STATUS_INDICATOR_PENDING_STORAGE_KEY = "runner_demo_pending_status_indicators_v1";
        const INTEGRATION_STATUS_STORAGE_KEY = "runner_demo_integration_status_v1";
        const HISTORY_MONACO_THEME_NAME = "runner-history-diff";
        const RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";
        const COMPUTER_AGENTS_CREATOR_PROFILE_URL = "/img/agent-profile-pics/ca-profilepic.jpg";
        const PLAYGROUND_GITHUB_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg";
        const PLAYGROUND_GITLAB_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg";
        const PLAYGROUND_GOOGLE_DRIVE_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg";
        const PLAYGROUND_ONEDRIVE_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg";
        const PLAYGROUND_NOTION_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg";
        const PLAYGROUND_GMAIL_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg";
        const PLAYGROUND_ONBOARDING_QUERY_PARAM = "showOnboarding";
        const PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM = "onboardingStep";
        const PLAYGROUND_SUBSCRIPTION_SUCCESS_QUERY_PARAM = "showSubscriptionSuccess";
        const PLAYGROUND_INITIAL_PROMPT_QUERY_PARAM = "initialPrompt";
        const PLAYGROUND_ONBOARDING_STATE_KEY = "runner_demo_playground_onboarding_v1";
        const PLAYGROUND_AUTH_REDIRECT_STATE_KEY = "runner_demo_auth_redirect_v1";
        const PLAYGROUND_AUTH_SESSION_MARKER_KEY = "runner_demo_auth_session_marker_v1";
        const PLAYGROUND_INTEGRATION_REDIRECT_STATE_KEY = "runner_demo_integration_redirect_v1";
        const PLAYGROUND_CONNECTOR_BROWSER_RESTORE_STATE_KEY = "runner_demo_connector_browser_restore_v1";
        const PLAYGROUND_PROJECT_COMPOSER_CONNECTOR_RESTORE_STATE_KEY = "runner_demo_project_composer_connector_restore_v1";
  __PLATFORM_COMPATIBILITY_BINDING_064__      const PLAYGROUND_CONNECTOR_BROWSER_RESTORE_QUERY_PARAMS = [
          "connectorProvider",
          "connectorMode",
          "connectorSource",
          "connectorProjectId",
          "connectorView",
          "connectorSavedAt",
        ];
        const INITIAL_THREAD_LAST_VISIT_STORAGE_KEY = "runner_playground_initial_thread_last_visited_at_v1";
  __PLATFORM_COMPATIBILITY_BINDING_065__      const PLAYGROUND_AGENTS_APP_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_066__;
        const PLAYGROUND_BROWSER_APP_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_067__;
        const PLAYGROUND_FILES_APP_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_068__;
        const PLAYGROUND_TERMINAL_APP_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_069__;
        const PLAYGROUND_ENVIRONMENTS_APP_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_070__;
        const PLAYGROUND_SKILLS_APP_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_071__;
        const PLAYGROUND_FOLDER_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_072__;
        const PLAYGROUND_TEXT_FILE_ICON_URL = __PLATFORM_COMPATIBILITY_BINDING_073__;
        const FIREBASE_WEB_API_KEY = __PLATFORM_COMPATIBILITY_BINDING_074__;
        const FIREBASE_AUTH_DOMAIN = __PLATFORM_COMPATIBILITY_BINDING_075__;
        const FIREBASE_PROJECT_ID = __PLATFORM_COMPATIBILITY_BINDING_076__;
        const FIREBASE_STORAGE_BUCKET = __PLATFORM_COMPATIBILITY_BINDING_077__;
        const FIREBASE_MESSAGING_SENDER_ID = __PLATFORM_COMPATIBILITY_BINDING_078__;
        const FIREBASE_APP_ID = __PLATFORM_COMPATIBILITY_BINDING_079__;
        const PLATFORM_IDENTITY_PROVIDER = __PLATFORM_COMPATIBILITY_BINDING_133__;
        const SEARCH_THREAD_FETCH_LIMIT = 20;
        const SETTINGS_CT_PER_DOLLAR = 100;
        const PLAYGROUND_SERVER_IDLE_RATE_PER_MINUTE = {
          website: 0.000005,
          web_app: 0.000008333333,
          api: 0.000006944444,
          function: 0,
          auth: 0.000004166667,
          agent_runtime: 0.0000125,
          secrets: 0,
        };
        const SETTINGS_SOURCE_CHANNELS = {
          ios: "native",
          macos: "native",
          runner: "web",
          agent_runtime: "web",
          web: "web",
          "runner-web-sdk-demo": "web",
          compass: "web",
          browser: "web",
          cocreate: "web",
          editor: "web",
          comma: "web",
          api: "api",
          automations: "integrations",
          mail: "integrations",
          discord: "integrations",
          telegram: "integrations",
          whatsapp: "integrations",
          unattributed: "unattributed",
        };
        const SETTINGS_SOURCE_LABELS = {
          ios: "Native App",
          macos: "macOS App",
          runner: "Runtime",
          agent_runtime: "Runtime",
          web: "Web App",
          "runner-web-sdk-demo": "Web App",
          compass: "Compass",
          browser: "Compass",
          cocreate: "CoCreate",
          editor: "CoCreate",
          comma: "Comma",
          api: "API",
          automations: "Automations",
          mail: "Email",
          discord: "Discord",
          telegram: "Telegram",
          whatsapp: "WhatsApp",
          unattributed: "Unattributed",
        };
        const SETTINGS_CHANNEL_LABELS = {
          native: "Native App",
          web: "Web App",
          api: "API",
          integrations: "Integrations",
          unattributed: "Unattributed",
        };
        const PLAYGROUND_FIREBASE_APP_NAME = "runner-platform-auth";
        let playgroundFirebaseAuthInstance = null;
        let playgroundFirebaseAuthReadyPromise = null;
        const SETTINGS_CHANNEL_COLORS = {
          native: "rgb(143,196,255)",
          web: "rgb(255,255,255)",
          api: "rgb(103,80,255)",
          integrations: "rgb(94,234,212)",
          unattributed: "rgb(148,163,184)",
        };
  __PLATFORM_COMPATIBILITY_BINDING_080__
        const SETTINGS_PLATFORM_CONFIG_STORAGE_KEY = "runner_demo_settings_platform_config_v1";
        const SETTINGS_DEFAULT_BILLING_PREFERENCES = {
          usageBillingEnabled: false,
          monthlyResourceSpendLimit: 0,
          pauseOnLimit: true,
          emailAlerts: true,
        };
  __PLATFORM_COMPATIBILITY_BINDING_081____PLATFORM_COMPATIBILITY_BINDING_082__      const SETTINGS_TRIGGER_SOURCE_OPTIONS = [
          { value: "github", label: "GitHub" },
          { value: "gitlab", label: "GitLab" },
          { value: "slack", label: "Slack" },
          { value: "webhook", label: "Custom Webhook" },
        ];
        const SETTINGS_GITHUB_EVENTS = ["push", "pull_request", "issues", "issue_comment", "release", "create", "delete", "workflow_run"];
        const SETTINGS_GITHUB_PULL_REQUEST_ACTION_EVENTS = ["pull_request", "issue_comment"];
        const SETTINGS_GITLAB_EVENTS = ["Push Hook", "Merge Request Hook", "Note Hook", "Tag Push Hook", "Pipeline Hook"];
        const SETTINGS_GITLAB_MERGE_REQUEST_ACTION_EVENTS = ["Merge Request Hook", "Note Hook"];
        const SETTINGS_TRIGGER_ACTION_OPTIONS = [
          { value: "send_message", label: "Start thread" },
          { value: "comment_pull_request", label: "Comment on pull request" },
          { value: "comment_merge_request", label: "Comment on merge request" },
        ];
        const PLAYGROUND_CODE_EDITOR_THEME_NAME = "runner-playground-code-editor";
        const RUNNER_WELCOME_GREETING_TEMPLATES = [
          "Welcome back, <name>!",
          "Greetings, <name>!",
          "What's on your mind, <name>?",
          "Welcome, <name>!",
          "What are we working on, <name>?",
          "Where should we begin, <name>?",
          "Good to see you, <name>!",
          "Ready to create, <name>!",
          "Let's get started, <name>!",
        ];
        let historyMonacoModuleLoader = null;
        let historyMonacoThemeRegistered = false;
        let playgroundCodeEditorModuleLoader = null;
        let playgroundCodeEditorThemeRegistered = false;
  
        function loadHistoryMonacoModule() {
          if (!historyMonacoModuleLoader) {
            historyMonacoModuleLoader = import("@monaco-editor/react").catch(() => null);
          }
          return historyMonacoModuleLoader;
        }
  
        function ensureHistoryMonacoTheme(monaco) {
          if (historyMonacoThemeRegistered) {
            return;
          }
  
          monaco.editor.defineTheme(HISTORY_MONACO_THEME_NAME, {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#00000000",
              "editorGutter.background": "#00000000",
              "editorLineNumber.foreground": "#ffffff52",
              "editorLineNumber.activeForeground": "#ffffff72",
              "editorLineHighlightBackground": "#00000000",
              "editor.selectionBackground": "#ffffff12",
              "editor.inactiveSelectionBackground": "#ffffff08",
              "scrollbar.shadow": "#00000000",
              "diffEditor.insertedTextBackground": "#2ea04333",
              "diffEditor.removedTextBackground": "#f8514933",
              "diffEditor.insertedLineBackground": "#2ea04324",
              "diffEditor.removedLineBackground": "#f8514924",
              "diffEditor.diagonalFill": "#00000000",
            },
          });
          historyMonacoThemeRegistered = true;
        }
  
        function loadPlaygroundCodeEditorModule() {
          if (!playgroundCodeEditorModuleLoader) {
            playgroundCodeEditorModuleLoader = import("@monaco-editor/react").catch((error) => {
              playgroundCodeEditorModuleLoader = null;
              throw error;
            });
          }
          return playgroundCodeEditorModuleLoader;
        }
  
        function ensurePlaygroundCodeEditorTheme(monaco) {
          if (playgroundCodeEditorThemeRegistered || !monaco?.editor?.defineTheme) {
            return;
          }
  
          monaco.editor.defineTheme(PLAYGROUND_CODE_EDITOR_THEME_NAME, {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#0d1117",
              "editorGutter.background": "#0d1117",
              "editorLineNumber.foreground": "#546173",
              "editorLineNumber.activeForeground": "#d8e1eb",
              "editorLineHighlightBackground": "#141d2800",
              "editor.selectionBackground": "#2f81f733",
              "editor.inactiveSelectionBackground": "#2f81f71f",
              "editorCursor.foreground": "#8ec8ff",
              "editorWhitespace.foreground": "#314055",
              "editorIndentGuide.background1": "#223041",
              "editorIndentGuide.activeBackground1": "#4f6278",
              "scrollbar.shadow": "#00000000",
            },
          });
          playgroundCodeEditorThemeRegistered = true;
        }
  
        function readPendingStatusIndicatorIds() {
          try {
            const raw = sessionStorage.getItem(STATUS_INDICATOR_PENDING_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
          } catch {
            return [];
          }
        }
  
        function writePendingStatusIndicatorIds(ids) {
          try {
            sessionStorage.setItem(STATUS_INDICATOR_PENDING_STORAGE_KEY, JSON.stringify(ids));
          } catch {}
        }
  
        function addPendingStatusIndicatorId(id) {
          const current = readPendingStatusIndicatorIds();
          if (current.includes(id)) return;
          writePendingStatusIndicatorIds([...current, id]);
        }
  
        function removePendingStatusIndicatorId(id) {
          const current = readPendingStatusIndicatorIds();
          if (!current.includes(id)) return;
          writePendingStatusIndicatorIds(current.filter((value) => value !== id));
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_083__
  __PLATFORM_COMPATIBILITY_BINDING_084__
  __PLATFORM_COMPATIBILITY_BINDING_085__
        function readCachedIntegrationStatuses() {
          try {
            const raw = localStorage.getItem(INTEGRATION_STATUS_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" ? parsed : {};
          } catch {
            return {};
          }
        }
  
        function readCachedIntegrationStatus(id) {
          const cachedStatuses = readCachedIntegrationStatuses();
          const cachedStatus = cachedStatuses[id];
          if (!cachedStatus || typeof cachedStatus !== "object") {
            return { connected: false };
          }
  
          return {
            connected: Boolean(cachedStatus.connected),
            profile: cachedStatus.profile && typeof cachedStatus.profile === "object" ? cachedStatus.profile : undefined,
          };
        }
  
        function writeCachedIntegrationStatus(id, status) {
          try {
            const cachedStatuses = readCachedIntegrationStatuses();
            if (status?.connected) {
              cachedStatuses[id] = {
                connected: true,
                profile: status.profile && typeof status.profile === "object" ? status.profile : undefined,
              };
            } else {
              delete cachedStatuses[id];
            }
            localStorage.setItem(INTEGRATION_STATUS_STORAGE_KEY, JSON.stringify(cachedStatuses));
          } catch {}
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_086__
        function readCurrentSearchParam(name) {
          try {
            return new URLSearchParams(window.location.search).get(name) || "";
          } catch {
            return "";
          }
        }
  
        function readInitialThreadDeepLinkId() {
          const normalized = String(readCurrentSearchParam("thread") || readCurrentSearchParam("threadId") || "").trim();
          return /^thread[_-]/.test(normalized) ? normalized : "";
        }
  
        function normalizePlaygroundInitialPrompt(value) {
          return String(value || "")
            .split(String.fromCharCode(13) + String.fromCharCode(10))
            .join(String.fromCharCode(10))
            .trim()
            .slice(0, 5000);
        }
  
        function readPlaygroundOnboardingState() {
          try {
            const raw = sessionStorage.getItem(PLAYGROUND_ONBOARDING_STATE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
          } catch {
            return null;
          }
        }
  
        function writePlaygroundOnboardingState(value) {
          try {
            sessionStorage.setItem(PLAYGROUND_ONBOARDING_STATE_KEY, JSON.stringify(value || {}));
          } catch {}
        }
  
        function clearPlaygroundOnboardingState() {
          try {
            sessionStorage.removeItem(PLAYGROUND_ONBOARDING_STATE_KEY);
          } catch {}
        }
  
        function readPlaygroundAuthRedirectState() {
          try {
            const raw = sessionStorage.getItem(PLAYGROUND_AUTH_REDIRECT_STATE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
          } catch {
            return null;
          }
        }
  
        function writePlaygroundAuthRedirectState(value) {
          try {
            sessionStorage.setItem(PLAYGROUND_AUTH_REDIRECT_STATE_KEY, JSON.stringify(value || {}));
          } catch {}
        }
  
        function clearPlaygroundAuthRedirectState() {
          try {
            sessionStorage.removeItem(PLAYGROUND_AUTH_REDIRECT_STATE_KEY);
          } catch {}
        }
  
        function readPlaygroundAuthSessionMarker() {
          try {
            const raw = sessionStorage.getItem(PLAYGROUND_AUTH_SESSION_MARKER_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
          } catch {
            return null;
          }
        }
  
        function writePlaygroundAuthSessionMarker(value) {
          try {
            sessionStorage.setItem(PLAYGROUND_AUTH_SESSION_MARKER_KEY, JSON.stringify(value || {}));
          } catch {}
        }
  
        function clearPlaygroundAuthSessionMarker() {
          try {
            sessionStorage.removeItem(PLAYGROUND_AUTH_SESSION_MARKER_KEY);
          } catch {}
        }
  
        function readPlaygroundIntegrationRedirectState() {
          try {
            const raw = sessionStorage.getItem(PLAYGROUND_INTEGRATION_REDIRECT_STATE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
          } catch {
            return null;
          }
        }
  
        function writePlaygroundIntegrationRedirectState(value) {
          try {
            sessionStorage.setItem(PLAYGROUND_INTEGRATION_REDIRECT_STATE_KEY, JSON.stringify(value || {}));
          } catch {}
        }
  
        function clearPlaygroundIntegrationRedirectState() {
          try {
            sessionStorage.removeItem(PLAYGROUND_INTEGRATION_REDIRECT_STATE_KEY);
          } catch {}
        }
  
        function normalizePlaygroundConnectorBrowserRestoreState(value) {
          if (!value || typeof value !== "object" || Array.isArray(value)) {
            return null;
          }
          const savedAt = Number(value.savedAt || 0);
          if (!Number.isFinite(savedAt) || Date.now() - savedAt > 1000 * 60 * 20) {
            return null;
          }
          const source = getPlaygroundTaskConnectorSource(value.source) || "";
          const provider = getPlaygroundTaskConnectorSource(value.provider) || source;
          const mode = value.mode === "project" ? "project" : "";
          const projectId = typeof value.projectId === "string" ? value.projectId.trim() : "";
          const view = value.view === "overview" ? "overview" : value.view === "calendar" ? "calendar" : "backlog";
          if (!provider || !source || !mode || !projectId) {
            return null;
          }
          return {
            provider,
            source,
            mode,
            projectId,
            view,
            savedAt,
          };
        }
  
        function readPlaygroundConnectorBrowserRestoreState() {
          try {
            const raw = sessionStorage.getItem(PLAYGROUND_CONNECTOR_BROWSER_RESTORE_STATE_KEY);
            const normalized = normalizePlaygroundConnectorBrowserRestoreState(raw ? JSON.parse(raw) : null);
            if (!normalized) {
              sessionStorage.removeItem(PLAYGROUND_CONNECTOR_BROWSER_RESTORE_STATE_KEY);
            }
            return normalized;
          } catch {
            return null;
          }
        }
  
        function writePlaygroundConnectorBrowserRestoreState(value) {
          try {
            const normalized = normalizePlaygroundConnectorBrowserRestoreState({
              ...(value && typeof value === "object" && !Array.isArray(value) ? value : {}),
              savedAt: Number(value?.savedAt || 0) || Date.now(),
            });
            if (normalized) {
              sessionStorage.setItem(PLAYGROUND_CONNECTOR_BROWSER_RESTORE_STATE_KEY, JSON.stringify(normalized));
            }
          } catch {}
        }
  
        function clearPlaygroundConnectorBrowserRestoreState() {
          try {
            sessionStorage.removeItem(PLAYGROUND_CONNECTOR_BROWSER_RESTORE_STATE_KEY);
          } catch {}
        }
  
        function readPlaygroundConnectorBrowserRestoreUrlState() {
          try {
            const url = new URL(window.location.href);
            const hasRestoreParams = PLAYGROUND_CONNECTOR_BROWSER_RESTORE_QUERY_PARAMS.some((name) => url.searchParams.has(name));
            if (!hasRestoreParams) {
              return null;
            }
            return normalizePlaygroundConnectorBrowserRestoreState({
              provider: url.searchParams.get("connectorProvider") || "",
              mode: url.searchParams.get("connectorMode") || "",
              source: url.searchParams.get("connectorSource") || "",
              projectId: url.searchParams.get("connectorProjectId") || "",
              view: url.searchParams.get("connectorView") || "overview",
              savedAt: Number(url.searchParams.get("connectorSavedAt") || 0) || Date.now(),
            });
          } catch {
            return null;
          }
        }
  
        function clearPlaygroundConnectorBrowserRestoreUrlState() {
          try {
            const url = new URL(window.location.href);
            let changed = false;
            PLAYGROUND_CONNECTOR_BROWSER_RESTORE_QUERY_PARAMS.forEach((name) => {
              if (url.searchParams.has(name)) {
                url.searchParams.delete(name);
                changed = true;
              }
            });
            if (changed) {
              window.history.replaceState({}, "", url.pathname + url.search + url.hash);
            }
          } catch {}
        }
  
        function consumePlaygroundConnectorBrowserRestoreUrlState() {
          const restoreState = readPlaygroundConnectorBrowserRestoreUrlState();
          if (restoreState) {
            writePlaygroundConnectorBrowserRestoreState(restoreState);
          }
          clearPlaygroundConnectorBrowserRestoreUrlState();
          return restoreState;
        }
  
        function buildPlaygroundConnectorBrowserRestoreRedirectUrl(value) {
          const restoreState = normalizePlaygroundConnectorBrowserRestoreState({
            ...(value && typeof value === "object" && !Array.isArray(value) ? value : {}),
            savedAt: Number(value?.savedAt || 0) || Date.now(),
          });
          if (!restoreState) {
            return "";
          }
          try {
            const url = new URL(window.location.href);
            url.searchParams.set("connectorProvider", restoreState.provider);
            url.searchParams.set("connectorMode", restoreState.mode);
            url.searchParams.set("connectorSource", restoreState.source);
            url.searchParams.set("connectorProjectId", restoreState.projectId);
            url.searchParams.set("connectorView", restoreState.view);
            url.searchParams.set("connectorSavedAt", String(restoreState.savedAt));
            return url.toString();
          } catch {
            return "";
          }
        }
  
        function removeCurrentSearchParam(name) {
          try {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.delete(name);
            window.history.replaceState({}, "", nextUrl.toString());
          } catch {}
        }
  
        function isUnauthorizedStatus(status) {
          return status === 401 || status === 403;
        }
  
        function buildStatusIndicatorItem(id, profile) {
          if (id === "google-drive") {
            return {
              id: "google-drive",
              title: "Google Drive connected",
              copy: profile?.email || profile?.username || "Successfully connected",
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
            };
          }
  
          if (id === "one-drive") {
            return {
              id: "one-drive",
              title: "OneDrive connected",
              copy: profile?.email || profile?.username || "Successfully connected",
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg",
            };
          }
  
          if (id === "github") {
            return {
              id: "github",
              title: "GitHub connected",
              copy: profile?.email || profile?.login || profile?.name || "Successfully connected",
              brand: "github",
            };
          }
  
          if (id === "notion") {
            return {
              id: "notion",
              title: "Notion connected",
              copy: profile?.workspaceName || profile?.name || profile?.email || "Successfully connected",
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
            };
          }
  
          if (id === "gmail") {
            return {
              id: "gmail",
              title: "Gmail connected",
              copy: profile?.email || profile?.username || "Successfully connected",
              logoUrl: PLAYGROUND_GMAIL_LOGO_URL,
            };
          }
  
          return null;
        }
  
        function buildServerDeployStatusIndicatorItem(deployState) {
          const normalizedServerId = typeof deployState?.serverId === "string" ? deployState.serverId.trim() : "";
          if (!normalizedServerId) {
            return null;
          }
  
          const serverLabel = typeof deployState?.serverName === "string" && deployState.serverName.trim()
            ? deployState.serverName.trim()
            : "Server";
          const phase = typeof deployState?.phase === "string" ? deployState.phase.trim().toLowerCase() : "";
  
          if (phase === "starting" || phase === "running") {
            return {
              id: "server-deploy:" + normalizedServerId,
              title: "Deployment started",
              copy: serverLabel,
              indeterminate: true,
            };
          }
  
          if (phase === "finished") {
            return {
              id: "server-deploy:" + normalizedServerId,
              title: "Deployment finished",
              copy: typeof deployState?.serviceUrl === "string" && deployState.serviceUrl.trim()
                ? deployState.serviceUrl.trim()
                : serverLabel,
              progress: 100,
            };
          }
  
          if (phase === "failed") {
            return {
              id: "server-deploy:" + normalizedServerId,
              title: "Deployment failed",
              copy: typeof deployState?.error === "string" && deployState.error.trim()
                ? deployState.error.trim()
                : serverLabel,
            };
          }
  
          return null;
        }
  
        function getAccountInitials(value) {
          const normalized = String(value || "").trim();
          if (!normalized) {
            return "CA";
          }
  
          const emailPrefix = normalized.includes("@") ? normalized.split("@")[0] : normalized;
          const parts = emailPrefix
            .split(/[^a-zA-Z0-9]+/)
            .map((part) => part.trim())
            .filter(Boolean);
  
          if (parts.length === 0) {
            return emailPrefix.slice(0, 2).toUpperCase();
          }
  
          if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
          }
  
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
  
        function formatEmailPrefixDisplayName(value) {
          const normalizedValue = String(value || "").trim();
          if (!normalizedValue) {
            return "";
          }
  
          const emailPrefix = normalizedValue.includes("@") ? normalizedValue.split("@")[0] : normalizedValue;
          const parts = emailPrefix
            .split(/[^a-zA-Z0-9]+/)
            .map((part) => part.trim())
            .filter(Boolean);
  
          if (parts.length === 0) {
            return emailPrefix;
          }
  
          return parts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
        }
  
        function getTrustedDisplayName(displayName, email) {
          const normalizedDisplayName = String(displayName || "").replace(/\s+/g, " ").trim();
          if (!normalizedDisplayName) {
            return "";
          }
  
          const normalizedEmail = String(email || "").trim().toLowerCase();
          if (normalizedEmail && normalizedDisplayName.toLowerCase() === normalizedEmail) {
            return "";
          }
  
          const derivedEmailName = formatEmailPrefixDisplayName(email);
          if (
            derivedEmailName
            && normalizedDisplayName.localeCompare(derivedEmailName, undefined, { sensitivity: "accent" }) === 0
          ) {
            return "";
          }
  
          return normalizedDisplayName;
        }
  
        function formatAccountDisplayName(displayName, email, fallbackValue) {
          const trustedDisplayName = getTrustedDisplayName(displayName, email);
          if (trustedDisplayName) {
            return trustedDisplayName;
          }
  
          const emailDerivedDisplayName = formatEmailPrefixDisplayName(email);
          if (emailDerivedDisplayName) {
            return emailDerivedDisplayName;
          }
  
          const normalizedFallback = String(fallbackValue || "").trim();
          if (normalizedFallback) {
            return normalizedFallback;
          }
  
          return "Computer Agents";
        }
  
        function getWelcomeGreetingName(displayName, email) {
          const trustedDisplayName = getTrustedDisplayName(displayName, email);
          const preferredSource = trustedDisplayName || formatEmailPrefixDisplayName(email);
          const normalizedSource = String(preferredSource || "").replace(/\s+/g, " ").trim();
  
          if (!normalizedSource) {
            return "there";
          }
  
          const firstSegment = normalizedSource.split(" ")[0] || normalizedSource;
          return firstSegment || "there";
        }
  
        function buildWelcomeGreeting(displayName, email) {
          const greetingName = getWelcomeGreetingName(displayName, email);
          const templateIndex = Math.floor(Math.random() * RUNNER_WELCOME_GREETING_TEMPLATES.length);
          return RUNNER_WELCOME_GREETING_TEMPLATES[templateIndex].replace("<name>", greetingName);
        }
  
        function buildDemoWelcomeWidgetsState(referenceDate = new Date()) {
          const demoNow = referenceDate instanceof Date ? new Date(referenceDate) : new Date(referenceDate || Date.now());
          const todayAt = (hours, minutes = 0) => {
            const date = new Date(demoNow);
            date.setHours(hours, minutes, 0, 0);
            return date.toISOString();
          };
          const createdAt = new Date(demoNow.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
          const updatedAt = new Date(demoNow.getTime() - 35 * 60 * 1000).toISOString();
          const projectId = "project_demo_crm";
          const project = normalizePlaygroundProjectRecord({
            id: projectId,
            name: "CRM App",
            description: "Demo customer workspace for the landing preview.",
            icon: "layers",
            wallpaperId: "gradient-orange",
            color: "#f4b85f",
            summary: {
              tasksCount: 20,
              openTasksCount: 20,
              environmentsCount: 1,
              threadsCount: 6,
              activeThreadsCount: 2,
            },
            createdAt,
            updatedAt,
          });
          const tasks = [
            {
              id: "task_demo_crm_foundation",
              projectId,
              title: "Backend & Database Foundation",
              status: "in_progress",
              priority: "medium",
              createdAt,
              updatedAt: new Date(demoNow.getTime() - 8 * 60 * 1000).toISOString(),
            },
            {
              id: "task_demo_crm_perf",
              projectId,
              title: "Performance optimization and debugging",
              status: "todo",
              priority: "medium",
              createdAt,
              updatedAt: new Date(demoNow.getTime() - 18 * 60 * 1000).toISOString(),
            },
            {
              id: "task_demo_crm_e2e",
              projectId,
              title: "End-to-end integration testing",
              status: "todo",
              priority: "medium",
              createdAt,
              updatedAt: new Date(demoNow.getTime() - 28 * 60 * 1000).toISOString(),
            },
            {
              id: "task_demo_crm_leads",
              projectId,
              title: "Build lead details edit dialog",
              status: "todo",
              priority: "medium",
              createdAt,
              updatedAt: new Date(demoNow.getTime() - 42 * 60 * 1000).toISOString(),
            },
          ].map((task) => normalizePlaygroundTaskRecord(task));
          const schedules = [
            {
              id: "schedule_demo_daily_briefing",
              name: "Daily Briefing",
              task: "Deliver the morning status briefing for the CRM workspace.",
              projectId,
              environmentName: "Default",
              contextName: "Default",
              metadata: {
                projectId,
                projectName: project.name,
              },
              scheduleType: "one-time",
              scheduledTime: todayAt(8, 0),
              enabled: true,
              createdAt,
              updatedAt,
            },
          ].map((schedule) => normalizePlaygroundScheduleRecord(schedule));
  
          return {
            status: "ready",
            error: "",
            projectId,
            project,
            tasks,
            schedules,
          };
        }
  
        function formatSettingsCurrency(value) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
        }
  
        function settingsDollarsToComputeTokens(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue)) {
            return 0;
          }
  
          return Math.max(0, Math.round(numericValue * SETTINGS_CT_PER_DOLLAR));
        }
  
        function normalizeSettingsCostKey(value) {
          return String(value || "")
            .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
            .replace(/[-s]+/g, "_")
            .replace(/__+/g, "_")
            .replace(/^_+|_+$/g, "")
            .toLowerCase();
        }
  
        function getSettingsRecordPathValue(record, path) {
          if (!record || typeof record !== "object" || Array.isArray(record)) {
            return undefined;
          }
          const parts = String(path || "").split(".").filter(Boolean);
          let current = record;
          for (const part of parts) {
            if (!current || typeof current !== "object" || Array.isArray(current) || !(part in current)) {
              return undefined;
            }
            current = current[part];
          }
          return current;
        }
  
        function readSettingsFiniteNumber(record, keys = []) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
          if (!source) return null;
          for (const key of keys) {
            const value = getSettingsRecordPathValue(source, key);
            if (value == null || value === "") continue;
            const numericValue = Number(value);
            if (Number.isFinite(numericValue)) {
              return numericValue;
            }
          }
          return null;
        }
  
        function buildSettingsUsdAmountKeys(currencyKey, ctKey) {
          const keys = [];
          const add = (value) => {
            const key = String(value || "").trim();
            if (key && !keys.includes(key)) keys.push(key);
          };
          const addKeyGroup = (value) => {
            const key = String(value || "").trim();
            if (!key) return;
            const snake = normalizeSettingsCostKey(key);
            const camelUsd = key.endsWith("Usd") || key.endsWith("USD") ? key : key + "Usd";
            const upperUsd = key.endsWith("Usd") || key.endsWith("USD") ? key : key + "USD";
            add(camelUsd);
            add(upperUsd);
            if (snake) add(snake.endsWith("_usd") ? snake : snake + "_usd");
            add(key);
            if (snake) add(snake);
          };
  
          addKeyGroup(currencyKey);
          const normalizedCurrencyKey = normalizeSettingsCostKey(currencyKey);
          const normalizedCtKey = normalizeSettingsCostKey(ctKey);
          if (normalizedCurrencyKey.includes("agent") || normalizedCtKey.includes("agent")) {
            [
              "agentCostUsd", "agent_cost_usd", "agentUsd", "agent_usd",
              "llmCostUsd", "llm_cost_usd", "modelCostUsd", "model_cost_usd",
              "inferenceCostUsd", "inference_cost_usd", "agentCost", "agent_cost",
            ].forEach(add);
          } else if (normalizedCurrencyKey.includes("environment") || normalizedCtKey.includes("environment")) {
            [
              "environmentCostUsd", "environment_cost_usd", "environmentUsd", "environment_usd",
              "runtimeCostUsd", "runtime_cost_usd", "resourceCostUsd", "resource_cost_usd",
              "computerCostUsd", "computer_cost_usd", "environmentCost", "environment_cost",
            ].forEach(add);
          } else {
            [
              "totalCostUsd", "total_cost_usd", "totalUsd", "total_usd",
              "costUsd", "cost_usd", "usdCost", "usd_cost",
              "amountUsd", "amount_usd", "totalCost", "total_cost", "cost", "amount",
            ].forEach(add);
          }
  
          ["usage", "cost", "costs", "billing", "metadata"].forEach((prefix) => {
            keys.slice().forEach((key) => add(prefix + "." + key));
          });
          return keys;
        }
  
        function buildSettingsLegacyComputeTokenKeys(ctKey) {
          const keys = [];
          const add = (value) => {
            const key = String(value || "").trim();
            if (key && !keys.includes(key)) keys.push(key);
          };
          const addKeyGroup = (value) => {
            const key = String(value || "").trim();
            if (!key) return;
            const snake = normalizeSettingsCostKey(key);
            add(key);
            if (snake) add(snake);
          };
          addKeyGroup(ctKey);
          const normalizedCtKey = normalizeSettingsCostKey(ctKey);
          if (normalizedCtKey.includes("agent")) {
            ["agentCT", "agentCt", "agent_ct", "llmCT", "llmCt", "llm_ct", "modelCT", "modelCt", "model_ct", "inferenceCT", "inferenceCt", "inference_ct"].forEach(add);
          } else if (normalizedCtKey.includes("environment")) {
            ["environmentCT", "environmentCt", "environment_ct", "runtimeCT", "runtimeCt", "runtime_ct", "resourceCT", "resourceCt", "resource_ct", "computerCT", "computerCt", "computer_ct"].forEach(add);
          } else {
            ["totalCT", "totalCt", "total_ct", "totalCostCT", "totalCostCt", "total_cost_ct", "costCT", "costCt", "cost_ct", "computeTokens", "compute_tokens", "ct"].forEach(add);
          }
          ["usage", "cost", "costs", "billing", "metadata"].forEach((prefix) => {
            keys.slice().forEach((key) => add(prefix + "." + key));
          });
          return keys;
        }
  
        function clampSettingsPercentage(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue)) {
            return 0;
          }
  
          return Math.max(0, Math.min(100, Math.round(numericValue)));
        }
  
        function readSettingsComputeTokens(record, ctKey, currencyKey) {
          const usdValue = readSettingsFiniteNumber(record, buildSettingsUsdAmountKeys(currencyKey, ctKey));
          if (usdValue !== null) {
            return settingsDollarsToComputeTokens(Math.max(0, usdValue));
          }
  
          const ctValue = readSettingsFiniteNumber(record, buildSettingsLegacyComputeTokenKeys(ctKey));
          return ctValue !== null ? Math.max(0, Math.round(ctValue)) : 0;
        }
  
        function readSettingsUsdAmount(record, keys = []) {
          const candidates = [];
          const add = (value) => {
            const key = String(value || "").trim();
            if (key && !candidates.includes(key)) candidates.push(key);
          };
          (Array.isArray(keys) ? keys : [keys]).forEach((key) => {
            const normalizedKey = String(key || "").trim();
            if (!normalizedKey) return;
            const snake = normalizeSettingsCostKey(normalizedKey);
            add(normalizedKey.endsWith("Usd") || normalizedKey.endsWith("USD") ? normalizedKey : normalizedKey + "Usd");
            add(normalizedKey.endsWith("Usd") || normalizedKey.endsWith("USD") ? normalizedKey : normalizedKey + "USD");
            if (snake) add(snake.endsWith("_usd") ? snake : snake + "_usd");
            add(normalizedKey);
            if (snake) add(snake);
          });
          ["billing", "usage", "metadata"].forEach((prefix) => {
            candidates.slice().forEach((key) => add(prefix + "." + key));
          });
          const value = readSettingsFiniteNumber(record, candidates);
          return value !== null ? Math.max(0, value) : 0;
        }
  
        function formatSettingsComputeTokens(value) {
          const numericValue = Math.max(0, Math.round(Number.isFinite(Number(value)) ? Number(value) : 0));
          return formatSettingsCurrency(numericValue / SETTINGS_CT_PER_DOLLAR);
        }
  
        function formatSettingsUsdCredits(value) {
          const numericValue = Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);
          return formatSettingsCurrency(numericValue);
        }
  
        function readSettingsTopUpCreditsUsd(pkg) {
          const directCredits = Number(pkg?.creditsUsd);
          if (Number.isFinite(directCredits) && directCredits > 0) {
            return directCredits;
          }
  
          const legacyTokens = Number(pkg?.computeTokens);
          return Number.isFinite(legacyTokens) && legacyTokens > 0
            ? legacyTokens / SETTINGS_CT_PER_DOLLAR
            : 0;
        }
  
        function formatSettingsAxisComputeTokens(value) {
          const numericValue = Math.max(0, Math.round(Number.isFinite(Number(value)) ? Number(value) : 0));
          return formatSettingsCurrency(numericValue / SETTINGS_CT_PER_DOLLAR);
        }
  
        function getSettingsSourceLabel(sourceId) {
          return SETTINGS_SOURCE_LABELS[sourceId] || sourceId;
        }
  
        function getSettingsSourceChannel(sourceId) {
          return SETTINGS_SOURCE_CHANNELS[sourceId] || "integrations";
        }
  
        function formatSettingsUsageResourceKind(value) {
          switch (String(value || "").trim().toLowerCase()) {
            case "llm":
              return "LLM";
            case "thread_runtime":
              return "Thread Runtime";
            case "mcp":
              return "MCP";
            case "computer":
              return "Computer";
            case "website":
              return "Website";
            case "web_app":
              return "Web App";
            case "api":
              return "API";
  	          case "function":
  	            return "Function";
  	          case "auth":
  	            return "Authentication";
  	          case "agent_runtime":
  	            return "Agent Runtime";
            case "database":
              return "Database";
            default:
              return value ? String(value) : "Resource";
          }
        }
  
        function formatSettingsBillingReason(value) {
          const normalized = String(value || "").trim();
          if (!normalized) {
            return "";
          }
  
          return normalized.replace(/_/g, " ");
        }
  
        function createEmptySettingsUsageSummary() {
          return {
            startDate: "",
            endDate: "",
            totals: {
              totalCT: 0,
              agentCT: 0,
              environmentCT: 0,
              totalThreads: 0,
            },
            byDay: [],
          };
        }
  
        function normalizeSettingsSpendLimit(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue)) {
            return 0;
          }
          return Math.max(0, Math.min(50000, Math.round(numericValue)));
        }
  
        function normalizeDemoSettingsBillingPreferences(value) {
          const source = value && typeof value === "object" ? value : {};
          const normalizedUsageBillingEnabled = Boolean(source.usageBillingEnabled);
          const normalizedSpendLimit = normalizeSettingsSpendLimit(source.monthlyResourceSpendLimit);
          const legacyImplicitDefault = !normalizedUsageBillingEnabled && normalizedSpendLimit === 200;
          const hasEmailAlerts = Object.prototype.hasOwnProperty.call(source, "emailAlerts");
          const hasResourceEmailAlerts = Object.prototype.hasOwnProperty.call(source, "resourceEmailAlerts");
          return {
            usageBillingEnabled: normalizedUsageBillingEnabled,
            monthlyResourceSpendLimit: legacyImplicitDefault ? 0 : normalizedSpendLimit,
            pauseOnLimit: Object.prototype.hasOwnProperty.call(source, "pauseOnLimit")
              ? Boolean(source.pauseOnLimit)
              : SETTINGS_DEFAULT_BILLING_PREFERENCES.pauseOnLimit,
            emailAlerts: hasEmailAlerts
              ? Boolean(source.emailAlerts)
              : hasResourceEmailAlerts
                ? Boolean(source.resourceEmailAlerts)
                : SETTINGS_DEFAULT_BILLING_PREFERENCES.emailAlerts,
          };
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_087__
        function normalizeDemoSettingsSkillsConfig(source) {
          const normalizedSource = source && typeof source === "object" ? source : {};
          const deepResearchModel = PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.some((option) => option.id === normalizedSource.deepResearchModel)
            ? normalizedSource.deepResearchModel
            : "gemini-3-flash-preview";
          const imageGenerationModel = PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS.some((option) => option.id === normalizedSource.imageGenerationModel)
            ? normalizedSource.imageGenerationModel
            : "gpt-image-2";
          const imageGenerationQuality = PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS.some((option) => option.id === normalizedSource.imageGenerationQuality)
            ? normalizedSource.imageGenerationQuality
            : "medium";
          const videoGenerationModel = normalizePlaygroundVideoGenerationModelId(normalizedSource.videoGenerationModel);
          return {
            deepResearchModel,
            imageGenerationModel,
            imageGenerationQuality,
            videoGenerationModel,
          };
        }
  
        function getDemoDefaultDeepResearchModel(config) {
          return normalizeDemoSettingsSkillsConfig(config?.skills).deepResearchModel;
        }
  
        function getDemoDefaultImageGenerationModel(config) {
          return normalizeDemoSettingsSkillsConfig(config?.skills).imageGenerationModel;
        }
  
        function getDemoDefaultImageGenerationQuality(config) {
          return normalizeDemoSettingsSkillsConfig(config?.skills).imageGenerationQuality;
        }
  
        function getDemoDefaultVideoGenerationModel(config) {
          return normalizeDemoSettingsSkillsConfig(config?.skills).videoGenerationModel;
        }
  
        function readDemoSettingsPlatformConfig() {
          try {
            const raw = localStorage.getItem(SETTINGS_PLATFORM_CONFIG_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            const source = parsed && typeof parsed === "object" ? parsed : {};
            return {
              billing: normalizeDemoSettingsBillingPreferences(source.billing),
              inference: normalizeDemoSettingsInferenceSettings(source.inference),
              inferenceEndpoints: normalizeDemoInferenceEndpointCollection(
                source.inferenceEndpoints,
                source.inference,
              ),
              skills: normalizeDemoSettingsSkillsConfig(source.skills),
            };
          } catch {
            return {
              billing: normalizeDemoSettingsBillingPreferences(null),
              inference: normalizeDemoSettingsInferenceSettings(null),
              inferenceEndpoints: normalizeDemoInferenceEndpointCollection(null),
              skills: normalizeDemoSettingsSkillsConfig(null),
            };
          }
        }
  
        function writeDemoSettingsPlatformConfig(config) {
          try {
            localStorage.setItem(SETTINGS_PLATFORM_CONFIG_STORAGE_KEY, JSON.stringify({
              billing: normalizeDemoSettingsBillingPreferences(config?.billing),
              inference: normalizeDemoSettingsInferenceSettings(config?.inference),
              inferenceEndpoints: normalizeDemoInferenceEndpointCollection(
                config?.inferenceEndpoints,
                config?.inference,
              ),
              skills: normalizeDemoSettingsSkillsConfig(config?.skills),
            }));
          } catch {}
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_088__
        function formatSettingsDate(value) {
          if (!value) {
            return "Unavailable";
          }
  
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) {
            return "Unavailable";
          }
  
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
  
        function formatSettingsDateTime(value) {
          if (!value) {
            return "Unavailable";
          }
  
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) {
            return "Unavailable";
          }
  
          return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_089__
  __PLATFORM_COMPATIBILITY_BINDING_090__
        function getSettingsTriggerSourceMeta(source) {
          switch (String(source || "").trim().toLowerCase()) {
            case "github":
              return {
                label: "GitHub",
                icon: GitCommitHorizontal,
              };
            case "gitlab":
              return {
                label: "GitLab",
                icon: GitCommitHorizontal,
              };
            case "slack":
              return {
                label: "Slack",
                icon: MessageCircle,
              };
            default:
              return {
                label: "Webhook",
                icon: Webhook,
              };
          }
        }
  
        function getSettingsTriggerActionLabel(action) {
          const actionType = String(action?.type || "").trim().toLowerCase();
          if (actionType === "comment_pull_request") {
            return "Comment on PR";
          }
          if (actionType === "comment_merge_request") {
            return "Comment on MR";
          }
          return "Start thread";
        }
  
        function isSettingsTriggerActionSupportedForSource(source, actionType) {
          const normalizedSource = String(source || "").trim().toLowerCase();
          const normalizedActionType = String(actionType || "").trim().toLowerCase();
          if (normalizedActionType === "comment_pull_request") {
            return normalizedSource === "github";
          }
          if (normalizedActionType === "comment_merge_request") {
            return normalizedSource === "gitlab";
          }
          return true;
        }
  
        function getSettingsTriggerDefaultEvent(source, actionType) {
          const normalizedSource = String(source || "").trim().toLowerCase();
          const normalizedActionType = String(actionType || "").trim().toLowerCase();
          if (normalizedSource === "github") {
            return normalizedActionType === "comment_pull_request" ? "pull_request" : "push";
          }
          if (normalizedSource === "gitlab") {
            return normalizedActionType === "comment_merge_request" ? "Merge Request Hook" : "Push Hook";
          }
          return "";
        }
  
        function getSettingsTriggerEventOptions(source, actionType) {
          const normalizedSource = String(source || "").trim().toLowerCase();
          const normalizedActionType = String(actionType || "").trim().toLowerCase();
          if (normalizedSource === "github") {
            return normalizedActionType === "comment_pull_request"
              ? SETTINGS_GITHUB_PULL_REQUEST_ACTION_EVENTS
              : SETTINGS_GITHUB_EVENTS;
          }
          if (normalizedSource === "gitlab") {
            return normalizedActionType === "comment_merge_request"
              ? SETTINGS_GITLAB_MERGE_REQUEST_ACTION_EVENTS
              : SETTINGS_GITLAB_EVENTS;
          }
          return [];
        }
  
        function getSettingsTriggerPromptPlaceholder(source, actionType) {
          const normalizedSource = String(source || "").trim().toLowerCase();
          const normalizedActionType = String(actionType || "").trim().toLowerCase();
          if (normalizedActionType === "comment_pull_request") {
            return "Review the pull request changes and write a concise, helpful GitHub comment.";
          }
          if (normalizedActionType === "comment_merge_request") {
            return "Review the merge request changes and write a concise, helpful GitLab comment.";
          }
          if (normalizedSource === "gitlab") {
            return "Inspect the GitLab event, pull the latest changes if needed, and summarize what happened.";
          }
          return "Pull the latest changes, inspect the webhook payload, and summarize what happened.";
        }
  
        function mapFirebaseAuthErrorMessage(code, fallbackMessage) {
          const normalized = String(code || "").trim().toUpperCase();
          if (!normalized) {
            return fallbackMessage;
          }
          if (normalized === "INVALID_LOGIN_CREDENTIALS" || normalized === "INVALID_PASSWORD") {
            return "Current password is incorrect.";
          }
          if (normalized === "EMAIL_NOT_FOUND" || normalized === "USER_NOT_FOUND") {
            return "This account could not be verified.";
          }
          if (normalized.startsWith("WEAK_PASSWORD")) {
            return "New password must be at least 6 characters.";
          }
          if (normalized === "USER_DISABLED") {
            return "This account is disabled.";
          }
          if (normalized === "TOO_MANY_ATTEMPTS_TRY_LATER") {
            return "Too many attempts. Try again later.";
          }
          if (normalized === "OPERATION_NOT_ALLOWED") {
            return "Password authentication is not enabled for this account.";
          }
          return fallbackMessage;
        }
  
        function buildFirebaseRestUrl(pathname) {
          return "https://identitytoolkit.googleapis.com/v1/" + pathname + "?key=" + encodeURIComponent(FIREBASE_WEB_API_KEY);
        }
  
        function getFirebaseSessionCookieDomain() {
          if (typeof window === "undefined") {
            return "";
          }
          const hostname = String(window.location.hostname || "").trim();
          if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
            return "";
          }
          const parts = hostname.split(".").filter(Boolean);
          if (parts.length < 2) {
            return "";
          }
          return "." + parts.slice(-2).join(".");
        }
  
        function writeFirebaseSessionCookie(token) {
          if (typeof document === "undefined") {
            return;
          }
          const normalizedToken = typeof token === "string" ? token.trim() : "";
          const secure = typeof window !== "undefined" ? window.location.protocol === "https:" : true;
          const maxAge = 7 * 24 * 60 * 60;
          const baseCookie = "__session=" + encodeURIComponent(normalizedToken)
            + "; Path=/; Max-Age=" + maxAge
            + "; SameSite=Lax"
            + (secure ? "; Secure" : "");
          const domain = getFirebaseSessionCookieDomain();
          document.cookie = baseCookie + (domain ? "; Domain=" + domain : "");
        }
  
        function clearFirebaseSessionCookie() {
          if (typeof document === "undefined") {
            return;
          }
          const secure = typeof window !== "undefined" ? window.location.protocol === "https:" : true;
          const expiredCookie = "__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
            + (secure ? "; Secure" : "");
          const domain = getFirebaseSessionCookieDomain();
          document.cookie = expiredCookie;
          if (domain) {
            document.cookie = expiredCookie + "; Domain=" + domain;
          }
        }
  
        function getPlaygroundFirebaseAuth() {
          if (PLATFORM_IDENTITY_PROVIDER !== "firebase") {
            return null;
          }
          if (!FIREBASE_WEB_API_KEY || !FIREBASE_AUTH_DOMAIN || !FIREBASE_PROJECT_ID) {
            return null;
          }
          if (playgroundFirebaseAuthInstance) {
            return playgroundFirebaseAuthInstance;
          }
  
          const firebaseConfig = {
            apiKey: FIREBASE_WEB_API_KEY,
            authDomain: FIREBASE_AUTH_DOMAIN,
            projectId: FIREBASE_PROJECT_ID,
            storageBucket: FIREBASE_STORAGE_BUCKET,
            messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
            appId: FIREBASE_APP_ID,
          };
          try {
            const existingApp = getApps().find((app) => app.name === PLAYGROUND_FIREBASE_APP_NAME);
            const firebaseApp = existingApp || initializeApp(firebaseConfig, PLAYGROUND_FIREBASE_APP_NAME);
            playgroundFirebaseAuthInstance = getAuth(firebaseApp);
            return playgroundFirebaseAuthInstance;
          } catch {
            return null;
          }
        }
  
        async function ensurePlaygroundFirebaseAuth() {
          const auth = getPlaygroundFirebaseAuth();
          if (!auth) {
            return null;
          }
          if (!playgroundFirebaseAuthReadyPromise) {
            playgroundFirebaseAuthReadyPromise = setPersistence(auth, browserLocalPersistence).catch(() => {});
          }
          await playgroundFirebaseAuthReadyPromise;
          return auth;
        }
  
        function createFetchAbortReason(name, message) {
          if (typeof DOMException === "function") {
            return new DOMException(message, name);
          }
          const error = new Error(message);
          error.name = name;
          return error;
        }
  
        function getSignalAbortReason(signal, fallbackMessage) {
          return signal && "reason" in signal && signal.reason
            ? signal.reason
            : createFetchAbortReason("AbortError", fallbackMessage);
        }
  
        function isFetchAbortError(error) {
          const name = String(error?.name || "").toLowerCase();
          const message = String(error?.message || error || "").toLowerCase();
          return name === "aborterror"
            || name === "timeouterror"
            || message.includes("aborted")
            || message.includes("signal is aborted")
            || message.includes("aborterror")
            || message.includes("timeouterror");
        }
  
        async function fetchJsonWithTimeout(input, init = {}, timeoutMs = 8000) {
          const controller = new AbortController();
          const externalSignal = init?.signal;
          const abortFromExternalSignal = () => {
            if (!controller.signal.aborted) {
              controller.abort(getSignalAbortReason(externalSignal, "Request was cancelled."));
            }
          };
          if (externalSignal) {
            if (externalSignal.aborted) {
              controller.abort(getSignalAbortReason(externalSignal, "Request was cancelled."));
            } else {
              externalSignal.addEventListener("abort", abortFromExternalSignal, { once: true });
            }
          }
          const normalizedTimeoutMs = Math.max(250, Number(timeoutMs) || 0);
          const timeoutId = window.setTimeout(() => {
            if (!controller.signal.aborted) {
              controller.abort(createFetchAbortReason("TimeoutError", "Request timed out after " + String(normalizedTimeoutMs) + "ms."));
            }
          }, normalizedTimeoutMs);
  
          try {
            const response = await fetch(input, {
              ...init,
              signal: controller.signal,
            });
            const data = await response.json().catch(() => ({}));
            return { response, data };
          } finally {
            window.clearTimeout(timeoutId);
            if (externalSignal) {
              externalSignal.removeEventListener("abort", abortFromExternalSignal);
            }
          }
        }
  
        function normalizeSessionIdentityValue(value) {
          return String(value || "").replace(/\s+/g, " ").trim();
        }
  
        function getSessionIdentityObject(value) {
          return value && typeof value === "object" && !Array.isArray(value) ? value : null;
        }
  
        function pickFirstSessionIdentityValue(...values) {
          for (const value of values) {
            const normalizedValue = normalizeSessionIdentityValue(value);
            if (normalizedValue) {
              return normalizedValue;
            }
          }
          return "";
        }
  
        function normalizeSessionPhotoUrl(value) {
          const normalizedValue = normalizeSessionIdentityValue(value);
          if (!normalizedValue) {
            return "";
          }
          if (normalizedValue.startsWith("//")) {
            return "https:" + normalizedValue;
          }
          return normalizedValue;
        }
  
        function getPreferredSessionProviderProfile(...sources) {
          const providerEntries = [];
          sources.forEach((source) => {
            const providerUserInfo = Array.isArray(source?.providerUserInfo) ? source.providerUserInfo : [];
            providerUserInfo.forEach((entry) => {
              const normalizedEntry = getSessionIdentityObject(entry);
              if (normalizedEntry) {
                providerEntries.push(normalizedEntry);
              }
            });
          });
  
          if (!providerEntries.length) {
            return null;
          }
  
          return (
            providerEntries.find((entry) => normalizeSessionIdentityValue(entry.providerId).toLowerCase() === "google.com")
            || providerEntries.find((entry) => (
              pickFirstSessionIdentityValue(
                entry.displayName,
                entry.name,
                entry.email,
                entry.photoUrl,
                entry.photoURL,
                entry.avatarUrl,
                entry.picture
              )
            ))
            || null
          );
        }
  
        function extractSessionIdentityFromPayload(payload) {
          const root = getSessionIdentityObject(payload);
          const profile = getSessionIdentityObject(root?.profile);
          const user = getSessionIdentityObject(root?.user);
          const authProfile = getSessionIdentityObject(root?.authProfile);
          const preferredProvider = getPreferredSessionProviderProfile(root, profile, user, authProfile);
  
          const email = pickFirstSessionIdentityValue(
            root?.email,
            profile?.email,
            user?.email,
            authProfile?.email,
            preferredProvider?.email
          );
          const displayName = getTrustedDisplayName(
            pickFirstSessionIdentityValue(
              profile?.displayName,
              profile?.display_name,
              profile?.name,
              root?.displayName,
              root?.display_name,
              root?.name,
              user?.displayName,
              user?.display_name,
              user?.name,
              authProfile?.displayName,
              authProfile?.display_name,
              authProfile?.name,
              preferredProvider?.displayName,
              preferredProvider?.name
            ),
            email
          ) || formatEmailPrefixDisplayName(email);
          const photoURL = normalizeSessionPhotoUrl(
            pickFirstSessionIdentityValue(
              profile?.photoURL,
              profile?.photoUrl,
              profile?.photo_url,
              profile?.avatarUrl,
              profile?.avatarURL,
              profile?.avatar,
              profile?.picture,
              root?.photoURL,
              root?.photoUrl,
              root?.photo_url,
              root?.avatarUrl,
              root?.avatar,
              root?.picture,
              user?.photoURL,
              user?.photoUrl,
              user?.photo_url,
              user?.avatarUrl,
              user?.avatar,
              user?.picture,
              authProfile?.photoURL,
              authProfile?.photoUrl,
              authProfile?.photo_url,
              authProfile?.avatarUrl,
              authProfile?.avatar,
              authProfile?.picture,
              preferredProvider?.photoURL,
              preferredProvider?.photoUrl,
              preferredProvider?.photo_url,
              preferredProvider?.avatarUrl,
              preferredProvider?.avatar,
              preferredProvider?.picture
            )
          );
          const emailVerified = typeof root?.emailVerified === "boolean"
            ? root.emailVerified
            : (typeof authProfile?.emailVerified === "boolean" ? authProfile.emailVerified : undefined);
  
          return {
            email,
            displayName,
            photoURL: canRenderAvatarImage(photoURL) ? photoURL : "",
            emailVerified,
          };
        }
  
        function readNamedCookie(name) {
          if (typeof document === "undefined") {
            return "";
          }
          const normalizedName = String(name || "").trim();
          if (!normalizedName) {
            return "";
          }
          const escapedName = normalizedName.replace(/[.*+?^{}$()|[\]\\]/g, "\\$&");
          const match = document.cookie.match(new RegExp("(?:^|; )" + escapedName + "=([^;]*)"));
          if (!match || typeof match[1] !== "string") {
            return "";
          }
          try {
            return decodeURIComponent(match[1]);
          } catch {
            return match[1];
          }
        }
  
        async function lookupFirebaseSessionIdentity() {
          if (PLATFORM_IDENTITY_PROVIDER !== "firebase") {
            return null;
          }
          const sessionToken = readNamedCookie("__session");
          if (!sessionToken) {
            return null;
          }
  
          const { response, data } = await fetchJsonWithTimeout(buildFirebaseRestUrl("accounts:lookup"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: sessionToken,
            }),
          }, 3000);
          if (!response.ok) {
            return null;
          }
  
          const user = Array.isArray(data?.users) ? getSessionIdentityObject(data.users[0]) : null;
          if (!user) {
            return null;
          }
  
          const identity = extractSessionIdentityFromPayload({
            email: user.email,
            emailVerified: user.emailVerified,
            user: {
              email: user.email,
              uid: user.localId || user.userId || user.id || "",
              displayName: user.displayName,
              name: user.displayName,
              photoURL: user.photoURL || user.photoUrl,
              photoUrl: user.photoUrl || user.photoURL,
              providerUserInfo: Array.isArray(user.providerUserInfo) ? user.providerUserInfo : [],
            },
          });
          return {
            ...identity,
            userId: pickFirstSessionIdentityValue(user.localId, user.userId, user.id),
          };
        }
  
        async function syncFirebaseSessionCookieFromCurrentUser(forceRefresh = false) {
          if (PLATFORM_IDENTITY_PROVIDER !== "firebase") {
            return false;
          }
          try {
            const auth = await ensurePlaygroundFirebaseAuth();
            const currentUser = auth?.currentUser || null;
            if (!currentUser) {
              return false;
            }
            const idToken = await currentUser.getIdToken(Boolean(forceRefresh));
            if (!idToken) {
              return false;
            }
            writeFirebaseSessionCookie(idToken);
            return true;
          } catch {
            return false;
          }
        }
  
        async function copyTextToClipboard(value) {
          try {
            await navigator.clipboard.writeText(String(value || ""));
            return true;
          } catch {
            return false;
          }
        }
  
        function canRenderAvatarImage(value) {
          const normalized = normalizeSessionPhotoUrl(value);
          return normalized.startsWith("data:image/")
            || /^https?:\/\//i.test(normalized)
            || normalized.startsWith("/img/");
        }
  
        function AccountAvatar({ className, imageClassName, fallbackLabel, photoUrl }) {
          const [imageReady, setImageReady] = useState(false);
          const normalizedPhotoUrl = normalizeSessionPhotoUrl(photoUrl);
          const normalizedFallbackLabel = normalizeSessionIdentityValue(fallbackLabel) || "CA";
          const fallbackClassName = className + "-fallback";
          const shouldAttemptImage = canRenderAvatarImage(normalizedPhotoUrl);
  
          useEffect(() => {
            let cancelled = false;
            setImageReady(false);
  
            if (!shouldAttemptImage) {
              return undefined;
            }
  
            const probe = new Image();
            probe.onload = () => {
              if (!cancelled) {
                setImageReady(true);
              }
            };
            probe.onerror = () => {
              if (!cancelled) {
                setImageReady(false);
              }
            };
            probe.src = normalizedPhotoUrl;
  
            return () => {
              cancelled = true;
            };
          }, [normalizedPhotoUrl, shouldAttemptImage]);
  
          return React.createElement("div", { className },
            imageReady && shouldAttemptImage
              ? React.createElement("img", {
                  className: imageClassName,
                  src: normalizedPhotoUrl,
                  alt: "",
                  "aria-hidden": "true",
                  referrerPolicy: "no-referrer",
                })
              : React.createElement("span", { className: fallbackClassName, "aria-hidden": "true" }, normalizedFallbackLabel)
          );
        }
  
        function PlaygroundDotLoader({
          dotCount = 9,
          dotSize = 4,
          gap = 3,
          speed = 800,
        }) {
          const [activeIndex, setActiveIndex] = useState(0);
          const gridSize = dotCount === 4 ? 2 : 3;
          const pattern = dotCount === 4
            ? [1, 0, 2, 3, -1, -1, -1]
            : [2, 1, 0, 3, 6, 7, 8, 5, 4, -1, -1, -1, -1];
  
          useEffect(() => {
            const interval = window.setInterval(() => {
              setActiveIndex((current) => (current + 1) % pattern.length);
            }, speed / pattern.length);
            return () => window.clearInterval(interval);
          }, [pattern.length, speed]);
  
          function getDotOpacity(dotIndex) {
            const currentPatternValue = pattern[activeIndex];
  
            if (currentPatternValue === -1) {
              return 0.1;
            }
  
            const patternPosition = pattern.indexOf(dotIndex);
            if (patternPosition === -1) {
              return 0.1;
            }
  
            const distance = (activeIndex - patternPosition + pattern.length) % pattern.length;
  
            if (distance === 0) return 1;
            if (distance === 1) return 0.5;
            if (distance === 2) return 0.25;
            return 0.1;
          }
  
          return React.createElement("div", {
              className: "grid",
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(" + gridSize + ", " + dotSize + "px)",
                gap: String(gap) + "px",
              },
            },
            Array.from({ length: dotCount }).map((_, index) =>
              React.createElement("span", {
                key: "playground-dot-loader:" + index,
                className: "rounded-full",
                style: {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "999px",
                  backgroundColor: "rgba(255, 255, 255, " + getDotOpacity(index) + ")",
                  transition: "background-color 200ms ease-out",
                },
              })
            )
          );
        }
  
        function PlaygroundAppLoadingScreen({ label = "Agentic Compute Platform" }) {
          return React.createElement("div", {
              style: {
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                pointerEvents: "none",
                opacity: 1,
                transition: "opacity 0.2s ease-out",
              },
            },
            React.createElement("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                },
              },
              React.createElement(PlaygroundDotLoader, {
                dotCount: 9,
                dotSize: 4,
                gap: 3,
                speed: 800,
              }),
              React.createElement("span", {
                style: {
                  fontSize: "18px",
                  lineHeight: 1,
                  fontWeight: 600,
                  color: "#fff",
                },
              }, label)
            )
          );
        }
  
        function readFileAsDataUrl(file) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
            reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
            reader.readAsDataURL(file);
          });
        }
  
        async function readFileAsBase64(file) {
          const dataUrl = await readFileAsDataUrl(file);
          const commaIndex = dataUrl.indexOf(",");
          return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
        }
  
        function loadImageElement(src) {
          return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Failed to load selected image"));
            image.src = src;
          });
        }
  
        async function createProfilePhotoDataUrl(file) {
          const sourceDataUrl = await readFileAsDataUrl(file);
          const image = await loadImageElement(sourceDataUrl);
          const canvas = document.createElement("canvas");
          const targetSize = 320;
          const sourceWidth = image.naturalWidth || image.width || targetSize;
          const sourceHeight = image.naturalHeight || image.height || targetSize;
          const squareSize = Math.min(sourceWidth, sourceHeight);
          const sourceX = Math.max(0, Math.floor((sourceWidth - squareSize) / 2));
          const sourceY = Math.max(0, Math.floor((sourceHeight - squareSize) / 2));
  
          canvas.width = targetSize;
          canvas.height = targetSize;
  
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Failed to prepare profile picture preview");
          }
  
          context.clearRect(0, 0, targetSize, targetSize);
          context.drawImage(
            image,
            sourceX,
            sourceY,
            squareSize,
            squareSize,
            0,
            0,
            targetSize,
            targetSize
          );
  
          return canvas.toDataURL("image/jpeg", 0.84);
        }
  
        function StatusIndicatorCloseIcon() {
          return React.createElement("svg", {
            className: "status-indicator-close-icon",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true"
          },
            React.createElement("path", { d: "M18 6 6 18" }),
            React.createElement("path", { d: "m6 6 12 12" })
          );
        }
  
        function StatusIndicatorGithubLogo() {
          return React.createElement("svg", {
            className: "status-indicator-logo",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true"
          },
            React.createElement("path", {
              d: "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
            })
          );
        }
  
        function StatusIndicator({ title, copy, logoUrl, brand, progress, indeterminate, onDismiss }) {
          const [isVisible, setIsVisible] = useState(false);
          const [isExiting, setIsExiting] = useState(false);
          const hasProgress = Number.isFinite(progress) || indeterminate;
          const normalizedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, Number(progress))) : 0;
  
          useEffect(() => {
            const frameId = window.requestAnimationFrame(() => setIsVisible(true));
            return () => window.cancelAnimationFrame(frameId);
          }, []);
  
          function handleDismiss() {
            setIsExiting(true);
            window.setTimeout(() => {
              onDismiss?.();
            }, 180);
          }
  
          return React.createElement("div", {
            className: "status-indicator" + (isVisible && !isExiting ? " is-visible" : "") + (isExiting ? " is-exiting" : "")
          },
            (logoUrl || brand)
              ? React.createElement("div", { className: "status-indicator-media" },
                  brand === "github"
                    ? React.createElement(StatusIndicatorGithubLogo)
                    :
                  React.createElement("img", {
                    className: "status-indicator-logo",
                    src: logoUrl,
                    alt: "",
                    "aria-hidden": "true",
                    draggable: false
                  })
                )
              : null,
            React.createElement("div", { className: "status-indicator-body" },
              React.createElement("div", { className: "status-indicator-title" }, title),
              React.createElement("div", { className: "status-indicator-copy" }, copy),
              hasProgress
                ? React.createElement("div", { className: "status-indicator-progress" },
                    React.createElement("div", {
                      className: "status-indicator-progress-fill" + (indeterminate ? " is-indeterminate" : ""),
                      style: indeterminate ? undefined : { width: normalizedProgress + "%" },
                    })
                  )
                : null
            ),
            React.createElement("button", {
              type: "button",
              className: "status-indicator-close",
              onClick: handleDismiss,
              "aria-label": "Dismiss " + title
            }, React.createElement(StatusIndicatorCloseIcon))
          );
        }
  
        function StatusIndicatorStack({ items, emptyText, dismissedIds, onDismiss }) {
          const visibleItems = items.filter((item) => !dismissedIds.includes(item.id));
          if (visibleItems.length === 0) {
            return null;
          }
  
          return React.createElement("div", { className: "status-indicator-stack" },
            React.createElement("div", { className: "status-indicator-list" },
              visibleItems.map((item) =>
                React.createElement(StatusIndicator, {
                  key: item.id,
                  title: item.title,
                  copy: item.copy,
                  logoUrl: item.logoUrl,
                  brand: item.brand,
                  progress: item.progress,
                  indeterminate: item.indeterminate,
                  onDismiss: () => onDismiss(item.id)
                })
              )
            )
          );
        }
  
        const DEMO_PINNED_THREADS = [
          { id: "pin_runner_playground", title: "Improve runner playground sidebar", positive: "+2", negative: "-1", ageLabel: "2 H" },
          { id: "pin_sdk_foundation", title: "Runner SDK foundation cleanup", positive: "+4", negative: "-0", ageLabel: "1 D" }
        ];
  
        const DEMO_RECENT_THREADS = [
          { id: "demo_thread_sidebar", title: "on localhost:4177 we have this runner playground sample application running", messageCount: 12, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
          { id: "demo_thread_settings", title: "Plan improved aiOS settings modal structure", messageCount: 3, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
          { id: "demo_thread_context", title: "Build thread context operations popup and slash command staging", messageCount: 6, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
          { id: "demo_thread_files", title: "Unify file explorer integrations for Google Drive, OneDrive, GitHub, and Notion", messageCount: 8, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
          { id: "demo_thread_speech", title: "Ship speech to text and microphone states in runner task input", messageCount: 5, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString() }
        ];
  
        const DEMO_SCHEDULED_THREADS = [
          { id: "demo_scheduled_publish", title: "Publish runner SDK changelog", messageCount: 2, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), isScheduled: true },
          { id: "demo_scheduled_review", title: "Review open playground polish tasks", messageCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), isScheduled: true }
        ];
  
        const SEEDED_DEMO_THREAD_ID = DEMO_RECENT_THREADS[0]?.id || "demo_thread_sidebar";
        const DEFAULT_DEMO_THREAD_ID = "";
  
        const DEMO_THREAD_EXPERIENCE_MAP = {
          demo_thread_sidebar: {
            prompt: "Redesign the ACP sidebar so power users can scan activity faster without losing density.",
            agent: "Efficient Agent",
            model: "gpt-5.4-mini",
            runtime: "claw",
            environment: "Default",
            summary: "I separated pinned, recent, and scheduled work, kept the collapsed rail fast, and made active runs more legible without sacrificing density.",
            events: [
              { kind: "user", title: "Prompt", body: "Redesign the ACP sidebar so power users can scan activity faster without losing density." },
              { kind: "reasoning", title: "Planning", body: "Review the current information hierarchy, then rebalance the shell around fast scanning, pinned context, and active work." },
              { kind: "tool", title: "bash", body: "rg -n \"sidebar-thread|sidebar-action|sidebar-rail\" apps/platform/server/index.mjs" },
              { kind: "reasoning", title: "Refining layout", body: "Preserve the current rhythm, but pull pinned work forward, simplify meta labels, and sharpen the active state." },
              { kind: "tool", title: "apply_patch", body: "Restructure the thread groups, strengthen selected states, and rebalance the right-side metadata." },
              { kind: "message", title: "Result", body: "Pinned, recent, and scheduled work now read as separate layers, active runs stand out immediately, and the rail still stays compact." },
            ],
            changes: [
              { path: "apps/platform/server/index.mjs", copy: "Rebalanced sidebar grouping and active-state treatment." },
              { path: "apps/platform/server/index.mjs", copy: "Tightened thread metadata so status and recency compete less." },
              { path: "apps/platform/server/index.mjs", copy: "Kept the collapsed rail behavior intact for fast switching." },
            ],
          },
          demo_thread_settings: {
            prompt: "Plan an enterprise settings flow for usage billing, BYOM inference, and seat-based team plans.",
            agent: "Strategist Agent",
            model: "gpt-5.4-mini",
            runtime: "claw",
            environment: "Default",
            summary: "The plan unifies Builder, Team, Business, and Enterprise, keeps product access on subscription, and meters infrastructure separately after included organization credits.",
            events: [
              { kind: "user", title: "Prompt", body: "Plan an enterprise settings flow for usage billing, BYOM inference, and seat-based team plans." },
              { kind: "reasoning", title: "Framing", body: "Separate product entitlement from metered usage, then place customer-hosted inference under Team, Business, and Enterprise." },
              { kind: "tool", title: "notes", body: "Review current billing controls, organization inference settings, and plan naming inside ACP." },
              { kind: "reasoning", title: "Designing the flow", body: "Plans should govern entitlement. Inference settings should govern endpoint configuration. Usage billing should remain a separate safety control." },
              { kind: "message", title: "Result", body: "Add organization-scoped inference controls, monthly spend limits, and a dedicated Inference section for endpoint health, model discovery, and encrypted credentials." },
            ],
            changes: [
              { path: "settings/plans", copy: "Added canonical organization plans with metered usage controls." },
              { path: "settings/inference", copy: "Defined BYOM endpoint inputs and connection testing." },
            ],
          },
          demo_thread_context: {
            prompt: "Design a thread context popup so users can attach files, repos, and previous work before starting a run.",
            agent: "Assistant",
            model: "gpt-5.4-mini",
            runtime: "claw",
            environment: "Default",
            summary: "The popup stages context before execution, so threads start with the right files, repos, and historical references already attached.",
            events: [
              { kind: "user", title: "Prompt", body: "Design a thread context popup so users can attach files, repos, and previous work before starting a run." },
              { kind: "reasoning", title: "Scope", body: "Keep the composer clean. Move context staging into a dedicated surface with visible chips and reusable presets." },
              { kind: "tool", title: "bash", body: "rg -n \"context|attachment|slash command\" apps/platform/server/index.mjs" },
              { kind: "message", title: "Result", body: "The popup groups repos, files, skills, and previous thread state so the run begins with deliberate context instead of ad-hoc prompts." },
            ],
            changes: [
              { path: "threads/context", copy: "Defined staged context groups for repos, attachments, and prior runs." },
              { path: "composer", copy: "Kept the thread composer focused by moving heavy context into a popup." },
            ],
          },
        };
  
        function getDemoThreadExperience(thread) {
          const normalizedId = typeof thread?.id === "string" ? thread.id.trim() : "";
          const mapped = normalizedId ? DEMO_THREAD_EXPERIENCE_MAP[normalizedId] : null;
          if (mapped) {
            return mapped;
          }
  
          const title = typeof thread?.title === "string" && thread.title.trim()
            ? thread.title.trim()
            : "Explore the Agentic Compute Platform demo";
  
          return {
            prompt: title,
            agent: "Efficient Agent",
            model: "gpt-5.4-mini",
            runtime: "claw",
            environment: "Default",
            summary: "This seeded thread shows how ACP combines threads, agents, environments, and tool execution in one workspace.",
            events: [
              { kind: "user", title: "Prompt", body: title },
              { kind: "reasoning", title: "Planning", body: "Review the workspace context, decide what to inspect first, and prepare the next tool action." },
              { kind: "tool", title: "bash", body: "pwd" },
              { kind: "message", title: "Result", body: "This demo thread is here to show the shell, logs, and orchestration flow before you sign in and run real work." },
            ],
            changes: [
              { path: "workspace/demo", copy: "Seeded walkthrough content for the platform preview." },
            ],
          };
        }
  
        function formatRelativeThreadTime(value) {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          const diffMs = Math.max(0, Date.now() - date.getTime());
          const minuteMs = 60 * 1000;
          const hourMs = 60 * minuteMs;
          const dayMs = 24 * hourMs;
          const weekMs = 7 * dayMs;
          const monthMs = 30 * dayMs;
  
          if (diffMs < hourMs) return Math.max(1, Math.round(diffMs / minuteMs)) + " M";
          if (diffMs < dayMs) return Math.max(1, Math.round(diffMs / hourMs)) + " H";
          if (diffMs < weekMs) return Math.max(1, Math.round(diffMs / dayMs)) + " D";
          if (diffMs < monthMs) return Math.max(1, Math.round(diffMs / weekMs)) + " W";
          return Math.max(1, Math.round(diffMs / monthMs)) + " M";
        }
  
        function formatCompactThreadActivityTime(value) {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          const diffMs = Math.max(0, Date.now() - date.getTime());
          const minuteMs = 60 * 1000;
          const hourMs = 60 * minuteMs;
          const dayMs = 24 * hourMs;
          const weekMs = 7 * dayMs;
          const monthMs = 30 * dayMs;
          const yearMs = 365 * dayMs;
  
          if (diffMs < hourMs) return Math.max(1, Math.round(diffMs / minuteMs)) + "M";
          if (diffMs < dayMs) return Math.max(1, Math.round(diffMs / hourMs)) + "H";
          if (diffMs < weekMs) return Math.max(1, Math.round(diffMs / dayMs)) + "D";
          if (diffMs < monthMs) return Math.max(1, Math.round(diffMs / weekMs)) + "W";
          if (diffMs < yearMs) {
            const months = Math.max(1, Math.round(diffMs / monthMs));
            if (months <= 9) {
              return months + "MO";
            }
          }
          return Math.max(1, Math.round(diffMs / yearMs)) + "Y";
        }
  
        function normalizeThreadItem(thread) {
          const rawId = typeof thread?.id === "string"
            ? thread.id
            : typeof thread?.id === "number"
              ? String(thread.id)
              : "";
          const rawTitle = typeof thread?.title === "string"
            ? thread.title
            : typeof thread?.title === "number"
              ? String(thread.title)
              : "";
          const rawStatus = typeof thread?.status === "string"
            ? thread.status
            : typeof thread?.status === "number"
              ? String(thread.status)
              : "";
          const rawAgentId = typeof thread?.agentId === "string"
            ? thread.agentId
            : typeof thread?.agentId === "number"
              ? String(thread.agentId)
              : "";
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : {};
          const runnerPlaygroundMetadata = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : {};
          const runnerTaskPreview = runnerPlaygroundMetadata?.taskPreview && typeof runnerPlaygroundMetadata.taskPreview === "object" && !Array.isArray(runnerPlaygroundMetadata.taskPreview)
            ? runnerPlaygroundMetadata.taskPreview
            : {};
          const runnerMissionControl = runnerPlaygroundMetadata?.missionControl && typeof runnerPlaygroundMetadata.missionControl === "object" && !Array.isArray(runnerPlaygroundMetadata.missionControl)
            ? runnerPlaygroundMetadata.missionControl
            : {};
          const threadProjectRecord = thread?.project && typeof thread.project === "object" && !Array.isArray(thread.project)
            ? thread.project
            : {};
          const threadEnvironmentRecord = thread?.environment && typeof thread.environment === "object" && !Array.isArray(thread.environment)
            ? thread.environment
            : thread?.computer && typeof thread.computer === "object" && !Array.isArray(thread.computer)
              ? thread.computer
              : {};
          const threadAgentRecord = thread?.agent && typeof thread.agent === "object" && !Array.isArray(thread.agent)
            ? thread.agent
            : {};
          const rawProjectId = typeof thread?.projectId === "string"
            ? thread.projectId
            : typeof thread?.project_id === "string"
              ? thread.project_id
              : typeof threadProjectRecord?.id === "string"
                ? threadProjectRecord.id
              : typeof metadata?.projectId === "string"
                ? metadata.projectId
                : typeof metadata?.project_id === "string"
                  ? metadata.project_id
                  : typeof runnerTaskPreview?.projectId === "string"
                    ? runnerTaskPreview.projectId
                    : typeof runnerMissionControl?.projectId === "string"
                      ? runnerMissionControl.projectId
                      : "";
          const rawProjectName = typeof thread?.projectName === "string"
            ? thread.projectName
            : typeof thread?.project_name === "string"
              ? thread.project_name
              : typeof threadProjectRecord?.name === "string"
                ? threadProjectRecord.name
              : typeof metadata?.projectName === "string"
                ? metadata.projectName
                : typeof metadata?.project_name === "string"
                  ? metadata.project_name
                  : typeof runnerTaskPreview?.projectName === "string"
                    ? runnerTaskPreview.projectName
                    : typeof runnerMissionControl?.projectName === "string"
                      ? runnerMissionControl.projectName
                      : "";
          const rawEnvironmentId = typeof thread?.environmentId === "string"
            ? thread.environmentId
            : typeof thread?.environment_id === "string"
              ? thread.environment_id
              : typeof threadEnvironmentRecord?.id === "string"
                ? threadEnvironmentRecord.id
              : typeof metadata?.environmentId === "string"
                ? metadata.environmentId
                : typeof metadata?.environment_id === "string"
                  ? metadata.environment_id
                  : typeof runnerPlaygroundMetadata?.environmentId === "string"
                    ? runnerPlaygroundMetadata.environmentId
                    : typeof runnerTaskPreview?.environmentId === "string"
                      ? runnerTaskPreview.environmentId
                      : "";
          const rawEnvironmentName = typeof thread?.environmentName === "string"
            ? thread.environmentName
            : typeof thread?.environment_name === "string"
              ? thread.environment_name
              : typeof thread?.computerName === "string"
                ? thread.computerName
                : typeof thread?.computer_name === "string"
                  ? thread.computer_name
                  : typeof threadEnvironmentRecord?.name === "string"
                    ? threadEnvironmentRecord.name
                  : typeof metadata?.environmentName === "string"
                    ? metadata.environmentName
                    : typeof metadata?.environment_name === "string"
                      ? metadata.environment_name
                      : typeof runnerPlaygroundMetadata?.environmentName === "string"
                        ? runnerPlaygroundMetadata.environmentName
                        : typeof runnerTaskPreview?.environmentName === "string"
                          ? runnerTaskPreview.environmentName
                          : "";
          const rawAgentName = typeof thread?.agentName === "string"
            ? thread.agentName
            : typeof thread?.agent_name === "string"
              ? thread.agent_name
              : typeof threadAgentRecord?.name === "string"
                ? threadAgentRecord.name
                : typeof threadAgentRecord?.label === "string"
                  ? threadAgentRecord.label
                  : typeof metadata?.agentName === "string"
                    ? metadata.agentName
                    : typeof metadata?.agent_name === "string"
                      ? metadata.agent_name
                      : typeof runnerPlaygroundMetadata?.agentName === "string"
                        ? runnerPlaygroundMetadata.agentName
                        : typeof runnerPlaygroundMetadata?.agent_name === "string"
                          ? runnerPlaygroundMetadata.agent_name
                          : typeof runnerTaskPreview?.agentName === "string"
                            ? runnerTaskPreview.agentName
                            : typeof runnerTaskPreview?.agent_name === "string"
                              ? runnerTaskPreview.agent_name
                              : "";
          const rawAgentPhotoUrl = typeof thread?.agentPhotoUrl === "string"
            ? thread.agentPhotoUrl
            : typeof thread?.agent_photo_url === "string"
              ? thread.agent_photo_url
              : typeof thread?.agentAvatarUrl === "string"
                ? thread.agentAvatarUrl
                : typeof thread?.agent_avatar_url === "string"
                  ? thread.agent_avatar_url
                  : typeof threadAgentRecord?.profilePhotoUrl === "string"
                    ? threadAgentRecord.profilePhotoUrl
                    : typeof threadAgentRecord?.photoUrl === "string"
                      ? threadAgentRecord.photoUrl
                      : typeof threadAgentRecord?.avatarUrl === "string"
                        ? threadAgentRecord.avatarUrl
                        : typeof metadata?.agentPhotoUrl === "string"
                          ? metadata.agentPhotoUrl
                          : typeof metadata?.agent_photo_url === "string"
                            ? metadata.agent_photo_url
                            : typeof metadata?.agentAvatarUrl === "string"
                              ? metadata.agentAvatarUrl
                              : typeof metadata?.agent_avatar_url === "string"
                                ? metadata.agent_avatar_url
                                : typeof runnerPlaygroundMetadata?.agentPhotoUrl === "string"
                                  ? runnerPlaygroundMetadata.agentPhotoUrl
                                  : typeof runnerPlaygroundMetadata?.agent_photo_url === "string"
                                    ? runnerPlaygroundMetadata.agent_photo_url
                                    : typeof runnerPlaygroundMetadata?.agentAvatarUrl === "string"
                                      ? runnerPlaygroundMetadata.agentAvatarUrl
                                      : typeof runnerPlaygroundMetadata?.agent_avatar_url === "string"
                                        ? runnerPlaygroundMetadata.agent_avatar_url
                                        : typeof runnerTaskPreview?.agentPhotoUrl === "string"
                                          ? runnerTaskPreview.agentPhotoUrl
                                          : typeof runnerTaskPreview?.agent_photo_url === "string"
                                            ? runnerTaskPreview.agent_photo_url
                                            : typeof runnerTaskPreview?.agentAvatarUrl === "string"
                                              ? runnerTaskPreview.agentAvatarUrl
                                              : typeof runnerTaskPreview?.agent_avatar_url === "string"
                                                ? runnerTaskPreview.agent_avatar_url
                                                : "";
          const rawCreatedAt = typeof thread?.createdAt === "string" ? thread.createdAt : "";
          const rawUpdatedAt = typeof thread?.updatedAt === "string" ? thread.updatedAt : "";
          const rawStartedAt = typeof thread?.startedAt === "string"
            ? thread.startedAt
            : typeof thread?.started_at === "string"
              ? thread.started_at
              : "";
          const rawCompletedAt = typeof thread?.completedAt === "string"
            ? thread.completedAt
            : typeof thread?.completed_at === "string"
              ? thread.completed_at
              : "";
          const rawFinishedAt = typeof thread?.finishedAt === "string"
            ? thread.finishedAt
            : typeof thread?.finished_at === "string"
              ? thread.finished_at
              : "";
          const rawEndedAt = typeof thread?.endedAt === "string"
            ? thread.endedAt
            : typeof thread?.ended_at === "string"
              ? thread.ended_at
              : "";
          const rawNextRunAt = typeof thread?.nextRunAt === "string"
            ? thread.nextRunAt
            : typeof thread?.scheduledTime === "string"
              ? thread.scheduledTime
              : "";
          const resolvedStatus = resolveThreadDisplayStatus(rawStatus, rawCompletedAt || rawFinishedAt || rawEndedAt);
          return {
            id: rawId || generateId("thread"),
            title: rawTitle || "Untitled thread",
            status: resolvedStatus,
            agentId: rawAgentId,
            agentName: rawAgentName,
            agentPhotoUrl: rawAgentPhotoUrl,
            agentAvatarUrl: rawAgentPhotoUrl,
            projectId: rawProjectId,
            projectName: rawProjectName,
            environmentId: rawEnvironmentId,
            environmentName: rawEnvironmentName,
            messageCount: Number.isFinite(thread.messageCount) ? thread.messageCount : 0,
            createdAt: rawCreatedAt,
            updatedAt: rawUpdatedAt,
            startedAt: rawStartedAt,
            completedAt: rawCompletedAt,
            finishedAt: rawFinishedAt,
            endedAt: rawEndedAt,
            nextRunAt: rawNextRunAt,
            isScheduled: Boolean(rawNextRunAt),
            totalCT: readSettingsComputeTokens(thread, "totalCT", "totalCost"),
            agentCT: readSettingsComputeTokens(thread, "agentCT", "agentCost"),
            environmentCT: readSettingsComputeTokens(thread, "environmentCT", "environmentCost"),
            totalCost: Number.isFinite(Number(thread?.totalCost)) ? Number(thread.totalCost) : 0,
            agentCost: Number.isFinite(Number(thread?.agentCost)) ? Number(thread.agentCost) : 0,
            environmentCost: Number.isFinite(Number(thread?.environmentCost)) ? Number(thread.environmentCost) : 0,
            inputTokens: Number.isFinite(Number(thread?.inputTokens)) ? Number(thread.inputTokens) : 0,
            outputTokens: Number.isFinite(Number(thread?.outputTokens)) ? Number(thread.outputTokens) : 0,
            cacheTokens: Number.isFinite(Number(thread?.cacheTokens)) ? Number(thread.cacheTokens) : 0,
            totalTokens: Number.isFinite(Number(thread?.totalTokens)) ? Number(thread.totalTokens) : 0,
            metadata,
            isPinned: Boolean(runnerPlaygroundMetadata.pinnedInSidebar),
            pinnedAt: typeof runnerPlaygroundMetadata.pinnedAt === "string" ? runnerPlaygroundMetadata.pinnedAt : "",
            positive: typeof thread?.positive === "string" ? thread.positive : "",
            negative: typeof thread?.negative === "string" ? thread.negative : "",
            ageLabel: typeof thread?.ageLabel === "string" ? thread.ageLabel : "",
            attachments: Array.isArray(thread?.attachments) ? thread.attachments : [],
          };
        }
  
        function getThreadTaskPreview(thread) {
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : null;
          const runnerPlaygroundMetadata = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : null;
          const taskPreview = runnerPlaygroundMetadata?.taskPreview && typeof runnerPlaygroundMetadata.taskPreview === "object" && !Array.isArray(runnerPlaygroundMetadata.taskPreview)
            ? runnerPlaygroundMetadata.taskPreview
            : null;
          return taskPreview?.taskId ? taskPreview : null;
        }
  
        function getThreadMissionControlMetadata(thread) {
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : null;
          const runnerPlaygroundMetadata = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : null;
          const missionControl = runnerPlaygroundMetadata?.missionControl && typeof runnerPlaygroundMetadata.missionControl === "object" && !Array.isArray(runnerPlaygroundMetadata.missionControl)
            ? runnerPlaygroundMetadata.missionControl
            : null;
          return missionControl?.source === "project_backlog_mission_control"
            ? missionControl
            : null;
        }
  
        function getPlaygroundThreadActorInfo(thread, agentsById = {}, fallbackName = "No agent") {
          const safeThread = normalizeThreadItem(thread);
          const threadMetadata = safeThread?.metadata && typeof safeThread.metadata === "object" && !Array.isArray(safeThread.metadata)
            ? safeThread.metadata
            : {};
          const runnerPlaygroundMetadata = threadMetadata?.runnerPlayground && typeof threadMetadata.runnerPlayground === "object" && !Array.isArray(threadMetadata.runnerPlayground)
            ? threadMetadata.runnerPlayground
            : {};
          const taskPreview = runnerPlaygroundMetadata?.taskPreview && typeof runnerPlaygroundMetadata.taskPreview === "object" && !Array.isArray(runnerPlaygroundMetadata.taskPreview)
            ? runnerPlaygroundMetadata.taskPreview
            : {};
          const agentId = String(
            safeThread?.agentId
            || safeThread?.agent?.id
            || safeThread?.metadata?.agentId
            || runnerPlaygroundMetadata?.agentId
            || taskPreview?.agentId
            || ""
          ).trim();
          const explicitAgentName = String(
            safeThread?.agentName
            || safeThread?.agent_name
            || threadMetadata?.agentName
            || threadMetadata?.agent_name
            || runnerPlaygroundMetadata?.agentName
            || runnerPlaygroundMetadata?.agent_name
            || taskPreview?.agentName
            || taskPreview?.agent_name
            || ""
          ).trim();
          const explicitAgentPhotoUrl = normalizeSessionPhotoUrl(
            safeThread?.agentPhotoUrl
            || safeThread?.agent_photo_url
            || safeThread?.agentAvatarUrl
            || safeThread?.agent_avatar_url
            || threadMetadata?.agentPhotoUrl
            || threadMetadata?.agent_photo_url
            || threadMetadata?.agentAvatarUrl
            || threadMetadata?.agent_avatar_url
            || runnerPlaygroundMetadata?.agentPhotoUrl
            || runnerPlaygroundMetadata?.agent_photo_url
            || runnerPlaygroundMetadata?.agentAvatarUrl
            || runnerPlaygroundMetadata?.agent_avatar_url
            || taskPreview?.agentPhotoUrl
            || taskPreview?.agent_photo_url
            || taskPreview?.agentAvatarUrl
            || taskPreview?.agent_avatar_url
            || ""
          );
          if (getThreadMissionControlMetadata(safeThread)) {
            return {
              id: agentId,
              name: "Mission Control Agent",
              photoUrl: explicitAgentPhotoUrl,
              kind: "mission-control",
            };
          }
  
          const agentRecord = agentId && agentsById && agentsById[agentId]
            ? agentsById[agentId]
            : null;
          if (agentRecord) {
            const agentPhotoUrl = typeof getPlaygroundAgentProfilePhotoUrl === "function"
              ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(agentRecord))
              : "";
            return {
              id: agentId,
              name: agentRecord.name || agentRecord.label || explicitAgentName || agentId,
              photoUrl: agentPhotoUrl || explicitAgentPhotoUrl,
              kind: "agent",
            };
          }
  
          return {
            id: agentId,
            name: explicitAgentName || agentId || fallbackName,
            photoUrl: explicitAgentPhotoUrl,
            kind: agentId ? "agent" : "none",
          };
        }
  
        function getSidebarThreadTitleParts(thread) {
          const safeThread = normalizeThreadItem(thread);
          const safeThreadTitle = typeof safeThread.title === "string" && safeThread.title.trim()
            ? safeThread.title.trim()
            : "Untitled thread";
          const taskPreview = getThreadTaskPreview(safeThread);
          const previewTicketNumber = typeof taskPreview?.ticketNumber === "string" && taskPreview.ticketNumber.trim()
            ? taskPreview.ticketNumber.trim()
            : "";
          const prefixedTicketMatch = safeThreadTitle.match(/^((?:[A-Z]{1,10}-)?\d{1,6})\s+(.+)$/);
          const ticketNumber = previewTicketNumber || (prefixedTicketMatch ? prefixedTicketMatch[1].trim() : "");
          const displayThreadTitle = ticketNumber && safeThreadTitle.startsWith(ticketNumber)
            ? (safeThreadTitle.slice(ticketNumber.length).trimStart() || safeThreadTitle)
            : prefixedTicketMatch?.[2]?.trim() || safeThreadTitle;
  
          return {
            safeThread,
            taskPreview,
            taskTicketNumber: ticketNumber,
            displayThreadTitle,
          };
        }
  
        function renderPlaygroundThreadOverviewPersonAvatar(label, photoUrl = "") {
          const normalizedLabel = String(label || "").trim() || "User";
          const fallbackLabel = typeof getAccountInitials === "function"
            ? getAccountInitials(normalizedLabel)
            : normalizedLabel.charAt(0).toUpperCase() || "U";
          const normalizedPhotoUrl = typeof normalizeSessionPhotoUrl === "function"
            ? normalizeSessionPhotoUrl(photoUrl)
            : String(photoUrl || "").trim();
          return React.createElement("div", {
              className: "playground-agents-detail-thread-user-avatar",
              title: normalizedLabel,
              "aria-hidden": "true",
            },
            typeof canRenderAvatarImage === "function" && canRenderAvatarImage(normalizedPhotoUrl)
              ? React.createElement("img", {
                  className: "playground-agents-detail-thread-user-avatar-image",
                  src: normalizedPhotoUrl,
                  alt: fallbackLabel,
                })
              : React.createElement("span", { className: "playground-agents-detail-thread-user-avatar-fallback" }, fallbackLabel)
          );
        }
  
  
        function renderPlaygroundThreadOverviewTable({
          threads = [],
          rowOptions = {},
          tableOptions = {},
        } = {}) {
          const safeThreads = Array.isArray(threads) ? threads : [];
          const selectable = Boolean(rowOptions.selectable);
          const sortable = tableOptions.sortable !== false;
          const selectedIds = rowOptions.selectedIds instanceof Set
            ? rowOptions.selectedIds
            : new Set(Array.isArray(rowOptions.selectedIds) ? rowOptions.selectedIds.map((id) => String(id || "").trim()).filter(Boolean) : []);
          const readThreadContext = (thread) => {
            const titleParts = typeof getSidebarThreadTitleParts === "function"
              ? getSidebarThreadTitleParts(thread)
              : { safeThread: thread, displayThreadTitle: thread?.title || "Untitled thread" };
            return {
              safeThread: titleParts.safeThread || thread,
              displayThreadTitle: titleParts.displayThreadTitle || "Untitled thread",
              threadId: String(titleParts.safeThread?.id || thread?.id || "").trim(),
            };
          };
          const triggerThreadActions = (event, thread) => {
            const { safeThread, threadId } = readThreadContext(thread);
            if (!threadId) return;
            if (typeof rowOptions.onThreadActions === "function") {
              rowOptions.onThreadActions(event, threadId, safeThread, thread);
              return;
            }
            if (typeof rowOptions.onOpenThread === "function") rowOptions.onOpenThread(threadId, safeThread, thread);
          };
          const readThreadDateLabel = (thread) => {
            const safeThread = readThreadContext(thread).safeThread;
            return String(typeof rowOptions.getDateLabel === "function"
              ? rowOptions.getDateLabel(thread, safeThread)
              : (typeof formatThreadSearchTimestamp === "function"
                  ? formatThreadSearchTimestamp(typeof resolveThreadSortTimestamp === "function" ? resolveThreadSortTimestamp(safeThread) : (thread?.updatedAt || thread?.createdAt || ""))
                  : "")
            ).trim() || "—";
          };
          const readThreadSortTimestamp = (thread) => {
            const safeThread = readThreadContext(thread).safeThread;
            const value = typeof resolveThreadSortTimestamp === "function"
              ? resolveThreadSortTimestamp(safeThread)
              : (safeThread?.updatedAt || safeThread?.createdAt || thread?.updatedAt || thread?.createdAt || "");
            const timestamp = new Date(value || 0).getTime();
            return Number.isFinite(timestamp) ? timestamp : 0;
          };
          const dataTable = React.createElement(PlatformDataTable, {
            key: tableOptions.key,
            rows: safeThreads,
            getRowId: (thread) => readThreadContext(thread).threadId,
            ariaLabel: tableOptions.ariaLabel || "Threads",
            className: ["playground-thread-overview-platform-table", tableOptions.className || ""].filter(Boolean).join(" "),
            surface: tableOptions.surface || "plain",
            layout: tableOptions.layout || "content",
            variant: tableOptions.variant || "minimalistic-ui",
            sticky: Boolean(tableOptions.sticky),
            stickyTop: tableOptions.stickyTop,
            rowMinHeight: tableOptions.rowMinHeight,
            sorting: tableOptions.sorting,
            pagination: tableOptions.pagination === undefined ? false : tableOptions.pagination,
            toolbar: tableOptions.toolbar,
            loading: Boolean(tableOptions.loading),
            error: tableOptions.error || undefined,
            emptyState: tableOptions.emptyState || "No threads yet.",
            noResultsState: tableOptions.noResultsState || "No matching threads.",
            footer: tableOptions.footer,
            columns: [
              {
                id: "title",
                header: "Title",
                accessor: (thread) => readThreadContext(thread).displayThreadTitle,
                sortable,
                width: "minmax(180px, 1.7fr)",
                cell: ({ row: thread }) => React.createElement("div", { className: "playground-plugin-row-title" }, readThreadContext(thread).displayThreadTitle),
              },
              {
                id: "source",
                header: "Source",
                accessor: (thread) => String(typeof rowOptions.getSourceLabel === "function" ? rowOptions.getSourceLabel(thread, readThreadContext(thread).safeThread) : "").trim() || "Chat",
                width: "minmax(90px, 0.8fr)",
              },
              {
                id: "environment",
                header: "Environment",
                accessor: (thread) => String(typeof rowOptions.getEnvironmentLabel === "function" ? rowOptions.getEnvironmentLabel(thread, readThreadContext(thread).safeThread) : "").trim() || "Workspace",
                width: "minmax(110px, 1fr)",
                hideBelow: 720,
              },
              {
                id: "triggered-by",
                header: "Triggered by",
                accessor: (thread) => String(typeof rowOptions.getTriggeredByLabel === "function" ? rowOptions.getTriggeredByLabel(thread, readThreadContext(thread).safeThread) : "").trim() || "-",
                width: "minmax(120px, 1fr)",
                hideBelow: 900,
                cell: ({ row: thread }) => {
                  const safeThread = readThreadContext(thread).safeThread;
                  const label = String(typeof rowOptions.getTriggeredByLabel === "function" ? rowOptions.getTriggeredByLabel(thread, safeThread) : "").trim() || "-";
                  const avatarUrl = typeof rowOptions.getTriggeredByAvatarUrl === "function" ? rowOptions.getTriggeredByAvatarUrl(thread, safeThread) : "";
                  return label !== "-"
                    ? React.createElement("span", { className: "playground-agents-detail-thread-triggered-by" },
                        renderPlaygroundThreadOverviewPersonAvatar(label, avatarUrl),
                        React.createElement("span", { className: "playground-agents-detail-thread-triggered-by-label" }, label)
                      )
                    : "-";
                },
              },
              {
                id: "date",
                header: "Date",
                accessor: readThreadSortTimestamp,
                sortable,
                sortDescFirst: true,
                width: "minmax(100px, 0.85fr)",
                align: "end",
                cell: ({ row: thread }) => readThreadDateLabel(thread),
              },
            ],
            selection: selectable ? {
              enabled: true,
              value: selectedIds,
              ariaLabel: (thread) => "Select " + readThreadContext(thread).displayThreadTitle,
              onChange: ({ selectedIds: nextIds, reason }) => {
                if (reason === "visible") {
                  rowOptions.onToggleVisibleSelection?.();
                  return;
                }
                const changedId = Array.from(new Set([...selectedIds, ...nextIds])).find((id) => selectedIds.has(id) !== nextIds.has(id));
                if (changedId) {
                  const changedThread = safeThreads.find((thread) => readThreadContext(thread).threadId === changedId);
                  rowOptions.onToggleSelection?.(changedId, readThreadContext(changedThread).safeThread, changedThread);
                }
              },
            } : undefined,
            onRowActivate: (thread) => {
              const { safeThread, threadId } = readThreadContext(thread);
              if (threadId && typeof rowOptions.onOpenThread === "function") rowOptions.onOpenThread(threadId, safeThread, thread);
            },
            onRowActionTrigger: triggerThreadActions,
            onRowContextMenu: (event, thread) => {
              event.preventDefault();
              triggerThreadActions(event, thread);
            },
            isRowActionOpen: (thread) => Boolean(typeof rowOptions.isActionOpen === "function" && rowOptions.isActionOpen(readThreadContext(thread).threadId, readThreadContext(thread).safeThread, thread)),
            getRowAriaLabel: (thread) => "Open thread " + readThreadContext(thread).displayThreadTitle,
          });
          return rowOptions.toolbarContent
            ? React.createElement("div", { className: "playground-thread-overview-table-shell" },
                rowOptions.toolbarContent,
                dataTable
              )
            : dataTable;
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_091__
  
        function normalizeThreadList(items) {
          const next = [];
          const seenIds = new Set();
  
          (Array.isArray(items) ? items : []).forEach((item) => {
            try {
              const normalizedThread = normalizeThreadItem(item);
              const normalizedId = typeof normalizedThread?.id === "string" ? normalizedThread.id.trim() : "";
              const threadId = normalizedId || generateId("thread");
              if (seenIds.has(threadId)) {
                return;
              }
              seenIds.add(threadId);
              next.push({
                ...normalizedThread,
                id: threadId,
              });
            } catch (error) {
              console.error("Failed to normalize thread item", error, item);
            }
          });
  
          return next;
        }
  
        function getThreadPinnedSortTimestamp(thread) {
          if (!thread?.pinnedAt) return 0;
          const timestamp = new Date(thread.pinnedAt).getTime();
          return Number.isFinite(timestamp) ? timestamp : 0;
        }
  
        function isRealThreadId(value) {
          const normalized = String(value || "").trim();
          return /^thread[_-]/.test(normalized);
        }
  
        function isPrivateThreadRecord(thread) {
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : {};
          const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : {};
          return Boolean(
            thread?.privateMode === true
            || thread?.isPrivate === true
            || thread?.temporary === true
            || metadata.privateMode === true
            || metadata.temporary === true
            || String(metadata.visibility || "").trim().toLowerCase() === "private"
            || runnerPlayground.privateMode === true
          );
        }
  
        function threadMetaLabel(thread) {
          if (thread.nextRunAt) {
            return "Scheduled";
          }
          if (typeof thread?.ageLabel === "string" && thread.ageLabel.trim()) {
            return thread.ageLabel.trim();
          }
          if (!isRealThreadId(thread?.id) && thread?.createdAt) {
            return formatRelativeThreadTime(thread.createdAt);
          }
          return "";
        }
  
        function formatPlaygroundFileSize(bytes) {
          if (!Number.isFinite(bytes) || bytes <= 0) return "-";
          if (bytes < 1024) return bytes + " B";
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
          if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
          return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
        }
  
        function formatPlaygroundFileDate(value) {
          if (!value) return "-";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "-";
  
          const diffMs = Math.max(0, Date.now() - date.getTime());
          const minuteMs = 60 * 1000;
          const hourMs = 60 * minuteMs;
          const dayMs = 24 * hourMs;
  
          if (diffMs < hourMs) {
            return Math.max(1, Math.round(diffMs / minuteMs)) + "m ago";
          }
          if (diffMs < dayMs) {
            return Math.max(1, Math.round(diffMs / hourMs)) + "h ago";
          }
          if (diffMs < 7 * dayMs) {
            return Math.max(1, Math.round(diffMs / dayMs)) + "d ago";
          }
          return date.toLocaleDateString();
        }
  
        function formatPlaygroundRelativeTime(value) {
          return formatPlaygroundFileDate(value);
        }
  
        function formatPlaygroundExactDate(value) {
          if (!value) return "—";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "—";
          return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date);
        }
  
        function formatPlaygroundFolderItemCount(entry) {
          const itemCount = Array.isArray(entry?.children) ? entry.children.length : 0;
          if (itemCount > 0 || entry?.hasChildren === false) {
            return itemCount + " items";
          }
          return "Contains items";
        }
  
        const PLAYGROUND_MASKED_SECRET_VALUE = "••••••••";
        const PLAYGROUND_ENVIRONMENT_DRAFT_ID = "__playground_new_environment__";
        const PLAYGROUND_SERVER_DRAFT_ID = "__playground_new_server__";
        const PLAYGROUND_DATABASE_DRAFT_ID = "__playground_new_database__";
        const PLAYGROUND_DEFAULT_FUNCTION_SOURCE_PATH = "index.js";
        const PLAYGROUND_DEFAULT_FUNCTION_PACKAGE_PATH = "package.json";
        const PLAYGROUND_DEFAULT_FUNCTION_SOURCE_CONTENT = [
          "export default async function handler(request) {",
          "  return {",
          "    status: 200,",
          "    headers: {",
          '      "content-type": "application/json; charset=utf-8",',
          "    },",
          "    body: JSON.stringify({",
          '      message: "Hello from Computer Agents",',
          "    }),",
          "  };",
          "}",
        ].join("\n");
        const PLAYGROUND_DEFAULT_FUNCTION_PACKAGE_CONTENT = JSON.stringify({
          name: "computer-agents-function",
          version: "1.0.0",
          private: true,
          type: "module",
          scripts: {
            start: "node index.js",
          },
          engines: {
            node: ">=22",
          },
          dependencies: {
            "computer-agents": "latest",
            zod: "latest",
            nanoid: "latest",
            "date-fns": "latest",
          },
        }, null, 2) + "\n";
        const PLAYGROUND_DEFAULT_WEB_APP_SOURCE_PATH = "index.html";
        const PLAYGROUND_DEFAULT_WEB_APP_PACKAGE_PATH = "package.json";
        const PLAYGROUND_DEFAULT_WEB_APP_SOURCE_CONTENT = [
          "<!doctype html>",
          '<html lang="en">',
          "  <head>",
          '    <meta charset="utf-8" />',
          '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
          "    <title>Computer Agents Web App</title>",
          "    <style>",
          "      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }",
          "      * { box-sizing: border-box; }",
          "      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #000; color: #fff; }",
          "      main { width: min(720px, calc(100vw - 40px)); padding: 48px; border: 1px solid rgba(255,255,255,.1); border-radius: 24px; background: rgba(255,255,255,.05); }",
          "      p { color: rgba(255,255,255,.68); line-height: 1.6; }",
          "      button { border: 0; border-radius: 999px; padding: 12px 18px; background: #fff; color: #000; font: inherit; cursor: pointer; }",
          "    </style>",
          "  </head>",
          "  <body>",
          "    <main>",
          "      <h1>Computer Agents Web App</h1>",
          "      <p>This starter page is ready to deploy. Add files, connect resources, and let your agents build from here.</p>",
          '      <button id="action-button">Run action</button>',
          "    </main>",
          "    <" + "script>",
          '      document.querySelector("#action-button")?.addEventListener("click", () => {',
          '        alert("Your web app is running.");',
          "      });",
          "    <" + "/script>",
          "  </body>",
          "</html>",
        ].join("\n");
        const PLAYGROUND_DEFAULT_WEB_APP_PACKAGE_CONTENT = JSON.stringify({
          name: "computer-agents-web-app",
          version: "1.0.0",
          private: true,
          type: "module",
          scripts: {
            start: "serve -s . -l $" + "{PORT:-8080}",
          },
          dependencies: {
            serve: "latest",
          },
        }, null, 2) + "\n";
        const PLAYGROUND_AGENT_DRAFT_ID = "__playground_new_agent__";
        const PLAYGROUND_SPARK_AGENT_PROFILE_URL = "/img/agent-profile-pics/spark.webp";
        const PLAYGROUND_FORGE_AGENT_PROFILE_URL = "/img/agent-profile-pics/forge.webp";
        const PLAYGROUND_FOUNDRY_AGENT_PROFILE_URL = "/img/agent-profile-pics/foundry.webp";
        const PLAYGROUND_AGENT_CREATOR_METADATA_ROLE = "agent_creator";
        const PLAYGROUND_AGENT_CREATOR_NAME = "Agent Creator";
        const PLAYGROUND_AGENT_CREATOR_DESCRIPTION = "Creates and improves ACP agent instructions from a requested use case.";
        const PLAYGROUND_AGENT_CREATOR_PROFILE_URL = "/img/agent-profile-pics/assistantastro-1.webp";
        const PLAYGROUND_MISSION_CONTROL_AGENT_METADATA_ROLE = "mission_control";
        const PLAYGROUND_MISSION_CONTROL_AGENT_NAME = "Mission Control";
        const PLAYGROUND_MISSION_CONTROL_AGENT_DESCRIPTION = "Runs project strategy, backlog planning, and delivery alignment for a selected project.";
        const PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL = "/img/agent-profile-pics/assistantastro-1.webp";
        const PLAYGROUND_DEFAULT_AVAILABLE_RUNTIMES = {
          python: ["3.9", "3.10", "3.11", "3.12", "3.13"],
          nodejs: ["18", "20", "22"],
          go: ["1.20", "1.21", "1.22", "1.23"],
          php: ["8.1", "8.2", "8.3"],
          java: ["11", "17", "21"],
          ruby: ["3.1", "3.2", "3.3"],
          rust: ["stable", "1.75", "1.76", "1.77"],
        };
        const PLAYGROUND_RUNTIME_DEFINITIONS = [
          { key: "python", label: "Python", defaultVersion: "last" },
          { key: "nodejs", label: "Node.js", defaultVersion: "last" },
          { key: "go", label: "Go", defaultVersion: "last" },
          { key: "java", label: "Java", defaultVersion: "last" },
          { key: "php", label: "PHP", defaultVersion: "last" },
          { key: "ruby", label: "Ruby", defaultVersion: "last" },
          { key: "rust", label: "Rust", defaultVersion: "first" },
        ];
        const PLAYGROUND_AGENT_MODEL_OPTIONS = [
          {
            id: "claude-opus-4-8",
            label: "Claude Opus 4.8",
            description: "Latest Anthropic flagship for complex reasoning, long-horizon coding, and high-autonomy agent work.",
            intelligence: "Highest",
            contextWindow: "1M",
            speed: "Medium",
          },
          {
            id: "claude-opus-4-7",
            label: "Claude Opus 4.7",
            description: "Latest Anthropic flagship for complex reasoning and agentic coding.",
            intelligence: "Highest",
            contextWindow: "1M",
            speed: "Medium",
          },
          {
            id: "claude-opus-4-6",
            label: "Claude Opus 4.6",
            description: "Previous-generation Anthropic flagship for complex reasoning.",
            intelligence: "Highest",
            contextWindow: "1M",
            speed: "Medium",
          },
          {
            id: "claude-sonnet-4-5",
            label: "Claude Sonnet 4.5",
            description: "Balanced flagship model for everyday coding work.",
            intelligence: "High",
            contextWindow: "200k",
            speed: "Fast",
          },
          {
            id: "claude-haiku-4-5",
            label: "Claude Haiku 4.5",
            description: "Fast and efficient for quick iterations.",
            intelligence: "Good",
            contextWindow: "200k",
            speed: "Very Fast",
          },
          {
            id: "gpt-5.5-pro",
            label: "GPT-5.5 Pro",
            description: "OpenAI highest-accuracy model on Clawcode for the hardest professional and agentic work.",
            intelligence: "Highest",
            contextWindow: "1M",
            speed: "Medium",
          },
          {
            id: "gpt-5.5",
            label: "GPT-5.5",
            description: "OpenAI frontier model on Clawcode for coding, professional work, and long-context agents.",
            intelligence: "Highest",
            contextWindow: "1M",
            speed: "Fast",
          },
          {
            id: "gpt-5.4",
            label: "GPT-5.4",
            description: "OpenAI flagship model running through Clawcode for advanced coding and planning.",
            intelligence: "Highest",
            contextWindow: "1M",
            speed: "Fast",
          },
          {
            id: "gpt-5.4-mini",
            label: "GPT-5.4 mini",
            description: "OpenAI mini model on Clawcode for coding, subagents, and computer use.",
            intelligence: "High",
            contextWindow: "400k",
            speed: "Fast",
          },
          {
            id: "gpt-5.4-nano",
            label: "GPT-5.4 nano",
            description: "OpenAI nano model on Clawcode for lightweight, high-volume workflows.",
            intelligence: "Good",
            contextWindow: "400k",
            speed: "Very Fast",
          },
          {
            id: "grok-4.5",
            label: "Grok 4.5",
            description: "xAI frontier model for coding, agentic tasks, and knowledge work.",
            intelligence: "Highest",
            contextWindow: "500k",
            speed: "Fast",
            providerType: "xai",
          },
          {
            id: "gemini-3-flash",
            label: "Gemini 3 Flash",
            description: "Fast default model for broad agent execution.",
            intelligence: "Good",
            contextWindow: "1M",
            speed: "Very Fast",
          },
          {
            id: "gemini-3-1-flash",
            label: "Gemini 3.1 Flash",
            description: "Fast Gemini tier that currently routes through the same runtime as Gemini 3 Flash.",
            intelligence: "Good",
            contextWindow: "1M",
            speed: "Very Fast",
          },
          {
            id: "gemini-3-1-pro",
            label: "Gemini 3.1 Pro",
            description: "Long-context reasoning for deeper planning.",
            intelligence: "High",
            contextWindow: "1M",
            speed: "Fast",
          },
          {
            id: "deepseek-v4-pro",
            label: "DeepSeek V4 Pro",
            description: "DeepSeek flagship on Clawcode for agentic coding and long-context reasoning.",
            intelligence: "High",
            contextWindow: "1M",
            speed: "Fast",
          },
          {
            id: "deepseek-v4-flash",
            label: "DeepSeek V4 Flash",
            description: "Fast DeepSeek V4 model on Clawcode for efficient agent execution.",
            intelligence: "High",
            contextWindow: "1M",
            speed: "Very Fast",
          },
          {
            id: "minimax-m3",
            label: "MiniMax M3",
            description: "MiniMax long-context model via Cloudflare for efficient coding, tool use, and digital work.",
            intelligence: "High",
            contextWindow: "1M",
            speed: "Fast",
            providerType: "minimax",
          },
          {
            id: "kimi-k2.6",
            label: "Kimi K2.6",
            description: "Moonshot flagship via Cloudflare Workers AI running on Clawcode for long-horizon coding.",
            intelligence: "High",
            contextWindow: "262k",
            speed: "Fast",
          },
          {
            id: "kimi-k2.7-code",
            label: "Kimi K2.7 Code",
            description: "Moonshot coding model via Cloudflare Workers AI for long-horizon software engineering.",
            intelligence: "High",
            contextWindow: "262k",
            speed: "Fast",
            providerType: "kimi",
          },
          {
            id: "glm-5.2",
            label: "ZAI GLM 5.2",
            description: "Z.ai flagship agentic coding model via Cloudflare Workers AI for software engineering and planning.",
            intelligence: "Highest",
            contextWindow: "262k",
            speed: "Very Fast",
            providerType: "zai",
          },
          {
            id: "qwen3.5-397b-a17b",
            label: "Qwen 3.5 397B A17B",
            description: "Alibaba Qwen mixture-of-experts model via Cloudflare AI for reasoning, coding, and multimodal agent work.",
            intelligence: "High",
            contextWindow: "262k",
            speed: "Fast",
            providerType: "qwen",
          },
        ];
        const PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS = [
          {
            id: "gemini-3-flash-preview",
            label: "Gemini 3.1 Flash",
            description: "Faster deep research path tuned for speed and lower cost.",
          },
          {
            id: "gemini-3-pro-preview",
            label: "Gemini 3.1 Pro",
            description: "Higher-depth deep research path tuned for stronger coverage.",
          },
        ];
        const PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS = [
          {
            id: "gpt-image-2",
            label: "GPT Image 2",
            provider: "OpenAI",
            description: "Highest-fidelity OpenAI image model with USD-credit billing by output quality.",
            pricing: {
              textInputUsdPerMillion: 5,
              imageInputUsdPerMillion: 8,
              imageOutputUsdPerMillion: 30,
            },
            qualityOutputTokens: {
              low: 272,
              medium: 1056,
              high: 4160,
            },
          },
          {
            id: "gemini-3.1-flash-image-preview",
            label: "Gemini 3.1 Flash Image",
            provider: "Google DeepMind",
            description: "Fast multimodal image generation and editing preview with a flat USD-credit estimate per image.",
            computeTokensPerImage: 7,
          },
        ];
        const PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS = [
          {
            id: "low",
            label: "Low",
            description: "Fast draft output",
            squareOutputTokens: 272,
          },
          {
            id: "medium",
            label: "Medium",
            description: "Balanced default quality",
            squareOutputTokens: 1056,
          },
          {
            id: "high",
            label: "High",
            description: "Highest detail output",
            squareOutputTokens: 4160,
          },
        ];
        const PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS = [
          {
            id: "seedance-2.0-fast",
            label: "Seedance 2.0 Fast",
            provider: "ByteDance",
            description: "Fast default video generation for short clips and quick iterations.",
          },
          {
            id: "seedance-2.0",
            label: "Seedance 2.0",
            provider: "ByteDance",
            description: "Higher-quality Seedance video generation with reference media support.",
          },
          {
            id: "grok-imagine-video",
            label: "Grok Imagine Video",
            provider: "xAI",
            description: "Alternative video model for imaginative motion and stylized clips.",
          },
        ];
  
        function normalizePlaygroundVideoGenerationModelId(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (normalized === "seedance-2.0" || normalized === "seedance-2" || normalized === "bytedance/seedance-2.0") {
            return "seedance-2.0";
          }
          if (normalized === "grok" || normalized === "grok-imagine" || normalized === "grok-imagine-video") {
            return "grok-imagine-video";
          }
          return "seedance-2.0-fast";
        }
  
        function getPlaygroundVideoGenerationModelMeta(modelId) {
          const normalizedModelId = normalizePlaygroundVideoGenerationModelId(modelId);
          return PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS.find((option) => option.id === normalizedModelId)
            || PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS[0];
        }
  
        function getPlaygroundImageGenerationQualityMeta(qualityId) {
          return PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS.find((option) => option.id === qualityId)
            || PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS.find((option) => option.id === "medium")
            || PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS[0];
        }
  
        function getPlaygroundImageGenerationModelMeta(modelId) {
          return PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS.find((option) => option.id === modelId)
            || PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS[0];
        }
  
        function getPlaygroundImageGenerationComputeTokensPerImage(modelId, qualityId) {
          const modelMeta = getPlaygroundImageGenerationModelMeta(modelId);
          const qualityMeta = getPlaygroundImageGenerationQualityMeta(qualityId);
          const directCost = Number(modelMeta?.computeTokensPerImage);
          if (Number.isFinite(directCost) && directCost > 0) {
            return Math.max(1, Math.round(directCost));
          }
  
          const qualityOutputTokens = modelMeta?.qualityOutputTokens && typeof modelMeta.qualityOutputTokens === "object"
            ? Number(modelMeta.qualityOutputTokens[qualityMeta.id])
            : Number(qualityMeta?.squareOutputTokens);
          const outputPricePerMillion = Number(modelMeta?.pricing?.imageOutputUsdPerMillion);
          if (Number.isFinite(qualityOutputTokens) && qualityOutputTokens > 0 && Number.isFinite(outputPricePerMillion) && outputPricePerMillion > 0) {
            return Math.max(1, settingsDollarsToComputeTokens((qualityOutputTokens / 1_000_000) * outputPricePerMillion));
          }
  
          return 1;
        }
  
        function getDemoImageGenerationSkillDefaults(config = readDemoSettingsPlatformConfig()) {
          const normalizedConfig = normalizeDemoSettingsSkillsConfig(config?.skills);
          return {
            deepResearch: {
              model: normalizedConfig.deepResearchModel,
            },
            imageGeneration: {
              model: normalizedConfig.imageGenerationModel,
              quality: normalizedConfig.imageGenerationQuality,
              computeTokensPerImage: getPlaygroundImageGenerationComputeTokensPerImage(
                normalizedConfig.imageGenerationModel,
                normalizedConfig.imageGenerationQuality
              ),
            },
            videoGeneration: {
              model: normalizedConfig.videoGenerationModel,
            },
          };
        }
  
        function applyDemoSkillDefaultsToEnabledSkillsPayload(payload) {
          const target = payload && typeof payload === "object" ? payload : {};
          const skillDefaults = getDemoImageGenerationSkillDefaults();
          if (target.imageGeneration && skillDefaults.imageGeneration) {
            target.imageGenerationModel = skillDefaults.imageGeneration.model;
            target.imageGenerationQuality = skillDefaults.imageGeneration.quality;
            target.imageGenerationComputeTokensPerImage = skillDefaults.imageGeneration.computeTokensPerImage;
            target.imageGenerationConfig = skillDefaults.imageGeneration;
          }
          if (target.videoGeneration && skillDefaults.videoGeneration) {
            target.videoGenerationModel = skillDefaults.videoGeneration.model;
            target.videoGenerationConfig = skillDefaults.videoGeneration;
          }
          if ((target.deepResearch || target.research) && skillDefaults.deepResearch) {
            target.deepResearchModel = skillDefaults.deepResearch.model;
            target.deepResearchConfig = skillDefaults.deepResearch;
          }
          return target;
        }
  
        const PLAYGROUND_AGENT_TEAM_EXECUTION_MODE = "claude_subagents_v1";
        const PLAYGROUND_AGENT_EMAIL_DOMAIN = "agent.computer-agents.com";
        const PLAYGROUND_AGENT_PROFILE_PRESET_OPTIONS = [
          { id: "spark", label: "Spark", url: PLAYGROUND_SPARK_AGENT_PROFILE_URL },
          { id: "forge", label: "Forge", url: PLAYGROUND_FORGE_AGENT_PROFILE_URL },
          { id: "foundry", label: "Foundry", url: PLAYGROUND_FOUNDRY_AGENT_PROFILE_URL },
          { id: "assistantastro", label: "Assistant Astro", url: "/img/agent-profile-pics/assistantastro-1.webp" },
          { id: "devastro", label: "Developer Astro", url: "/img/agent-profile-pics/devastro.webp" },
          { id: "researchastro", label: "Research Astro", url: "/img/agent-profile-pics/researchastro.webp" },
          { id: "blueastro", label: "Blue Astro", url: "/img/agent-profile-pics/blueastro.webp" },
          { id: "orangeastro", label: "Orange Astro", url: "/img/agent-profile-pics/orangeastro.webp" },
          { id: "suitastro", label: "Suit Astro", url: "/img/agent-profile-pics/suitastro.webp" },
        ];
        const PLAYGROUND_AGENTS_SHELL_BACKGROUND = "#000000";
        const PLAYGROUND_AGENT_SKILL_OPTIONS = [
          {
            id: "image_generation",
            label: "Image Generation",
            description: "Generate and edit images with configured image models.",
          },
          {
            id: "video_generation",
            label: "Video Generation",
            description: "Generate short videos with configured video models.",
          },
          {
            id: "frontend_design",
            label: "Hallmark Frontend Design",
            description: "Use Hallmark by default for websites, web apps, landing pages, audits, and redesigns.",
          },
          {
            id: "deep_research",
            label: "Deep Research",
            description: "Enable longer-form research runs with a dedicated research model.",
          },
          {
            id: "memory",
            label: "Memory",
            description: "Allow the agent to reuse persistent memory context when available.",
          },
          {
            id: "task_management",
            label: "Task Management",
            description: "Let the agent create, organize, and comment on planning tasks and projects.",
          },
          {
            id: "computer_agents",
            label: "Computer Agents",
            description: "Inspect and manage agents, environments, skills, and threads from inside the run.",
          },
          {
            id: "app_platform",
            label: "App Platform",
            description: "Create, connect, deploy, and debug web apps, functions, databases, and auth resources.",
          },
          {
            id: "email",
            label: "Email",
            description: "Search, read, summarize, and send email through the connected Gmail account.",
          },
        ];
        const PLAYGROUND_RUNNER_SKILL_ID_ALIASES = {
          imageGeneration: "image_generation",
          image_generation: "image_generation",
          "image-generation": "image_generation",
          videoGeneration: "video_generation",
          video_generation: "video_generation",
          "video-generation": "video_generation",
          webSearch: "web_search",
          web_search: "web_search",
          "web-search": "web_search",
          frontendDesign: "frontend_design",
          frontend_design: "frontend_design",
          "frontend-design": "frontend_design",
          hallmark: "frontend_design",
          hallmarkFrontendDesign: "frontend_design",
          hallmark_frontend_design: "frontend_design",
          "hallmark-frontend-design": "frontend_design",
          deepResearch: "deep_research",
          deep_research: "deep_research",
          "deep-research": "deep_research",
          research: "deep_research",
          pdf: "pdf",
          pdf_processing: "pdf",
          "pdf-processing": "pdf",
          pptx: "pptx",
          powerpoint: "pptx",
          "powerpoint-pptx": "pptx",
          memory: "memory",
          taskManagement: "task_management",
          task_management: "task_management",
          "task-management": "task_management",
          computerAgents: "computer_agents",
          computer_agents: "computer_agents",
          "computer-agents": "computer_agents",
          appPlatform: "app_platform",
          app_platform: "app_platform",
          "app-platform": "app_platform",
          gmail: "email",
          mail: "email",
          email: "email",
        };
        const PLAYGROUND_RUNNER_ENABLED_SKILLS_STORAGE_KEY = "tb_runner_chat_enabled_skills_v3:runner-web-sdk-demo";
        const PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS = [
          "image_generation",
          "video_generation",
          "web_search",
          "deep_research",
          "browser",
          "memory",
          "task_management",
          "computer_agents",
          "email",
        ];
  
        function dedupePlaygroundAgentIds(ids) {
          const next = [];
          const seen = new Set();
          (Array.isArray(ids) ? ids : []).forEach((value) => {
            const normalized = String(value || "").trim();
            if (!normalized || seen.has(normalized)) return;
            seen.add(normalized);
            next.push(normalized);
          });
          return next;
        }
  
        function getPlaygroundAgentTeamMetadata(metadata) {
          if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
            return null;
          }
  
          const kind = typeof metadata.kind === "string" ? metadata.kind : "";
          const team = metadata.team && typeof metadata.team === "object" && !Array.isArray(metadata.team)
            ? metadata.team
            : null;
  
          if (kind !== "team" || !team) {
            return null;
          }
  
          const orchestratorAgentId = typeof team.orchestratorAgentId === "string"
            ? team.orchestratorAgentId.trim()
            : "";
          const subagentIds = dedupePlaygroundAgentIds(team.subagentIds);
  
          if (!orchestratorAgentId) {
            return null;
          }
  
          return {
            kind: "team",
            executionMode: typeof metadata.executionMode === "string" && metadata.executionMode.trim()
              ? metadata.executionMode
              : PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
            team: {
              version: 1,
              orchestratorAgentId,
              subagentIds,
            },
          };
        }
  
        function getPlaygroundAgentProfileMetadata(metadata) {
          if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
            return null;
          }
  
          const profile = metadata.profile && typeof metadata.profile === "object" && !Array.isArray(metadata.profile)
            ? metadata.profile
            : null;
          if (!profile) {
            return null;
          }
  
          const email = typeof profile.email === "string" ? profile.email.trim() : "";
          const photoURL = normalizeSessionPhotoUrl(
            profile.photoURL
            || profile.photoUrl
            || profile.avatarUrl
            || profile.avatarURL
            || profile.avatar
            || profile.picture
            || ""
          );
  
          if (!email && !photoURL) {
            return null;
          }
  
          return {
            email,
            photoURL,
          };
        }
  
        function slugifyPlaygroundAgentEmailLocalPart(value) {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return normalized || "agent";
        }
  
        function isPlaygroundGeneratedAgentEmailAddress(value) {
          const normalizedEmail = String(value || "").trim().toLowerCase();
          const suffix = "@" + PLAYGROUND_AGENT_EMAIL_DOMAIN.toLowerCase();
          return Boolean(normalizedEmail && normalizedEmail.endsWith(suffix));
        }
  
        function getPlaygroundAgentCreatorRole(agent) {
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
            ? agent.metadata
            : null;
          if (!metadata) {
            return "";
          }
  
          const runnerPlaygroundMetadata = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : null;
          return String(
            runnerPlaygroundMetadata?.role
            || runnerPlaygroundMetadata?.agentRole
            || metadata.agentRole
            || ""
          ).trim().toLowerCase();
        }
  
        function isPlaygroundAgentCreatorAgent(agent) {
          if (!agent || typeof agent !== "object") {
            return false;
          }
  
          if (getPlaygroundAgentCreatorRole(agent) === PLAYGROUND_AGENT_CREATOR_METADATA_ROLE) {
            return true;
          }
  
          const normalizedName = String(agent.name || "").trim().toLowerCase();
          const normalizedInstructions = String(agent.instructions || "").trim().toLowerCase();
          const enabledSkills = normalizePlaygroundEnabledSkillIds(agent.enabledSkills);
          return normalizedName === PLAYGROUND_AGENT_CREATOR_NAME.toLowerCase()
            && enabledSkills.includes("computer_agents")
            && normalizedInstructions.includes("internal agent creator");
        }
  
        function isPlaygroundMissionControlAgent(agent) {
          if (!agent || typeof agent !== "object") {
            return false;
          }
  
          if (getPlaygroundAgentCreatorRole(agent) === PLAYGROUND_MISSION_CONTROL_AGENT_METADATA_ROLE) {
            return true;
          }
  
          const normalizedName = String(agent.name || "").trim().toLowerCase();
          const normalizedInstructions = String(agent.instructions || "").trim().toLowerCase();
          const enabledSkills = normalizePlaygroundEnabledSkillIds(agent.enabledSkills);
          return normalizedName === PLAYGROUND_MISSION_CONTROL_AGENT_NAME.toLowerCase()
            && enabledSkills.includes("task_management")
            && enabledSkills.includes("computer_agents")
            && normalizedInstructions.includes("internal mission control");
        }
  
        function isPlaygroundDeveloperAgent(agent) {
          const normalizedName = String(agent?.name || "").trim().toLowerCase();
          const normalizedId = String(agent?.id || "").trim().toLowerCase();
          return normalizedName === "forge"
            || normalizedName === "developer"
            || normalizedId === "agent_default"
            || normalizedId === "agent-default"
            || (normalizedId.startsWith("agent-default-") && (normalizedName.includes("forge") || normalizedName.includes("developer")));
        }
  
        function isPlaygroundResearcherAgent(agent) {
          const normalizedName = String(agent?.name || "").trim().toLowerCase();
          const normalizedId = String(agent?.id || "").trim().toLowerCase();
          return normalizedName === "foundry"
            || normalizedName === "researcher agent"
            || normalizedName === "researcher"
            || normalizedName === "research agent"
            || normalizedId === "agent_research"
            || normalizedId === "agent-research"
            || normalizedId.startsWith("agent-research-");
        }
  
        function isPlaygroundAssistantAgent(agent) {
          const normalizedName = String(agent?.name || "").trim().toLowerCase();
          const normalizedId = String(agent?.id || "").trim().toLowerCase();
          return normalizedName === "spark"
            || normalizedName === "assistant"
            || normalizedName === "default"
            || normalizedName === "default agent"
            || normalizedId === "agent_assistant"
            || normalizedId === "agent-assistant"
            || normalizedId.startsWith("agent-assistant-");
        }
  
        function isPlaygroundDefaultAgentConfigurationLocked(agent) {
          if (!agent || getPlaygroundAgentListMode(agent) === "teams" || agent?.agentType === "team") {
            return false;
          }
          const normalizedName = String(agent?.name || "").trim().toLowerCase();
          const normalizedId = String(agent?.id || "").trim().toLowerCase();
          const hasDefaultMarker = agent?.isDefault === true || agent?.isSystem === true;
          const hasDefaultIdentity = isPlaygroundDeveloperAgent(agent)
            || isPlaygroundResearcherAgent(agent)
            || isPlaygroundAssistantAgent(agent);
          const hasBuiltinName = normalizedName === "forge" || normalizedName === "spark" || normalizedName === "foundry";
          const hasBuiltinId = normalizedId === "agent_default"
            || normalizedId === "agent-default"
            || normalizedId.startsWith("agent-default-")
            || normalizedId === "agent_research"
            || normalizedId === "agent-research"
            || normalizedId.startsWith("agent-research-")
            || normalizedId === "agent_assistant"
            || normalizedId === "agent-assistant"
            || normalizedId.startsWith("agent-assistant-");
          return hasDefaultIdentity && (hasDefaultMarker || hasBuiltinName || hasBuiltinId);
        }
  
        function isPlaygroundFreePlanLockedComposerAgent(agent) {
          return isPlaygroundDeveloperAgent(agent) || isPlaygroundResearcherAgent(agent) || getPlaygroundAgentListMode(agent) === "teams";
        }
  
        function renderPlaygroundAgentUpgradeModal({
          isOpen,
          titleId = "playground-agent-upgrade-title",
          onClose,
          onCheckout,
          checkoutLoading = false,
          checkoutDisabled = false,
        } = {}) {
          if (!isOpen) {
            return null;
          }
  
          const features = [
            { icon: Bot, title: "Forge and Foundry", copy: "Use higher-capacity default agents for implementation, synthesis, and reasoning-heavy work." },
            { icon: Plus, title: "Custom agents", copy: "Create specialized agents with their own instructions, skills, permissions, and models." },
            { icon: UsersRound, title: "Agent Squads", copy: "Coordinate fixed squads with orchestrators and subagents for repeatable workflows." },
            { icon: Brain, title: "Premium models", copy: "Access the managed model catalog beyond Spark, including long-context and frontier models." },
            { icon: Sparkles, title: "Credits included", copy: "Start with $5.00 in monthly usage credits and organization budget controls." },
            { icon: Key, title: "API access", copy: "Use Computer Agents APIs and budget controls for production workflows." },
          ];
  
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-calendar-upgrade-backdrop",
              role: "dialog",
              "aria-modal": "true",
              "aria-labelledby": titleId,
            },
            React.createElement("button", {
              type: "button",
              className: "playground-files-header-icon-button is-plain playground-calendar-upgrade-close",
              onClick: onClose,
              "aria-label": "Close upgrade modal",
              disabled: checkoutLoading,
            }, React.createElement(X, { width: 18, height: 18, strokeWidth: 1.8 })),
            React.createElement("div", { className: "playground-calendar-upgrade-shell" },
              React.createElement("h2", {
                id: titleId,
                className: "playground-calendar-upgrade-headline",
              },
                "Unlock the full platform with ",
                React.createElement("span", { className: "playground-calendar-upgrade-headline-price" }, "Builder")
              ),
              React.createElement("div", { className: "playground-calendar-upgrade-pill" }, "Custom agents, projects, workflows, resources, and API access"),
              React.createElement(PlatformModalSurface, {
                  className: "playground-calendar-upgrade-modal",
                  role: "document",
                },
                React.createElement("div", { className: "playground-calendar-upgrade-modal-top" },
                  React.createElement("div", { className: "playground-calendar-upgrade-modal-header" },
                    React.createElement("div", { className: "playground-calendar-upgrade-modal-title" }, "Builder"),
                    React.createElement("div", { className: "playground-calendar-upgrade-modal-offer" }, "$5 usage credit included")
                  ),
                  React.createElement("div", { className: "playground-calendar-upgrade-price-row" },
                    React.createElement("span", { className: "playground-calendar-upgrade-price-new" }, "$24"),
                    React.createElement("span", null, " / month")
                  ),
                  React.createElement("p", { className: "playground-calendar-upgrade-modal-copy" },
                    "Use Spark on Sandbox. Upgrade to create custom agents and operate projects, workflows, and developer resources."
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-calendar-upgrade-modal-button",
                    onClick: onCheckout,
                    disabled: checkoutLoading || checkoutDisabled,
                  }, checkoutLoading ? "Opening checkout..." : "Upgrade to Builder")
                ),
                React.createElement("div", { className: "playground-calendar-upgrade-feature-list" },
                  features.map((feature) => {
                    const Icon = feature.icon;
                    return React.createElement("div", {
                        key: feature.title,
                        className: "playground-calendar-upgrade-modal-feature",
                      },
                      React.createElement("span", { className: "playground-calendar-upgrade-modal-feature-icon" },
                        React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.8 })
                      ),
                      React.createElement("div", null,
                        React.createElement("div", null, feature.title),
                        React.createElement("small", null, feature.copy)
                      )
                    );
                  })
                )
              )
            )
          );
        }
  
        function isPlaygroundDefaultNamedAgent(agent) {
          const normalizedName = String(agent?.name || "").trim().toLowerCase();
          return normalizedName === "default" || normalizedName === "default agent" || agent?.isDefault === true;
        }
  
        function getPlaygroundSystemAgentSortRank(agent) {
          if (isPlaygroundAssistantAgent(agent)) {
            return 0;
          }
          if (isPlaygroundDeveloperAgent(agent)) {
            return 1;
          }
          if (isPlaygroundResearcherAgent(agent)) {
            return 2;
          }
          return 10;
        }
  
        function getPlaygroundPreferredDefaultAgent(agents) {
          const normalizedAgents = Array.isArray(agents) ? agents.filter(Boolean) : [];
          if (normalizedAgents.length === 0) {
            return null;
          }
  
          const singleAgents = normalizedAgents.filter((agent) => getPlaygroundAgentListMode(agent) !== "teams");
          const candidateAgents = singleAgents.length > 0 ? singleAgents : normalizedAgents;
  
          const explicitAssistant = candidateAgents.find((agent) => isPlaygroundAssistantAgent(agent));
          if (explicitAssistant) {
            return explicitAssistant;
          }
  
          const explicitDefault = candidateAgents.find((agent) => agent?.isDefault);
          if (explicitDefault) {
            return explicitDefault;
          }
  
          const explicitDeveloper = candidateAgents.find((agent) => isPlaygroundDeveloperAgent(agent));
          if (explicitDeveloper) {
            return explicitDeveloper;
          }
  
          return candidateAgents[0] || null;
        }
  
        function getPlaygroundAgentEmailAddress(agent) {
          const profileMetadata = getPlaygroundAgentProfileMetadata(agent?.metadata);
          if (profileMetadata?.email && !isPlaygroundGeneratedAgentEmailAddress(profileMetadata.email)) {
            return profileMetadata.email;
          }
  
          const localPart = slugifyPlaygroundAgentEmailLocalPart(agent?.name || agent?.id || "");
          return localPart + "@" + PLAYGROUND_AGENT_EMAIL_DOMAIN;
        }
  
        function getPlaygroundAgentProfilePhotoUrl(agent) {
          if (isPlaygroundMissionControlAgent(agent)) {
            return PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL;
          }
  
          const profileMetadata = getPlaygroundAgentProfileMetadata(agent?.metadata);
          if (profileMetadata?.photoURL) {
            return profileMetadata.photoURL;
          }
  
          if (isPlaygroundDeveloperAgent(agent)) {
            return PLAYGROUND_FORGE_AGENT_PROFILE_URL;
          }
  
          if (isPlaygroundResearcherAgent(agent)) {
            return PLAYGROUND_FOUNDRY_AGENT_PROFILE_URL;
          }
  
          if (isPlaygroundAgentCreatorAgent(agent)) {
            return PLAYGROUND_AGENT_CREATOR_PROFILE_URL;
          }
  
          if (isPlaygroundAssistantAgent(agent)) {
            return PLAYGROUND_SPARK_AGENT_PROFILE_URL;
          }
  
          if (isPlaygroundDefaultNamedAgent(agent)) {
            return PLAYGROUND_SPARK_AGENT_PROFILE_URL;
          }
  
          return PLAYGROUND_SPARK_AGENT_PROFILE_URL;
        }
  
        function getPlaygroundAgentRunnerPhotoUrl(agent) {
          if (isPlaygroundMissionControlAgent(agent)) {
            return normalizeSessionPhotoUrl(PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL);
          }
  
          const explicitPhotoUrl = normalizeSessionPhotoUrl(
            agent?.photoUrl
            || agent?.photoURL
            || agent?.avatarUrl
            || agent?.avatarURL
            || agent?.avatar
            || agent?.picture
            || ""
          );
          return explicitPhotoUrl || normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(agent));
        }
  
        function buildPlaygroundRunnerAgentOption(agent, overrides = {}) {
          const baseAgent = isPlaygroundMissionControlAgent(agent)
            ? {
                ...agent,
                name: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
                description: String(agent?.description || "").trim() || PLAYGROUND_MISSION_CONTROL_AGENT_DESCRIPTION,
              }
            : agent;
          const photoUrl = getPlaygroundAgentRunnerPhotoUrl(baseAgent);
          return {
            ...baseAgent,
            ...(photoUrl ? { photoUrl, photoURL: photoUrl } : {}),
            ...(overrides && typeof overrides === "object" ? overrides : {}),
          };
        }
  
        function buildPlaygroundComposerDefaultAgentFallback(kind) {
          const normalizedKind = String(kind || "").trim().toLowerCase();
          if (normalizedKind === "forge") {
            return buildPlaygroundRunnerAgentOption({
              id: "agent_default",
              name: "Forge",
              description: "Implementation-heavy execution and technical work.",
              model: "minimax-m3",
              isDefault: true,
              isSystem: true,
              enabledSkills: PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS,
            });
          }
          if (normalizedKind === "foundry") {
            return buildPlaygroundRunnerAgentOption({
              id: "agent_research",
              name: "Foundry",
              description: "High-rigor synthesis, reasoning, and review.",
              model: "claude-opus-4-8",
              isDefault: true,
              isSystem: true,
              enabledSkills: PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS,
            });
          }
          return buildPlaygroundRunnerAgentOption({
            id: "agent_assistant",
            name: "Spark",
            description: "Fast everyday execution for digital work.",
            model: "deepseek-v4-flash",
            isDefault: true,
            isSystem: true,
            enabledSkills: PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS,
          });
        }
  
        function buildPlaygroundComposerDefaultTeamFallback(agents) {
          const normalizedAgents = Array.isArray(agents) ? agents.filter(Boolean) : [];
          const sparkAgent = normalizedAgents.find((agent) => isPlaygroundAssistantAgent(agent)) || buildPlaygroundComposerDefaultAgentFallback("spark");
          const forgeAgent = normalizedAgents.find((agent) => isPlaygroundDeveloperAgent(agent)) || buildPlaygroundComposerDefaultAgentFallback("forge");
          const foundryAgent = normalizedAgents.find((agent) => isPlaygroundResearcherAgent(agent)) || buildPlaygroundComposerDefaultAgentFallback("foundry");
          const orchestratorAgentId = String(sparkAgent?.id || "agent_assistant").trim();
          const subagentIds = dedupePlaygroundAgentIds([
            forgeAgent?.id || "agent_default",
            foundryAgent?.id || "agent_research",
          ]);
          return buildPlaygroundRunnerAgentOption({
            id: "agent_default_team",
            name: "Default Team",
            description: "Spark, Forge, and Foundry coordinated for project work.",
            agentType: "team",
            isDefault: true,
            isSystem: true,
            metadata: {
              kind: "team",
              executionMode: PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
              team: {
                version: 1,
                orchestratorAgentId,
                subagentIds,
              },
            },
          });
        }
  
        function ensurePlaygroundComposerDefaultChoices(agents) {
          const nextAgents = (Array.isArray(agents) ? agents : []).filter(Boolean).slice();
          if (!nextAgents.some((agent) => isPlaygroundAssistantAgent(agent))) {
            nextAgents.push(buildPlaygroundComposerDefaultAgentFallback("spark"));
          }
          if (!nextAgents.some((agent) => isPlaygroundDeveloperAgent(agent))) {
            nextAgents.push(buildPlaygroundComposerDefaultAgentFallback("forge"));
          }
          if (!nextAgents.some((agent) => isPlaygroundResearcherAgent(agent))) {
            nextAgents.push(buildPlaygroundComposerDefaultAgentFallback("foundry"));
          }
          const hasDefaultTeam = nextAgents.some((agent) => (
            getPlaygroundAgentListMode(agent) === "teams"
            && (
              agent?.isDefault
              || String(agent?.id || "").trim() === "agent_default_team"
              || String(agent?.name || "").trim().toLowerCase() === "default team"
            )
          ));
          if (!hasDefaultTeam) {
            nextAgents.push(buildPlaygroundComposerDefaultTeamFallback(nextAgents));
          }
          return nextAgents;
        }
  
        function buildPlaygroundAgentProfileMetadata(agent) {
          const email = getPlaygroundAgentEmailAddress(agent);
          const photoURL = normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(agent));
          const nextProfile = {};
  
          if (email) {
            nextProfile.email = email;
          }
          if (photoURL) {
            nextProfile.photoURL = photoURL;
          }
  
          return Object.keys(nextProfile).length > 0 ? nextProfile : null;
        }
  
        function isPlaygroundTeamAgent(agent) {
          return Boolean(getPlaygroundAgentTeamMetadata(agent?.metadata));
        }
  
        function getPlaygroundAgentListMode(agent) {
          return agent?.agentType === "team" || isPlaygroundTeamAgent(agent) ? "teams" : "agents";
        }
  
        function getPlaygroundTaskAssigneePopupMode(actor) {
          if (isPlaygroundHumanAssigneeId(actor?.id)) {
            return "humans";
          }
          return getPlaygroundAgentListMode(actor);
        }
  
        function buildPlaygroundFallbackAgentModelMeta(modelId) {
          const raw = String(modelId || "").trim();
          if (raw.toLowerCase().startsWith("external:")) {
            const parts = raw.split(":");
            const encodedModelId = parts.slice(2).join(":");
            let decodedModelId = encodedModelId;
            try {
              decodedModelId = decodeURIComponent(encodedModelId);
            } catch {}
            return {
              id: raw,
              label: decodedModelId || "External Model",
              description: "Workspace-managed external model",
              intelligence: "Custom",
              contextWindow: "Custom",
              speed: "Custom",
              source: "external",
            };
          }
          return {
            id: raw || "claude-haiku-4-5",
            label: raw || "Claude Haiku 4.5",
            description: "Selected model",
            intelligence: "Good",
            contextWindow: "Custom",
            speed: "Custom",
            source: "managed",
          };
        }
  
        function getPlaygroundAgentModelMeta(modelId, options) {
          const candidateOptions = Array.isArray(options) && options.length > 0
            ? options
            : PLAYGROUND_AGENT_MODEL_OPTIONS;
          const matched = candidateOptions.find((option) => option.id === modelId);
          if (matched) {
            return matched;
          }
          return buildPlaygroundFallbackAgentModelMeta(modelId);
        }
  
        function getPlaygroundAgentModelProviderType(model) {
          const explicitProvider = String(model?.providerType || "").trim().toLowerCase();
          const modelId = String(model?.id || "").trim().toLowerCase();
          if (modelId.startsWith("minimax-") || modelId === "minimax/m3") return "minimax";
          if (modelId.startsWith("kimi-") || modelId.includes("moonshot")) return "kimi";
          if (modelId.startsWith("glm-") || modelId.includes("zai") || modelId.includes("zhipu")) return "zai";
          if (modelId.startsWith("qwen") || modelId.includes("alibaba/qwen")) return "qwen";
          if (modelId.startsWith("grok-") || modelId.includes("xai")) return "xai";
          if (explicitProvider) {
            if (explicitProvider.includes("anthropic")) return "anthropic";
            if (explicitProvider.includes("google") || explicitProvider.includes("gemini")) return "google";
            if (explicitProvider.includes("openai")) return "openai";
            if (explicitProvider.includes("xai") || explicitProvider.includes("grok")) return "xai";
            if (explicitProvider.includes("deepseek")) return "deepseek";
            if (explicitProvider.includes("minimax")) return "minimax";
            if (explicitProvider.includes("moonshot") || explicitProvider.includes("kimi") || explicitProvider.includes("cloudflare")) return "kimi";
            if (explicitProvider.includes("zai") || explicitProvider.includes("zhipu")) return "zai";
            if (explicitProvider.includes("qwen") || explicitProvider.includes("alibaba")) return "qwen";
          }
          if (modelId.startsWith("claude-")) return "anthropic";
          if (modelId.startsWith("gemini-")) return "google";
          if (modelId.startsWith("gpt-")) return "openai";
          if (modelId.startsWith("deepseek-")) return "deepseek";
          if (modelId.startsWith("kimi-")) return "kimi";
          return "generic";
        }
  
        function getPlaygroundAgentModelProviderLabel(model) {
          const providerType = getPlaygroundAgentModelProviderType(model);
          if (providerType === "anthropic") return "Anthropic";
          if (providerType === "google") return "Google";
          if (providerType === "openai") return "OpenAI";
          if (providerType === "xai") return "xAI";
          if (providerType === "deepseek") return "DeepSeek";
          if (providerType === "minimax") return "MiniMax";
          if (providerType === "kimi") return "Moonshot";
          if (providerType === "zai") return "ZAI";
          if (providerType === "qwen") return "Qwen";
          return "Provider";
        }
  
        function getPlaygroundAgentModelProviderFilterKey(model) {
          const normalizedContextWindow = String(model?.contextWindow || "").trim().toLowerCase();
          if (!normalizedContextWindow || normalizedContextWindow === "custom") {
            return "custom";
          }
          const providerType = getPlaygroundAgentModelProviderType(model);
          if (providerType === "anthropic" || providerType === "google" || providerType === "openai" || providerType === "xai" || providerType === "deepseek" || providerType === "minimax" || providerType === "kimi" || providerType === "zai" || providerType === "qwen") {
            return providerType;
          }
          const normalizedSource = String(model?.source || "").trim().toLowerCase();
          const normalizedProviderType = String(model?.providerType || "").trim().toLowerCase();
          if (
            normalizedSource === "external"
            || normalizedSource === "custom"
            || normalizedProviderType.includes("custom")
            || normalizedProviderType.includes("generic")
          ) {
            return "custom";
          }
          return "custom";
        }
  
        function getPlaygroundAgentModelProviderIcon(model) {
          const providerType = getPlaygroundAgentModelProviderType(model);
          if (providerType === "anthropic") {
            return { src: "/img/05-model-provider-icons/claude.png", alt: "Anthropic", className: "" };
          }
          if (providerType === "google") {
            return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" };
          }
          if (providerType === "openai") {
            return { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" };
          }
          if (providerType === "xai") {
            return { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI", className: "is-openai" };
          }
          if (providerType === "deepseek") {
            return { src: "/img/05-model-provider-icons/deepseek.png", alt: "DeepSeek", className: "" };
          }
          if (providerType === "minimax") {
            return { src: "/img/05-model-provider-icons/minimax.svg", alt: "MiniMax", className: "" };
          }
          if (providerType === "kimi") {
            return { src: "/img/05-model-provider-icons/kimi.png", alt: "Moonshot", className: "" };
          }
          if (providerType === "zai") {
            return { src: "/img/05-model-provider-icons/zai.webp", alt: "ZAI", className: "" };
          }
          if (providerType === "qwen") {
            return { src: "/img/05-model-provider-icons/qwen.svg", alt: "Qwen", className: "is-openai" };
          }
          return null;
        }
  
        const PLAYGROUND_AGENT_MODEL_PRICING_BY_ID = {
          "claude-haiku-4-5": { input: 1.0, cached: 0.1, output: 5.0 },
          "claude-sonnet-4-5": { input: 3.0, cached: 0.3, output: 15.0 },
          "claude-opus-4-6": { input: 5.0, cached: 0.5, output: 25.0 },
          "claude-opus-4-7": { input: 5.0, cached: 0.5, output: 25.0 },
          "claude-opus-4-8": { input: 5.0, cached: 0.5, output: 25.0 },
          "gpt-5.5-pro": { input: 30.0, cached: null, output: 180.0 },
          "gpt-5.5": { input: 5.0, cached: 0.5, output: 30.0 },
          "gpt-5.4": { input: 2.5, cached: 0.25, output: 15.0 },
          "gpt-5.4-mini": { input: 0.75, cached: 0.075, output: 4.5 },
          "gpt-5.4-nano": { input: 0.2, cached: 0.02, output: 1.25 },
          "grok-4.5": { input: 2.0, cached: 2.0, output: 6.0 },
          "gemini-3-flash": { input: 0.5, cached: 0.05, output: 3.0 },
          "gemini-3-1-flash": { input: 0.5, cached: 0.05, output: 3.0 },
          "gemini-3-1-pro": { input: 2.0, cached: 0.2, output: 12.0 },
          "deepseek-v4-pro": { input: 0.435, cached: 0.003625, output: 0.87 },
          "deepseek-v4-flash": { input: 0.14, cached: 0.0028, output: 0.28 },
          "minimax-m3": { input: 0.6, cached: 0.12, output: 2.4 },
          "kimi-k2.6": { input: 0.95, cached: 0.16, output: 4.0 },
          "kimi-k2.7-code": { input: 0.95, cached: 0.19, output: 4.0 },
          "glm-5.2": { input: 1.4, cached: 0.26, output: 4.4 },
          "qwen3.5-397b-a17b": { input: 0.6, cached: 0.6, output: 3.6 },
        };
  
        function getPlaygroundAgentModelPricing(modelId) {
          return PLAYGROUND_AGENT_MODEL_PRICING_BY_ID[String(modelId || "").trim()] || null;
        }
  
        function readPlaygroundAgentModelPricingNumber(value) {
          const numericValue = Number(value);
          return Number.isFinite(numericValue) ? numericValue : null;
        }
  
        function getPlaygroundAgentModelWeightedCost(modelId) {
          const pricing = getPlaygroundAgentModelPricing(modelId);
          if (!pricing) {
            return 0;
          }
          const inputCost = readPlaygroundAgentModelPricingNumber(pricing.input);
          const cachedCost = readPlaygroundAgentModelPricingNumber(pricing.cached);
          const outputCost = readPlaygroundAgentModelPricingNumber(pricing.output);
          if (inputCost === null || outputCost === null) {
            return 0;
          }
          return (inputCost * 0.7) + ((cachedCost === null ? inputCost : cachedCost) * 0.1) + (outputCost * 0.2);
        }
  
        function getPlaygroundAgentModelCostMultiplier(modelId) {
          const baseline = getPlaygroundAgentModelWeightedCost("claude-haiku-4-5");
          const target = getPlaygroundAgentModelWeightedCost(modelId);
          if (!baseline || !target) {
            return 1;
          }
          return target / baseline;
        }
  
        function formatPlaygroundAgentModelComputeTokenCost(modelId) {
          const weightedCost = getPlaygroundAgentModelWeightedCost(modelId);
          if (!weightedCost) {
            return "Custom";
          }
          return formatSettingsCurrency(weightedCost * 1.1) + " / 1M";
        }
  
        function formatPlaygroundAgentModelCostMultiplier(multiplier) {
          const normalized = Number.isFinite(Number(multiplier)) ? Number(multiplier) : 1;
          if (Math.abs(normalized - 1) < 0.01) {
            return "1x";
          }
          if (normalized < 1) {
            return normalized.toFixed(2) + "x";
          }
          return normalized.toFixed(1) + "x";
        }
  
        function getPlaygroundAgentIntelligenceLevel(label) {
          const normalized = String(label || "").trim().toLowerCase();
          if (normalized === "highest") {
            return 4;
          }
          if (normalized === "high" || normalized === "medium") {
            return 3;
          }
          if (normalized === "good") {
            return 2;
          }
          return 1;
        }
  
        const PLAYGROUND_ENVIRONMENT_COMPUTE_PROFILES = [
          {
            id: "lite",
            label: "Lite",
            description: "Lowest-cost profile for fast CLI-first work.",
            cpuCores: 0.5,
            memoryMb: 1536,
            guiEnabled: false,
            officeAppsEnabled: false,
            minutePrice: 0.0026,
          },
          {
            id: "standard",
            label: "Standard",
            description: "Balanced default for most coding and automation work.",
            cpuCores: 1,
            memoryMb: 2048,
            guiEnabled: false,
            officeAppsEnabled: false,
            minutePrice: 0.0052,
          },
          {
            id: "power",
            label: "Power",
            description: "More CPU and memory for heavier builds and multi-step tasks.",
            cpuCores: 2,
            memoryMb: 4096,
            guiEnabled: false,
            officeAppsEnabled: false,
            minutePrice: 0.00975,
          },
          {
            id: "desktop",
            label: "Desktop",
            description: "GUI-enabled profile for browser and desktop-app workflows.",
            cpuCores: 2,
            memoryMb: 4096,
            guiEnabled: true,
            officeAppsEnabled: false,
            minutePrice: 0.013,
          },
        ];
        const PLAYGROUND_DEFAULT_USER_ENVIRONMENT_COMPUTE_PROFILE = "lite";
        const PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE = "standard";
  
        function normalizePlaygroundEnvironmentComputeProfileId(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (normalized === "lite" || normalized === "standard" || normalized === "power" || normalized === "desktop") {
            return normalized;
          }
          return "";
        }
  
        function getPlaygroundEnvironmentComputeProfileConfig(profileId) {
          const normalized = normalizePlaygroundEnvironmentComputeProfileId(profileId) || PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE;
          return PLAYGROUND_ENVIRONMENT_COMPUTE_PROFILES.find((profile) => profile.id === normalized)
            || PLAYGROUND_ENVIRONMENT_COMPUTE_PROFILES[1];
        }
  
        function clonePlaygroundEnvironmentMetadata(metadata) {
          return metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? JSON.parse(JSON.stringify(metadata))
            : {};
        }
  
        function resolvePlaygroundEnvironmentComputeProfileId(environment) {
          const metadata = environment?.metadata && typeof environment.metadata === "object" && !Array.isArray(environment.metadata)
            ? environment.metadata
            : null;
          const explicitProfile = normalizePlaygroundEnvironmentComputeProfileId(environment?.computeProfile || metadata?.computeProfile);
          if (explicitProfile) {
            return explicitProfile;
          }
  
          const guiEnabled = typeof environment?.guiEnabled === "boolean"
            ? environment.guiEnabled
            : metadata?.guiEnabled === true;
          const officeAppsEnabled = typeof environment?.officeAppsEnabled === "boolean"
            ? environment.officeAppsEnabled
            : metadata?.officeAppsEnabled === true;
  
          if (guiEnabled || officeAppsEnabled) {
            return "desktop";
          }
  
          return environment?.isDefault
            ? PLAYGROUND_DEFAULT_USER_ENVIRONMENT_COMPUTE_PROFILE
            : PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE;
        }
  
        function getPlaygroundEnvironmentRatePerMinute(environment) {
          const profile = getPlaygroundEnvironmentComputeProfileConfig(resolvePlaygroundEnvironmentComputeProfileId(environment));
          return profile.minutePrice;
        }
  
        function applyPlaygroundEnvironmentComputeProfileDraft(environment, profileId, options = {}) {
          const base = environment && typeof environment === "object"
            ? environment
            : {};
          const profile = getPlaygroundEnvironmentComputeProfileConfig(profileId);
          const metadata = clonePlaygroundEnvironmentMetadata(base.metadata);
          const pricing = metadata.pricing && typeof metadata.pricing === "object" && !Array.isArray(metadata.pricing)
            ? { ...metadata.pricing }
            : {};
          pricing.minutePrice = profile.minutePrice;
  
          const requestedOfficeAppsEnabled = Object.prototype.hasOwnProperty.call(options, "officeAppsEnabled")
            ? options.officeAppsEnabled === true
            : base.officeAppsEnabled === true;
          const officeAppsEnabled = profile.id === "desktop" ? requestedOfficeAppsEnabled : false;
  
          return {
            ...base,
            computeProfile: profile.id,
            guiEnabled: profile.guiEnabled,
            officeAppsEnabled,
            estimatedCostPerMinute: profile.minutePrice,
            metadata: {
              ...metadata,
              computeProfile: profile.id,
              computeResources: {
                cpuCores: profile.cpuCores,
                memoryMb: profile.memoryMb,
              },
              pricing,
              guiEnabled: profile.guiEnabled,
              officeAppsEnabled,
            },
          };
        }
  
        function setPlaygroundEnvironmentOfficeAppsEnabled(environment, enabled) {
          if (enabled) {
            return applyPlaygroundEnvironmentComputeProfileDraft(environment, "desktop", { officeAppsEnabled: true });
          }
  
          return applyPlaygroundEnvironmentComputeProfileDraft(
            environment,
            resolvePlaygroundEnvironmentComputeProfileId(environment),
            { officeAppsEnabled: false }
          );
        }
  
        function buildPlaygroundDefaultEnvironmentDraft() {
          const now = new Date().toISOString();
          const defaultRuntimes = {
            python: "3.12",
            nodejs: "22",
          };
  
          const draft = {
            id: "",
            userId: "",
            name: "New Environment",
            description: "",
            runtimes: defaultRuntimes,
            packageVersions: defaultRuntimes,
            packages: {
              system: [],
              python: [],
              node: [],
            },
            environmentVariables: [],
            secrets: [],
            setupScripts: [],
            mcpServers: [],
            documentation: [],
            internetAccess: true,
            guiEnabled: false,
            officeAppsEnabled: false,
            computeProfile: PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE,
            dockerfileExtensions: "",
            baseImage: "",
            metadata: null,
            status: "stopped",
            estimatedStorageMB: 0,
            estimatedCostPerMinute: 0,
            isSystem: false,
            isDefault: false,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          };
  
          return applyPlaygroundEnvironmentComputeProfileDraft(
            draft,
            PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE,
            { officeAppsEnabled: false }
          );
        }
  
        function buildPlaygroundDefaultServerDraft() {
          const now = new Date().toISOString();
          return {
            id: "",
            userId: "",
            projectId: null,
            name: "New Resource",
            description: "",
            kind: "web_app",
            sourceType: "manual",
            sourceEnvironmentId: null,
            sourcePath: "",
            region: "europe-west1",
            runtime: "nodejs22",
            authMode: "public",
            serviceUrl: "",
            customDomain: "",
            cloudRunServiceName: "",
            imageUrl: "",
            status: "draft",
            lastDeployedAt: "",
            template: "blank",
            templateAgentId: "",
            templateEnvironmentId: "",
            templateDeploy: false,
            databaseMode: "none",
            databaseId: "",
            databaseName: "",
            databaseDescription: "",
            databaseLocation: "eur3",
            metadata: null,
            createdAt: now,
            updatedAt: now,
          };
        }
  
        function buildPlaygroundDefaultDatabaseDraft() {
          const now = new Date().toISOString();
          return {
            id: "",
            userId: "",
            projectId: null,
            name: "New Database",
            description: "",
            provider: "firestore",
            location: "eur3",
            status: "active",
            firestoreNamespace: "",
            permissionSet: createPlaygroundDefaultPermissionSet("database"),
            metadata: null,
            createdAt: now,
            updatedAt: now,
          };
        }
  
        function buildPlaygroundDefaultAgentDraft(kind = "single") {
          const now = new Date().toISOString();
          const defaultDeepResearchModel = getDemoDefaultDeepResearchModel(readDemoSettingsPlatformConfig());
          return {
            id: PLAYGROUND_AGENT_DRAFT_ID,
            name: kind === "team" ? "New Squad" : "New Agent",
            description: "",
            model: "deepseek-v4-flash",
            instructions: "",
            binary: "Claude Code CLI",
            reasoningEffort: "medium",
            enabledSkills: ["frontend_design"],
            guardrailSetIds: [],
            deepResearchModel: defaultDeepResearchModel,
            permissionSet: createPlaygroundFullAccessPermissionSet("agent"),
            voiceMode: "web",
            voiceProvider: "xai",
            voiceModel: "grok-voice-latest",
            voiceId: "eve",
            voiceInstructions: "",
            voiceLanguageHint: "",
            voiceTurnDetection: null,
            voicePronunciationReplacements: null,
            agentType: kind === "team" ? "team" : "single",
            teamOrchestratorAgentId: "",
            teamSubagentIds: [],
            teamExecutionMode: PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
            createdAt: now,
            updatedAt: now,
            lastRunAt: "",
            isActive: true,
            isDefault: false,
            isSystem: false,
            metadata: {
              profile: {
                photoURL: PLAYGROUND_SPARK_AGENT_PROFILE_URL,
              },
            },
          };
        }
  
        function buildPlaygroundAgentCreatorInstructions() {
          return [
            "You are the internal Agent Creator for Testbase ACP.",
            "Your only job is to create or improve instructions for a target ACP agent. You do not implement the user's underlying business task.",
            "",
            "Workflow:",
            "1. Read the target agent context and user use case.",
            "2. If the use case is underspecified, ask a compact numbered set of clarifying questions and stop. Ask about audience, recurring workflow, tools/data sources, output format, approval boundaries, and success criteria only when relevant.",
            "3. If enough information is available, write the final instructions to a temporary markdown file and run: python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py agents update <target_agent_id> --instructions-file <instructions_file>. Do not list all agents, inspect unrelated resources, browse documentation, or run help first unless this update command is unavailable or fails because the syntax is unknown.",
            "4. After the update succeeds, briefly summarize what changed and mention that the details page will reflect the new instructions.",
            "",
            "Instruction quality requirements:",
            "- Write production-ready operational instructions, not a casual summary.",
            "- Include role, scope, normal workflow, tool-use policy, clarification rules, output expectations, and constraints implied by the use case.",
            "- Preserve any user-provided name, description, model, permissions, and boundaries.",
            "- Keep the instructions specific to the target agent and avoid creating new agents, teams, environments, skills, or threads.",
            "- Never claim the instructions were updated until the Computer Agents skill update succeeds.",
          ].join("\n");
        }
  
        function selectPlaygroundAgentModelId(modelOptions, candidateModelIds) {
          const candidateOptions = Array.isArray(modelOptions) && modelOptions.length > 0
            ? modelOptions
            : PLAYGROUND_AGENT_MODEL_OPTIONS;
          const candidates = Array.isArray(candidateModelIds) ? candidateModelIds : [];
          for (const modelId of candidates) {
            const normalizedModelId = String(modelId || "").trim();
            if (!normalizedModelId) continue;
            const matchingOption = candidateOptions.find((option) => option?.id === normalizedModelId);
            if (matchingOption && !matchingOption.locked) {
              return matchingOption.id;
            }
          }
          return getPlaygroundAgentModelMeta(candidates[0] || "gemini-3-flash", candidateOptions).id;
        }
  
        function resolvePlaygroundAgentCreatorModelId(modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId = "") {
          const isFreeTier = (normalizeSettingsTierId(subscriptionTierId) || "sandbox") === "sandbox";
          return selectPlaygroundAgentModelId(
            modelOptions,
            isFreeTier
              ? ["gemini-3-flash", "gemini-3-1-flash", "gemini-3-flash-preview", "claude-haiku-4-5", "claude-sonnet-4-5"]
              : ["claude-sonnet-4-5", "gemini-3-flash", "gemini-3-1-flash", "claude-haiku-4-5"]
          );
        }
  
        function resolvePlaygroundAgentDraftModelId(modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId = "") {
          const isFreeTier = (normalizeSettingsTierId(subscriptionTierId) || "sandbox") === "sandbox";
          return selectPlaygroundAgentModelId(
            modelOptions,
            isFreeTier
              ? ["deepseek-v4-flash", "claude-haiku-4-5", "gemini-3-flash", "gemini-3-1-flash", "gemini-3-flash-preview"]
              : ["deepseek-v4-flash", "claude-haiku-4-5", "gemini-3-flash", "gemini-3-1-flash"]
          );
        }
  
        function isPlaygroundPaidModelSubscriptionError(message) {
          const text = String(message || "");
          return /requires a paid subscription/i.test(text)
            || (/please upgrade/i.test(text) && /gemini-3-flash/i.test(text));
        }
  
        function buildPlaygroundAgentCreatorDraft(modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId = "") {
          const draft = buildPlaygroundDefaultAgentDraft("single");
          const modelMeta = getPlaygroundAgentModelMeta(
            resolvePlaygroundAgentCreatorModelId(modelOptions, subscriptionTierId),
            modelOptions
          );
          return normalizePlaygroundAgentRecord({
            ...draft,
            id: PLAYGROUND_AGENT_DRAFT_ID,
            name: PLAYGROUND_AGENT_CREATOR_NAME,
            description: PLAYGROUND_AGENT_CREATOR_DESCRIPTION,
            model: modelMeta.id,
            instructions: buildPlaygroundAgentCreatorInstructions(),
            enabledSkills: ["computer_agents"],
            permissionSet: createPlaygroundDefaultPermissionSet("agent"),
            metadata: {
              runnerPlayground: {
                role: PLAYGROUND_AGENT_CREATOR_METADATA_ROLE,
                internal: true,
                managedBy: "runner-web-sdk-demo",
                version: 1,
              },
              profile: {
                email: slugifyPlaygroundAgentEmailLocalPart(PLAYGROUND_AGENT_CREATOR_NAME) + "@" + PLAYGROUND_AGENT_EMAIL_DOMAIN,
                photoURL: PLAYGROUND_AGENT_CREATOR_PROFILE_URL,
              },
            },
          });
        }
  
        function buildPlaygroundMissionControlAgentInstructions() {
          return [
            "You are the internal mission control agent for Testbase ACP.",
            "Your job is to run project strategy and backlog planning for the exact project supplied in the user prompt. You do not ask what Mission Control means.",
            "",
            "Workflow:",
            "1. Read the provided project goal, operating profile, existing structured strategy, outcomes, rules, connectors, attachments, milestones, tasks, agents, environments, and operator directive.",
            "2. Treat the project operating profile as the default shape of the project: it defines likely resources, setup steps, dashboard focus, collaboration style, and sync targets. Override it only when the actual project context proves a better path.",
            "3. Use the Task Management skill for milestone, task, subtask, blocker, dependency, connector, comment, and assignment mutations whenever the project structure needs to change.",
            "4. Use the Computer Agents skill to inspect live agents, environments, skills, and thread context before assigning work or assuming IDs.",
            "5. Keep the project's selected default environment as the execution environment unless the prompt or available context proves another environment is better.",
            "6. Update the compact strategy, outcomes, and project rules only when the new project context justifies it. Preserve existing outcome IDs and rule meaning whenever possible.",
            "7. Produce a concise project strategy document and the required mission_control_json block. Do not add conversational prefaces or outros.",
            "",
            "Planning standards:",
            "- Prefer milestone-level structure before creating loose tasks.",
            "- Create execution-ready tasks with assignee, environment, skills, dependencies, connector context, and acceptance criteria when the context supports it.",
            "- Keep tickets specific, short, and actionable.",
            "- Keep outcomes user/business-facing and map them to releaseIds (milestone ids) when milestones clearly contribute to them. Use releaseId only for legacy single-milestone mappings.",
            "- Keep project rules concrete, operational, and phrased as instructions agents can follow while executing tickets.",
            "- Use comments to preserve important rationale, sequencing, and handoff context.",
            "- If the project is underspecified, still create a useful strategy from the available context and state the most important assumptions in the strategy document.",
          ].join("\n");
        }
  
        function resolvePlaygroundMissionControlAgentModelId(modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId = "") {
          const isFreeTier = (normalizeSettingsTierId(subscriptionTierId) || "sandbox") === "sandbox";
          return selectPlaygroundAgentModelId(
            modelOptions,
            isFreeTier
              ? ["claude-haiku-4-5", "gemini-3-flash", "gemini-3-1-flash", "gemini-3-flash-preview"]
              : ["minimax-m3", "deepseek-v4-pro", "claude-sonnet-4-5", "claude-haiku-4-5", "gemini-3-flash", "gemini-3-1-flash"]
          );
        }
  
        function buildPlaygroundMissionControlAgentDraft(modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId = "") {
          const draft = buildPlaygroundDefaultAgentDraft("single");
          const modelMeta = getPlaygroundAgentModelMeta(
            resolvePlaygroundMissionControlAgentModelId(modelOptions, subscriptionTierId),
            modelOptions
          );
          return normalizePlaygroundAgentRecord({
            ...draft,
            id: PLAYGROUND_AGENT_DRAFT_ID,
            name: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
            description: PLAYGROUND_MISSION_CONTROL_AGENT_DESCRIPTION,
            model: modelMeta.id,
            instructions: buildPlaygroundMissionControlAgentInstructions(),
            enabledSkills: ["task_management", "computer_agents"],
            permissionSet: createPlaygroundDefaultPermissionSet("agent"),
            metadata: {
              runnerPlayground: {
                role: PLAYGROUND_MISSION_CONTROL_AGENT_METADATA_ROLE,
                internal: true,
                managedBy: "runner-web-sdk-demo",
                version: 1,
              },
              profile: {
                email: slugifyPlaygroundAgentEmailLocalPart(PLAYGROUND_MISSION_CONTROL_AGENT_NAME) + "@" + PLAYGROUND_AGENT_EMAIL_DOMAIN,
                photoURL: PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL,
              },
            },
          });
        }
  
        const PLAYGROUND_TEAM_ROLE_DEFINITIONS = [
          {
            id: "owner",
            label: "Owner",
            description: "Has permanent full control of the team, role permissions, shared resources, and governance settings.",
          },
          {
            id: "member",
            label: "Member",
            description: "Can participate in shared team work, with elevated team operations routed through approval.",
          },
          {
            id: "contributor",
            label: "Contributor",
            description: "Can contribute to shared resources and projects, while administrative team changes remain protected.",
          },
          {
            id: "admin",
            label: "Admin",
            description: "Can manage team membership, shared resources, role permissions, and team settings.",
          },
        ];
  
        const PLAYGROUND_ASSIGNABLE_TEAM_ROLE_DEFINITIONS = PLAYGROUND_TEAM_ROLE_DEFINITIONS.filter((role) => role.id !== "owner");
        const PLAYGROUND_TEAM_ROLE_IDS = PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id);
  __PLATFORM_COMPATIBILITY_BINDING_092__      const PLAYGROUND_TEAM_LEGACY_ROLE_MAP = {
          create: "member",
          member: "member",
          viewer: "member",
          configure: "contributor",
          develop: "contributor",
          contributor: "contributor",
          editor: "contributor",
          admin: "admin",
          owner: "owner",
          manage: "admin",
        };
        const PLAYGROUND_TEAM_ROLE_API_VALUE_MAP = {
          member: "create",
          contributor: "develop",
          admin: "admin",
          owner: "owner",
        };
  
        function normalizePlaygroundTeamRoleId(value, fallback = "member") {
          const normalized = String(value || "").trim().toLowerCase();
          const mapped = PLAYGROUND_TEAM_LEGACY_ROLE_MAP[normalized] || normalized;
          return PLAYGROUND_TEAM_ROLE_IDS.includes(mapped) ? mapped : fallback;
        }
  
        function getPlaygroundTeamRoleDefinition(roleId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          return PLAYGROUND_TEAM_ROLE_DEFINITIONS.find((role) => role.id === normalizedRoleId)
            || PLAYGROUND_TEAM_ROLE_DEFINITIONS[0];
        }
  
        function getPlaygroundTeamRoleApiValue(roleId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          return PLAYGROUND_TEAM_ROLE_API_VALUE_MAP[normalizedRoleId] || normalizedRoleId;
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_093__
        function createPlaygroundTeamRolePermissionSet(roleId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          if (normalizedRoleId === "owner") {
            return createPlaygroundFullAccessPermissionSet("team_role");
          }
          const permissionSet = createPlaygroundDefaultPermissionSet("team_role");
          const applyRingAccess = (ringId, access) => {
            permissionSet.rings[ringId] = {
              ...(permissionSet.rings[ringId] || {}),
              defaultAccess: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
            };
          };
          const applyActionAccess = (actionId, ringId, access) => {
            permissionSet.actions[actionId] = {
              ...(permissionSet.actions[actionId] || {}),
              ringId: normalizePlaygroundPermissionRingId(ringId, "ring_1"),
              access: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
            };
          };
  
          if (normalizedRoleId === "admin") {
            PLAYGROUND_PERMISSION_RING_IDS.forEach((ringId) => applyRingAccess(ringId, "full_access"));
            [
              "team_member_invite",
              "team_member_remove",
              "team_role_update",
              "team_shared_resource_manage",
              "team_permission_request_review",
              "team_settings_update",
              "team_workspace_view",
            ].forEach((actionId) => {
              const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
              applyActionAccess(actionId, actionDefinition?.ringId || "ring_2", "full_access");
            });
            return permissionSet;
          }
  
          if (normalizedRoleId === "contributor") {
            applyRingAccess("ring_1", "full_access");
            applyRingAccess("ring_2", "ask_for_permission");
            applyRingAccess("ring_3", "ask_for_permission");
            applyActionAccess("team_workspace_view", "ring_1", "full_access");
            applyActionAccess("shared_resource_write", "ring_2", "ask_for_permission");
            applyActionAccess("team_shared_resource_manage", "ring_2", "ask_for_permission");
            applyActionAccess("team_member_invite", "ring_2", "no_access");
            applyActionAccess("team_member_remove", "ring_2", "no_access");
            applyActionAccess("team_role_update", "ring_2", "no_access");
            applyActionAccess("team_permission_request_review", "ring_2", "no_access");
            applyActionAccess("team_settings_update", "ring_3", "no_access");
            return permissionSet;
          }
  
          applyRingAccess("ring_1", "read_only");
          applyRingAccess("ring_2", "ask_for_permission");
          applyRingAccess("ring_3", "no_access");
          applyActionAccess("team_workspace_view", "ring_1", "read_only");
          applyActionAccess("shared_resource_write", "ring_2", "ask_for_permission");
          applyActionAccess("team_shared_resource_manage", "ring_2", "ask_for_permission");
          applyActionAccess("team_member_invite", "ring_2", "no_access");
          applyActionAccess("team_member_remove", "ring_2", "no_access");
          applyActionAccess("team_role_update", "ring_2", "no_access");
          applyActionAccess("team_permission_request_review", "ring_2", "no_access");
          applyActionAccess("team_settings_update", "ring_3", "no_access");
          return permissionSet;
        }
  
        function createPlaygroundDatabaseTeamRolePermissionSet(roleId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          if (normalizedRoleId === "owner") {
            return createPlaygroundFullAccessPermissionSet("database");
          }
          const permissionSet = createPlaygroundDefaultPermissionSet("database");
          const applyRingAccess = (ringId, access) => {
            permissionSet.rings[ringId] = {
              ...(permissionSet.rings[ringId] || {}),
              defaultAccess: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
            };
          };
          const applyActionAccess = (actionId, access) => {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            permissionSet.actions[actionId] = {
              ...(permissionSet.actions[actionId] || {}),
              ringId: actionDefinition?.ringId || "ring_1",
              access: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
            };
          };
  
          if (normalizedRoleId === "admin") {
            PLAYGROUND_PERMISSION_RING_IDS.forEach((ringId) => applyRingAccess(ringId, "full_access"));
            PLAYGROUND_PERMISSION_ACTION_DEFINITIONS
              .filter((action) => action.subjectTypes?.includes("database"))
              .forEach((action) => applyActionAccess(action.id, "full_access"));
            return permissionSet;
          }
  
          if (normalizedRoleId === "contributor") {
            applyRingAccess("ring_1", "full_access");
            applyRingAccess("ring_2", "full_access");
            applyRingAccess("ring_3", "ask_for_permission");
            ["database_schema_read", "database_data_read", "database_query", "database_export", "database_document_create", "database_document_update"]
              .forEach((actionId) => applyActionAccess(actionId, "full_access"));
            applyActionAccess("database_document_delete", "ask_for_permission");
            applyActionAccess("database_schema_manage", "ask_for_permission");
            applyActionAccess("database_access_manage", "no_access");
            return permissionSet;
          }
  
          applyRingAccess("ring_1", "read_only");
          applyRingAccess("ring_2", "ask_for_permission");
          applyRingAccess("ring_3", "no_access");
          ["database_schema_read", "database_data_read", "database_query"]
            .forEach((actionId) => applyActionAccess(actionId, "read_only"));
          applyActionAccess("database_export", "ask_for_permission");
          ["database_document_create", "database_document_update"]
            .forEach((actionId) => applyActionAccess(actionId, "ask_for_permission"));
          ["database_document_delete", "database_schema_manage", "database_access_manage"]
            .forEach((actionId) => applyActionAccess(actionId, "no_access"));
          return permissionSet;
        }
  
        function createPlaygroundServerTeamRolePermissionSet(roleId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          if (normalizedRoleId === "owner") {
            return createPlaygroundFullAccessPermissionSet("server");
          }
          const permissionSet = createPlaygroundDefaultPermissionSet("server");
          const applyRingAccess = (ringId, access) => {
            permissionSet.rings[ringId] = {
              ...(permissionSet.rings[ringId] || {}),
              defaultAccess: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
            };
          };
          const applyActionAccess = (actionId, access) => {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            permissionSet.actions[actionId] = {
              ...(permissionSet.actions[actionId] || {}),
              ringId: actionDefinition?.ringId || "ring_1",
              access: normalizePlaygroundPermissionAccess(access, "ask_for_permission"),
            };
          };
  
          if (normalizedRoleId === "admin") {
            PLAYGROUND_PERMISSION_RING_IDS.forEach((ringId) => applyRingAccess(ringId, "full_access"));
            PLAYGROUND_PERMISSION_ACTION_DEFINITIONS
              .filter((action) => action.subjectTypes?.includes("server"))
              .forEach((action) => applyActionAccess(action.id, "full_access"));
            return permissionSet;
          }
  
          if (normalizedRoleId === "contributor") {
            applyRingAccess("ring_1", "full_access");
            applyRingAccess("ring_2", "full_access");
            applyRingAccess("ring_3", "ask_for_permission");
            ["server_source_read", "server_invoke", "server_logs_read", "server_source_write", "server_connection_manage"]
              .forEach((actionId) => applyActionAccess(actionId, "full_access"));
            applyActionAccess("server_deploy", "ask_for_permission");
            applyActionAccess("server_access_manage", "no_access");
            applyActionAccess("server_delete", "no_access");
            return permissionSet;
          }
  
          applyRingAccess("ring_1", "read_only");
          applyRingAccess("ring_2", "ask_for_permission");
          applyRingAccess("ring_3", "no_access");
          ["server_source_read", "server_logs_read"].forEach((actionId) => applyActionAccess(actionId, "read_only"));
          applyActionAccess("server_invoke", "full_access");
          ["server_source_write", "server_connection_manage"].forEach((actionId) => applyActionAccess(actionId, "ask_for_permission"));
          ["server_deploy", "server_access_manage", "server_delete"].forEach((actionId) => applyActionAccess(actionId, "no_access"));
          return permissionSet;
        }
  
        function normalizePlaygroundTeamRolePermissionSets(value) {
          const inputSets = isPlaygroundPermissionRecord(value) ? value : {};
          return PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((rolePermissionSets, role) => {
            if (role.id === "owner") {
              rolePermissionSets[role.id] = createPlaygroundTeamRolePermissionSet(role.id);
              return rolePermissionSets;
            }
            rolePermissionSets[role.id] = normalizePlaygroundPermissionSet(
              inputSets[role.id] || createPlaygroundTeamRolePermissionSet(role.id),
              "team_role"
            );
            return rolePermissionSets;
          }, {});
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_094__
        function normalizePlaygroundPackages(packages) {
          const source = packages && typeof packages === "object" ? packages : {};
          return {
            system: Array.isArray(source.system) ? source.system.map((value) => String(value || "")).filter(Boolean) : [],
            python: Array.isArray(source.python) ? source.python.map((value) => String(value || "")).filter(Boolean) : [],
            node: Array.isArray(source.node) ? source.node.map((value) => String(value || "")).filter(Boolean) : [],
          };
        }
  
        function normalizePlaygroundEnvironmentVariables(items) {
          return (Array.isArray(items) ? items : []).map((item) => ({
            key: typeof item?.key === "string" ? item.key : "",
            value: typeof item?.value === "string" ? item.value : "",
          }));
        }
  
        function normalizePlaygroundMcpServers(items) {
          return (Array.isArray(items) ? items : []).map((item, index) => ({
            id: typeof item?.id === "string" && item.id.trim() ? item.id : "mcp-" + index + "-" + Date.now().toString(36),
            name: typeof item?.name === "string" ? item.name : "",
            enabled: item?.enabled !== false,
            type: item?.type === "http" ? "http" : "stdio",
            command: typeof item?.command === "string" ? item.command : "",
            url: typeof item?.url === "string" ? item.url : "",
            bearerToken: typeof item?.bearerToken === "string" ? item.bearerToken : "",
          }));
        }
  
        function normalizePlaygroundDocumentationFiles(items) {
          return (Array.isArray(items) ? items : []).map((item, index) => {
            if (typeof item === "string") {
              return {
                id: "doc-" + index + "-" + Date.now().toString(36),
                name: "Document " + (index + 1),
                content: item,
                mimeType: "text/plain",
              };
            }
  
            return {
              id: typeof item?.id === "string" && item.id.trim() ? item.id : "doc-" + index + "-" + Date.now().toString(36),
              name: typeof item?.name === "string" ? item.name : "Document " + (index + 1),
              content: typeof item?.content === "string" ? item.content : "",
              mimeType: typeof item?.mimeType === "string" ? item.mimeType : "text/plain",
            };
          });
        }
  
        function normalizePlaygroundEnvironmentRecord(environment) {
          if (!environment || typeof environment !== "object") {
            return buildPlaygroundDefaultEnvironmentDraft();
          }
  
          const draft = buildPlaygroundDefaultEnvironmentDraft();
          const rawRuntimes = environment?.runtimes && typeof environment.runtimes === "object"
            ? environment.runtimes
            : environment?.packageVersions && typeof environment.packageVersions === "object"
              ? environment.packageVersions
              : draft.runtimes;
          const runtimes = Object.keys(rawRuntimes || {}).length > 0
            ? Object.fromEntries(
                Object.entries(rawRuntimes).filter(([, value]) => typeof value === "string" && value.trim())
              )
            : draft.runtimes;
          const normalizedMetadata = environment?.metadata && typeof environment.metadata === "object" && !Array.isArray(environment.metadata)
            ? environment.metadata
            : null;
          const computeProfile = resolvePlaygroundEnvironmentComputeProfileId({
            ...environment,
            metadata: normalizedMetadata,
          });
          const profileConfig = getPlaygroundEnvironmentComputeProfileConfig(computeProfile);
          const guiEnabled = typeof environment?.guiEnabled === "boolean"
            ? environment.guiEnabled
            : normalizedMetadata?.guiEnabled === true
              ? true
              : profileConfig.guiEnabled;
          const officeAppsEnabled = typeof environment?.officeAppsEnabled === "boolean"
            ? environment.officeAppsEnabled
            : normalizedMetadata?.officeAppsEnabled === true;
          const normalizedEnvironment = {
            ...draft,
            id: typeof environment.id === "string" ? environment.id : draft.id,
            userId: typeof environment.userId === "string" ? environment.userId : draft.userId,
            name: typeof environment.name === "string" && environment.name.trim() ? environment.name : draft.name,
            description: typeof environment.description === "string" ? environment.description : draft.description,
            runtimes,
            packageVersions: {
              ...(runtimes || {}),
            },
            packages: normalizePlaygroundPackages(environment.packages),
            environmentVariables: normalizePlaygroundEnvironmentVariables(environment.environmentVariables),
            secrets: normalizePlaygroundEnvironmentVariables(environment.secrets),
            setupScripts: Array.isArray(environment.setupScripts)
              ? environment.setupScripts.map((value) => String(value || ""))
              : [],
            mcpServers: normalizePlaygroundMcpServers(environment.mcpServers),
            documentation: normalizePlaygroundDocumentationFiles(environment.documentation),
            internetAccess: environment.internetAccess !== false,
            guiEnabled,
            officeAppsEnabled,
            computeProfile,
            dockerfileExtensions: typeof environment.dockerfileExtensions === "string" ? environment.dockerfileExtensions : "",
            baseImage: typeof environment.baseImage === "string" ? environment.baseImage : "",
            metadata: normalizedMetadata,
            status: ["running", "starting", "stopped", "error"].includes(String(environment.status || "").trim().toLowerCase())
              ? String(environment.status || "").trim().toLowerCase()
              : draft.status,
            estimatedStorageMB: Number.isFinite(environment.estimatedStorageMB) ? environment.estimatedStorageMB : draft.estimatedStorageMB,
            estimatedCostPerMinute: getPlaygroundEnvironmentRatePerMinute({
              ...environment,
              computeProfile,
              metadata: normalizedMetadata,
              guiEnabled,
              officeAppsEnabled,
            }),
            isSystem: Boolean(environment.isSystem),
            isDefault: Boolean(environment.isDefault),
            isActive: environment.isActive !== false,
            createdAt: typeof environment.createdAt === "string" && environment.createdAt ? environment.createdAt : draft.createdAt,
            updatedAt: typeof environment.updatedAt === "string" && environment.updatedAt ? environment.updatedAt : draft.updatedAt,
          };
  
          return applyPlaygroundEnvironmentComputeProfileDraft(
            normalizedEnvironment,
            computeProfile,
            { officeAppsEnabled }
          );
        }
  
        function parsePlaygroundEnvironmentListResponse(data) {
          const items = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.environments)
              ? data.environments
              : Array.isArray(data?.items)
                ? data.items
                : [];
          return items.map(normalizePlaygroundEnvironmentRecord);
        }
  
        function getPlaygroundEnvironmentResponseRecord(data) {
          const source = data?.environment || data?.data || data;
          return source && typeof source === "object" && typeof source.id === "string"
            ? normalizePlaygroundEnvironmentRecord(source)
            : null;
        }
  
        function stripPlaygroundEnvironmentVersionMetadata(metadata) {
          const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? { ...metadata }
            : {};
          delete source.environmentVersions;
          delete source.environment_versions;
          delete source.computerVersions;
          delete source.computer_versions;
          delete source.versions;
          delete source.activeEnvironmentVersionId;
          delete source.active_environment_version_id;
          delete source.activeComputerVersionId;
          delete source.active_computer_version_id;
          delete source.activeEnvironmentVersionNumber;
          delete source.active_environment_version_number;
          delete source.activeComputerVersionNumber;
          delete source.active_computer_version_number;
          delete source.restoredFromEnvironmentVersionId;
          delete source.restored_from_environment_version_id;
          delete source.restoredFromComputerVersionId;
          delete source.restored_from_computer_version_id;
          delete source.restoredFromEnvironmentVersionNumber;
          delete source.restored_from_environment_version_number;
          delete source.restoredFromComputerVersionNumber;
          delete source.restored_from_computer_version_number;
          delete source.publishedAt;
          delete source.published_at;
          delete source.unpublishedAt;
          delete source.unpublished_at;
          return source;
        }
  
        function normalizePlaygroundEnvironmentVersion(rawVersion, fallbackIndex = 0) {
          const version = rawVersion && typeof rawVersion === "object" && !Array.isArray(rawVersion) ? rawVersion : {};
          const snapshot = version.snapshot && typeof version.snapshot === "object" && !Array.isArray(version.snapshot)
            ? version.snapshot
            : {};
          const createdAt = String(version.createdAt || version.created_at || version.publishedAt || version.published_at || new Date().toISOString()).trim();
          const id = String(version.id || version.versionId || version.version_id || ("environment_version_" + (fallbackIndex + 1))).trim();
          const versionNumber = normalizePlatformVersionNumber(
            version.version ?? version.versionNumber ?? version.version_number,
            fallbackIndex
          );
          const rawStatus = String(version.status || "").trim().toLowerCase();
          const status = rawStatus === "published"
            ? "active"
            : ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
          const rawLifecycleState = String(version.lifecycleState || version.lifecycle_state || "").trim().toLowerCase();
          const lifecycleState = ["published", "saved", "draft", "deprecated", "unpublished", "archived"].includes(rawLifecycleState)
            ? rawLifecycleState
            : status === "active"
              ? "published"
              : status === "superseded"
                ? "deprecated"
                : status === "unpublished"
                  ? "unpublished"
                  : "saved";
          const rawRuntimes = version.runtimes && typeof version.runtimes === "object" && !Array.isArray(version.runtimes)
            ? version.runtimes
            : snapshot.runtimes && typeof snapshot.runtimes === "object" && !Array.isArray(snapshot.runtimes)
              ? snapshot.runtimes
              : {};
          const runtimes = Object.fromEntries(
            Object.entries(rawRuntimes).filter(([, value]) => typeof value === "string" && value.trim())
          );
          const normalizedSnapshot = {
            name: String(
              snapshot.name
              || version.environmentName
              || version.environment_name
              || version.computerName
              || version.computer_name
              || version.resourceName
              || version.resource_name
              || ""
            ).trim(),
            description: typeof snapshot.description === "string"
              ? snapshot.description
              : typeof version.environmentDescription === "string"
                ? version.environmentDescription
                : typeof version.environment_description === "string"
                  ? version.environment_description
                  : typeof version.computerDescription === "string"
                    ? version.computerDescription
                    : typeof version.computer_description === "string"
                      ? version.computer_description
                      : "",
            runtimes,
            packageVersions: { ...runtimes },
            packages: normalizePlaygroundPackages(version.packages || snapshot.packages),
            environmentVariables: normalizePlaygroundEnvironmentVariables(
              version.environmentVariables
              || version.environment_variables
              || snapshot.environmentVariables
              || snapshot.environment_variables
            ),
            secrets: normalizePlaygroundEnvironmentVariables(version.secrets || snapshot.secrets),
            setupScripts: Array.isArray(version.setupScripts)
              ? version.setupScripts.map((value) => String(value || ""))
              : Array.isArray(version.setup_scripts)
                ? version.setup_scripts.map((value) => String(value || ""))
              : Array.isArray(snapshot.setupScripts)
                ? snapshot.setupScripts.map((value) => String(value || ""))
                : Array.isArray(snapshot.setup_scripts)
                  ? snapshot.setup_scripts.map((value) => String(value || ""))
                : [],
            mcpServers: normalizePlaygroundMcpServers(
              version.mcpServers
              || version.mcp_servers
              || snapshot.mcpServers
              || snapshot.mcp_servers
            ),
            documentation: normalizePlaygroundDocumentationFiles(version.documentation || snapshot.documentation),
            internetAccess: (
              Object.prototype.hasOwnProperty.call(version, "internetAccess")
                ? version.internetAccess
                : Object.prototype.hasOwnProperty.call(version, "internet_access")
                  ? version.internet_access
                  : Object.prototype.hasOwnProperty.call(snapshot, "internetAccess")
                    ? snapshot.internetAccess
                    : snapshot.internet_access
            ) !== false,
            guiEnabled: Boolean(
              Object.prototype.hasOwnProperty.call(version, "guiEnabled")
                ? version.guiEnabled
                : Object.prototype.hasOwnProperty.call(snapshot, "guiEnabled")
                  ? snapshot.guiEnabled
                  : snapshot.metadata?.guiEnabled
            ),
            officeAppsEnabled: Boolean(
              Object.prototype.hasOwnProperty.call(version, "officeAppsEnabled")
                ? version.officeAppsEnabled
                : Object.prototype.hasOwnProperty.call(snapshot, "officeAppsEnabled")
                  ? snapshot.officeAppsEnabled
                  : snapshot.metadata?.officeAppsEnabled
            ),
            computeProfile: normalizePlaygroundEnvironmentComputeProfileId(
              version.computeProfile
              || version.compute_profile
              || snapshot.computeProfile
              || snapshot.compute_profile
              || snapshot.metadata?.computeProfile
            )
              || PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE,
            dockerfileExtensions: typeof version.dockerfileExtensions === "string"
              ? version.dockerfileExtensions
              : typeof version.dockerfile_extensions === "string"
                ? version.dockerfile_extensions
              : typeof snapshot.dockerfileExtensions === "string"
                ? snapshot.dockerfileExtensions
                : typeof snapshot.dockerfile_extensions === "string"
                  ? snapshot.dockerfile_extensions
                : "",
            baseImage: typeof version.baseImage === "string"
              ? version.baseImage
              : typeof version.base_image === "string"
                ? version.base_image
              : typeof snapshot.baseImage === "string"
                ? snapshot.baseImage
                : typeof snapshot.base_image === "string"
                  ? snapshot.base_image
                : "",
            metadata: stripPlaygroundEnvironmentVersionMetadata(snapshot.metadata),
          };
  
          return {
            id,
            version: versionNumber,
            label: String(version.label || ("Version " + versionNumber)).trim(),
            description: String(version.description || version.summary || "").trim(),
            status,
            lifecycleState,
            lifecycle_state: lifecycleState,
            createdAt,
            created_at: createdAt,
            updatedAt: String(version.updatedAt || version.updated_at || "").trim(),
            updated_at: String(version.updatedAt || version.updated_at || "").trim(),
            publishedAt: String(version.publishedAt || version.published_at || "").trim(),
            published_at: String(version.publishedAt || version.published_at || "").trim(),
            unpublishedAt: String(version.unpublishedAt || version.unpublished_at || "").trim(),
            unpublished_at: String(version.unpublishedAt || version.unpublished_at || "").trim(),
            revisionId: String(version.revisionId || version.revision_id || "").trim(),
            revision_id: String(version.revisionId || version.revision_id || "").trim(),
            baseRevisionId: String(version.baseRevisionId || version.base_revision_id || "").trim(),
            base_revision_id: String(version.baseRevisionId || version.base_revision_id || "").trim(),
            revisionNumber: Number(version.revisionNumber || version.revision_number || versionNumber || 0) || versionNumber,
            revision_number: Number(version.revisionNumber || version.revision_number || versionNumber || 0) || versionNumber,
            createdBy: normalizePlaygroundVersionActor(version.createdBy || version.created_by),
            created_by: normalizePlaygroundVersionActor(version.createdBy || version.created_by),
            updatedBy: normalizePlaygroundVersionActor(version.updatedBy || version.updated_by),
            updated_by: normalizePlaygroundVersionActor(version.updatedBy || version.updated_by),
            publishedBy: normalizePlaygroundVersionActor(version.publishedBy || version.published_by),
            published_by: normalizePlaygroundVersionActor(version.publishedBy || version.published_by),
            unpublishedBy: normalizePlaygroundVersionActor(version.unpublishedBy || version.unpublished_by),
            unpublished_by: normalizePlaygroundVersionActor(version.unpublishedBy || version.unpublished_by),
            deploymentId: String(version.deploymentId || version.deployment_id || "").trim(),
            deployment_id: String(version.deploymentId || version.deployment_id || "").trim(),
            deploymentStatus: String(version.deploymentStatus || version.deployment_status || "").trim(),
            deployment_status: String(version.deploymentStatus || version.deployment_status || "").trim(),
            name: normalizedSnapshot.name,
            computeProfile: normalizedSnapshot.computeProfile,
            runtimeCount: Object.keys(normalizedSnapshot.runtimes || {}).length,
            snapshot: normalizedSnapshot,
          };
        }
  
        function normalizePlaygroundEnvironmentVersions(value) {
          const rawItems = Array.isArray(value) ? value : [];
          return rawItems
            .map((version, index) => normalizePlaygroundEnvironmentVersion(version, index))
            .filter((version) => version.id)
            .sort((a, b) => {
              const versionDelta = Number(b.version || 0) - Number(a.version || 0);
              if (versionDelta) return versionDelta;
              return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
            });
        }
  
        function readPlaygroundEnvironmentVersions(environment) {
          const metadata = environment?.metadata && typeof environment.metadata === "object" && !Array.isArray(environment.metadata)
            ? environment.metadata
            : {};
          return normalizePlaygroundEnvironmentVersions(
            environment?.environmentVersions
            || environment?.computerVersions
            || environment?.versions
            || metadata.environmentVersions
            || metadata.environment_versions
            || metadata.computerVersions
            || metadata.computer_versions
            || metadata.versions
            || []
          );
        }
  
        function createPlaygroundEnvironmentVersionId() {
          return "environment_version_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }
  
        function createPlaygroundEnvironmentVersionRevisionId() {
          return "environment_revision_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }
  
        function createPlaygroundEnvironmentDeploymentId(versionId = "") {
          const normalizedVersionId = String(versionId || "").trim();
          return "environment_deployment_" + (normalizedVersionId || (Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8)));
        }
  
        function buildPlaygroundEnvironmentVersionSnapshot(environment) {
          const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environment || buildPlaygroundDefaultEnvironmentDraft());
          const runtimes = Object.fromEntries(
            Object.entries(normalizedEnvironment.runtimes || {}).filter(([, value]) => typeof value === "string" && value.trim())
          );
          const secrets = normalizePlaygroundEnvironmentVariables(normalizedEnvironment.secrets)
            .map((secret) => ({ key: secret.key, value: "" }));
          const mcpServers = normalizePlaygroundMcpServers(normalizedEnvironment.mcpServers)
            .map((server) => {
              const {
                bearerToken,
                bearer_token,
                bearerTokenEncrypted,
                bearer_token_encrypted,
                ...versionedServer
              } = server;
              return versionedServer;
            });
          return {
            name: String(normalizedEnvironment.name || "").trim() || "Untitled Computer",
            description: typeof normalizedEnvironment.description === "string" ? normalizedEnvironment.description : "",
            runtimes,
            packageVersions: { ...runtimes },
            packages: normalizePlaygroundPackages(normalizedEnvironment.packages),
            environmentVariables: normalizePlaygroundEnvironmentVariables(normalizedEnvironment.environmentVariables),
            secrets,
            setupScripts: Array.isArray(normalizedEnvironment.setupScripts)
              ? normalizedEnvironment.setupScripts.map((value) => String(value || ""))
              : [],
            mcpServers,
            documentation: normalizePlaygroundDocumentationFiles(normalizedEnvironment.documentation),
            internetAccess: normalizedEnvironment.internetAccess !== false,
            guiEnabled: normalizedEnvironment.guiEnabled === true,
            officeAppsEnabled: normalizedEnvironment.officeAppsEnabled === true,
            computeProfile: normalizePlaygroundEnvironmentComputeProfileId(normalizedEnvironment.computeProfile)
              || PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE,
            dockerfileExtensions: typeof normalizedEnvironment.dockerfileExtensions === "string" ? normalizedEnvironment.dockerfileExtensions : "",
            baseImage: typeof normalizedEnvironment.baseImage === "string" ? normalizedEnvironment.baseImage : "",
            metadata: stripPlaygroundEnvironmentVersionMetadata(normalizedEnvironment.metadata),
          };
        }
  
        function createPlaygroundEnvironmentVersion(environment, existingVersions = [], options = {}) {
          const now = new Date().toISOString();
          const normalizedExisting = normalizePlaygroundEnvironmentVersions(existingVersions);
          const nextVersion = normalizedExisting.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
          const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
          const status = requestedStatus === "active" ? "active" : "saved";
          const snapshot = buildPlaygroundEnvironmentVersionSnapshot(environment);
          const actor = normalizePlaygroundVersionActor(options?.actor);
          const revisionId = createPlaygroundEnvironmentVersionRevisionId();
          const versionId = createPlaygroundEnvironmentVersionId();
          const deploymentId = status === "active" ? createPlaygroundEnvironmentDeploymentId(versionId) : "";
          return normalizePlaygroundEnvironmentVersion({
            id: versionId,
            version: nextVersion,
            label: String(options?.label || ("Version " + nextVersion)).trim(),
            description: String(options?.description || "").trim(),
            status,
            lifecycleState: status === "active" ? "published" : "saved",
            lifecycle_state: status === "active" ? "published" : "saved",
            createdAt: now,
            created_at: now,
            updatedAt: now,
            updated_at: now,
            createdBy: actor,
            created_by: actor,
            updatedBy: actor,
            updated_by: actor,
            publishedAt: status === "active" ? now : "",
            published_at: status === "active" ? now : "",
            publishedBy: status === "active" ? actor : null,
            published_by: status === "active" ? actor : null,
            revisionId,
            revision_id: revisionId,
            revisionNumber: nextVersion,
            revision_number: nextVersion,
            deploymentId,
            deployment_id: deploymentId,
            deploymentStatus: status === "active" ? "published" : "",
            deployment_status: status === "active" ? "published" : "",
            name: snapshot.name,
            computeProfile: snapshot.computeProfile,
            runtimes: snapshot.runtimes,
            snapshot,
          }, nextVersion - 1);
        }
  
        function createPlaygroundEnvironmentWithVersionList(environment, versions, preferredSelectedId = "") {
          const baseEnvironment = normalizePlaygroundEnvironmentRecord(environment || buildPlaygroundDefaultEnvironmentDraft());
          const normalizedVersions = normalizePlaygroundEnvironmentVersions(versions);
          const metadata = baseEnvironment.metadata && typeof baseEnvironment.metadata === "object" && !Array.isArray(baseEnvironment.metadata)
            ? { ...baseEnvironment.metadata }
            : {};
          const previousSelectedId = String(
            metadata.restoredFromEnvironmentVersionId
            || metadata.restored_from_environment_version_id
            || metadata.restoredFromComputerVersionId
            || metadata.restored_from_computer_version_id
            || metadata.activeEnvironmentVersionId
            || metadata.active_environment_version_id
            || metadata.activeComputerVersionId
            || metadata.active_computer_version_id
            || ""
          ).trim();
          const selectedVersion = normalizedVersions.find((version) => version.id === String(preferredSelectedId || "").trim())
            || normalizedVersions.find((version) => version.id === previousSelectedId)
            || normalizedVersions.find((version) => version.status === "active")
            || normalizedVersions[0]
            || null;
          const activeVersion = normalizedVersions.find((version) => version.status === "active")
            || normalizedVersions.find((version) => (
              version.id === String(metadata.activeEnvironmentVersionId || metadata.active_environment_version_id || metadata.activeComputerVersionId || metadata.active_computer_version_id || "").trim()
            ))
            || null;
          metadata.environmentVersions = normalizedVersions;
          metadata.environment_versions = normalizedVersions;
          metadata.computerVersions = normalizedVersions;
          metadata.computer_versions = normalizedVersions;
          metadata.activeEnvironmentVersionId = activeVersion?.id || "";
          metadata.active_environment_version_id = activeVersion?.id || "";
          metadata.activeComputerVersionId = activeVersion?.id || "";
          metadata.active_computer_version_id = activeVersion?.id || "";
          metadata.activeEnvironmentVersionNumber = activeVersion?.version || 0;
          metadata.active_environment_version_number = activeVersion?.version || 0;
          metadata.activeComputerVersionNumber = activeVersion?.version || 0;
          metadata.active_computer_version_number = activeVersion?.version || 0;
          metadata.restoredFromEnvironmentVersionId = selectedVersion?.id || "";
          metadata.restored_from_environment_version_id = selectedVersion?.id || "";
          metadata.restoredFromComputerVersionId = selectedVersion?.id || "";
          metadata.restored_from_computer_version_id = selectedVersion?.id || "";
          metadata.restoredFromEnvironmentVersionNumber = selectedVersion?.version || 0;
          metadata.restored_from_environment_version_number = selectedVersion?.version || 0;
          metadata.restoredFromComputerVersionNumber = selectedVersion?.version || 0;
          metadata.restored_from_computer_version_number = selectedVersion?.version || 0;
          if (activeVersion?.publishedAt) {
            metadata.publishedAt = activeVersion.publishedAt;
            metadata.published_at = activeVersion.publishedAt;
          } else {
            delete metadata.publishedAt;
            delete metadata.published_at;
          }
          return normalizePlaygroundEnvironmentRecord({
            ...baseEnvironment,
            metadata,
            publishedAt: activeVersion?.publishedAt || "",
          });
        }
  
        function createPlaygroundEnvironmentFromVersionSnapshot(environment, version, versions, preferredSelectedId = "") {
          const baseEnvironment = normalizePlaygroundEnvironmentRecord(environment || buildPlaygroundDefaultEnvironmentDraft());
          const normalizedVersion = normalizePlaygroundEnvironmentVersion(version || {});
          const snapshot = normalizedVersion.snapshot || {};
          const baseMetadata = stripPlaygroundEnvironmentVersionMetadata(baseEnvironment.metadata);
          const snapshotMetadata = stripPlaygroundEnvironmentVersionMetadata(snapshot.metadata);
          const nextEnvironment = normalizePlaygroundEnvironmentRecord({
            ...baseEnvironment,
            name: snapshot.name || baseEnvironment.name,
            description: typeof snapshot.description === "string" ? snapshot.description : baseEnvironment.description,
            runtimes: snapshot.runtimes || baseEnvironment.runtimes,
            packageVersions: snapshot.packageVersions || snapshot.runtimes || baseEnvironment.packageVersions,
            packages: snapshot.packages || baseEnvironment.packages,
            environmentVariables: Array.isArray(snapshot.environmentVariables) ? snapshot.environmentVariables : baseEnvironment.environmentVariables,
            secrets: Array.isArray(snapshot.secrets) ? snapshot.secrets : baseEnvironment.secrets,
            setupScripts: Array.isArray(snapshot.setupScripts) ? snapshot.setupScripts : baseEnvironment.setupScripts,
            mcpServers: Array.isArray(snapshot.mcpServers) ? snapshot.mcpServers : baseEnvironment.mcpServers,
            documentation: Array.isArray(snapshot.documentation) ? snapshot.documentation : baseEnvironment.documentation,
            internetAccess: snapshot.internetAccess !== false,
            guiEnabled: snapshot.guiEnabled === true,
            officeAppsEnabled: snapshot.officeAppsEnabled === true,
            computeProfile: snapshot.computeProfile || baseEnvironment.computeProfile,
            dockerfileExtensions: typeof snapshot.dockerfileExtensions === "string" ? snapshot.dockerfileExtensions : baseEnvironment.dockerfileExtensions,
            baseImage: typeof snapshot.baseImage === "string" ? snapshot.baseImage : baseEnvironment.baseImage,
            metadata: {
              ...baseMetadata,
              ...snapshotMetadata,
            },
          });
          return createPlaygroundEnvironmentWithVersionList(nextEnvironment, versions, preferredSelectedId || normalizedVersion.id);
        }
  
        function normalizePlaygroundServerRecord(server) {
          if (!server || typeof server !== "object") {
            return buildPlaygroundDefaultServerDraft();
          }
  
          const draft = buildPlaygroundDefaultServerDraft();
          const metadata = server?.metadata && typeof server.metadata === "object" && !Array.isArray(server.metadata)
            ? server.metadata
            : null;
          const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : null;
          const databaseBinding = runnerPlayground?.database && typeof runnerPlayground.database === "object" && !Array.isArray(runnerPlayground.database)
            ? runnerPlayground.database
            : null;
          const databaseId = typeof server.databaseId === "string" && server.databaseId.trim()
            ? server.databaseId.trim()
            : typeof databaseBinding?.id === "string" && databaseBinding.id.trim()
              ? databaseBinding.id.trim()
              : "";
          const databaseName = typeof server.databaseName === "string" && server.databaseName.trim()
            ? server.databaseName.trim()
            : typeof databaseBinding?.name === "string"
              ? databaseBinding.name
              : "";
          const databaseDescription = typeof server.databaseDescription === "string"
            ? server.databaseDescription
            : typeof databaseBinding?.description === "string"
              ? databaseBinding.description
              : "";
          const databaseLocation = typeof server.databaseLocation === "string" && server.databaseLocation.trim()
            ? server.databaseLocation.trim()
            : typeof databaseBinding?.location === "string" && databaseBinding.location.trim()
              ? databaseBinding.location.trim()
              : draft.databaseLocation;
  	        const databaseMode = typeof server.databaseMode === "string" && ["none", "existing", "create"].includes(server.databaseMode)
  	          ? server.databaseMode
  	          : databaseId
  	            ? "existing"
  	            : databaseName || databaseDescription
  	              ? "create"
  	              : "none";
  	        const normalizedKind = canonicalizePlaygroundServerKind(server.kind || draft.kind);
  
  	        return {
  	          ...draft,
            id: typeof server.id === "string" ? server.id : draft.id,
            userId: typeof server.userId === "string" ? server.userId : draft.userId,
            projectId: typeof server.projectId === "string" && server.projectId.trim() ? server.projectId.trim() : null,
            name: typeof server.name === "string" && server.name.trim() ? server.name : draft.name,
            description: typeof server.description === "string" ? server.description : draft.description,
  	          kind: normalizedKind,
            sourceType: ["manual", "computer", "git"].includes(server.sourceType) ? server.sourceType : draft.sourceType,
            sourceEnvironmentId: typeof server.sourceEnvironmentId === "string" && server.sourceEnvironmentId.trim() ? server.sourceEnvironmentId.trim() : null,
            sourcePath: typeof server.sourcePath === "string" ? server.sourcePath : draft.sourcePath,
            region: typeof server.region === "string" && server.region.trim() ? server.region.trim() : draft.region,
            runtime: typeof server.runtime === "string" && server.runtime.trim() ? server.runtime.trim() : draft.runtime,
  	          authMode: normalizedKind === "agent_runtime" ? "private" : (["public", "private"].includes(server.authMode) ? server.authMode : draft.authMode),
            serviceUrl: typeof server.serviceUrl === "string" ? server.serviceUrl : draft.serviceUrl,
            customDomain: typeof server.customDomain === "string" ? server.customDomain : draft.customDomain,
            cloudRunServiceName: typeof server.cloudRunServiceName === "string" ? server.cloudRunServiceName : draft.cloudRunServiceName,
            imageUrl: typeof server.imageUrl === "string" ? server.imageUrl : draft.imageUrl,
            status: ["draft", "deploying", "deployed", "failed", "inactive"].includes(server.status) ? server.status : draft.status,
            lastDeployedAt: typeof server.lastDeployedAt === "string" ? server.lastDeployedAt : draft.lastDeployedAt,
            lastUsedAt: typeof server.lastUsedAt === "string"
              ? server.lastUsedAt
              : typeof server.last_used_at === "string"
                ? server.last_used_at
                : "",
            template: typeof server.template === "string" && ["blank", "ai_chat_app"].includes(server.template) ? server.template : draft.template,
            templateAgentId: typeof server.templateAgentId === "string" ? server.templateAgentId : draft.templateAgentId,
            templateEnvironmentId: typeof server.templateEnvironmentId === "string" ? server.templateEnvironmentId : draft.templateEnvironmentId,
            templateDeploy: server.templateDeploy === true,
            databaseMode,
            databaseId,
            databaseName,
            databaseDescription,
            databaseLocation,
            metadata,
            createdAt: typeof server.createdAt === "string" && server.createdAt ? server.createdAt : draft.createdAt,
            updatedAt: typeof server.updatedAt === "string" && server.updatedAt ? server.updatedAt : draft.updatedAt,
          };
        }
  
        function stripPlaygroundServerVersionMetadata(metadata) {
          const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? { ...metadata }
            : {};
          delete source.serverVersions;
          delete source.server_versions;
          delete source.versions;
          delete source.activeServerVersionId;
          delete source.active_server_version_id;
          delete source.activeServerVersionNumber;
          delete source.active_server_version_number;
          delete source.restoredFromServerVersionId;
          delete source.restored_from_server_version_id;
          delete source.restoredFromServerVersionNumber;
          delete source.restored_from_server_version_number;
          delete source.publishedAt;
          delete source.published_at;
          delete source.unpublishedAt;
          delete source.unpublished_at;
          delete source.activeServerDeployment;
          delete source.active_server_deployment;
          return source;
        }
  
        function normalizePlaygroundServerVersionSourceFiles(value) {
          return (Array.isArray(value) ? value : [])
            .map((entry, index) => {
              const path = normalizeHistoryPath(entry?.path || entry?.name || "");
              if (!path) {
                return null;
              }
              return {
                id: String(entry?.id || path || ("source-" + index)).trim(),
                name: String(entry?.name || path.split("/").pop() || path).trim(),
                path,
                isFolder: Boolean(entry?.isFolder),
                size: Number.isFinite(Number(entry?.size)) ? Number(entry.size) : 0,
                type: String(entry?.type || entry?.mimeType || "").trim(),
                modifiedTime: String(entry?.modifiedTime || entry?.updatedAt || "").trim(),
              };
            })
            .filter(Boolean)
            .sort((left, right) => String(left.path || "").localeCompare(String(right.path || "")));
        }
  
        function normalizePlaygroundServerVersionSourceFileContents(value) {
          const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
          return Object.fromEntries(
            Object.entries(source)
              .map(([path, content]) => [normalizeHistoryPath(path), typeof content === "string" ? content : String(content ?? "")])
              .filter(([path]) => path)
              .sort(([left], [right]) => left.localeCompare(right))
          );
        }
  
        function normalizePlaygroundServerVersion(rawVersion, fallbackIndex = 0) {
          const version = rawVersion && typeof rawVersion === "object" && !Array.isArray(rawVersion) ? rawVersion : {};
          const snapshot = version.snapshot && typeof version.snapshot === "object" && !Array.isArray(version.snapshot)
            ? version.snapshot
            : {};
          const createdAt = String(version.createdAt || version.created_at || version.publishedAt || version.published_at || new Date().toISOString()).trim();
          const id = String(version.id || version.versionId || version.version_id || ("server_version_" + (fallbackIndex + 1))).trim();
          const versionNumber = normalizePlatformVersionNumber(
            version.version ?? version.versionNumber ?? version.version_number,
            fallbackIndex
          );
          const rawStatus = String(version.status || "").trim().toLowerCase();
          const status = rawStatus === "published"
            ? "active"
            : ["active", "saved", "superseded", "unpublished"].includes(rawStatus)
              ? rawStatus
              : "saved";
          const rawLifecycleState = String(version.lifecycleState || version.lifecycle_state || "").trim().toLowerCase();
          const lifecycleState = ["published", "saved", "draft", "deprecated", "unpublished", "archived"].includes(rawLifecycleState)
            ? rawLifecycleState
            : status === "active"
              ? "published"
              : status === "superseded"
                ? "deprecated"
                : status === "unpublished"
                  ? "unpublished"
                  : "saved";
          const normalizedKind = canonicalizePlaygroundServerKind(version.kind || snapshot.kind || "web_app");
          const normalizedSnapshot = {
            name: String(
              snapshot.name
              || version.resourceName
              || version.resource_name
              || ""
            ).trim(),
            description: typeof snapshot.description === "string"
              ? snapshot.description
              : typeof version.resourceDescription === "string"
                ? version.resourceDescription
                : typeof version.resource_description === "string"
                  ? version.resource_description
                : "",
            kind: normalizedKind,
            sourceType: ["manual", "computer", "git"].includes(snapshot.sourceType || version.sourceType) ? (snapshot.sourceType || version.sourceType) : "manual",
            sourceEnvironmentId: typeof snapshot.sourceEnvironmentId === "string" ? snapshot.sourceEnvironmentId : (typeof version.sourceEnvironmentId === "string" ? version.sourceEnvironmentId : ""),
            sourcePath: typeof snapshot.sourcePath === "string" ? snapshot.sourcePath : (typeof version.sourcePath === "string" ? version.sourcePath : ""),
            region: String(snapshot.region || version.region || "us-central1").trim() || "us-central1",
            runtime: String(version.runtime || snapshot.runtime || "nodejs22").trim() || "nodejs22",
            authMode: ["public", "private"].includes(snapshot.authMode || version.authMode) ? (snapshot.authMode || version.authMode) : "public",
            template: String(snapshot.template || version.template || "blank").trim() || "blank",
            templateAgentId: String(snapshot.templateAgentId || version.templateAgentId || "").trim(),
            templateEnvironmentId: String(snapshot.templateEnvironmentId || version.templateEnvironmentId || "").trim(),
            databaseMode: ["none", "existing", "create"].includes(snapshot.databaseMode || version.databaseMode) ? (snapshot.databaseMode || version.databaseMode) : "none",
            databaseId: String(snapshot.databaseId || version.databaseId || "").trim(),
            databaseName: String(snapshot.databaseName || version.databaseName || "").trim(),
            databaseDescription: typeof snapshot.databaseDescription === "string" ? snapshot.databaseDescription : "",
            databaseLocation: String(snapshot.databaseLocation || version.databaseLocation || "eur3").trim() || "eur3",
            customDomain: typeof snapshot.customDomain === "string" ? snapshot.customDomain : "",
            serviceUrl: typeof snapshot.serviceUrl === "string" ? snapshot.serviceUrl : "",
            cloudRunServiceName: typeof snapshot.cloudRunServiceName === "string" ? snapshot.cloudRunServiceName : "",
            imageUrl: typeof snapshot.imageUrl === "string" ? snapshot.imageUrl : "",
            lastDeployedAt: typeof snapshot.lastDeployedAt === "string" ? snapshot.lastDeployedAt : "",
            sourceFiles: normalizePlaygroundServerVersionSourceFiles(snapshot.sourceFiles || version.sourceFiles),
            sourceFileContents: normalizePlaygroundServerVersionSourceFileContents(snapshot.sourceFileContents || version.sourceFileContents),
            metadata: stripPlaygroundServerVersionMetadata(snapshot.metadata),
          };
  
          return {
            id,
            version: versionNumber,
            label: String(version.label || version.name || ("Version " + versionNumber)).trim(),
            description: String(version.description || version.summary || "").trim(),
            status,
            lifecycleState,
            lifecycle_state: lifecycleState,
            createdAt,
            created_at: createdAt,
            updatedAt: String(version.updatedAt || version.updated_at || "").trim(),
            updated_at: String(version.updatedAt || version.updated_at || "").trim(),
            publishedAt: String(version.publishedAt || version.published_at || "").trim(),
            published_at: String(version.publishedAt || version.published_at || "").trim(),
            unpublishedAt: String(version.unpublishedAt || version.unpublished_at || "").trim(),
            unpublished_at: String(version.unpublishedAt || version.unpublished_at || "").trim(),
            revisionId: String(version.revisionId || version.revision_id || "").trim(),
            revision_id: String(version.revisionId || version.revision_id || "").trim(),
            baseRevisionId: String(version.baseRevisionId || version.base_revision_id || "").trim(),
            base_revision_id: String(version.baseRevisionId || version.base_revision_id || "").trim(),
            revisionNumber: Number(version.revisionNumber || version.revision_number || versionNumber || 0) || versionNumber,
            revision_number: Number(version.revisionNumber || version.revision_number || versionNumber || 0) || versionNumber,
            createdBy: normalizePlaygroundVersionActor(version.createdBy || version.created_by),
            created_by: normalizePlaygroundVersionActor(version.createdBy || version.created_by),
            updatedBy: normalizePlaygroundVersionActor(version.updatedBy || version.updated_by),
            updated_by: normalizePlaygroundVersionActor(version.updatedBy || version.updated_by),
            publishedBy: normalizePlaygroundVersionActor(version.publishedBy || version.published_by),
            published_by: normalizePlaygroundVersionActor(version.publishedBy || version.published_by),
            unpublishedBy: normalizePlaygroundVersionActor(version.unpublishedBy || version.unpublished_by),
            unpublished_by: normalizePlaygroundVersionActor(version.unpublishedBy || version.unpublished_by),
            deploymentId: String(version.deploymentId || version.deployment_id || "").trim(),
            deployment_id: String(version.deploymentId || version.deployment_id || "").trim(),
            deploymentStatus: String(version.deploymentStatus || version.deployment_status || "").trim(),
            deployment_status: String(version.deploymentStatus || version.deployment_status || "").trim(),
            name: normalizedSnapshot.name,
            kind: normalizedSnapshot.kind,
            runtime: normalizedSnapshot.runtime,
            sourceFileCount: normalizedSnapshot.sourceFiles.filter((entry) => !entry.isFolder).length,
            snapshot: normalizedSnapshot,
          };
        }
  
        function normalizePlaygroundServerVersions(value) {
          const rawItems = Array.isArray(value) ? value : [];
          return rawItems
            .map((version, index) => normalizePlaygroundServerVersion(version, index))
            .filter((version) => version.id)
            .sort((a, b) => {
              const versionDelta = Number(b.version || 0) - Number(a.version || 0);
              if (versionDelta) return versionDelta;
              return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
            });
        }
  
        function readPlaygroundServerVersions(server) {
          const metadata = server?.metadata && typeof server.metadata === "object" && !Array.isArray(server.metadata)
            ? server.metadata
            : {};
          return normalizePlaygroundServerVersions(
            server?.serverVersions
            || server?.versions
            || metadata.serverVersions
            || metadata.server_versions
            || metadata.versions
            || []
          );
        }
  
        function createPlaygroundServerVersionId() {
          return "server_version_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }
  
        function createPlaygroundServerVersionRevisionId() {
          return "server_revision_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }
  
        function createPlaygroundServerDeploymentId(versionId = "") {
          const normalizedVersionId = String(versionId || "").trim();
          return "server_deployment_" + (normalizedVersionId || (Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8)));
        }
  
        function buildPlaygroundServerVersionSnapshot(server, options = {}) {
          const normalizedServer = normalizePlaygroundServerRecord(server || buildPlaygroundDefaultServerDraft());
          const sourceFileContents = normalizePlaygroundServerVersionSourceFileContents(options.sourceFileContents || {});
          const sourceFiles = normalizePlaygroundServerVersionSourceFiles(options.sourceFiles || []);
          return {
            name: String(normalizedServer.name || "").trim() || "Untitled Server",
            description: typeof normalizedServer.description === "string" ? normalizedServer.description : "",
            kind: canonicalizePlaygroundServerKind(normalizedServer.kind),
            sourceType: normalizedServer.sourceType || "manual",
            sourceEnvironmentId: normalizedServer.sourceEnvironmentId || "",
            sourcePath: normalizedServer.sourcePath || "",
            region: normalizedServer.region || "us-central1",
            runtime: normalizedServer.runtime || "nodejs22",
            authMode: normalizedServer.authMode || "public",
            template: normalizedServer.template || "blank",
            templateAgentId: normalizedServer.templateAgentId || "",
            templateEnvironmentId: normalizedServer.templateEnvironmentId || "",
            databaseMode: normalizedServer.databaseMode || "none",
            databaseId: normalizedServer.databaseId || "",
            databaseName: normalizedServer.databaseName || "",
            databaseDescription: typeof normalizedServer.databaseDescription === "string" ? normalizedServer.databaseDescription : "",
            databaseLocation: normalizedServer.databaseLocation || "eur3",
            customDomain: typeof normalizedServer.customDomain === "string" ? normalizedServer.customDomain : "",
            serviceUrl: typeof normalizedServer.serviceUrl === "string" ? normalizedServer.serviceUrl : "",
            cloudRunServiceName: typeof normalizedServer.cloudRunServiceName === "string" ? normalizedServer.cloudRunServiceName : "",
            imageUrl: typeof normalizedServer.imageUrl === "string" ? normalizedServer.imageUrl : "",
            lastDeployedAt: typeof normalizedServer.lastDeployedAt === "string" ? normalizedServer.lastDeployedAt : "",
            sourceFiles,
            sourceFileContents,
            metadata: stripPlaygroundServerVersionMetadata(buildPlaygroundServerMetadata(normalizedServer)),
          };
        }
  
        function createPlaygroundServerVersion(server, existingVersions = [], options = {}) {
          const now = new Date().toISOString();
          const normalizedExisting = normalizePlaygroundServerVersions(existingVersions);
          const nextVersion = normalizedExisting.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
          const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
          const status = requestedStatus === "active" ? "active" : "saved";
          const snapshot = options?.snapshot && typeof options.snapshot === "object" && !Array.isArray(options.snapshot)
            ? normalizePlaygroundServerVersion({ snapshot: options.snapshot }).snapshot
            : buildPlaygroundServerVersionSnapshot(server, options);
          const actor = normalizePlaygroundVersionActor(options?.actor);
          const revisionId = createPlaygroundServerVersionRevisionId();
          const versionId = createPlaygroundServerVersionId();
          const deploymentId = status === "active" ? createPlaygroundServerDeploymentId(versionId) : "";
          return normalizePlaygroundServerVersion({
            id: versionId,
            version: nextVersion,
            label: String(options?.label || ("Version " + nextVersion)).trim(),
            description: String(options?.description || "").trim(),
            status,
            lifecycleState: status === "active" ? "published" : "saved",
            lifecycle_state: status === "active" ? "published" : "saved",
            createdAt: now,
            created_at: now,
            updatedAt: now,
            updated_at: now,
            createdBy: actor,
            created_by: actor,
            updatedBy: actor,
            updated_by: actor,
            publishedAt: status === "active" ? now : "",
            published_at: status === "active" ? now : "",
            publishedBy: status === "active" ? actor : null,
            published_by: status === "active" ? actor : null,
            revisionId,
            revision_id: revisionId,
            revisionNumber: nextVersion,
            revision_number: nextVersion,
            deploymentId,
            deployment_id: deploymentId,
            deploymentStatus: status === "active" ? "published" : "",
            deployment_status: status === "active" ? "published" : "",
            name: snapshot.name,
            kind: snapshot.kind,
            runtime: snapshot.runtime,
            sourceFiles: snapshot.sourceFiles,
            sourceFileContents: snapshot.sourceFileContents,
            snapshot,
          }, nextVersion - 1);
        }
  
        function createPlaygroundServerWithVersionList(server, versions, preferredSelectedId = "") {
          const baseServer = normalizePlaygroundServerRecord(server || buildPlaygroundDefaultServerDraft());
          const normalizedVersions = normalizePlaygroundServerVersions(versions);
          const metadata = baseServer.metadata && typeof baseServer.metadata === "object" && !Array.isArray(baseServer.metadata)
            ? { ...baseServer.metadata }
            : {};
          const previousSelectedId = String(
            metadata.restoredFromServerVersionId
            || metadata.restored_from_server_version_id
            || metadata.activeServerVersionId
            || metadata.active_server_version_id
            || ""
          ).trim();
          const selectedVersion = normalizedVersions.find((version) => version.id === String(preferredSelectedId || "").trim())
            || normalizedVersions.find((version) => version.id === previousSelectedId)
            || normalizedVersions.find((version) => version.status === "active")
            || normalizedVersions[0]
            || null;
          const activeVersion = normalizedVersions.find((version) => version.status === "active")
            || normalizedVersions.find((version) => version.id === String(metadata.activeServerVersionId || metadata.active_server_version_id || "").trim())
            || null;
          metadata.serverVersions = normalizedVersions;
          metadata.server_versions = normalizedVersions;
          metadata.activeServerVersionId = activeVersion?.id || "";
          metadata.active_server_version_id = activeVersion?.id || "";
          metadata.activeServerVersionNumber = activeVersion?.version || 0;
          metadata.active_server_version_number = activeVersion?.version || 0;
          metadata.restoredFromServerVersionId = selectedVersion?.id || "";
          metadata.restored_from_server_version_id = selectedVersion?.id || "";
          metadata.restoredFromServerVersionNumber = selectedVersion?.version || 0;
          metadata.restored_from_server_version_number = selectedVersion?.version || 0;
          if (activeVersion?.publishedAt) {
            metadata.publishedAt = activeVersion.publishedAt;
            metadata.published_at = activeVersion.publishedAt;
            metadata.activeServerDeployment = {
              id: activeVersion.deploymentId || activeVersion.deployment_id || createPlaygroundServerDeploymentId(activeVersion.id),
              versionId: activeVersion.id,
              version: activeVersion.version,
              status: "published",
              publishedAt: activeVersion.publishedAt,
              publishedBy: activeVersion.publishedBy || activeVersion.published_by || null,
            };
            metadata.active_server_deployment = metadata.activeServerDeployment;
          } else {
            delete metadata.publishedAt;
            delete metadata.published_at;
            delete metadata.activeServerDeployment;
            delete metadata.active_server_deployment;
          }
          return normalizePlaygroundServerRecord({
            ...baseServer,
            metadata,
            publishedAt: activeVersion?.publishedAt || "",
          });
        }
  
        function createPlaygroundServerFromVersionSnapshot(server, version, versions, preferredSelectedId = "") {
          const baseServer = normalizePlaygroundServerRecord(server || buildPlaygroundDefaultServerDraft());
          const normalizedVersion = normalizePlaygroundServerVersion(version || {});
          const snapshot = normalizedVersion.snapshot || {};
          const baseMetadata = stripPlaygroundServerVersionMetadata(baseServer.metadata);
          const snapshotMetadata = stripPlaygroundServerVersionMetadata(snapshot.metadata);
          const nextServer = normalizePlaygroundServerRecord({
            ...baseServer,
            name: snapshot.name || baseServer.name,
            description: typeof snapshot.description === "string" ? snapshot.description : baseServer.description,
            kind: snapshot.kind || baseServer.kind,
            sourceType: snapshot.sourceType || baseServer.sourceType,
            sourceEnvironmentId: snapshot.sourceEnvironmentId || baseServer.sourceEnvironmentId,
            sourcePath: typeof snapshot.sourcePath === "string" ? snapshot.sourcePath : baseServer.sourcePath,
            region: snapshot.region || baseServer.region,
            runtime: snapshot.runtime || baseServer.runtime,
            authMode: snapshot.authMode || baseServer.authMode,
            template: snapshot.template || baseServer.template,
            templateAgentId: typeof snapshot.templateAgentId === "string" ? snapshot.templateAgentId : baseServer.templateAgentId,
            templateEnvironmentId: typeof snapshot.templateEnvironmentId === "string" ? snapshot.templateEnvironmentId : baseServer.templateEnvironmentId,
            databaseMode: snapshot.databaseMode || baseServer.databaseMode,
            databaseId: typeof snapshot.databaseId === "string" ? snapshot.databaseId : baseServer.databaseId,
            databaseName: typeof snapshot.databaseName === "string" ? snapshot.databaseName : baseServer.databaseName,
            databaseDescription: typeof snapshot.databaseDescription === "string" ? snapshot.databaseDescription : baseServer.databaseDescription,
            databaseLocation: snapshot.databaseLocation || baseServer.databaseLocation,
            customDomain: typeof snapshot.customDomain === "string" ? snapshot.customDomain : baseServer.customDomain,
            serviceUrl: typeof snapshot.serviceUrl === "string" ? snapshot.serviceUrl : baseServer.serviceUrl,
            cloudRunServiceName: typeof snapshot.cloudRunServiceName === "string" ? snapshot.cloudRunServiceName : baseServer.cloudRunServiceName,
            imageUrl: typeof snapshot.imageUrl === "string" ? snapshot.imageUrl : baseServer.imageUrl,
            lastDeployedAt: typeof snapshot.lastDeployedAt === "string" ? snapshot.lastDeployedAt : baseServer.lastDeployedAt,
            metadata: {
              ...baseMetadata,
              ...snapshotMetadata,
            },
          });
          return createPlaygroundServerWithVersionList(nextServer, versions, preferredSelectedId || normalizedVersion.id);
        }
  
        function getPlaygroundPaymentsMetadata(server) {
          const normalized = normalizePlaygroundServerRecord(server);
          const metadata = normalized?.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
            ? normalized.metadata
            : null;
          const payments = metadata?.payments && typeof metadata.payments === "object" && !Array.isArray(metadata.payments)
            ? metadata.payments
            : null;
          return payments || {};
        }
  
        function formatPlaygroundPaymentMoney(cents, currency = "usd") {
          const normalizedCurrency = String(currency || "usd").trim().toUpperCase() || "USD";
          const amount = Math.max(0, Number(cents || 0)) / 100;
          try {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: normalizedCurrency,
              maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
            }).format(amount);
          } catch {
            return "$" + amount.toFixed(amount % 1 === 0 ? 0 : 2);
          }
        }
  
        function formatPlaygroundPaymentsStatus(metadata) {
          const status = String(metadata?.onboardingStatus || "").trim().toLowerCase();
          if (status === "active" || (metadata?.chargesEnabled && metadata?.payoutsEnabled)) {
            return "Active";
          }
          if (status === "review") {
            return "In review";
          }
          if (status === "restricted") {
            return "Restricted";
          }
          if (metadata?.detailsSubmitted) {
            return "In review";
          }
          if (metadata?.stripeAccountId) {
            return "Setup incomplete";
          }
          return "Not connected";
        }
  
        function getPlaygroundServerDatabaseBinding(server) {
          const normalized = normalizePlaygroundServerRecord(server);
          return {
            mode: ["none", "existing", "create"].includes(normalized.databaseMode) ? normalized.databaseMode : "none",
            id: String(normalized.databaseId || "").trim(),
            name: String(normalized.databaseName || "").trim(),
            description: typeof normalized.databaseDescription === "string" ? normalized.databaseDescription : "",
            location: String(normalized.databaseLocation || "").trim() || "eur3",
          };
        }
  
        function getPlaygroundServerAgentRuntimeConfig(server) {
          const normalized = normalizePlaygroundServerRecord(server);
          const metadata = normalized?.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
            ? normalized.metadata
            : null;
          const agentRuntime = metadata?.agentRuntime && typeof metadata.agentRuntime === "object" && !Array.isArray(metadata.agentRuntime)
            ? metadata.agentRuntime
            : null;
          const skillPolicy = agentRuntime?.skills && typeof agentRuntime.skills === "object" && !Array.isArray(agentRuntime.skills)
            ? agentRuntime.skills
            : null;
          return {
            agentId: typeof agentRuntime?.agentId === "string" ? agentRuntime.agentId : "",
            executionMode: agentRuntime?.executionMode === "sync" ? "sync" : "async",
            streamingEnabled: agentRuntime?.streamingEnabled !== false,
            maxRuntimeSeconds: Number.isFinite(Number(agentRuntime?.maxRuntimeSeconds)) ? Math.max(30, Number(agentRuntime.maxRuntimeSeconds)) : 1800,
            skillsMode: skillPolicy?.mode === "override" ? "override" : "inherit",
            enabledSkills: normalizePlaygroundEnabledSkillIds(skillPolicy?.enabledSkills),
          };
        }
  
        function normalizePlaygroundServerCustomDomainState(domainState, fallbackDomain) {
          const primary = domainState && typeof domainState === "object" && !Array.isArray(domainState)
            ? domainState
            : null;
          const domain = String(primary?.domain || fallbackDomain || "").trim();
          if (!domain) {
            return null;
          }
          return {
            domain,
            provider: String(primary?.provider || "firebase_hosting"),
            status: String(primary?.status || "pending"),
            url: typeof primary?.url === "string" ? primary.url : "",
            records: Array.isArray(primary?.records) ? primary.records : [],
            conditions: Array.isArray(primary?.conditions) ? primary.conditions : [],
            verification: primary?.verification && typeof primary.verification === "object" && !Array.isArray(primary.verification) ? primary.verification : null,
            siteId: typeof primary?.siteId === "string"
              ? primary.siteId
              : typeof primary?.hosting?.siteId === "string"
                ? primary.hosting.siteId
                : "",
            hostState: typeof primary?.hostState === "string" ? primary.hostState : "",
            ownershipState: typeof primary?.ownershipState === "string" ? primary.ownershipState : "",
            certState: typeof primary?.certState === "string" ? primary.certState : "",
            lastCheckedAt: typeof primary?.lastCheckedAt === "string" ? primary.lastCheckedAt : "",
          };
        }
  
        function getPlaygroundServerCustomDomainStates(server) {
          const normalized = normalizePlaygroundServerRecord(server);
          const metadata = normalized?.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
            ? normalized.metadata
            : null;
          const domains = metadata?.customDomains && typeof metadata.customDomains === "object" && !Array.isArray(metadata.customDomains)
            ? Object.values(metadata.customDomains)
            : [];
          const primary = metadata?.customDomain && typeof metadata.customDomain === "object" && !Array.isArray(metadata.customDomain)
            ? metadata.customDomain
            : null;
          const states = [];
          const seen = new Set();
          [primary, ...domains].forEach((item) => {
            const normalizedState = normalizePlaygroundServerCustomDomainState(item, normalized.customDomain);
            if (!normalizedState || seen.has(normalizedState.domain)) {
              return;
            }
            seen.add(normalizedState.domain);
            states.push(normalizedState);
          });
          return states.sort((left, right) => {
            const leftTime = Date.parse(left.lastCheckedAt || "") || 0;
            const rightTime = Date.parse(right.lastCheckedAt || "") || 0;
            return rightTime - leftTime;
          });
        }
  
        function getPlaygroundServerCustomDomainState(server) {
          return getPlaygroundServerCustomDomainStates(server)[0] || null;
        }
  
        function formatPlaygroundCustomDomainStatus(value) {
          const status = String(value || "").trim();
          if (status === "connected") return "Connected";
          if (status === "verification_required") return "Verify domain";
          if (status === "needs_setup") return "Needs setup";
          if (status === "pending_dns") return "Pending DNS";
          return "Pending";
        }
  
        function buildPlaygroundServerMetadata(server) {
          const normalized = normalizePlaygroundServerRecord(server);
          const currentMetadata = normalized.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
            ? { ...normalized.metadata }
            : {};
          const currentRunnerPlayground = currentMetadata.runnerPlayground && typeof currentMetadata.runnerPlayground === "object" && !Array.isArray(currentMetadata.runnerPlayground)
            ? { ...currentMetadata.runnerPlayground }
            : {};
          const databaseBinding = getPlaygroundServerDatabaseBinding(normalized);
  
          if (databaseBinding.id) {
            currentRunnerPlayground.database = {
              id: databaseBinding.id,
              name: databaseBinding.name || "",
              description: databaseBinding.description || "",
              location: databaseBinding.location || "eur3",
            };
          } else {
            delete currentRunnerPlayground.database;
          }
  
          if (Object.keys(currentRunnerPlayground).length > 0) {
            currentMetadata.runnerPlayground = currentRunnerPlayground;
          } else {
            delete currentMetadata.runnerPlayground;
          }
  
          return Object.keys(currentMetadata).length > 0 ? currentMetadata : null;
        }
  
        function buildPlaygroundServerWithLinkedDatabase(server, database, mode = "existing") {
          const normalizedServer = normalizePlaygroundServerRecord(server);
          const normalizedDatabase = normalizePlaygroundDatabaseRecord(database);
          return normalizePlaygroundServerRecord({
            ...normalizedServer,
            databaseMode: mode === "create" ? "create" : "existing",
            databaseId: normalizedDatabase.id || "",
            databaseName: normalizedDatabase.name || "",
            databaseDescription: normalizedDatabase.description || "",
            databaseLocation: normalizedDatabase.location || "eur3",
          });
        }
  
        function clearPlaygroundServerDatabaseBinding(server) {
          const normalizedServer = normalizePlaygroundServerRecord(server);
          return normalizePlaygroundServerRecord({
            ...normalizedServer,
            databaseMode: "none",
            databaseId: "",
            databaseName: "",
            databaseDescription: "",
            databaseLocation: normalizedServer.databaseLocation || "eur3",
          });
        }
  
        function parsePlaygroundServerListResponse(data) {
          const items = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.servers)
              ? data.servers
              : Array.isArray(data?.items)
                ? data.items
                : [];
          return items.map(normalizePlaygroundServerRecord);
        }
  
        function getPlaygroundServerResponseRecord(data) {
          const source = data?.server || data?.data || data;
          return source && typeof source === "object" && typeof source.id === "string"
            ? normalizePlaygroundServerRecord(source)
            : null;
        }
  
        function normalizePlaygroundDatabaseRecord(database) {
          if (!database || typeof database !== "object") {
            return buildPlaygroundDefaultDatabaseDraft();
          }
  
          const draft = buildPlaygroundDefaultDatabaseDraft();
          const metadata = database?.metadata && typeof database.metadata === "object" && !Array.isArray(database.metadata)
            ? database.metadata
            : null;
          const permissionSetSource = database?.permissionSet && typeof database.permissionSet === "object" && !Array.isArray(database.permissionSet)
            ? database.permissionSet
            : metadata?.permissionSet && typeof metadata.permissionSet === "object" && !Array.isArray(metadata.permissionSet)
              ? metadata.permissionSet
              : metadata?.permission_set && typeof metadata.permission_set === "object" && !Array.isArray(metadata.permission_set)
                ? metadata.permission_set
                : null;
  
          return {
            ...draft,
            id: typeof database.id === "string" ? database.id : draft.id,
            userId: typeof database.userId === "string" ? database.userId : draft.userId,
            projectId: typeof database.projectId === "string" && database.projectId.trim() ? database.projectId.trim() : null,
            name: typeof database.name === "string" && database.name.trim() ? database.name : draft.name,
            description: typeof database.description === "string" ? database.description : draft.description,
            provider: "firestore",
            location: typeof database.location === "string" && database.location.trim() ? database.location.trim() : draft.location,
            status: ["active", "provisioning", "error"].includes(database.status) ? database.status : draft.status,
            firestoreNamespace: typeof database.firestoreNamespace === "string" ? database.firestoreNamespace : draft.firestoreNamespace,
            permissionSet: normalizePlaygroundPermissionSet(permissionSetSource, "database"),
            metadata,
            createdAt: typeof database.createdAt === "string" && database.createdAt ? database.createdAt : draft.createdAt,
            updatedAt: typeof database.updatedAt === "string" && database.updatedAt ? database.updatedAt : draft.updatedAt,
          };
        }
  
        function parsePlaygroundDatabaseListResponse(data) {
          const items = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.databases)
              ? data.databases
              : Array.isArray(data?.items)
                ? data.items
                : [];
          return items.map(normalizePlaygroundDatabaseRecord);
        }
  
        const PLAYGROUND_DATABASE_LIST_CACHE_TTL_MS = 30_000;
        const PLAYGROUND_DATABASE_LIST_STORAGE_PREFIX = "runner-playground:database-list:";
        const playgroundDatabaseListCache = new Map();
        const PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS = 60_000;
        const PLAYGROUND_DATABASE_DETAIL_CACHE_TTL_MS = 30_000;
        const PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS = 300_000;
        const PLAYGROUND_DATABASE_DOCUMENTS_CACHE_TTL_MS = 10_000;
        const PLAYGROUND_DATABASE_RESOURCE_STORAGE_PREFIX = "runner-playground:database-resource:";
        const playgroundDatabaseResourceRequestCache = new Map();
  
        function getPlaygroundRequestHeaderValue(headers, names) {
          const normalizedNames = (Array.isArray(names) ? names : [names]).map((name) => String(name || "").toLowerCase());
          try {
            const normalizedHeaders = new Headers(headers || {});
            for (const name of normalizedNames) {
              const value = String(normalizedHeaders.get(name) || "").trim();
              if (value) return value;
            }
          } catch {}
          return "";
        }
  
        function hashPlaygroundDatabaseListScope(value) {
          let hash = 2166136261;
          const source = String(value || "");
          for (let index = 0; index < source.length; index += 1) {
            hash ^= source.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return (hash >>> 0).toString(36);
        }
  
        function buildPlaygroundDatabaseListScopeKey(backendUrl, headers, identity = "") {
          const organizationId = getPlaygroundRequestHeaderValue(headers, [
            "x-organization-id",
            "x-organization",
            "organization-id",
          ]);
          const authenticationIdentity = String(identity || "").trim()
            || getPlaygroundRequestHeaderValue(headers, "x-api-key")
            || "session";
          return String(backendUrl || "").replace(new RegExp("/+$"), "")
            + "|" + organizationId
            + "|" + hashPlaygroundDatabaseListScope(authenticationIdentity);
        }
  
        async function fetchPlaygroundCachedDatabaseResourceJson(url, headers, options = {}) {
          const normalizedUrl = String(url || "").trim();
          if (!normalizedUrl) {
            throw new Error("Database request URL is required.");
          }
          const scopeKey = String(options?.scopeKey || "database").trim();
          const cacheKey = scopeKey + "|" + normalizedUrl;
          const ttlMs = Math.max(0, Number(options?.ttlMs || 0));
          const force = options?.force === true;
          let cachedRecord = playgroundDatabaseResourceRequestCache.get(cacheKey);
          if (!cachedRecord && options?.persist === true) {
            try {
              const storageKey = PLAYGROUND_DATABASE_RESOURCE_STORAGE_PREFIX + hashPlaygroundDatabaseListScope(cacheKey);
              const storedRecord = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
              if (storedRecord?.cacheKey === cacheKey && storedRecord?.data) {
                cachedRecord = {
                  data: storedRecord.data,
                  loadedAt: Math.max(0, Number(storedRecord.loadedAt || 0)),
                  promise: null,
                };
                playgroundDatabaseResourceRequestCache.set(cacheKey, cachedRecord);
              }
            } catch {}
          }
          if (cachedRecord?.promise) {
            if (!force && options?.staleWhileRevalidate === true && cachedRecord?.data) {
              return cachedRecord.data;
            }
            if (!force) {
              return cachedRecord.promise;
            }
            try {
              await cachedRecord.promise;
            } catch {}
            cachedRecord = playgroundDatabaseResourceRequestCache.get(cacheKey);
          }
          const cacheAgeMs = cachedRecord ? Date.now() - Number(cachedRecord.loadedAt || 0) : Infinity;
          if (!force && cachedRecord?.data && cacheAgeMs >= 0 && cacheAgeMs < ttlMs) {
            return cachedRecord.data;
          }
          const shouldReturnStale = !force && options?.staleWhileRevalidate === true && Boolean(cachedRecord?.data);
  
          const request = (async () => {
            const response = await fetch(normalizedUrl, {
              method: "GET",
              headers,
              cache: "no-store",
              signal: options?.signal,
              priority: options?.priority || "auto",
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load database data.");
            }
            playgroundDatabaseResourceRequestCache.set(cacheKey, {
              data,
              loadedAt: Date.now(),
              promise: null,
            });
            if (options?.persist === true) {
              try {
                const storageKey = PLAYGROUND_DATABASE_RESOURCE_STORAGE_PREFIX + hashPlaygroundDatabaseListScope(cacheKey);
                window.sessionStorage.setItem(storageKey, JSON.stringify({
                  cacheKey,
                  data,
                  loadedAt: Date.now(),
                }));
              } catch {}
            }
            return data;
          })();
          playgroundDatabaseResourceRequestCache.set(cacheKey, {
            data: cachedRecord?.data || null,
            loadedAt: Number(cachedRecord?.loadedAt || 0),
            promise: request,
          });
          void request.finally(() => {
            const currentRecord = playgroundDatabaseResourceRequestCache.get(cacheKey);
            if (currentRecord?.promise === request) {
              playgroundDatabaseResourceRequestCache.set(cacheKey, {
                data: currentRecord.data || null,
                loadedAt: Number(currentRecord.loadedAt || 0),
                promise: null,
              });
            }
          }).catch(() => {});
          if (shouldReturnStale) {
            return cachedRecord.data;
          }
          return request;
        }
  
        function readPlaygroundDatabaseListCache(scopeKey) {
          const memoryRecord = playgroundDatabaseListCache.get(scopeKey);
          if (memoryRecord && Array.isArray(memoryRecord.items)) {
            return memoryRecord;
          }
          try {
            const storageKey = PLAYGROUND_DATABASE_LIST_STORAGE_PREFIX + hashPlaygroundDatabaseListScope(scopeKey);
            const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
            if (parsed?.scopeKey !== scopeKey || !Array.isArray(parsed?.items)) {
              return null;
            }
            const record = {
              items: parsed.items.map(normalizePlaygroundDatabaseRecord),
              loadedAt: Math.max(0, Number(parsed.loadedAt || 0)),
              promise: null,
            };
            playgroundDatabaseListCache.set(scopeKey, record);
            return record;
          } catch {
            return null;
          }
        }
  
        function writePlaygroundDatabaseListCache(scopeKey, items, loadedAt = Date.now()) {
          const normalizedItems = (Array.isArray(items) ? items : []).map(normalizePlaygroundDatabaseRecord);
          const existingRecord = playgroundDatabaseListCache.get(scopeKey);
          const record = {
            items: normalizedItems,
            loadedAt,
            promise: existingRecord?.promise || null,
          };
          playgroundDatabaseListCache.set(scopeKey, record);
          try {
            const storageKey = PLAYGROUND_DATABASE_LIST_STORAGE_PREFIX + hashPlaygroundDatabaseListScope(scopeKey);
            window.sessionStorage.setItem(storageKey, JSON.stringify({
              scopeKey,
              items: normalizedItems,
              loadedAt,
            }));
          } catch {}
          return record;
        }
  
        async function fetchPlaygroundDatabaseList(backendUrl, headers, options = {}) {
          const scopeKey = buildPlaygroundDatabaseListScopeKey(backendUrl, headers, options?.identity);
          const cachedRecord = readPlaygroundDatabaseListCache(scopeKey);
          if (cachedRecord?.promise) {
            return cachedRecord.promise;
          }
          const cacheAgeMs = cachedRecord ? Date.now() - Number(cachedRecord.loadedAt || 0) : Infinity;
          if (options?.force !== true && cachedRecord && cacheAgeMs >= 0 && cacheAgeMs < PLAYGROUND_DATABASE_LIST_CACHE_TTL_MS) {
            return cachedRecord.items;
          }
  
          const request = (async () => {
            const response = await fetch(String(backendUrl || "").replace(new RegExp("/+$"), "") + "/databases", {
              method: "GET",
              headers,
              cache: "no-store",
              signal: options?.signal,
              priority: options?.priority || "auto",
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load databases.");
            }
            const items = parsePlaygroundDatabaseListResponse(data);
            writePlaygroundDatabaseListCache(scopeKey, items);
            return items;
          })();
  
          playgroundDatabaseListCache.set(scopeKey, {
            items: cachedRecord?.items || [],
            loadedAt: Number(cachedRecord?.loadedAt || 0),
            promise: request,
          });
          void request.finally(() => {
            const currentRecord = playgroundDatabaseListCache.get(scopeKey);
            if (currentRecord?.promise === request) {
              playgroundDatabaseListCache.set(scopeKey, {
                ...currentRecord,
                promise: null,
              });
            }
          }).catch(() => {});
          return request;
        }
  
        function getPlaygroundDatabaseResponseRecord(data) {
          const source = data?.database || data?.data || data;
          return source && typeof source === "object" && typeof source.id === "string"
            ? normalizePlaygroundDatabaseRecord(source)
            : null;
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_095__      function normalizePlaygroundAgentRecord(agent) {
          if (!agent || typeof agent !== "object") {
            return buildPlaygroundDefaultAgentDraft();
          }
  
          const draft = buildPlaygroundDefaultAgentDraft();
          const teamMetadata = getPlaygroundAgentTeamMetadata(agent.metadata);
          const id = typeof agent.id === "string" && agent.id.trim() ? agent.id.trim() : draft.id;
          const isDefaultByPattern = id.startsWith("agent-default-")
            || id.startsWith("agent-research-")
            || id.startsWith("agent-assistant-")
            || id.startsWith("agent-computer-use-");
          const enabledSkills = Array.isArray(agent.enabledSkills)
            ? agent.enabledSkills.map((value) => String(value || "").trim()).filter(Boolean)
            : [];
          const guardrailSetIds = getPlaygroundAgentGuardrailSetIds(agent);
          const guardrails = getPlaygroundAgentGuardrailSnapshots(agent);
          const metadata = agent.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
            ? agent.metadata
            : {};
          const promptAdaptations = normalizePlaygroundPromptAdaptations(
            agent.promptAdaptations
            || agent.promptAdaptions
            || agent.invisiblePromptAdaptations
            || agent.invisiblePromptAdaptions
            || metadata.promptAdaptations
            || metadata.prompt_adaptations
            || metadata.promptAdaptions
            || metadata.prompt_adaptions
            || metadata.invisiblePromptAdaptations
            || metadata.invisible_prompt_adaptations
            || metadata.invisiblePromptAdaptions
            || metadata.invisible_prompt_adaptions
          );
          const deepResearchModel = PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.some((option) => option.id === agent.deepResearchModel)
            ? agent.deepResearchModel
            : draft.deepResearchModel;
          const reasoningEffort = ["minimal", "low", "medium", "high"].includes(agent.reasoningEffort)
            ? agent.reasoningEffort
            : draft.reasoningEffort;
          const voiceMode = normalizePlaygroundVoiceAgentMode(agent.voiceMode);
          const voiceModel = PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS.some((option) => option.id === agent.voiceModel)
            ? agent.voiceModel
            : draft.voiceModel;
  
          return {
            ...draft,
            ...agent,
            id,
            name: typeof agent.name === "string" ? agent.name : draft.name,
            description: typeof agent.description === "string" ? agent.description : draft.description,
            model: getPlaygroundAgentModelMeta(typeof agent.model === "string" ? agent.model : "").id,
            instructions: typeof agent.instructions === "string" ? agent.instructions : draft.instructions,
            binary: typeof agent.binary === "string" && agent.binary.trim() ? agent.binary : draft.binary,
            reasoningEffort,
            enabledSkills,
            guardrailSetIds,
            guardrails,
            promptAdaptations,
            invisiblePromptAdaptations: promptAdaptations,
            deepResearchModel,
            voiceMode,
            voiceProvider: "xai",
            voiceModel,
            voiceId: typeof agent.voiceId === "string" && agent.voiceId.trim() ? agent.voiceId.trim() : draft.voiceId,
            voiceInstructions: typeof agent.voiceInstructions === "string" ? agent.voiceInstructions : draft.voiceInstructions,
            voiceLanguageHint: typeof agent.voiceLanguageHint === "string" ? agent.voiceLanguageHint : draft.voiceLanguageHint,
            voiceTurnDetection: agent.voiceTurnDetection && typeof agent.voiceTurnDetection === "object" && !Array.isArray(agent.voiceTurnDetection)
              ? agent.voiceTurnDetection
              : null,
            voicePronunciationReplacements: agent.voicePronunciationReplacements && typeof agent.voicePronunciationReplacements === "object" && !Array.isArray(agent.voicePronunciationReplacements)
              ? agent.voicePronunciationReplacements
              : null,
            agentType: teamMetadata ? "team" : "single",
            teamOrchestratorAgentId: teamMetadata?.team?.orchestratorAgentId || "",
            teamSubagentIds: teamMetadata?.team?.subagentIds || [],
            teamExecutionMode: teamMetadata?.executionMode || PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
            createdAt: typeof agent.createdAt === "string" && agent.createdAt ? agent.createdAt : draft.createdAt,
            updatedAt: typeof agent.updatedAt === "string" && agent.updatedAt ? agent.updatedAt : draft.updatedAt,
            lastRunAt: typeof agent.lastRunAt === "string" ? agent.lastRunAt : draft.lastRunAt,
            isActive: agent.isActive !== false,
            isDefault: Boolean(agent.isDefault) || isDefaultByPattern,
            isSystem: Boolean(agent.isSystem) || isDefaultByPattern,
            permissionSet: normalizePlaygroundPermissionSet(agent.permissionSet, "agent"),
            metadata: Object.keys(metadata).length > 0
              ? metadata
              : null,
          };
        }
  
        function stripPlaygroundAgentVersionMetadata(metadata) {
          const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? { ...metadata }
            : {};
          delete source.agentVersions;
          delete source.agent_versions;
          delete source.versions;
          delete source.activeAgentVersionId;
          delete source.active_agent_version_id;
          delete source.activeAgentVersionNumber;
          delete source.active_agent_version_number;
          delete source.restoredFromAgentVersionId;
          delete source.restored_from_agent_version_id;
          delete source.restoredFromAgentVersionNumber;
          delete source.restored_from_agent_version_number;
          delete source.publishedAt;
          delete source.published_at;
          delete source.unpublishedAt;
          delete source.unpublished_at;
          delete source.runnerVersioning;
          delete source.runner_versioning;
          delete source.versioning;
          delete source.activeAgentDeployment;
          delete source.active_agent_deployment;
          return source;
        }
  
        function createPlaygroundAgentVersionRevisionId() {
          return "agent_revision_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }
  
        function createPlaygroundAgentDeploymentId(versionId = "") {
          const suffix = String(versionId || "").trim() || (Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8));
          return "agent_deployment_" + suffix.replace(/[^A-Za-z0-9_-]+/g, "_");
        }
  
        function normalizePlaygroundVersionActor(actor) {
          const source = actor && typeof actor === "object" && !Array.isArray(actor) ? actor : {};
          const id = String(source.id || source.userId || source.user_id || source.uid || source.email || "").trim();
          const name = String(source.name || source.displayName || source.display_name || source.fullName || source.full_name || source.email || "").trim();
          const email = String(source.email || source.emailAddress || source.email_address || "").trim().toLowerCase();
          const avatarUrl = String(source.avatarUrl || source.avatar_url || source.photoURL || source.photoUrl || source.photo_url || source.picture || "").trim();
          if (!id && !name && !email && !avatarUrl) {
            return null;
          }
          return {
            id,
            name,
            email,
            avatarUrl,
          };
        }
  
        function normalizePlaygroundAgentVersionLifecycleState(version, status = "") {
          const rawState = String(
            version?.lifecycleState
            || version?.lifecycle_state
            || version?.state
            || ""
          ).trim().toLowerCase();
          if (["draft", "saved", "published", "deprecated", "archived", "unpublished"].includes(rawState)) {
            return rawState;
          }
          const normalizedStatus = String(status || version?.status || "").trim().toLowerCase();
          if (normalizedStatus === "active") return "published";
          if (normalizedStatus === "superseded") return "deprecated";
          if (normalizedStatus === "unpublished") return "unpublished";
          return "saved";
        }
  
        function normalizePlaygroundAgentVersionDeployment(rawDeployment, fallback = {}) {
          const source = rawDeployment && typeof rawDeployment === "object" && !Array.isArray(rawDeployment)
            ? rawDeployment
            : {};
          const id = String(source.id || source.deploymentId || source.deployment_id || fallback.id || "").trim();
          const status = String(source.status || source.deploymentStatus || source.deployment_status || fallback.status || "").trim().toLowerCase();
          const versionId = String(source.versionId || source.version_id || fallback.versionId || "").trim();
          const publishedAt = String(source.publishedAt || source.published_at || fallback.publishedAt || "").trim();
          const publishedBy = normalizePlaygroundVersionActor(source.publishedBy || source.published_by || fallback.publishedBy);
          if (!id && !status && !versionId && !publishedAt && !publishedBy) {
            return null;
          }
          return {
            id,
            versionId,
            status: status || "published",
            publishedAt,
            publishedBy,
          };
        }
  
        function normalizePlaygroundAgentVersion(rawVersion, fallbackIndex = 0) {
          const version = rawVersion && typeof rawVersion === "object" && !Array.isArray(rawVersion) ? rawVersion : {};
          const snapshot = version.snapshot && typeof version.snapshot === "object" && !Array.isArray(version.snapshot)
            ? version.snapshot
            : {};
          const createdAt = String(version.createdAt || version.created_at || version.publishedAt || version.published_at || new Date().toISOString()).trim();
          const id = String(version.id || version.versionId || version.version_id || ("agent_version_" + (fallbackIndex + 1))).trim();
          const versionNumber = normalizePlatformVersionNumber(
            version.version ?? version.versionNumber ?? version.version_number,
            fallbackIndex
          );
          const rawStatus = String(version.status || "").trim().toLowerCase();
          const status = ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
          const lifecycleState = normalizePlaygroundAgentVersionLifecycleState(version, status);
          const agentType = version.agentType === "team" || snapshot.agentType === "team" ? "team" : "single";
          const enabledSkills = Array.isArray(version.enabledSkills)
            ? version.enabledSkills
            : Array.isArray(snapshot.enabledSkills)
              ? snapshot.enabledSkills
              : [];
          const guardrailSetIds = getPlaygroundAgentGuardrailSetIds({
            ...snapshot,
            ...version,
            metadata: version.metadata || snapshot.metadata,
          });
          const guardrails = getPlaygroundAgentGuardrailSnapshots({
            ...snapshot,
            ...version,
            metadata: version.metadata || snapshot.metadata,
          });
          const promptAdaptations = normalizePlaygroundPromptAdaptations(
            version.promptAdaptations
            || version.promptAdaptions
            || version.invisiblePromptAdaptations
            || version.invisiblePromptAdaptions
            || snapshot.promptAdaptations
            || snapshot.promptAdaptions
            || snapshot.invisiblePromptAdaptations
            || snapshot.invisiblePromptAdaptions
            || version.metadata?.promptAdaptations
            || version.metadata?.promptAdaptions
            || snapshot.metadata?.promptAdaptations
            || snapshot.metadata?.promptAdaptions
          );
          const teamSubagentIds = Array.isArray(version.teamSubagentIds)
            ? version.teamSubagentIds
            : Array.isArray(snapshot.teamSubagentIds)
              ? snapshot.teamSubagentIds
              : [];
          const normalizedSnapshot = {
            name: String(
              snapshot.name
              || version.agentName
              || version.agent_name
              || version.resourceName
              || version.resource_name
              || ""
            ).trim(),
            description: typeof snapshot.description === "string"
              ? snapshot.description
              : typeof version.agentDescription === "string"
                ? version.agentDescription
                : typeof version.agent_description === "string"
                  ? version.agent_description
                  : "",
            model: getPlaygroundAgentModelMeta(typeof version.model === "string" ? version.model : snapshot.model || "").id,
            instructions: typeof version.instructions === "string"
              ? version.instructions
              : typeof snapshot.instructions === "string"
                ? snapshot.instructions
                : "",
            binary: String(version.binary || snapshot.binary || "Claude Code CLI").trim() || "Claude Code CLI",
            reasoningEffort: ["minimal", "low", "medium", "high"].includes(version.reasoningEffort)
              ? version.reasoningEffort
              : ["minimal", "low", "medium", "high"].includes(snapshot.reasoningEffort)
                ? snapshot.reasoningEffort
                : "medium",
            enabledSkills: enabledSkills.map((value) => String(value || "").trim()).filter(Boolean),
            guardrailSetIds,
            guardrails,
            promptAdaptations,
            invisiblePromptAdaptations: promptAdaptations,
            deepResearchModel: PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.some((option) => option.id === version.deepResearchModel)
              ? version.deepResearchModel
              : PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.some((option) => option.id === snapshot.deepResearchModel)
                ? snapshot.deepResearchModel
                : null,
            voiceMode: normalizePlaygroundVoiceAgentMode(version.voiceMode || snapshot.voiceMode),
            voiceProvider: "xai",
            voiceModel: PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS.some((option) => option.id === version.voiceModel)
              ? version.voiceModel
              : PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS.some((option) => option.id === snapshot.voiceModel)
                ? snapshot.voiceModel
                : "grok-voice-latest",
            voiceId: String(version.voiceId || snapshot.voiceId || "eve").trim() || "eve",
            voiceInstructions: typeof version.voiceInstructions === "string"
              ? version.voiceInstructions
              : typeof snapshot.voiceInstructions === "string"
                ? snapshot.voiceInstructions
                : "",
            voiceLanguageHint: String(version.voiceLanguageHint || snapshot.voiceLanguageHint || "").trim(),
            permissionSet: normalizePlaygroundPermissionSet(version.permissionSet || snapshot.permissionSet, "agent"),
            agentType,
            teamOrchestratorAgentId: String(version.teamOrchestratorAgentId || snapshot.teamOrchestratorAgentId || "").trim(),
            teamSubagentIds: dedupePlaygroundAgentIds(teamSubagentIds),
            teamExecutionMode: agentType === "team" ? PLAYGROUND_AGENT_TEAM_EXECUTION_MODE : "",
            metadata: stripPlaygroundAgentVersionMetadata(snapshot.metadata),
          };
  
          return {
            id,
            version: versionNumber,
            label: String(
              version.label
              || version.versionLabel
              || version.version_label
              || ("Version " + versionNumber)
            ).trim(),
            description: String(version.description || version.summary || "").trim(),
            status,
            lifecycleState,
            lifecycle_state: lifecycleState,
            revisionId: String(version.revisionId || version.revision_id || "").trim(),
            revision_id: String(version.revisionId || version.revision_id || "").trim(),
            baseRevisionId: String(version.baseRevisionId || version.base_revision_id || "").trim(),
            base_revision_id: String(version.baseRevisionId || version.base_revision_id || "").trim(),
            revisionNumber: Number(version.revisionNumber || version.revision_number || versionNumber || 0) || versionNumber,
            revision_number: Number(version.revisionNumber || version.revision_number || versionNumber || 0) || versionNumber,
            createdAt,
            updatedAt: String(version.updatedAt || version.updated_at || "").trim(),
            publishedAt: String(version.publishedAt || version.published_at || "").trim(),
            unpublishedAt: String(version.unpublishedAt || version.unpublished_at || "").trim(),
            createdBy: normalizePlaygroundVersionActor(version.createdBy || version.created_by),
            created_by: normalizePlaygroundVersionActor(version.createdBy || version.created_by),
            updatedBy: normalizePlaygroundVersionActor(version.updatedBy || version.updated_by),
            updated_by: normalizePlaygroundVersionActor(version.updatedBy || version.updated_by),
            publishedBy: normalizePlaygroundVersionActor(version.publishedBy || version.published_by),
            published_by: normalizePlaygroundVersionActor(version.publishedBy || version.published_by),
            unpublishedBy: normalizePlaygroundVersionActor(version.unpublishedBy || version.unpublished_by),
            unpublished_by: normalizePlaygroundVersionActor(version.unpublishedBy || version.unpublished_by),
            deploymentId: String(version.deploymentId || version.deployment_id || version.deployment?.id || "").trim(),
            deployment_id: String(version.deploymentId || version.deployment_id || version.deployment?.id || "").trim(),
            deploymentStatus: String(version.deploymentStatus || version.deployment_status || version.deployment?.status || "").trim().toLowerCase(),
            deployment_status: String(version.deploymentStatus || version.deployment_status || version.deployment?.status || "").trim().toLowerCase(),
            deployment: normalizePlaygroundAgentVersionDeployment(version.deployment, {
              id: version.deploymentId || version.deployment_id,
              versionId: id,
              status: version.deploymentStatus || version.deployment_status,
              publishedAt: version.publishedAt || version.published_at,
              publishedBy: version.publishedBy || version.published_by,
            }),
            name: normalizedSnapshot.name,
            model: normalizedSnapshot.model,
            skillCount: normalizedSnapshot.enabledSkills.length,
            permissionSet: normalizedSnapshot.permissionSet,
            snapshot: normalizedSnapshot,
          };
        }
  
        function normalizePlaygroundAgentVersions(value) {
          const rawItems = Array.isArray(value) ? value : [];
          return rawItems
            .map((version, index) => normalizePlaygroundAgentVersion(version, index))
            .filter((version) => version.id)
            .sort((a, b) => {
              const versionDelta = Number(b.version || 0) - Number(a.version || 0);
              if (versionDelta) return versionDelta;
              return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
            });
        }
  
        function readPlaygroundAgentVersions(agent) {
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
            ? agent.metadata
            : {};
          return normalizePlaygroundAgentVersions(
            agent?.agentVersions
            || agent?.versions
            || metadata.agentVersions
            || metadata.agent_versions
            || metadata.versions
            || []
          );
        }
  
        function createPlaygroundAgentVersionId() {
          return "agent_version_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }
  
        function buildPlaygroundAgentVersionSnapshot(agent) {
          const normalizedAgent = normalizePlaygroundAgentRecord(agent || buildPlaygroundDefaultAgentDraft());
          return {
            name: String(normalizedAgent.name || "").trim() || (normalizedAgent.agentType === "team" ? "New Squad" : "New Agent"),
            description: typeof normalizedAgent.description === "string" ? normalizedAgent.description : "",
            model: getPlaygroundAgentModelMeta(normalizedAgent.model || "").id,
            instructions: typeof normalizedAgent.instructions === "string" ? normalizedAgent.instructions : "",
            binary: String(normalizedAgent.binary || "Claude Code CLI").trim() || "Claude Code CLI",
            reasoningEffort: ["minimal", "low", "medium", "high"].includes(normalizedAgent.reasoningEffort)
              ? normalizedAgent.reasoningEffort
              : "medium",
            enabledSkills: normalizePlaygroundEnabledSkillIds(normalizedAgent.enabledSkills),
            guardrailSetIds: normalizePlaygroundGuardrailSetIds(normalizedAgent.guardrailSetIds),
            guardrails: getPlaygroundAgentGuardrailSnapshots(normalizedAgent),
            promptAdaptations: normalizePlaygroundPromptAdaptations(normalizedAgent.promptAdaptations || normalizedAgent.invisiblePromptAdaptations),
            invisiblePromptAdaptations: normalizePlaygroundPromptAdaptations(normalizedAgent.promptAdaptations || normalizedAgent.invisiblePromptAdaptations),
            deepResearchModel: PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.some((option) => option.id === normalizedAgent.deepResearchModel)
              ? normalizedAgent.deepResearchModel
              : null,
            voiceMode: normalizePlaygroundVoiceAgentMode(normalizedAgent.voiceMode),
            voiceProvider: "xai",
            voiceModel: PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS.some((option) => option.id === normalizedAgent.voiceModel)
              ? normalizedAgent.voiceModel
              : "grok-voice-latest",
            voiceId: String(normalizedAgent.voiceId || "eve").trim() || "eve",
            voiceInstructions: typeof normalizedAgent.voiceInstructions === "string" ? normalizedAgent.voiceInstructions : "",
            voiceLanguageHint: String(normalizedAgent.voiceLanguageHint || "").trim(),
            permissionSet: normalizePlaygroundPermissionSet(normalizedAgent.permissionSet, "agent"),
            agentType: normalizedAgent.agentType === "team" ? "team" : "single",
            teamOrchestratorAgentId: String(normalizedAgent.teamOrchestratorAgentId || "").trim(),
            teamSubagentIds: dedupePlaygroundAgentIds(normalizedAgent.teamSubagentIds),
            teamExecutionMode: normalizedAgent.agentType === "team" ? PLAYGROUND_AGENT_TEAM_EXECUTION_MODE : "",
            metadata: stripPlaygroundAgentVersionMetadata(normalizedAgent.metadata),
          };
        }
  
        function createPlaygroundAgentVersion(agent, existingVersions = [], options = {}) {
          const now = new Date().toISOString();
          const normalizedExisting = normalizePlaygroundAgentVersions(existingVersions);
          const nextVersion = normalizedExisting.length
            ? normalizedExisting.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), -1) + 1
            : 0;
          const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
          const status = requestedStatus === "active" ? "active" : "saved";
          const lifecycleState = status === "active" ? "published" : "saved";
          const actor = normalizePlaygroundVersionActor(options?.actor);
          const id = createPlaygroundAgentVersionId();
          const revisionId = createPlaygroundAgentVersionRevisionId();
          const deploymentId = status === "active" ? createPlaygroundAgentDeploymentId(id) : "";
          const snapshot = buildPlaygroundAgentVersionSnapshot(agent);
          return normalizePlaygroundAgentVersion({
            id,
            version: nextVersion,
            label: String(options?.label || ("Version " + nextVersion)).trim(),
            description: String(options?.description || "").trim(),
            status,
            lifecycleState,
            lifecycle_state: lifecycleState,
            revisionId,
            revision_id: revisionId,
            baseRevisionId: String(options?.baseRevisionId || options?.base_revision_id || "").trim(),
            base_revision_id: String(options?.baseRevisionId || options?.base_revision_id || "").trim(),
            revisionNumber: nextVersion,
            revision_number: nextVersion,
            createdAt: now,
            createdBy: actor,
            created_by: actor,
            updatedAt: now,
            updated_at: now,
            updatedBy: actor,
            updated_by: actor,
            publishedAt: status === "active" ? now : "",
            published_at: status === "active" ? now : "",
            publishedBy: status === "active" ? actor : null,
            published_by: status === "active" ? actor : null,
            deploymentId,
            deployment_id: deploymentId,
            deploymentStatus: status === "active" ? "published" : "",
            deployment_status: status === "active" ? "published" : "",
            deployment: deploymentId
              ? {
                  id: deploymentId,
                  versionId: id,
                  status: "published",
                  publishedAt: now,
                  publishedBy: actor,
                }
              : null,
            name: snapshot.name,
            model: snapshot.model,
            enabledSkills: snapshot.enabledSkills,
            guardrailSetIds: snapshot.guardrailSetIds,
            permissionSet: snapshot.permissionSet,
            snapshot,
          }, nextVersion);
        }
  
        function createPlaygroundAgentWithVersionList(agent, versions, preferredSelectedId = "") {
          const baseAgent = normalizePlaygroundAgentRecord(agent || buildPlaygroundDefaultAgentDraft());
          const normalizedVersions = normalizePlaygroundAgentVersions(versions);
          const metadata = baseAgent.metadata && typeof baseAgent.metadata === "object" && !Array.isArray(baseAgent.metadata)
            ? { ...baseAgent.metadata }
            : {};
          const previousSelectedId = String(metadata.restoredFromAgentVersionId || metadata.restored_from_agent_version_id || metadata.activeAgentVersionId || metadata.active_agent_version_id || "").trim();
          const selectedVersion = normalizedVersions.find((version) => version.id === String(preferredSelectedId || "").trim())
            || normalizedVersions.find((version) => version.id === previousSelectedId)
            || normalizedVersions.find((version) => version.status === "active")
            || normalizedVersions[0]
            || null;
          const activeVersion = normalizedVersions.find((version) => version.status === "active")
            || normalizedVersions.find((version) => version.id === String(metadata.activeAgentVersionId || metadata.active_agent_version_id || "").trim())
            || null;
          metadata.agentVersions = normalizedVersions;
          metadata.agent_versions = normalizedVersions;
          metadata.activeAgentVersionId = activeVersion?.id || "";
          metadata.active_agent_version_id = activeVersion?.id || "";
          metadata.activeAgentVersionNumber = activeVersion?.version || 0;
          metadata.active_agent_version_number = activeVersion?.version || 0;
          metadata.restoredFromAgentVersionId = selectedVersion?.id || "";
          metadata.restored_from_agent_version_id = selectedVersion?.id || "";
          metadata.restoredFromAgentVersionNumber = selectedVersion?.version || 0;
          metadata.restored_from_agent_version_number = selectedVersion?.version || 0;
          if (activeVersion?.publishedAt) {
            metadata.publishedAt = activeVersion.publishedAt;
            metadata.published_at = activeVersion.publishedAt;
          } else {
            delete metadata.publishedAt;
            delete metadata.published_at;
          }
          return normalizePlaygroundAgentRecord({
            ...baseAgent,
            metadata,
            publishedAt: activeVersion?.publishedAt || "",
          });
        }
  
        function createPlaygroundAgentFromVersionSnapshot(agent, version, versions, preferredSelectedId = "") {
          const baseAgent = normalizePlaygroundAgentRecord(agent || buildPlaygroundDefaultAgentDraft());
          const normalizedVersion = normalizePlaygroundAgentVersion(version || {});
          const snapshot = normalizedVersion.snapshot || {};
          const baseMetadata = stripPlaygroundAgentVersionMetadata(baseAgent.metadata);
          const snapshotMetadata = stripPlaygroundAgentVersionMetadata(snapshot.metadata);
          const snapshotName = String(snapshot.name || "").trim();
          const versionLabel = String(normalizedVersion.label || "").trim();
          const hasVersionLabelAsSnapshotName = Boolean(
            snapshotName
            && (
              snapshotName === versionLabel
              || /^Version\s+\d+$/i.test(snapshotName)
            )
          );
          const nextAgent = normalizePlaygroundAgentRecord({
            ...baseAgent,
            name: hasVersionLabelAsSnapshotName
              ? baseAgent.name
              : snapshotName || baseAgent.name,
            description: typeof snapshot.description === "string" ? snapshot.description : baseAgent.description,
            model: snapshot.model || baseAgent.model,
            instructions: typeof snapshot.instructions === "string" ? snapshot.instructions : baseAgent.instructions,
            binary: snapshot.binary || baseAgent.binary,
            reasoningEffort: snapshot.reasoningEffort || baseAgent.reasoningEffort,
            enabledSkills: Array.isArray(snapshot.enabledSkills) ? snapshot.enabledSkills : baseAgent.enabledSkills,
            guardrailSetIds: Array.isArray(snapshot.guardrailSetIds) ? snapshot.guardrailSetIds : baseAgent.guardrailSetIds,
            guardrails: Array.isArray(snapshot.guardrails) ? snapshot.guardrails : baseAgent.guardrails,
            promptAdaptations: Array.isArray(snapshot.promptAdaptations) ? snapshot.promptAdaptations : baseAgent.promptAdaptations,
            invisiblePromptAdaptations: Array.isArray(snapshot.invisiblePromptAdaptations) ? snapshot.invisiblePromptAdaptations : baseAgent.invisiblePromptAdaptations,
            deepResearchModel: snapshot.deepResearchModel || baseAgent.deepResearchModel,
            voiceMode: normalizePlaygroundVoiceAgentMode(snapshot.voiceMode || baseAgent.voiceMode),
            voiceProvider: "xai",
            voiceModel: PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS.some((option) => option.id === snapshot.voiceModel)
              ? snapshot.voiceModel
              : baseAgent.voiceModel,
            voiceId: String(snapshot.voiceId || baseAgent.voiceId || "eve").trim() || "eve",
            voiceInstructions: typeof snapshot.voiceInstructions === "string" ? snapshot.voiceInstructions : baseAgent.voiceInstructions,
            voiceLanguageHint: String(snapshot.voiceLanguageHint || baseAgent.voiceLanguageHint || "").trim(),
            permissionSet: snapshot.permissionSet || baseAgent.permissionSet,
            agentType: snapshot.agentType === "team" ? "team" : baseAgent.agentType,
            teamOrchestratorAgentId: snapshot.teamOrchestratorAgentId || baseAgent.teamOrchestratorAgentId,
            teamSubagentIds: Array.isArray(snapshot.teamSubagentIds) ? snapshot.teamSubagentIds : baseAgent.teamSubagentIds,
            teamExecutionMode: snapshot.agentType === "team" ? PLAYGROUND_AGENT_TEAM_EXECUTION_MODE : baseAgent.teamExecutionMode,
            metadata: {
              ...baseMetadata,
              ...snapshotMetadata,
            },
          });
          return createPlaygroundAgentWithVersionList(nextAgent, versions, preferredSelectedId || normalizedVersion.id);
        }
  
        function parsePlaygroundAgentListResponse(data) {
          return normalizePlatformAgentListRecords(data).map(normalizePlaygroundAgentRecord);
        }
  
        function getPlaygroundAgentResponseRecord(data) {
          const source = data?.agent || data?.data || data;
          return source && typeof source === "object" && typeof source.id === "string"
            ? normalizePlaygroundAgentRecord(source)
            : null;
        }
  
        const PLAYGROUND_VOICE_AGENT_MODE_OPTIONS = [
          { id: "off", label: "Off" },
          { id: "web", label: "Web" },
          { id: "phone", label: "Phone" },
          { id: "web_and_phone", label: "Web + Phone" },
        ];
  
        const PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS = [
          { id: "grok-voice-latest", label: "grok-voice-latest" },
          { id: "grok-voice-think-fast-1.0", label: "grok-voice-think-fast-1.0" },
          { id: "grok-voice-fast-1.0", label: "grok-voice-fast-1.0" },
        ];
  
        const PLAYGROUND_VOICE_AGENT_VOICE_OPTIONS = [
          { id: "eve", label: "Eve Voice" },
          { id: "ara", label: "Ara Voice" },
          { id: "rex", label: "Rex Voice" },
          { id: "sal", label: "Sal Voice" },
          { id: "leo", label: "Leo Voice" },
        ];
  
        function normalizePlaygroundVoiceAgentMode(value) {
          const normalized = String(value || "off").trim().toLowerCase().replace(/[s-]+/g, "_");
          if (normalized === "web_phone") return "web_and_phone";
          return PLAYGROUND_VOICE_AGENT_MODE_OPTIONS.some((option) => option.id === normalized)
            ? normalized
            : "off";
        }
  
        function isPlaygroundVoiceAgentWebEnabled(mode) {
          const normalizedMode = normalizePlaygroundVoiceAgentMode(mode);
          return normalizedMode === "web" || normalizedMode === "web_and_phone";
        }
  
        function isPlaygroundVoiceAgentPhoneEnabled(mode) {
          const normalizedMode = normalizePlaygroundVoiceAgentMode(mode);
          return normalizedMode === "phone" || normalizedMode === "web_and_phone";
        }
  
        function normalizePlaygroundVoiceAgentRecord(record) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          const voiceSource = source.voice && typeof source.voice === "object" && !Array.isArray(source.voice) ? source.voice : {};
          const agentSource = source.agent && typeof source.agent === "object" && !Array.isArray(source.agent) ? source.agent : source;
          const agent = normalizePlaygroundAgentRecord(agentSource);
          const voiceMode = normalizePlaygroundVoiceAgentMode(voiceSource.mode || agent.voiceMode);
          const voiceModel = String(voiceSource.model || agent.voiceModel || "grok-voice-latest").trim() || "grok-voice-latest";
          const voiceId = String(voiceSource.voiceId || agent.voiceId || "eve").trim() || "eve";
          const languageHint = String(voiceSource.languageHint || agent.voiceLanguageHint || "").trim();
          const phoneNumber = source.phoneNumber && typeof source.phoneNumber === "object" && !Array.isArray(source.phoneNumber)
            ? source.phoneNumber
            : null;
          return {
            ...source,
            agent,
            voice: {
              mode: voiceMode,
              provider: "xai",
              model: voiceModel,
              voiceId,
              languageHint,
              enabled: voiceMode !== "off",
            },
            phoneNumber,
            recentSessions: Array.isArray(source.recentSessions) ? source.recentSessions : [],
          };
        }
  
        function buildPlaygroundVoiceAgentDraft(record) {
          const normalizedRecord = normalizePlaygroundVoiceAgentRecord(record);
          const agent = normalizedRecord.agent || {};
          return {
            agentId: String(agent.id || "").trim(),
            voiceMode: normalizePlaygroundVoiceAgentMode(normalizedRecord.voice?.mode || agent.voiceMode),
            voiceModel: String(normalizedRecord.voice?.model || agent.voiceModel || "grok-voice-latest").trim() || "grok-voice-latest",
            voiceId: String(normalizedRecord.voice?.voiceId || agent.voiceId || "eve").trim() || "eve",
            voiceLanguageHint: String(normalizedRecord.voice?.languageHint || agent.voiceLanguageHint || "").trim(),
            voiceInstructions: typeof agent.voiceInstructions === "string" ? agent.voiceInstructions : "",
          };
        }
  
        function buildPlaygroundVoiceAgentUpdatePayload(draft) {
          const normalizedDraft = draft && typeof draft === "object" && !Array.isArray(draft) ? draft : {};
          return {
            voiceMode: normalizePlaygroundVoiceAgentMode(normalizedDraft.voiceMode),
            voiceProvider: "xai",
            voiceModel: String(normalizedDraft.voiceModel || "grok-voice-latest").trim() || "grok-voice-latest",
            voiceId: String(normalizedDraft.voiceId || "").trim() || null,
            voiceLanguageHint: String(normalizedDraft.voiceLanguageHint || "").trim() || null,
            voiceInstructions: String(normalizedDraft.voiceInstructions || "").trim() || null,
          };
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_096__
  __PLATFORM_COMPATIBILITY_BINDING_097____PLATFORM_COMPATIBILITY_BINDING_098____PLATFORM_COMPATIBILITY_BINDING_099____PLATFORM_COMPATIBILITY_BINDING_100____PLATFORM_COMPATIBILITY_BINDING_101__
  __PLATFORM_COMPATIBILITY_BINDING_102__
  __PLATFORM_COMPATIBILITY_BINDING_103__
  
        function getPlaygroundThreadResponseRecord(data) {
          if (data?.thread && typeof data.thread === "object") {
            return data.thread;
          }
          if (data?.data && typeof data.data === "object") {
            return data.data;
          }
          return data && typeof data === "object" ? data : {};
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_104__
  
        const PLAYGROUND_RUNNER_WORKSPACE_SELECTION_STORAGE_KEY_PREFIX = "tb_runner_chat_workspace_selection_v1";
        const PLAYGROUND_RUNNER_CHAT_APP_ID = "runner-web-sdk-demo";
  
        function sanitizePlaygroundBackendUrl(url) {
          return String(url || "").trim().replace(/\/+$/, "");
        }
  
        function buildPlaygroundWorkspaceSelectionStorageKey(appId, backendUrl) {
          return PLAYGROUND_RUNNER_WORKSPACE_SELECTION_STORAGE_KEY_PREFIX
            + ":"
            + (appId || "runner-web-sdk")
            + ":"
            + (sanitizePlaygroundBackendUrl(backendUrl) || "default");
        }
  
        function normalizePlaygroundWorkspaceSelectorMode(value) {
          return value === "projects" ? "projects" : "computers";
        }
  
        function loadPlaygroundPersistedWorkspaceSelection(appId, backendUrl) {
          if (typeof window === "undefined") {
            return null;
          }
          try {
            const raw = window.localStorage.getItem(buildPlaygroundWorkspaceSelectionStorageKey(appId, backendUrl));
            if (!raw) {
              return null;
            }
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
              return null;
            }
            return {
              mode: normalizePlaygroundWorkspaceSelectorMode(parsed.mode),
              environmentId: typeof parsed.environmentId === "string" ? parsed.environmentId.trim() : "",
              projectId: typeof parsed.projectId === "string" ? parsed.projectId.trim() : "",
            };
          } catch {
            return null;
          }
        }
  
        function persistPlaygroundWorkspaceSelection(appId, backendUrl, selection) {
          if (typeof window === "undefined") {
            return;
          }
          try {
            window.localStorage.setItem(
              buildPlaygroundWorkspaceSelectionStorageKey(appId, backendUrl),
              JSON.stringify({
                mode: normalizePlaygroundWorkspaceSelectorMode(selection?.mode),
                environmentId: String(selection?.environmentId || "").trim(),
                projectId: String(selection?.projectId || "").trim(),
              })
            );
          } catch {
            // Local persistence is best effort only.
          }
        }
  
        function resolvePlaygroundPersistedWorkspaceEnvironmentId(appId, backendUrl, environments = [], projects = []) {
          const persisted = loadPlaygroundPersistedWorkspaceSelection(appId, backendUrl);
          if (!persisted) {
            return "";
          }
          if (persisted.mode === "projects" && persisted.projectId) {
            const persistedProject = projects.find((project) => project?.id === persisted.projectId) || null;
            const projectEnvironmentId = String(persistedProject?.defaultEnvironmentId || "").trim();
            return projectEnvironmentId && environments.some((environment) => environment?.id === projectEnvironmentId)
              ? projectEnvironmentId
              : "";
          }
          const persistedEnvironmentId = String(persisted.environmentId || "").trim();
          return persistedEnvironmentId && environments.some((environment) => environment?.id === persistedEnvironmentId)
            ? persistedEnvironmentId
            : "";
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_105__
  
        function buildPlaygroundEnvironmentAnalyticsUrl(backendUrl, environmentId) {
          if (!backendUrl || !environmentId) return "";
          return backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/analytics";
        }
  
        function buildPlaygroundEnvironmentHomeAnalyticsUrl(backendUrl) {
          if (!backendUrl) return "";
          return backendUrl + "/environments/analytics/overview";
        }
  
        function buildPlaygroundCostsSummaryUrl(backendUrl, period) {
          if (!backendUrl) return "";
          const params = new URLSearchParams();
          if (period) {
            params.set("period", period);
          }
          return backendUrl + "/costs/summary" + (params.toString() ? "?" + params.toString() : "");
        }
  
        function buildPlaygroundCostsSummaryRangeUrl(backendUrl, startDate, endDate) {
          if (!backendUrl) return "";
          const params = new URLSearchParams();
          if (startDate) {
            params.set("startDate", startDate);
          }
          if (endDate) {
            params.set("endDate", endDate);
          }
          return backendUrl + "/costs/summary" + (params.toString() ? "?" + params.toString() : "");
        }
  
        function buildPlaygroundCostsBreakdownUrl(backendUrl, groupBy, period) {
          if (!backendUrl) return "";
          const params = new URLSearchParams();
          if (groupBy) {
            params.set("groupBy", groupBy);
          }
          if (period) {
            params.set("period", period);
          }
          return backendUrl + "/costs/breakdown" + (params.toString() ? "?" + params.toString() : "");
        }
  
        function buildPlaygroundCostsBreakdownRangeUrl(backendUrl, groupBy, startDate, endDate) {
          if (!backendUrl) return "";
          const params = new URLSearchParams();
          if (groupBy) {
            params.set("groupBy", groupBy);
          }
          if (startDate) {
            params.set("startDate", startDate);
          }
          if (endDate) {
            params.set("endDate", endDate);
          }
          return backendUrl + "/costs/breakdown" + (params.toString() ? "?" + params.toString() : "");
        }
  
        function normalizePlaygroundEnvironmentHomeChartPeriod(period) {
          const normalizedPeriod = String(period || "").trim();
          return ["day", "week", "month"].includes(normalizedPeriod) ? normalizedPeriod : "month";
        }
  
        function buildPlaygroundEnvironmentHomeActivityBuckets(period) {
          const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(period);
          if (normalizedPeriod === "day") {
            const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
            return Array.from({ length: 24 }, (_, index) => {
              const date = new Date();
              date.setMinutes(0, 0, 0);
              date.setHours(date.getHours() - (23 - index));
              return {
                key: date.toISOString().slice(0, 13),
                hourKey: date.toISOString().slice(0, 13),
                label: formatter.format(date),
                startMs: date.getTime(),
                endMs: date.getTime() + 60 * 60 * 1000,
              };
            });
          }
          if (normalizedPeriod === "week") {
            const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
            return Array.from({ length: 7 }, (_, index) => {
              const date = new Date();
              date.setHours(0, 0, 0, 0);
              date.setDate(date.getDate() - (6 - index));
              return {
                key: date.toISOString().slice(0, 10),
                label: formatter.format(date),
                startMs: date.getTime(),
                endMs: date.getTime() + 24 * 60 * 60 * 1000,
              };
            });
          }
          const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
          return Array.from({ length: 30 }, (_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (29 - index));
            return {
              key: date.toISOString().slice(0, 10),
              label: formatter.format(date),
              startMs: date.getTime(),
              endMs: date.getTime() + 24 * 60 * 60 * 1000,
            };
          });
        }
  
        function buildPlaygroundAgentAnalyticsUrl(backendUrl, agentId) {
          if (!backendUrl || !agentId) return "";
          return backendUrl + "/agents/" + encodeURIComponent(agentId) + "/analytics";
        }
  
        function buildPlaygroundVoiceAgentsUrl(backendUrl) {
          if (!backendUrl) return "";
          return backendUrl + "/voice-agents";
        }
  
        function buildPlaygroundVoiceAgentUrl(backendUrl, agentId) {
          if (!backendUrl || !agentId) return "";
          return backendUrl + "/voice-agents/agents/" + encodeURIComponent(agentId);
        }
  
        function buildPlaygroundVoiceAgentPhoneNumberUrl(backendUrl, agentId) {
          if (!backendUrl || !agentId) return "";
          return backendUrl + "/voice-agents/agents/" + encodeURIComponent(agentId) + "/phone-number";
        }
  
        function buildPlaygroundVoiceAgentSessionsUrl(backendUrl, agentId) {
          if (!backendUrl || !agentId) return "";
          return backendUrl + "/voice-agents/agents/" + encodeURIComponent(agentId) + "/sessions";
        }
  
        function buildPlaygroundServerFilesListUrl(backendUrl, serverId, folderPath = "", depth = 1) {
          if (!backendUrl || !serverId) return "";
          const normalizedFolderPath = normalizeHistoryPath(folderPath);
          const params = new URLSearchParams();
          params.set("depth", String(depth));
          if (normalizedFolderPath) {
            params.set("path", normalizedFolderPath);
          }
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/files?" + params.toString();
        }
  
        function buildPlaygroundServerFileContentUrl(backendUrl, serverId, filePath = "") {
          if (!backendUrl || !serverId || !filePath) return "";
          const normalizedPath = normalizeHistoryPath(filePath);
          if (!normalizedPath) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/files/content/" + normalizedPath
            .split("/")
            .filter(Boolean)
            .map((segment) => encodeURIComponent(segment))
            .join("/");
        }
  
        function buildPlaygroundServerAnalyticsUrl(backendUrl, serverId, period = "day") {
          if (!backendUrl || !serverId) return "";
          const params = new URLSearchParams();
          params.set("period", normalizePlaygroundEnvironmentHomeChartPeriod(period));
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/analytics?" + params.toString();
        }
  
        function buildPlaygroundServerAnalyticsStateKey(serverId, period = "day") {
          const normalizedServerId = String(serverId || "").trim();
          if (!normalizedServerId) return "";
          return normalizedServerId + ":" + normalizePlaygroundEnvironmentHomeChartPeriod(period);
        }
  
        function buildPlaygroundServerBindingsUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/bindings";
        }
  
        function buildPlaygroundServerContextUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/context";
        }
  
        function buildPlaygroundServerRuntimeConfigUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/runtime-config";
        }
  
        function buildPlaygroundServerRuntimeSdkUrl(backendUrl, serverId, target = "server") {
          if (!backendUrl || !serverId) return "";
          const normalizedTarget = String(target || "").trim().toLowerCase() === "browser" ? "browser" : "server";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/runtime-sdk/" + encodeURIComponent(normalizedTarget);
        }
  
        function buildPlaygroundServerBindingTargetUrl(backendUrl, serverId, targetType) {
          if (!backendUrl || !serverId || !targetType) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/bindings/" + encodeURIComponent(targetType);
        }
  
        function buildPlaygroundServerPaymentsConnectUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/payments/connect-account";
        }
  
        function buildPlaygroundServerPaymentsSyncUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/payments/sync";
        }
  
        function buildPlaygroundServerAuthUsersUrl(backendUrl, serverId, limit = 200) {
          if (!backendUrl || !serverId) return "";
          const params = new URLSearchParams();
          params.set("limit", String(Math.max(1, Math.min(1000, Number(limit) || 200))));
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/auth-users?" + params.toString();
        }
  
        function buildPlaygroundServerSecretsUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/secrets";
        }
  
        function buildPlaygroundServerSecretUrl(backendUrl, serverId, secretId) {
          if (!backendUrl || !serverId || !secretId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/secrets/" + encodeURIComponent(secretId);
        }
  
        function buildPlaygroundServerRunsUrl(backendUrl, serverId, limit = 50) {
          if (!backendUrl || !serverId) return "";
          const params = new URLSearchParams();
          params.set("limit", String(Math.max(1, Math.min(200, Number(limit) || 50))));
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/runs?" + params.toString();
        }
  
        function buildPlaygroundServerRunUrl(backendUrl, serverId, runId, includeEvents = false) {
          if (!backendUrl || !serverId || !runId) return "";
          const base = backendUrl + "/servers/" + encodeURIComponent(serverId) + "/runs/" + encodeURIComponent(runId);
          return includeEvents ? base + "/events" : base;
        }
  
        function buildPlaygroundServerRunCancelUrl(backendUrl, serverId, runId) {
          if (!backendUrl || !serverId || !runId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/runs/" + encodeURIComponent(runId) + "/cancel";
        }
  
        function normalizePlaygroundRealApiBackendUrl(backendUrl) {
          const fallback = typeof window !== "undefined" && window.location?.origin
            ? window.location.origin + "/api/real"
            : "/api/real";
          const rawBackendUrl = String(backendUrl || "").trim().replace(/\/+$/, "");
          if (!rawBackendUrl) {
            return fallback;
          }
  
          try {
            const currentOrigin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
            const parsedUrl = new URL(rawBackendUrl, currentOrigin || "http://localhost");
            const normalizedPathname = String(parsedUrl.pathname || "/").replace(/\/+$/, "") || "/";
            if (
              currentOrigin
              && parsedUrl.origin === currentOrigin
              && normalizedPathname !== "/api/real"
              && !normalizedPathname.startsWith("/api/real/")
            ) {
              return parsedUrl.origin + "/api/real";
            }
          } catch {
          }
  
          return rawBackendUrl;
        }
  
        function buildPlaygroundServerLogsUrl(backendUrl, serverId, kind = "request", limit = 80) {
          if (!backendUrl || !serverId) return "";
          const params = new URLSearchParams();
          params.set("kind", String(kind || "request"));
          params.set("limit", String(Math.max(1, Math.min(250, Number(limit) || 80))));
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/logs?" + params.toString();
        }
  
        function buildPlaygroundServerDeploymentsUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/deployments";
        }
  
        function buildPlaygroundServerRollbackUrl(backendUrl, serverId) {
          if (!backendUrl || !serverId) return "";
          return backendUrl + "/servers/" + encodeURIComponent(serverId) + "/rollback";
        }
  
        function buildPlaygroundDatabaseBootstrapUrl(backendUrl, databaseId, documentsLimit = 25) {
          if (!backendUrl || !databaseId) return "";
          const params = new URLSearchParams();
          params.set("documentsLimit", String(Math.max(1, Math.min(100, Number(documentsLimit) || 25))));
          return backendUrl + "/databases/" + encodeURIComponent(databaseId) + "/bootstrap?" + params.toString();
        }
  
        function buildPlaygroundDatabaseCollectionsUrl(backendUrl, databaseId) {
          if (!backendUrl || !databaseId) return "";
          return backendUrl + "/databases/" + encodeURIComponent(databaseId) + "/collections";
        }
  
        function buildPlaygroundDatabaseDocumentsUrl(backendUrl, databaseId, collectionId, limit = 100) {
          if (!backendUrl || !databaseId || !collectionId) return "";
          const params = new URLSearchParams();
          params.set("limit", String(Math.max(1, Math.min(250, Number(limit) || 100))));
          return backendUrl
            + "/databases/" + encodeURIComponent(databaseId)
            + "/collections/" + encodeURIComponent(collectionId)
            + "/documents?" + params.toString();
        }
  
        function buildPlaygroundDatabaseDocumentUrl(backendUrl, databaseId, collectionId, documentId) {
          if (!backendUrl || !databaseId || !collectionId || !documentId) return "";
          return backendUrl
            + "/databases/" + encodeURIComponent(databaseId)
            + "/collections/" + encodeURIComponent(collectionId)
            + "/documents/" + encodeURIComponent(documentId);
        }
  
        function buildPlaygroundDatabaseAnalyticsUrl(backendUrl, databaseId, period = "day") {
          if (!backendUrl || !databaseId) return "";
  	    const params = new URLSearchParams();
  	    params.set("period", normalizePlaygroundEnvironmentHomeChartPeriod(period));
  	    return backendUrl + "/databases/" + encodeURIComponent(databaseId) + "/analytics?" + params.toString();
  	  }
  
  	  function buildPlaygroundDatabaseAnalyticsStateKey(databaseId, period = "day") {
  	    const normalizedDatabaseId = String(databaseId || "").trim();
  	    if (!normalizedDatabaseId) return "";
  	    return normalizedDatabaseId + ":" + normalizePlaygroundEnvironmentHomeChartPeriod(period);
        }
  
        function canonicalizePlaygroundServerKind(kind) {
          const normalizedKind = String(kind || "").trim().toLowerCase();
          if (normalizedKind === "web app" || normalizedKind === "website") return "web_app";
          if (normalizedKind === "function") return "function";
          if (normalizedKind === "database") return "database";
          if (normalizedKind === "api") return "api";
          if (normalizedKind === "auth") return "auth";
          if (normalizedKind === "agent runtime") return "agent_runtime";
          if (normalizedKind === "agent_runtime") return "agent_runtime";
          if (normalizedKind === "voice agent" || normalizedKind === "voice agents") return "voice_agent";
          if (normalizedKind === "voice_agent" || normalizedKind === "voice_agents") return "voice_agent";
          if (normalizedKind === "secrets") return "secrets";
          if (normalizedKind === "payments" || normalizedKind === "payment") return "payments";
          return "web_app";
        }
  
  	      function formatPlaygroundServerKindLabel(kind) {
  	        const normalizedKind = canonicalizePlaygroundServerKind(kind);
  	        if (normalizedKind === "function") return "Function";
  	        if (normalizedKind === "database") return "Database";
  	        if (normalizedKind === "api") return "APIs";
  	        if (normalizedKind === "auth") return "Authentication";
  	        if (normalizedKind === "agent_runtime") return "Agent Runtime";
  	        if (normalizedKind === "voice_agent") return "Voice Agent";
  	        if (normalizedKind === "secrets") return "Secrets";
  	        if (normalizedKind === "payments") return "Payments";
  	        return "Web App";
  	      }
  
        function normalizePlaygroundServerOverviewKind(kind) {
          const rawKind = String(kind || "").trim();
          if (!rawKind) {
            return "";
          }
          const normalizedRawKind = rawKind.toLowerCase();
          if (!["web_app", "web app", "website", "function", "database", "api", "auth", "agent_runtime", "agent runtime", "voice_agent", "voice_agents", "voice agent", "voice agents", "secrets", "payments", "payment"].includes(normalizedRawKind)) {
            return "";
          }
          const normalizedKind = canonicalizePlaygroundServerKind(rawKind);
          return ["web_app", "function", "database", "api", "auth", "agent_runtime", "voice_agent", "secrets", "payments"].includes(normalizedKind)
            ? normalizedKind
            : "";
        }
  
        function formatPlaygroundServerKindPluralLabel(kind) {
  	        const normalizedKind = canonicalizePlaygroundServerKind(kind);
  	        if (normalizedKind === "web_app") return "Web Apps";
  	        if (normalizedKind === "api") return "API";
  	        if (normalizedKind === "auth") return "Authentication";
  	        if (normalizedKind === "agent_runtime") return "Agent Runtime";
  	        if (normalizedKind === "voice_agent") return "Voice Agents";
  	        if (normalizedKind === "secrets") return "Secrets";
  	        if (normalizedKind === "payments") return "Payments";
  	        return formatPlaygroundServerKindLabel(normalizedKind) + "s";
  	      }
  
        function normalizePlaygroundServerBindingRecord(binding) {
          if (!binding || typeof binding !== "object") {
            return null;
          }
          const targetType = String(binding.targetType || "").trim().toLowerCase();
          if (!["database", "auth", "agent_runtime", "secrets", "payments"].includes(targetType)) {
            return null;
          }
          const resource = binding.resource && typeof binding.resource === "object" && !Array.isArray(binding.resource)
            ? binding.resource
            : null;
          return {
            id: typeof binding.id === "string" ? binding.id : "",
            serverId: typeof binding.serverId === "string" ? binding.serverId : "",
            targetType,
            targetId: typeof binding.targetId === "string" ? binding.targetId : "",
            alias: typeof binding.alias === "string" ? binding.alias : "",
            accessMode: typeof binding.accessMode === "string" ? binding.accessMode : "default",
            metadata: binding.metadata && typeof binding.metadata === "object" && !Array.isArray(binding.metadata) ? binding.metadata : null,
            createdAt: typeof binding.createdAt === "string" ? binding.createdAt : "",
            updatedAt: typeof binding.updatedAt === "string" ? binding.updatedAt : "",
            resource: resource
              ? {
                  id: typeof resource.id === "string" ? resource.id : "",
                  name: typeof resource.name === "string" ? resource.name : "",
                  kind: canonicalizePlaygroundServerKind(resource.kind),
                  location: typeof resource.location === "string" ? resource.location : "",
                  status: typeof resource.status === "string" ? resource.status : "",
                  documentCount: Number.isFinite(Number(resource.documentCount)) ? Number(resource.documentCount) : null,
                }
              : null,
          };
        }
  
        function normalizePlaygroundSecretRecord(secret) {
          if (!secret || typeof secret !== "object") {
            return null;
          }
          const id = typeof secret.id === "string" ? secret.id.trim() : "";
          const name = typeof secret.name === "string" ? secret.name.trim() : "";
          if (!id && !name) {
            return null;
          }
          return {
            id: id || name,
            name: name || id,
            description: typeof secret.description === "string" ? secret.description : "",
            maskedValue: typeof secret.maskedValue === "string"
              ? secret.maskedValue
              : typeof secret.value === "string"
                ? secret.value
                : "••••••••",
            valueEncrypted: secret.valueEncrypted !== false,
            metadata: secret.metadata && typeof secret.metadata === "object" && !Array.isArray(secret.metadata) ? secret.metadata : null,
            createdAt: typeof secret.createdAt === "string" ? secret.createdAt : "",
            updatedAt: typeof secret.updatedAt === "string" ? secret.updatedAt : "",
            lastAccessedAt: typeof secret.lastAccessedAt === "string" ? secret.lastAccessedAt : "",
          };
        }
  
        function normalizePlaygroundServerDeploymentRecord(deployment) {
          if (!deployment || typeof deployment !== "object") {
            return null;
          }
          const id = typeof deployment.id === "string" && deployment.id.trim()
            ? deployment.id.trim()
            : typeof deployment.deploymentId === "string" && deployment.deploymentId.trim()
              ? deployment.deploymentId.trim()
              : "";
          const revision = typeof deployment.revision === "string" ? deployment.revision.trim() : "";
          const at = typeof deployment.at === "string" && deployment.at ? deployment.at : "";
          if (!id && !revision && !at) {
            return null;
          }
          return {
            id: id || revision || at,
            at,
            outcome: String(deployment.outcome || "").trim().toLowerCase() || "success",
            type: typeof deployment.type === "string" ? deployment.type : "",
            serviceName: typeof deployment.serviceName === "string" ? deployment.serviceName : "",
            region: typeof deployment.region === "string" ? deployment.region : "",
            revision,
            serviceUrl: typeof deployment.serviceUrl === "string" ? deployment.serviceUrl : "",
            imageUrl: typeof deployment.imageUrl === "string" ? deployment.imageUrl : "",
            runtime: typeof deployment.runtime === "string" ? deployment.runtime : "",
            sourceEnvironmentId: typeof deployment.sourceEnvironmentId === "string" ? deployment.sourceEnvironmentId : "",
            sourcePath: typeof deployment.sourcePath === "string" ? deployment.sourcePath : "",
            error: typeof deployment.error === "string" ? deployment.error : "",
            rolledBackToDeploymentId: typeof deployment.rolledBackToDeploymentId === "string" ? deployment.rolledBackToDeploymentId : "",
          };
        }
  
        function buildPlaygroundServerCurrentDeploymentFallback(server) {
          if (!server || typeof server !== "object") {
            return null;
          }
          const metadata = server.metadata && typeof server.metadata === "object" && !Array.isArray(server.metadata)
            ? server.metadata
            : {};
          const lastDeployment = metadata.lastDeployment && typeof metadata.lastDeployment === "object" && !Array.isArray(metadata.lastDeployment)
            ? metadata.lastDeployment
            : null;
          const serviceName = String(lastDeployment?.serviceName || server.cloudRunServiceName || metadata.serviceName || "").trim();
          const revision = String(lastDeployment?.revision || metadata.latestRevision || "").trim();
          const at = String(lastDeployment?.at || server.lastDeployedAt || server.updatedAt || "").trim();
          const serviceUrl = String(lastDeployment?.serviceUrl || server.serviceUrl || "").trim();
          const imageUrl = String(lastDeployment?.imageUrl || server.imageUrl || "").trim();
          const activeDeploymentId = String(metadata.activeDeploymentId || "").trim();
          const id = String(lastDeployment?.id || lastDeployment?.deploymentId || activeDeploymentId || revision || at || serviceName || "").trim();
          const hasDeploymentSignal = Boolean(
            id
            || revision
            || at
            || serviceUrl
            || serviceName
            || imageUrl
            || String(server.status || "").trim().toLowerCase() === "deployed"
          );
          if (!hasDeploymentSignal) {
            return null;
          }
          return normalizePlaygroundServerDeploymentRecord({
            id: id || "dep_current",
            at,
            outcome: String(lastDeployment?.outcome || server.status || "").trim().toLowerCase() === "failed" ? "failed" : "success",
            type: lastDeployment?.type || metadata.deploymentType || "",
            serviceName,
            region: lastDeployment?.region || server.region || "",
            revision,
            serviceUrl,
            imageUrl,
            runtime: lastDeployment?.runtime || server.runtime || "",
            sourceEnvironmentId: lastDeployment?.sourceEnvironmentId || server.sourceEnvironmentId || "",
            sourcePath: lastDeployment?.sourcePath || server.sourcePath || "",
            error: lastDeployment?.error || metadata.deploymentError || "",
          });
        }
  
        function normalizePlaygroundServerContextRecord(context) {
          if (!context || typeof context !== "object") {
            return null;
          }
          const runtime = context.runtime && typeof context.runtime === "object" && !Array.isArray(context.runtime)
            ? context.runtime
            : null;
          const diagnostics = context.diagnostics && typeof context.diagnostics === "object" && !Array.isArray(context.diagnostics)
            ? context.diagnostics
            : null;
          return {
            serverId: typeof context.serverId === "string" ? context.serverId : "",
            bindings: Array.isArray(context.bindings)
              ? context.bindings.map(normalizePlaygroundServerBindingRecord).filter(Boolean)
              : [],
            runtime,
            diagnostics: diagnostics
              ? {
                  ...diagnostics,
                  warnings: Array.isArray(diagnostics.warnings)
                    ? diagnostics.warnings.filter((warning) => warning && typeof warning === "object").map((warning) => ({
                        code: typeof warning.code === "string" ? warning.code : "",
                        level: String(warning.level || "").trim().toLowerCase() === "warning" ? "warning" : "info",
                        message: typeof warning.message === "string" ? warning.message : "",
                      }))
                    : [],
                }
              : null,
          };
        }
  
        function formatPlaygroundAuthProviderLabel(providerId) {
          const normalized = String(providerId || "").trim().toLowerCase();
          if (!normalized) return "Unknown";
          if (normalized === "google.com" || normalized === "google") return "Google";
          if (normalized === "microsoft.com" || normalized === "microsoft") return "Microsoft";
          if (normalized === "password" || normalized === "email") return "Email";
          if (normalized === "phone" || normalized === "phone.com") return "Phone";
          if (normalized === "github.com" || normalized === "github") return "GitHub";
          return normalized.replace(/\.com$/g, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
        }
  
        function getPlaygroundAuthProviderTone(providerId) {
          const normalized = String(providerId || "").trim().toLowerCase();
          if (normalized === "google.com" || normalized === "google") return "google";
          if (normalized === "microsoft.com" || normalized === "microsoft") return "microsoft";
          if (normalized === "password" || normalized === "email") return "email";
          if (normalized === "phone" || normalized === "phone.com") return "phone";
          if (normalized === "github.com" || normalized === "github") return "github";
          return "default";
        }
  
        function getPlaygroundAuthUserIdentifier(user) {
          return String(user?.email || "").trim()
            || String(user?.phoneNumber || "").trim()
            || String(user?.displayName || "").trim()
            || String(user?.uid || "").trim()
            || "Unknown user";
        }
  
        function getPlaygroundAuthUserSearchText(user) {
          const providers = Array.isArray(user?.providers) ? user.providers.join(" ") : "";
          return [
            user?.email || "",
            user?.phoneNumber || "",
            user?.displayName || "",
            user?.uid || "",
            providers,
          ].join(" ").toLowerCase();
        }
  
        function formatPlaygroundServerLatency(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue) || numericValue < 0) {
            return "—";
          }
          if (numericValue >= 1000) {
            return (Math.round((numericValue / 1000) * 10) / 10).toFixed(1).replace(/.0$/, "") + "s";
          }
          return Math.round(numericValue) + "ms";
        }
  
        function formatPlaygroundServerRate(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue) || numericValue < 0) {
            return "—";
          }
          return (Math.round(numericValue * 10) / 10).toFixed(1).replace(/.0$/, "") + "%";
        }
  
        function formatPlaygroundExecutionDuration(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue) || numericValue < 0) {
            return "—";
          }
          if (numericValue >= 60 * 60 * 1000) {
            return (Math.round((numericValue / (60 * 60 * 1000)) * 10) / 10).toFixed(1).replace(/.0$/, "") + "h";
          }
          if (numericValue >= 60 * 1000) {
            return (Math.round((numericValue / (60 * 1000)) * 10) / 10).toFixed(1).replace(/.0$/, "") + "m";
          }
          if (numericValue >= 1000) {
            return (Math.round((numericValue / 1000) * 10) / 10).toFixed(1).replace(/.0$/, "") + "s";
          }
          return Math.round(numericValue) + "ms";
        }
  
        function formatPlaygroundServerLogKindLabel(kind) {
          const normalizedKind = String(kind || "").trim().toLowerCase();
          if (normalizedKind === "runtime") return "Console";
          if (normalizedKind === "deployment") return "Deploy";
          return "Requests";
        }
  
        function formatPlaygroundServerRequestStatus(status) {
          const numericStatus = Number(status);
          return Number.isFinite(numericStatus) && numericStatus > 0 ? String(Math.round(numericStatus)) : "—";
        }
  
        function formatPlaygroundDatabaseDocumentJson(value) {
          try {
            return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
          } catch {
            return "{}";
          }
        }
  
        function getPlaygroundDatabaseDocumentResponseRecord(payload, fallback = null) {
          const candidates = [payload?.document, payload?.data, payload?.item, payload];
          const record = candidates.find((candidate) => (
            candidate
            && typeof candidate === "object"
            && !Array.isArray(candidate)
            && (candidate.id != null || candidate.data != null)
          )) || null;
          if (!record) {
            return fallback;
          }
          return {
            ...(fallback && typeof fallback === "object" ? fallback : {}),
            ...record,
            id: String(record.id || fallback?.id || "").trim(),
            data: record.data && typeof record.data === "object" && !Array.isArray(record.data)
              ? record.data
              : {},
          };
        }
  
        function isPlaygroundDatabasePlainObject(value) {
          return Boolean(value) && typeof value === "object" && !Array.isArray(value);
        }
  
        function parsePlaygroundDatabaseDocumentObject(value) {
          if (typeof value === "string") {
            try {
              const parsed = JSON.parse(value || "{}");
              return isPlaygroundDatabasePlainObject(parsed) ? parsed : {};
            } catch {
              return null;
            }
          }
          return isPlaygroundDatabasePlainObject(value) ? value : {};
        }
  
        function clonePlaygroundDatabaseValue(value) {
          try {
            return JSON.parse(JSON.stringify(value));
          } catch {
            if (Array.isArray(value)) return value.slice();
            if (isPlaygroundDatabasePlainObject(value)) return { ...value };
            return value;
          }
        }
  
        function getPlaygroundDatabasePathKey(path) {
          return Array.isArray(path) && path.length ? path.join(".") : "__root__";
        }
  
        function getPlaygroundDatabaseFieldType(value) {
          if (Array.isArray(value)) return "array";
          if (isPlaygroundDatabasePlainObject(value)) return "map";
          if (value === null) return "null";
          if (typeof value === "boolean") return "boolean";
          if (typeof value === "number") return "number";
          return "string";
        }
  
        function getPlaygroundDatabaseValueAtPath(rootValue, path) {
          if (!Array.isArray(path) || !path.length) {
            return rootValue;
          }
          let current = rootValue;
          for (const segment of path) {
            if (Array.isArray(current)) {
              const index = Number(segment);
              if (!Number.isInteger(index) || index < 0 || index >= current.length) {
                return undefined;
              }
              current = current[index];
              continue;
            }
            if (isPlaygroundDatabasePlainObject(current)) {
              current = current[segment];
              continue;
            }
            return undefined;
          }
          return current;
        }
  
        function setPlaygroundDatabaseValueAtPath(rootValue, path, nextValue) {
          if (!Array.isArray(path) || !path.length) {
            return clonePlaygroundDatabaseValue(nextValue);
          }
  
          const clonedRoot = clonePlaygroundDatabaseValue(rootValue);
          let current = clonedRoot;
  
          for (let index = 0; index < path.length - 1; index += 1) {
            const segment = path[index];
            if (Array.isArray(current)) {
              const arrayIndex = Number(segment);
              if (!Number.isInteger(arrayIndex) || arrayIndex < 0 || arrayIndex >= current.length) {
                return clonedRoot;
              }
              current[arrayIndex] = clonePlaygroundDatabaseValue(current[arrayIndex]);
              current = current[arrayIndex];
              continue;
            }
            if (!isPlaygroundDatabasePlainObject(current)) {
              return clonedRoot;
            }
            current[segment] = clonePlaygroundDatabaseValue(current[segment]);
            current = current[segment];
          }
  
          const leafSegment = path[path.length - 1];
          if (Array.isArray(current)) {
            const arrayIndex = Number(leafSegment);
            if (!Number.isInteger(arrayIndex) || arrayIndex < 0 || arrayIndex >= current.length) {
              return clonedRoot;
            }
            current[arrayIndex] = nextValue;
            return clonedRoot;
          }
          if (isPlaygroundDatabasePlainObject(current)) {
            current[leafSegment] = nextValue;
          }
          return clonedRoot;
        }
  
        function deletePlaygroundDatabaseValueAtPath(rootValue, path) {
          if (!Array.isArray(path) || !path.length) {
            return clonePlaygroundDatabaseValue(rootValue);
          }
  
          const clonedRoot = clonePlaygroundDatabaseValue(rootValue);
          let current = clonedRoot;
  
          for (let index = 0; index < path.length - 1; index += 1) {
            const segment = path[index];
            if (Array.isArray(current)) {
              const arrayIndex = Number(segment);
              if (!Number.isInteger(arrayIndex) || arrayIndex < 0 || arrayIndex >= current.length) {
                return clonedRoot;
              }
              current[arrayIndex] = clonePlaygroundDatabaseValue(current[arrayIndex]);
              current = current[arrayIndex];
              continue;
            }
            if (!isPlaygroundDatabasePlainObject(current)) {
              return clonedRoot;
            }
            current[segment] = clonePlaygroundDatabaseValue(current[segment]);
            current = current[segment];
          }
  
          const leafSegment = path[path.length - 1];
          if (Array.isArray(current)) {
            const arrayIndex = Number(leafSegment);
            if (Number.isInteger(arrayIndex) && arrayIndex >= 0 && arrayIndex < current.length) {
              current.splice(arrayIndex, 1);
            }
            return clonedRoot;
          }
          if (isPlaygroundDatabasePlainObject(current)) {
            delete current[leafSegment];
          }
          return clonedRoot;
        }
  
        function createPlaygroundDatabaseFieldValue(type, rawValue) {
          const normalizedType = String(type || "string").trim().toLowerCase();
          if (normalizedType === "number") {
            const numericValue = Number(String(rawValue || "").trim());
            if (!Number.isFinite(numericValue)) {
              throw new Error("Number value is invalid.");
            }
            return numericValue;
          }
          if (normalizedType === "boolean") {
            return String(rawValue || "").trim().toLowerCase() === "true";
          }
          if (normalizedType === "null") {
            return null;
          }
          if (normalizedType === "map") {
            return {};
          }
          if (normalizedType === "array") {
            return [];
          }
          return String(rawValue || "");
        }
  
        function formatPlaygroundDatabaseFieldPreview(value) {
          const type = getPlaygroundDatabaseFieldType(value);
          if (type === "map") {
            const size = Object.keys(value || {}).length;
            return size + " field" + (size === 1 ? "" : "s");
          }
          if (type === "array") {
            const size = Array.isArray(value) ? value.length : 0;
            return size + " item" + (size === 1 ? "" : "s");
          }
          if (type === "null") {
            return "null";
          }
          if (type === "boolean" || type === "number") {
            return String(value);
          }
          return JSON.stringify(String(value || ""));
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_106__
  
  __PLATFORM_COMPATIBILITY_BINDING_107__
  
        function resolveThreadSortTimestamp(thread) {
          return thread.updatedAt || thread.createdAt || thread.nextRunAt || "";
        }
  
        function compareThreadsByRecent(left, right) {
          const leftTime = new Date(resolveThreadSortTimestamp(left)).getTime();
          const rightTime = new Date(resolveThreadSortTimestamp(right)).getTime();
          return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
        }
  
        function isCompletedThreadStatus(status) {
          const normalizedStatus = String(status || "").trim().toLowerCase();
          return ["completed", "complete", "done", "succeeded", "success", "finished"].includes(normalizedStatus);
        }
  
        function isTerminalThreadDisplayStatus(status) {
          const normalizedStatus = String(status || "").trim().toLowerCase();
          return ["completed", "complete", "done", "succeeded", "success", "finished", "failed", "cancelled", "canceled"].includes(normalizedStatus);
        }
  
        function isRunningThreadDisplayStatus(status) {
          const normalizedStatus = String(status || "").trim().toLowerCase();
          return ["running", "queued", "pending", "scheduled", "starting", "created", "ready"].includes(normalizedStatus);
        }
  
        function shouldPreserveThreadDisplayStatus(status) {
          return isTerminalThreadDisplayStatus(status) || isPendingPermissionThreadDisplayStatus(status) || isRunningThreadDisplayStatus(status);
        }
  
        function resolveThreadDisplayStatus(status, completedAt) {
          const normalizedCompletedAt = String(completedAt || "").trim();
          if (isPendingPermissionThreadDisplayStatus(status)) {
            return "permission_asked";
          }
          if (normalizedCompletedAt && !shouldPreserveThreadDisplayStatus(status)) {
            return "completed";
          }
          return typeof status === "string" ? status.trim() : "";
        }
  
        function threadHasStaleCompletionAfterUpdate(thread) {
          const completedAtMs = new Date(String(thread?.completedAt || thread?.finishedAt || thread?.endedAt || "")).getTime();
          const updatedAtMs = new Date(String(thread?.updatedAt || "")).getTime();
          return Number.isFinite(completedAtMs) && Number.isFinite(updatedAtMs) && updatedAtMs > completedAtMs + 1000;
        }
  
        function preserveActiveThreadStatusForStaleCompletion(existingThread, incomingThread, focusedThreadId) {
          const normalizedThreadId = String(incomingThread?.id || "").trim();
          if (!normalizedThreadId || normalizedThreadId !== String(focusedThreadId || "").trim()) {
            return incomingThread;
          }
          if (!isActiveThreadDisplayStatus(existingThread?.status) || !isCompletedThreadStatus(incomingThread?.status)) {
            return incomingThread;
          }
          if (!threadHasStaleCompletionAfterUpdate(incomingThread)) {
            return incomingThread;
          }
          return {
            ...incomingThread,
            status: existingThread.status,
          };
        }
  
        function isActiveThreadDisplayStatus(status) {
          const normalizedStatus = String(status || "").trim().toLowerCase();
          return ["running", "queued", "pending", "scheduled", "starting", "created", "ready"].includes(normalizedStatus);
        }
  
        function isPendingPermissionThreadDisplayStatus(status) {
          const normalizedStatus = String(status || "").trim().toLowerCase();
          return normalizedStatus === "permission_asked" || normalizedStatus === "permission asked";
        }
  
        function normalizeThreadTodoListItems(items) {
          if (!Array.isArray(items)) {
            return [];
          }
          return items
            .map((item) => {
              if (typeof item === "string") {
                const text = item.trim();
                return text ? { text, completed: false } : null;
              }
              if (!item || typeof item !== "object") {
                return null;
              }
              const text = String(item.text || item.content || item.title || item.message || "").trim();
              if (!text) {
                return null;
              }
              const normalizedStatus = String(item.status || item.state || "").trim().toLowerCase();
              const completed = Boolean(item.completed)
                || normalizedStatus === "completed"
                || normalizedStatus === "complete"
                || normalizedStatus === "done";
              return { text, completed };
            })
            .filter(Boolean);
        }
  
        function parseThreadTodoListCandidateValue(value, depth = 0) {
          if (depth > 3 || value == null) {
            return [];
          }
          if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed || (!trimmed.startsWith("[") && !trimmed.startsWith("{"))) {
              return [];
            }
            try {
              return parseThreadTodoListCandidateValue(JSON.parse(trimmed), depth + 1);
            } catch {
              return [];
            }
          }
          const directItems = normalizeThreadTodoListItems(value);
          if (directItems.length > 0) {
            return directItems;
          }
          if (!value || typeof value !== "object" || Array.isArray(value)) {
            return [];
          }
          const record = value;
          const directKeys = ["todos", "todoItems", "todo_items", "taskList", "task_list", "todoList", "todo_list", "items", "tasks"];
          for (const key of directKeys) {
            const items = parseThreadTodoListCandidateValue(record[key], depth + 1);
            if (items.length > 0) {
              return items;
            }
          }
          const nestedKeys = ["metadata", "logMetadata", "log_metadata", "result", "output", "data", "payload", "body", "args", "arguments", "input"];
          for (const key of nestedKeys) {
            const items = parseThreadTodoListCandidateValue(record[key], depth + 1);
            if (items.length > 0) {
              return items;
            }
          }
          return [];
        }
  
        function getThreadTodoLogArray(data) {
          if (Array.isArray(data?.logs)) {
            return data.logs;
          }
          if (Array.isArray(data?.data)) {
            return data.data;
          }
          return Array.isArray(data) ? data : [];
        }
  
        function getThreadTodoLogMetadata(log) {
          if (!log || typeof log !== "object") {
            return {};
          }
          if (log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata)) {
            return log.metadata;
          }
          if (log.logMetadata && typeof log.logMetadata === "object" && !Array.isArray(log.logMetadata)) {
            return log.logMetadata;
          }
          return {};
        }
  
        function extractLatestThreadTodoList(data) {
          const logs = getThreadTodoLogArray(data);
          const candidates = [];
          logs.forEach((log, index) => {
            if (!log || typeof log !== "object") {
              return;
            }
            const metadata = getThreadTodoLogMetadata(log);
            const eventType = String(log.eventType || log.event_type || log.kind || "").trim().toLowerCase();
            const toolName = String(metadata.toolName || metadata.tool_name || "").trim().toLowerCase();
            const isTodoListSignal = eventType === "todo_list"
              || toolName === "todowrite"
              || toolName === "todo_write"
              || toolName === "todo-write";
            if (eventType && !isTodoListSignal) {
              return;
            }
            const todos = parseThreadTodoListCandidateValue(log);
            if (todos.length === 0 && !isTodoListSignal) {
              return;
            }
            const timestamp = String(log.createdAt || log.created_at || log.timestamp || log.time || "").trim();
            const timestampMs = Date.parse(timestamp);
            candidates.push({
              todos,
              index,
              timestampMs: Number.isFinite(timestampMs) ? timestampMs : null,
            });
          });
          if (candidates.length === 0) {
            return [];
          }
          candidates.sort((left, right) => {
            if (left.timestampMs !== null && right.timestampMs !== null && left.timestampMs !== right.timestampMs) {
              return left.timestampMs - right.timestampMs;
            }
            if (left.timestampMs !== null && right.timestampMs === null) {
              return 1;
            }
            if (left.timestampMs === null && right.timestampMs !== null) {
              return -1;
            }
            return left.index - right.index;
          });
          return candidates[candidates.length - 1].todos;
        }
  
        function resolveThreadCompletionTimestampMs(thread) {
          const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
            ? thread.metadata
            : {};
          const runnerPlaygroundMetadata = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : {};
          const candidates = [
            thread?.completedAt,
            thread?.completed_at,
            thread?.finishedAt,
            thread?.finished_at,
            thread?.endedAt,
            thread?.ended_at,
            metadata?.completedAt,
            metadata?.completed_at,
            metadata?.finishedAt,
            metadata?.finished_at,
            metadata?.endedAt,
            metadata?.ended_at,
            runnerPlaygroundMetadata?.completedAt,
            runnerPlaygroundMetadata?.completed_at,
            thread?.updatedAt,
            resolveThreadSortTimestamp(thread),
            thread?.createdAt,
          ];
          for (const candidate of candidates) {
            const timestamp = new Date(String(candidate || "")).getTime();
            if (Number.isFinite(timestamp)) {
              return timestamp;
            }
          }
          return 0;
        }
  
        function formatThreadSearchTimestamp(value) {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
  
          const diffMs = Math.max(0, Date.now() - date.getTime());
          const minuteMs = 60 * 1000;
          const hourMs = 60 * minuteMs;
          const dayMs = 24 * hourMs;
          const weekMs = 7 * dayMs;
  
          if (diffMs < hourMs) {
            const minutes = Math.max(1, Math.round(diffMs / minuteMs));
            return minutes + " min ago";
          }
  
          if (diffMs < dayMs) {
            const hours = Math.max(1, Math.round(diffMs / hourMs));
            return hours + " hr" + (hours === 1 ? "" : "s") + " ago";
          }
  
          if (diffMs < weekMs) {
            const days = Math.max(1, Math.round(diffMs / dayMs));
            return days + " day" + (days === 1 ? "" : "s") + " ago";
          }
  
          const weeks = Math.max(1, Math.round(diffMs / weekMs));
          return weeks + " week" + (weeks === 1 ? "" : "s") + " ago";
        }
  
        function getThreadSearchBucket(value) {
          if (!value) {
            return { key: "older", label: "Older" };
          }
  
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) {
            return { key: "older", label: "Older" };
          }
  
          const diffMs = Math.max(0, Date.now() - date.getTime());
          const dayMs = 24 * 60 * 60 * 1000;
  
          if (diffMs < dayMs) {
            return { key: "today", label: "Today" };
          }
  
          if (diffMs < 2 * dayMs) {
            return { key: "yesterday", label: "Yesterday" };
          }
  
          if (diffMs < 7 * dayMs) {
            return { key: "last-7-days", label: "Last 7 Days" };
          }
  
          if (diffMs < 30 * dayMs) {
            return { key: "last-30-days", label: "Last 30 Days" };
          }
  
          return { key: "older", label: "Older" };
        }
  
        function normalizeHistoryPath(value) {
          const raw = String(value || "").trim();
          if (!raw) return "";
          let normalized = raw.split("\\").join("/");
          while (normalized.startsWith("/")) {
            normalized = normalized.slice(1);
          }
          if (normalized.startsWith("workspace/")) {
            normalized = normalized.slice("workspace/".length);
          }
          return normalized;
        }
  
        function shouldHideHistoryChangePath(value) {
          const normalized = normalizeHistoryPath(value);
          return Boolean(normalized) && /\.jsonl$/i.test(normalized);
        }
  
        function historyPathsMatch(left, right) {
          return normalizeHistoryPath(left) === normalizeHistoryPath(right);
        }
  
        function uniqueHistoryPaths(values) {
          const seen = new Set();
          return values
            .map(normalizeHistoryPath)
            .filter((value) => {
              if (!value || seen.has(value)) return false;
              seen.add(value);
              return true;
            });
        }
  
        function formatHistoryTimestamp(value) {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          return new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(date);
        }
  
        function formatHistoryDateHeading(value) {
          if (!value) return "Changes";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "Changes";
          return "Changes on " + new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(date);
        }
  
        function getHistoryDateGroupKey(value) {
          if (!value) return "unknown";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "unknown";
          return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
          ].join("-");
        }
  
        function normalizeHistoryPreviewText(value, maxLength = 140) {
          const normalized = String(value || "").replace(/\s+/g, " ").trim();
          if (!normalized) return "";
          return normalized.length > maxLength ? normalized.slice(0, maxLength - 1).trimEnd() + "…" : normalized;
        }
  
        function getHistoryLogCommand(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          return typeof metadata.command === "string" ? metadata.command : "";
        }
  
        function isReadOnlyHistorySyntheticFileCommand(command) {
          const normalized = String(command || "").trim().replace(/^\$\s*/, "");
          if (!normalized) {
            return false;
          }
  
          if (/(^|[^>])>>?/.test(normalized)) {
            return false;
          }
  
          const readOnlyCommands = new Set([
            "cat",
            "diff",
            "du",
            "env",
            "exiftool",
            "file",
            "find",
            "git",
            "grep",
            "head",
            "identify",
            "less",
            "ls",
            "od",
            "pwd",
            "readlink",
            "realpath",
            "rg",
            "sed",
            "sort",
            "stat",
            "tail",
            "wc",
            "which",
          ]);
          const writeCommands = new Set([
            "cp",
            "curl",
            "ffmpeg",
            "install",
            "magick",
            "mkdir",
            "mv",
            "rm",
            "tee",
            "touch",
            "wget",
          ]);
  
          const segments = normalized.split(/\s*(?:&&|\|\||;)\s*/).map((segment) => segment.trim()).filter(Boolean);
          if (segments.length === 0) {
            return false;
          }
  
          function resolveCommandName(segment) {
            const tokens = String(segment || "").split(/\s+/).filter(Boolean);
            let index = 0;
            while (index < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[index])) {
              index += 1;
            }
            if (tokens[index] === "sudo") {
              index += 1;
            }
            return (tokens[index] || "").toLowerCase();
          }
  
          let sawReadOnly = false;
          for (const segment of segments) {
            const commandName = resolveCommandName(segment);
            if (!commandName) {
              return false;
            }
            if (writeCommands.has(commandName)) {
              return false;
            }
            if (!readOnlyCommands.has(commandName)) {
              return false;
            }
            sawReadOnly = true;
          }
  
          return sawReadOnly;
        }
  
        function shouldIgnoreSyntheticHistoryFileStep(step, historyLogsById) {
          if (!step || step.eventType !== "file_change") {
            return false;
          }
          const metadata = step && step.metadata && typeof step.metadata === "object" ? step.metadata : {};
          const routeSource = typeof metadata.routeSource === "string" ? metadata.routeSource : "";
          if (routeSource !== "threads.command_execution_generated_image") {
            return false;
          }
          if (!historyLogsById || typeof step.sourceMessageId !== "string" || !step.sourceMessageId) {
            return false;
          }
          const hasDiffs = metadata.diffs && typeof metadata.diffs === "object" && Object.keys(metadata.diffs).length > 0;
          const hasFileContents = metadata.fileContents && typeof metadata.fileContents === "object" && Object.keys(metadata.fileContents).length > 0;
          if (hasDiffs || hasFileContents) {
            return false;
          }
          const sourceLog = historyLogsById.get(step.sourceMessageId);
          if (!sourceLog || sourceLog.eventType !== "command_execution") {
            return false;
          }
          return isReadOnlyHistorySyntheticFileCommand(getHistoryLogCommand(sourceLog));
        }
  
        function extractStepChangedPaths(step, historyLogsById) {
          if (shouldIgnoreSyntheticHistoryFileStep(step, historyLogsById)) {
            return [];
          }
          const metadata = step && step.metadata && typeof step.metadata === "object" ? step.metadata : {};
          const values = [];
          if (Array.isArray(metadata.changedPaths)) values.push(...metadata.changedPaths);
          if (Array.isArray(metadata.filePaths)) values.push(...metadata.filePaths);
          if (metadata.diffs && typeof metadata.diffs === "object") values.push(...Object.keys(metadata.diffs));
          if (typeof metadata.path === "string") values.push(metadata.path);
          return uniqueHistoryPaths(values).filter((value) => !shouldHideHistoryChangePath(value));
        }
  
        function getHistoryPathName(value) {
          const normalized = normalizeHistoryPath(value);
          if (!normalized) return "";
          const segments = normalized.split("/").filter(Boolean);
          return segments[segments.length - 1] || normalized;
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_108__
  
        function isHistoryImagePath(value) {
          return /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(normalizeHistoryPath(value));
        }
  
        function normalizeGeneratedHistoryImagePath(value) {
          const normalized = normalizeHistoryPath(value);
          return normalized && isHistoryImagePath(normalized) ? normalized : "";
        }
  
        function normalizeHistoryChangeKind(value) {
          const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
          return normalized === "created" || normalized === "modified" || normalized === "deleted"
            ? normalized
            : null;
        }
  
        function buildHistoryStructuredPatchDiff(filePath, patches, operation) {
          const normalizedPath = normalizeHistoryPath(filePath);
          if (!normalizedPath || !Array.isArray(patches) || patches.length === 0) {
            return "";
          }
          const oldHeaderPath = operation === "created" ? "/dev/null" : "a/" + normalizedPath;
          const newHeaderPath = operation === "deleted" ? "/dev/null" : "b/" + normalizedPath;
          const lines = ["--- " + oldHeaderPath, "+++ " + newHeaderPath];
  
          for (const patch of patches) {
            const oldStart = Number.isFinite(Number(patch?.oldStart)) ? Number(patch.oldStart) : 1;
            const oldLines = Number.isFinite(Number(patch?.oldLines)) ? Number(patch.oldLines) : 0;
            const newStart = Number.isFinite(Number(patch?.newStart)) ? Number(patch.newStart) : 1;
            const newLines = Number.isFinite(Number(patch?.newLines)) ? Number(patch.newLines) : 0;
            lines.push("@@ -" + oldStart + "," + oldLines + " +" + newStart + "," + newLines + " @@");
            if (Array.isArray(patch?.lines)) {
              lines.push(...patch.lines.map((entry) => String(entry)));
            }
          }
  
          return lines.join("\n");
        }
  
        function extractHistoryStructuredWritePayload(output) {
          const normalizeOperation = (value) => {
            const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
            if (!normalized) return null;
            if (normalized === "created" || normalized === "create" || normalized === "new" || normalized === "write") return "created";
            if (
              normalized === "modified"
              || normalized === "modify"
              || normalized === "updated"
              || normalized === "update"
              || normalized === "edit"
              || normalized === "edited"
              || normalized === "replace"
            ) {
              return "modified";
            }
            if (normalized === "delete" || normalized === "deleted" || normalized === "remove" || normalized === "removed") {
              return "deleted";
            }
            return null;
          };
  
          const visit = (value) => {
            if (value == null) return null;
            if (Array.isArray(value)) {
              for (const entry of value) {
                const nested = visit(entry);
                if (nested) return nested;
              }
              return null;
            }
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
                return null;
              }
              try {
                return visit(JSON.parse(trimmed));
              } catch {
                return null;
              }
            }
            if (typeof value !== "object") return null;
  
            const record = value;
            const filePathCandidate =
              typeof record.filePath === "string" ? record.filePath
              : typeof record.file_path === "string" ? record.file_path
              : typeof record.path === "string" ? record.path
              : "";
            const contentCandidate =
              typeof record.content === "string" ? record.content
              : typeof record.text === "string" ? record.text
              : typeof record.newContent === "string" ? record.newContent
              : typeof record.newString === "string" ? record.newString
              : "";
            const operationCandidate =
              normalizeOperation(record.operationKind)
              || normalizeOperation(record.operation_kind)
              || normalizeOperation(record.operation)
              || normalizeOperation(record.type)
              || normalizeOperation(record.mode);
            const structuredPatch = Array.isArray(record.structuredPatch)
              ? record.structuredPatch
              : Array.isArray(record.structured_patch)
                ? record.structured_patch
                : [];
            const gitDiff =
              typeof record.gitDiff === "string" && record.gitDiff.trim()
                ? record.gitDiff
                : typeof record.diff === "string" && record.diff.trim()
                  ? record.diff
                  : typeof record.changes === "string" && record.changes.trim()
                    ? record.changes
                    : "";
            const diffText =
              gitDiff
              || (filePathCandidate && structuredPatch.length > 0
                ? buildHistoryStructuredPatchDiff(filePathCandidate, structuredPatch, operationCandidate || "modified")
                : "");
            const diffStats = diffText ? summarizeUnifiedDiffStats(diffText) : null;
  
            if (filePathCandidate || contentCandidate || operationCandidate || diffText) {
              return {
                ...(filePathCandidate ? { filePath: filePathCandidate } : {}),
                ...(contentCandidate ? { content: contentCandidate } : {}),
                ...(operationCandidate ? { operation: operationCandidate } : {}),
                ...(diffText ? { diffText } : {}),
                ...(diffStats ? { additions: diffStats.additions, deletions: diffStats.deletions } : {}),
              };
            }
  
            const nestedCandidates = [
              record.file,
              record.result,
              record.payload,
              record.data,
              record.structuredContent,
              record.structured_content,
            ];
            for (const candidate of nestedCandidates) {
              const nested = visit(candidate);
              if (nested) return nested;
            }
            return null;
          };
  
          return visit(output);
        }
  
        function extractDeletedHistoryPathFromCommandOutput(log) {
          if (!log || log.eventType !== "command_execution") {
            return "";
          }
          const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const output = typeof metadata.output === "string" ? metadata.output : "";
          if (!output) {
            return "";
          }
  
          let combinedOutput = output;
          try {
            const parsed = JSON.parse(output);
            const stdout = typeof parsed?.stdout === "string" ? parsed.stdout : "";
            const stderr = typeof parsed?.stderr === "string" ? parsed.stderr : "";
            combinedOutput = [stdout, stderr, output].filter(Boolean).join("\n");
          } catch {}
  
          if (!/no such file or directory/i.test(combinedOutput)) {
            return "";
          }
  
          const pathMatch =
            combinedOutput.match(/cannot access ['"]([^'"]+)['"]:\s+No such file or directory/i)
            || combinedOutput.match(/cannot remove ['"]([^'"]+)['"]:\s+No such file or directory/i);
          return pathMatch?.[1] ? normalizeHistoryPath(pathMatch[1]) : "";
        }
  
        function createHistoryImageFileEntry(filePath, changeKind) {
          const normalizedPath = normalizeGeneratedHistoryImagePath(filePath);
          if (!normalizedPath) {
            return null;
          }
          return {
            path: normalizedPath,
            name: getHistoryPathName(normalizedPath),
            type: "file",
            size: null,
            changeKind: normalizeHistoryChangeKind(changeKind),
            additions: null,
            deletions: null,
            diffText: "",
            isChanged: true,
          };
        }
  
        function asHistoryObjectRecord(value) {
          return value && typeof value === "object" && !Array.isArray(value) ? value : null;
        }
  
        function asHistoryOptionalTrimmedString(value) {
          return typeof value === "string" && value.trim() ? value.trim() : "";
        }
  
        function normalizeHistoryNumericValue(value) {
          const parsed = typeof value === "number" ? value : Number(value);
          return Number.isFinite(parsed) ? parsed : null;
        }
  
        function normalizeHistoryTaskTicketNumber(value) {
          const normalized = String(value || "").trim();
          if (!normalized) return "";
          const digits = Array.from(normalized).filter((character) => character >= "0" && character <= "9").join("");
          const parsed = Number.parseInt(digits || normalized, 10);
          if (!Number.isFinite(parsed) || parsed <= 0) {
            return "";
          }
          return String(parsed).padStart(3, "0");
        }
  
        function normalizeHistoryTaskStatus(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (normalized === "todo" || normalized === "backlog") return "todo";
          if (normalized === "in_progress" || normalized === "blocked" || normalized === "done") return normalized;
          return "";
        }
  
        function normalizeHistoryTaskPriority(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (normalized === "low" || normalized === "medium" || normalized === "high" || normalized === "critical") {
            return normalized;
          }
          return "";
        }
  
        function normalizeHistoryTaskType(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (normalized === "subtask") return "subtask";
          if (normalized === "loop" || normalized === "loop_task" || normalized === "metronome_loop") return "loop";
          if (normalized === "task") return "task";
          return "";
        }
  
        function splitHistoryTaskTitleAndTicket(rawTitle) {
          const trimmedTitle = String(rawTitle || "").trim();
          const prefixedTicketMatch = trimmedTitle.match(/^((?:[A-Z]+-\d+)|(?:\d{2,4}))(?:(?:\s*[·\-:]\s*)|\s+)(.+)$/);
          if (prefixedTicketMatch?.[1] && prefixedTicketMatch[2]) {
            return {
              ticketNumber: prefixedTicketMatch[1].trim(),
              title: prefixedTicketMatch[2].trim() || trimmedTitle,
            };
          }
          return { title: trimmedTitle, ticketNumber: "" };
        }
  
        function formatHistoryResourceStatusLabel(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (!normalized) return "";
          if (normalized === "todo") return "To do";
          if (normalized === "in_progress") return "In progress";
          if (normalized === "done") return "Done";
          return normalized
            .split(/[_\s-]+/)
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" ");
        }
  
        function formatHistoryTaskPriorityLabel(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (!normalized) return "";
          return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }
  
        function formatHistoryTaskTypeLabel(value) {
          return String(value || "").trim().toLowerCase() === "subtask" ? "Subtask" : "Task";
        }
  
        function normalizeHistoryResourceType(value) {
          const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
          if (!normalized) return "";
          if (normalized === "agent" || normalized === "agents") return "agent";
          if (normalized === "skill" || normalized === "skills") return "skill";
          if (normalized === "task" || normalized === "tasks" || normalized === "subtask" || normalized === "subtasks") return "task";
          if (normalized === "release" || normalized === "releases") return "release";
          if (
            normalized === "environment"
            || normalized === "environments"
            || normalized === "env"
            || normalized === "envs"
          ) {
            return "environment";
          }
          return "";
        }
  
        function inferHistoryResourceTypeFromId(value) {
          const normalized = String(value || "").trim().toLowerCase();
          if (!normalized) return "";
          if (normalized.startsWith("agent_")) return "agent";
          if (normalized.startsWith("skill_")) return "skill";
          if (normalized.startsWith("task_")) return "task";
          if (normalized.startsWith("release_")) return "release";
          if (normalized.startsWith("env_") || normalized.startsWith("environment_")) return "environment";
          return "";
        }
  
        function getHistoryResourceTypeLabel(resourceType) {
          if (resourceType === "agent") return "Agent";
          if (resourceType === "skill") return "Skill";
          if (resourceType === "task") return "Task";
          if (resourceType === "release") return "Milestone";
          if (resourceType === "environment") return "Environment";
          return "Resource";
        }
  
        function getHistoryResourceSyntheticPath(resourceType, resourceId, name) {
          const typeSegment = normalizeHistoryResourceType(resourceType) || "resource";
          const rawIdentifier = String(resourceId || name || "").trim();
          const normalizedIdentifier = rawIdentifier
            ? rawIdentifier.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "")
            : "";
          return "__computer_agents__/" + typeSegment + "/" + (normalizedIdentifier || "created");
        }
  
        function extractHistoryCommandFlagValue(command, flagPattern) {
          const flagRegex = new RegExp("(?:^|\s)(?:" + flagPattern + ")\s+", "i");
          const match = String(command || "").match(flagRegex);
          if (!match || match.index === undefined) return null;
          const rest = String(command || "").slice(match.index + match[0].length);
          const first = rest[0];
          if (first === '"' || first === "'") {
            let value = "";
            for (let index = 1; index < rest.length; index += 1) {
              const current = rest[index];
              if (current === String.fromCharCode(92) && index + 1 < rest.length) {
                value += rest[index + 1];
                index += 1;
                continue;
              }
              if (current === first) break;
              value += current;
            }
            return value.trim();
          }
          const unquoted = rest.match(/^(\S+)/);
          return unquoted ? unquoted[1].trim() : null;
        }
  
        function inferComputerAgentsResourceTypeFromCommand(command) {
          const normalized = String(command || "").trim();
          if (!normalized) return "";
          if (/computer-agents\.py[\s\S]*\bagents\s+create\b/i.test(normalized)) return "agent";
          if (/computer-agents\.py[\s\S]*\bskills\s+create\b/i.test(normalized)) return "skill";
          if (/computer-agents\.py[\s\S]*\benvironments\s+create\b/i.test(normalized)) return "environment";
          if (/computer-agents\.py[\s\S]*\benvironments\s+clone\b/i.test(normalized)) return "environment";
          return "";
        }
  
        function inferComputerAgentsResourceTypeFromToolLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const serverName = String(metadata.serverName || "").trim().toLowerCase();
          const toolName = String(metadata.toolName || "").trim().toLowerCase();
          const combined = [serverName, toolName].filter(Boolean).join(" ");
          if (!combined) return "";
          if (!/(computer[_ -]?agents?|agents?|skills?|environments?|envs?)/.test(combined)) {
            return "";
          }
          if (/agents?/.test(combined) && /create|new/.test(combined)) return "agent";
          if (/skills?/.test(combined) && /create|new/.test(combined)) return "skill";
          if (/(?:environments?|envs?)/.test(combined) && /create|clone|new/.test(combined)) return "environment";
          return "";
        }
  
        function isComputerAgentsCreateHistoryLog(log) {
          if (!log || typeof log !== "object") return false;
          const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          return Boolean(
            inferComputerAgentsResourceTypeFromCommand(metadata.command)
            || inferComputerAgentsResourceTypeFromToolLog(log)
          );
        }
  
        function createHistoryResourceEntry(resourceType, record) {
          const resource = record && typeof record === "object" ? record : {};
          const metadata = asHistoryObjectRecord(resource.metadata);
          const runnerPlayground = asHistoryObjectRecord(metadata?.runnerPlayground);
          const assigneeRecord = asHistoryObjectRecord(resource.assignee) || asHistoryObjectRecord(resource.assigneeAgent);
          const normalizedType =
            normalizeHistoryResourceType(resourceType)
            || normalizeHistoryResourceType(resource.resourceType)
            || normalizeHistoryResourceType(resource.object)
            || normalizeHistoryResourceType(resource.type)
            || inferHistoryResourceTypeFromId(resource.id);
          if (!normalizedType) {
            return null;
          }
          const resourceId =
            asHistoryOptionalTrimmedString(resource.id)
            || asHistoryOptionalTrimmedString(resource.taskId)
            || asHistoryOptionalTrimmedString(resource.task_id)
            || asHistoryOptionalTrimmedString(resource.environmentId)
            || asHistoryOptionalTrimmedString(resource.environment_id)
            || asHistoryOptionalTrimmedString(resource.releaseId)
            || asHistoryOptionalTrimmedString(resource.release_id);
          const rawResourceName =
            asHistoryOptionalTrimmedString(resource.name)
            || asHistoryOptionalTrimmedString(resource.title)
            || asHistoryOptionalTrimmedString(resource.label)
            || asHistoryOptionalTrimmedString(resource.releaseName)
            || asHistoryOptionalTrimmedString(resource.release_name);
          const taskTitleParts = normalizedType === "task" ? splitHistoryTaskTitleAndTicket(rawResourceName) : null;
          const resourceName = normalizedType === "task" ? (taskTitleParts?.title || rawResourceName) : rawResourceName;
          if (!resourceId && !resourceName) {
            return null;
          }
          const description = normalizeHistoryPreviewText(
            resource.description
            || resource.instructions
            || resource.markdown
            || resource.documentation
            || "",
            220
          );
          const taskStatus = normalizeHistoryTaskStatus(
            asHistoryOptionalTrimmedString(resource.status)
            || asHistoryOptionalTrimmedString(runnerPlayground?.status)
          );
          const taskPriority = normalizeHistoryTaskPriority(
            asHistoryOptionalTrimmedString(resource.priority)
            || asHistoryOptionalTrimmedString(runnerPlayground?.priority)
          );
          const explicitTaskType =
            normalizeHistoryTaskType(resource.taskType)
            || normalizeHistoryTaskType(resource.task_type)
            || normalizeHistoryTaskType(resource.type)
            || normalizeHistoryTaskType(runnerPlayground?.taskType);
          const parentTaskId =
            asHistoryOptionalTrimmedString(resource.parentTaskId)
            || asHistoryOptionalTrimmedString(resource.parent_task_id)
            || asHistoryOptionalTrimmedString(runnerPlayground?.parentTaskId);
          const ticketNumber = normalizeHistoryTaskTicketNumber(
            asHistoryOptionalTrimmedString(resource.ticketNumber)
            || asHistoryOptionalTrimmedString(resource.ticket_number)
            || asHistoryOptionalTrimmedString(resource.ticket)
            || asHistoryOptionalTrimmedString(runnerPlayground?.ticketNumber)
            || (taskTitleParts ? taskTitleParts.ticketNumber : "")
          );
          const projectId =
            asHistoryOptionalTrimmedString(resource.projectId)
            || asHistoryOptionalTrimmedString(resource.project_id)
            || asHistoryOptionalTrimmedString(metadata?.projectId)
            || asHistoryOptionalTrimmedString(metadata?.project_id);
          const projectName =
            asHistoryOptionalTrimmedString(resource.projectName)
            || asHistoryOptionalTrimmedString(resource.project_name);
          const environmentId =
            asHistoryOptionalTrimmedString(resource.environmentId)
            || asHistoryOptionalTrimmedString(resource.environment_id)
            || asHistoryOptionalTrimmedString(runnerPlayground?.environmentId);
          const assigneeName =
            asHistoryOptionalTrimmedString(resource.assigneeName)
            || asHistoryOptionalTrimmedString(resource.assignee_name)
            || asHistoryOptionalTrimmedString(resource.assigneeAgentName)
            || asHistoryOptionalTrimmedString(resource.assigneeActorName)
            || asHistoryOptionalTrimmedString(resource.assignedToName)
            || asHistoryOptionalTrimmedString(assigneeRecord?.name)
            || asHistoryOptionalTrimmedString(assigneeRecord?.displayName);
          return {
            path: getHistoryResourceSyntheticPath(normalizedType, resourceId, resourceName),
            name: resourceName || getHistoryResourceTypeLabel(normalizedType),
            type: "resource",
            resourceType: normalizedType,
            resourceTypeLabel: getHistoryResourceTypeLabel(normalizedType),
            resourceId: resourceId || "",
            changeKind: "created",
            additions: null,
            deletions: null,
            diffText: "",
            isChanged: true,
            description,
            category: asHistoryOptionalTrimmedString(resource.category),
            model:
              asHistoryOptionalTrimmedString(resource.model)
              || asHistoryOptionalTrimmedString(resource.deepResearchModel),
            projectId,
            projectName,
            environmentId,
            isDefault: Boolean(resource.isDefault),
            ticketNumber,
            status: normalizedType === "task" ? taskStatus : asHistoryOptionalTrimmedString(resource.status),
            priority: normalizedType === "task" ? taskPriority : "",
            taskType: normalizedType === "task" ? (explicitTaskType || (parentTaskId ? "subtask" : "task")) : "",
            assigneeName,
            startAt: asHistoryOptionalTrimmedString(resource.startAt),
            endAt: asHistoryOptionalTrimmedString(resource.endAt),
            taskCount: normalizeHistoryNumericValue(resource.taskCount),
            openTaskCount: normalizeHistoryNumericValue(resource.openTaskCount),
          };
        }
  
        function extractComputerAgentsResourceEntriesFromValue(value, fallbackType) {
          const entries = new Map();
  
          function push(resourceType, record) {
            const entry = createHistoryResourceEntry(resourceType, record);
            if (!entry) return;
            const existing = entries.get(entry.path);
            entries.set(entry.path, existing ? { ...existing, ...entry } : entry);
          }
  
          function visit(candidate, hintedType) {
            if (!candidate) return;
            if (typeof candidate === "string") {
              const trimmed = candidate.trim();
              if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
                try {
                  visit(JSON.parse(trimmed), hintedType);
                } catch {}
              }
              return;
            }
            if (Array.isArray(candidate)) {
              for (const item of candidate) visit(item, hintedType);
              return;
            }
            if (typeof candidate !== "object") {
              return;
            }
  
            const record = candidate;
            if (record.agent && typeof record.agent === "object") push("agent", record.agent);
            if (record.skill && typeof record.skill === "object") push("skill", record.skill);
            if (record.environment && typeof record.environment === "object") push("environment", record.environment);
  
            if (Array.isArray(record.agents)) {
              for (const item of record.agents) push("agent", item);
            }
            if (Array.isArray(record.skills)) {
              for (const item of record.skills) push("skill", item);
            }
            if (Array.isArray(record.environments)) {
              for (const item of record.environments) push("environment", item);
            }
  
            const inferredType =
              normalizeHistoryResourceType(hintedType)
              || normalizeHistoryResourceType(record.resourceType)
              || normalizeHistoryResourceType(record.object)
              || normalizeHistoryResourceType(record.type)
              || inferHistoryResourceTypeFromId(record.id);
            if (inferredType && (record.id || record.name || record.title)) {
              push(inferredType, record);
            }
  
            for (const nestedValue of Object.values(record)) {
              if (nestedValue && typeof nestedValue === "object") {
                visit(nestedValue, null);
              } else if (typeof nestedValue === "string") {
                visit(nestedValue, null);
              }
            }
          }
  
          visit(value, fallbackType);
          return Array.from(entries.values());
        }
  
        function extractComputerAgentsResourceEntriesFromHistoryOutput(output, fallbackType) {
          const entries = new Map();
          const normalizedOutput = typeof output === "string" ? output : "";
          if (!normalizedOutput.trim()) {
            return [];
          }
  
          for (const entry of extractComputerAgentsResourceEntriesFromValue(normalizedOutput, fallbackType)) {
            entries.set(entry.path, entry);
          }
  
          const fallbackTypeLabel = normalizeHistoryResourceType(fallbackType);
          const creationPatterns = [
            { type: "agent", pattern: /\bagent created\b[:\s-]*(.+?)\s*\((agent_[A-Za-z0-9_-]+)\)/ig },
            { type: "skill", pattern: /\bskill created\b[:\s-]*(.+?)\s*\((skill_[A-Za-z0-9_-]+)\)/ig },
            { type: "environment", pattern: /\benvironment created\b[:\s-]*(.+?)\s*\(((?:env|environment)_[A-Za-z0-9_-]+)\)/ig },
          ];
          for (const { type, pattern } of creationPatterns) {
            for (const match of normalizedOutput.matchAll(pattern)) {
              const entry = createHistoryResourceEntry(type, {
                id: match[2],
                name: String(match[1] || "").trim(),
              });
              if (entry) {
                entries.set(entry.path, entry);
              }
            }
          }
  
          if (entries.size === 0 && fallbackTypeLabel) {
            const idPattern =
              fallbackTypeLabel === "agent"
                ? /(agent_[A-Za-z0-9_-]+)/i
                : fallbackTypeLabel === "skill"
                  ? /(skill_[A-Za-z0-9_-]+)/i
                  : /((?:env|environment)_[A-Za-z0-9_-]+)/i;
            const idMatch = normalizedOutput.match(idPattern);
            if (idMatch) {
              const entry = createHistoryResourceEntry(fallbackTypeLabel, {
                id: idMatch[1],
              });
              if (entry) {
                entries.set(entry.path, entry);
              }
            }
          }
  
          return Array.from(entries.values());
        }
  
        function extractComputerAgentsResourceEntriesFromHistoryLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const command = typeof metadata.command === "string" ? metadata.command : "";
          const output = typeof metadata.output === "string" ? metadata.output : "";
          const result = metadata.result;
          const args = metadata.args;
          const fileContents = metadata.fileContents && typeof metadata.fileContents === "object"
            ? Object.values(metadata.fileContents)
            : [];
          const fallbackType =
            inferComputerAgentsResourceTypeFromCommand(command)
            || inferComputerAgentsResourceTypeFromToolLog(log);
          const entries = new Map();
  
          function append(list) {
            for (const entry of Array.isArray(list) ? list : []) {
              if (entry && typeof entry === "object" && entry.path) {
                const existing = entries.get(entry.path);
                entries.set(entry.path, existing ? { ...existing, ...entry } : entry);
              }
            }
          }
  
          append(extractComputerAgentsResourceEntriesFromValue(result, fallbackType));
          append(extractComputerAgentsResourceEntriesFromValue(args, fallbackType));
          append(extractComputerAgentsResourceEntriesFromHistoryOutput(output, fallbackType));
          append(extractComputerAgentsResourceEntriesFromHistoryOutput(log?.message || "", fallbackType));
          for (const value of fileContents) {
            append(extractComputerAgentsResourceEntriesFromHistoryOutput(typeof value === "string" ? value : "", fallbackType));
          }
  
          if (entries.size === 0 && (fallbackType || isComputerAgentsCreateHistoryLog(log))) {
            const fallbackName = extractHistoryCommandFlagValue(command, "--name");
            if (fallbackName) {
              const fallbackEntry = createHistoryResourceEntry(fallbackType, {
                id: extractHistoryCommandFlagValue(command, "--id") || "",
                name: fallbackName,
                description: extractHistoryCommandFlagValue(command, "--description") || "",
                model: extractHistoryCommandFlagValue(command, "--model") || "",
                category: extractHistoryCommandFlagValue(command, "--category") || "",
                projectId: extractHistoryCommandFlagValue(command, "--project-id") || "",
              });
              if (fallbackEntry) {
                entries.set(fallbackEntry.path, fallbackEntry);
              }
            }
          }
  
          return Array.from(entries.values());
        }
  
        function isTaskManagementCreateCommand(command) {
          return /manage-tasks\.py[\s\S]*\btasks\s+create\b/i.test(String(command || ""));
        }
  
        function isTaskManagementCreateToolInvocation(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const serverName = String(metadata.serverName || "").trim().toLowerCase();
          const toolName = String(metadata.toolName || "").trim().toLowerCase();
          return (
            /task/.test(serverName || toolName)
            && (
              /(?:^|[._/-])create(?:[._/-])?tasks?(?:$|[._/-])/.test(toolName)
              || /(?:^|[._/-])tasks?(?:[._/-])create(?:$|[._/-])/.test(toolName)
            )
          );
        }
  
        function isTaskManagementCreateHistoryLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          return Boolean(isTaskManagementCreateCommand(metadata.command) || isTaskManagementCreateToolInvocation(log));
        }
  
        function buildHistoryTaskEntryFromTaskPayload(value) {
          const payload = asHistoryObjectRecord(value);
          if (!payload) return null;
          const taskRecord = asHistoryObjectRecord(payload.task);
          if (!taskRecord) return null;
          const details = asHistoryObjectRecord(payload.details);
          const project = asHistoryObjectRecord(details?.project);
          const assignee = asHistoryObjectRecord(details?.assignee);
          return createHistoryResourceEntry("task", {
            ...taskRecord,
            ...(project && !Object.prototype.hasOwnProperty.call(taskRecord, "projectName")
              ? {
                  projectName:
                    asHistoryOptionalTrimmedString(project.name)
                    || asHistoryOptionalTrimmedString(project.title)
                    || "",
                  projectId: asHistoryOptionalTrimmedString(project.id) || "",
                }
              : {}),
            ...(assignee && !Object.prototype.hasOwnProperty.call(taskRecord, "assigneeName")
              ? {
                  assigneeName:
                    asHistoryOptionalTrimmedString(assignee.name)
                    || asHistoryOptionalTrimmedString(assignee.displayName)
                    || "",
                  assigneeAgentId: asHistoryOptionalTrimmedString(assignee.id) || "",
                }
              : {}),
          });
        }
  
        function normalizeTaskManagementTaskEntry(value) {
          const record = asHistoryObjectRecord(value);
          if (!record) return null;
          const metadata = asHistoryObjectRecord(record.metadata);
          const runnerPlayground = asHistoryObjectRecord(metadata?.runnerPlayground);
          const title = asHistoryOptionalTrimmedString(record.title)
            || asHistoryOptionalTrimmedString(record.name)
            || asHistoryOptionalTrimmedString(record.taskTitle);
          const titleParts = splitHistoryTaskTitleAndTicket(title);
          const ticketNumber = normalizeHistoryTaskTicketNumber(
            asHistoryOptionalTrimmedString(record.ticketNumber)
            || asHistoryOptionalTrimmedString(record.ticket_number)
            || asHistoryOptionalTrimmedString(record.ticket)
            || asHistoryOptionalTrimmedString(runnerPlayground?.ticketNumber)
            || titleParts.ticketNumber
          );
          const explicitTaskType =
            normalizeHistoryTaskType(record.taskType)
            || normalizeHistoryTaskType(record.task_type)
            || (["task", "subtask", "loop"].includes(String(record.type || "").trim().toLowerCase()) ? normalizeHistoryTaskType(record.type) : "")
            || normalizeHistoryTaskType(runnerPlayground?.taskType);
          const hasExplicitTaskIdentifier =
            String(record.id || "").trim().startsWith("task_")
            || Object.prototype.hasOwnProperty.call(record, "taskId")
            || Object.prototype.hasOwnProperty.call(record, "task_id");
          const runnerPlaygroundHasTaskSignals =
            runnerPlayground !== null
            && (
              Boolean(asHistoryOptionalTrimmedString(runnerPlayground.ticketNumber))
              || Boolean(normalizeHistoryTaskType(runnerPlayground.taskType))
              || Boolean(asHistoryOptionalTrimmedString(runnerPlayground.taskColor))
              || Boolean(asHistoryOptionalTrimmedString(runnerPlayground.assigneeActorId))
              || Array.isArray(runnerPlayground.dependencyIds)
              || Array.isArray(runnerPlayground.linkedThreadIds)
            );
          const looksLikeTaskRecord =
            Boolean(titleParts.title)
            && (
              hasExplicitTaskIdentifier
              || Boolean(ticketNumber)
              || Boolean(explicitTaskType)
              || Object.prototype.hasOwnProperty.call(record, "assigneeAgentId")
              || Object.prototype.hasOwnProperty.call(record, "parentTaskId")
              || Object.prototype.hasOwnProperty.call(record, "linkedThreadIds")
              || Object.prototype.hasOwnProperty.call(record, "dependencyIds")
              || runnerPlaygroundHasTaskSignals
            );
          if (!looksLikeTaskRecord) {
            return null;
          }
          return createHistoryResourceEntry("task", {
            ...record,
            title: titleParts.title || title,
            ticketNumber: ticketNumber || undefined,
            taskType: explicitTaskType || undefined,
          });
        }
  
        function extractTaskManagementTaskEntriesFromHistoryValue(value) {
          const entries = new Map();
          const visited = new WeakSet();
  
          function append(entry) {
            if (!entry || !entry.path) return;
            const existing = entries.get(entry.path);
            entries.set(entry.path, existing ? { ...existing, ...entry } : entry);
          }
  
          function visit(current, depth) {
            if (!current || depth > 6) return;
            if (Array.isArray(current)) {
              current.forEach((item) => visit(item, depth + 1));
              return;
            }
            if (typeof current === "string") {
              const trimmed = current.trim();
              if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
                try {
                  visit(JSON.parse(trimmed), depth + 1);
                } catch {}
              }
              return;
            }
            const record = asHistoryObjectRecord(current);
            if (!record || visited.has(record)) return;
            visited.add(record);
  
            append(buildHistoryTaskEntryFromTaskPayload(record));
            append(normalizeTaskManagementTaskEntry(record));
  
            for (const nestedValue of Object.values(record)) {
              if (nestedValue && typeof nestedValue === "object") {
                visit(nestedValue, depth + 1);
              }
            }
          }
  
          visit(value, 0);
          return Array.from(entries.values());
        }
  
        function extractTaskManagementTaskEntriesFromHistoryText(text) {
          const normalized = typeof text === "string" ? text.trim() : "";
          if (!normalized) return [];
          try {
            const parsed = JSON.parse(normalized);
            const structuredEntries = extractTaskManagementTaskEntriesFromHistoryValue(parsed);
            if (structuredEntries.length > 0) {
              return structuredEntries;
            }
          } catch {}
  
          const entries = [];
          const lines = normalized.split(/\r?\n/);
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            const createdMatch = line.match(/^(?:[+*-]\s*)?(?:✓\s*)?Created:\s*(.+?)(?:\s+\((task_[^)]+)\))?\s*$/i);
            if (!createdMatch?.[1]) {
              continue;
            }
            const titleParts = splitHistoryTaskTitleAndTicket(createdMatch[1]);
            const entry = createHistoryResourceEntry("task", {
              id: createdMatch[2] || "",
              title: titleParts.title,
              ticketNumber: titleParts.ticketNumber || "",
              status: "todo",
              priority: "medium",
              taskType: "task",
            });
            if (entry) {
              entries.push(entry);
            }
          }
          return entries;
        }
  
        function extractTaskManagementTaskEntriesFromHistoryLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const command = typeof metadata.command === "string" ? metadata.command : "";
          const output = typeof metadata.output === "string" ? metadata.output : "";
          const result = metadata.result;
          const args = metadata.args;
          const fileContents = metadata.fileContents && typeof metadata.fileContents === "object"
            ? Object.values(metadata.fileContents)
            : [];
          const entries = new Map();
  
          function append(list) {
            for (const entry of Array.isArray(list) ? list : []) {
              if (entry && typeof entry === "object" && entry.path) {
                const existing = entries.get(entry.path);
                entries.set(entry.path, existing ? { ...existing, ...entry } : entry);
              }
            }
          }
  
          append(extractTaskManagementTaskEntriesFromHistoryValue(result));
          append(extractTaskManagementTaskEntriesFromHistoryValue(args));
          append(extractTaskManagementTaskEntriesFromHistoryText(output));
          append(extractTaskManagementTaskEntriesFromHistoryText(log?.message || ""));
          for (const value of fileContents) {
            append(extractTaskManagementTaskEntriesFromHistoryText(typeof value === "string" ? value : ""));
          }
  
          if (entries.size === 0 && isTaskManagementCreateHistoryLog(log)) {
            const fallbackTitle = extractHistoryCommandFlagValue(command, "--title");
            if (fallbackTitle) {
              const titleParts = splitHistoryTaskTitleAndTicket(fallbackTitle);
              const fallbackEntry = createHistoryResourceEntry("task", {
                id: extractHistoryCommandFlagValue(command, "--task-id") || extractHistoryCommandFlagValue(command, "--id") || "",
                title: titleParts.title,
                ticketNumber: titleParts.ticketNumber || "",
                status: "todo",
                priority: "medium",
                taskType: extractHistoryCommandFlagValue(command, "--task-type") || "",
                projectId: extractHistoryCommandFlagValue(command, "--project-id") || "",
              });
              if (fallbackEntry) {
                entries.set(fallbackEntry.path, fallbackEntry);
              }
            }
          }
  
          return Array.from(entries.values());
        }
  
        function isTaskManagementReleaseCreateCommand(command) {
          return /manage-tasks\.py[\s\S]*\breleases\s+create\b/i.test(String(command || ""));
        }
  
        function isTaskManagementReleaseCreateToolInvocation(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const serverName = String(metadata.serverName || "").trim().toLowerCase();
          const toolName = String(metadata.toolName || "").trim().toLowerCase();
          return (
            /task/.test(serverName || toolName)
            && (
              /(?:^|[._/-])create(?:[._/-])?releases?(?:$|[._/-])/.test(toolName)
              || /(?:^|[._/-])releases?(?:[._/-])create(?:$|[._/-])/.test(toolName)
            )
          );
        }
  
        function isTaskManagementReleaseCreateHistoryLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          return Boolean(isTaskManagementReleaseCreateCommand(metadata.command) || isTaskManagementReleaseCreateToolInvocation(log));
        }
  
        function normalizeTaskManagementReleaseEntry(value) {
          const record = asHistoryObjectRecord(value);
          if (!record) return null;
          const metadata = asHistoryObjectRecord(record.metadata);
          const normalizedType =
            normalizeHistoryResourceType(record.resourceType)
            || normalizeHistoryResourceType(record.object)
            || normalizeHistoryResourceType(record.type)
            || inferHistoryResourceTypeFromId(record.id);
          const id =
            asHistoryOptionalTrimmedString(record.id)
            || asHistoryOptionalTrimmedString(record.releaseId)
            || asHistoryOptionalTrimmedString(record.release_id);
          const name =
            asHistoryOptionalTrimmedString(record.name)
            || asHistoryOptionalTrimmedString(record.title)
            || asHistoryOptionalTrimmedString(record.releaseName)
            || asHistoryOptionalTrimmedString(record.release_name);
          const looksLikeReleaseRecord =
            normalizedType === "release"
            || id.startsWith("release_")
            || Object.prototype.hasOwnProperty.call(record, "startAt")
            || Object.prototype.hasOwnProperty.call(record, "endAt")
            || Object.prototype.hasOwnProperty.call(record, "openTaskCount")
            || Object.prototype.hasOwnProperty.call(record, "taskCount")
            || Object.prototype.hasOwnProperty.call(record, "releaseId");
          if (!looksLikeReleaseRecord || (!id && !name)) {
            return null;
          }
          return createHistoryResourceEntry("release", {
            ...record,
            id,
            name: name || "Untitled Milestone",
            projectId:
              asHistoryOptionalTrimmedString(record.projectId)
              || asHistoryOptionalTrimmedString(record.project_id)
              || asHistoryOptionalTrimmedString(metadata?.projectId)
              || "",
          });
        }
  
        function extractTaskManagementReleaseEntriesFromHistoryValue(value) {
          const entries = new Map();
          const visited = new WeakSet();
  
          function append(entry) {
            if (!entry || !entry.path) return;
            const existing = entries.get(entry.path);
            entries.set(entry.path, existing ? { ...existing, ...entry } : entry);
          }
  
          function visit(current, depth) {
            if (!current || depth > 6) return;
            if (Array.isArray(current)) {
              current.forEach((item) => visit(item, depth + 1));
              return;
            }
            if (typeof current === "string") {
              const trimmed = current.trim();
              if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
                try {
                  visit(JSON.parse(trimmed), depth + 1);
                } catch {}
              }
              return;
            }
            const record = asHistoryObjectRecord(current);
            if (!record || visited.has(record)) return;
            visited.add(record);
  
            if (record.release && typeof record.release === "object") {
              append(normalizeTaskManagementReleaseEntry(record.release));
            }
            if (Array.isArray(record.releases)) {
              record.releases.forEach((item) => append(normalizeTaskManagementReleaseEntry(item)));
            }
            append(normalizeTaskManagementReleaseEntry(record));
  
            for (const nestedValue of Object.values(record)) {
              if (nestedValue && typeof nestedValue === "object") {
                visit(nestedValue, depth + 1);
              }
            }
          }
  
          visit(value, 0);
          return Array.from(entries.values());
        }
  
        function extractTaskManagementReleaseEntriesFromHistoryText(text) {
          const normalized = typeof text === "string" ? text.trim() : "";
          if (!normalized) return [];
          try {
            const parsed = JSON.parse(normalized);
            const structuredEntries = extractTaskManagementReleaseEntriesFromHistoryValue(parsed);
            if (structuredEntries.length > 0) {
              return structuredEntries;
            }
          } catch {}
  
          const entries = [];
          const lines = normalized.split(/\r?\n/);
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            const match = line.match(/^(?:[+*-]\s*)?(?:✓\s*)?(?:(?:Release|Milestone) created|Created (?:release|milestone)):\s*(.+?)(?:\s+\((release_[^)]+)\))?\s*$/i);
            if (!match?.[1]) {
              continue;
            }
            const entry = createHistoryResourceEntry("release", {
              id: match[2] || "",
              name: match[1],
            });
            if (entry) {
              entries.push(entry);
            }
          }
          return entries;
        }
  
        function extractTaskManagementReleaseEntriesFromHistoryLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const command = typeof metadata.command === "string" ? metadata.command : "";
          const output = typeof metadata.output === "string" ? metadata.output : "";
          const result = metadata.result;
          const args = metadata.args;
          const fileContents = metadata.fileContents && typeof metadata.fileContents === "object"
            ? Object.values(metadata.fileContents)
            : [];
          const entries = new Map();
  
          function append(list) {
            for (const entry of Array.isArray(list) ? list : []) {
              if (entry && typeof entry === "object" && entry.path) {
                const existing = entries.get(entry.path);
                entries.set(entry.path, existing ? { ...existing, ...entry } : entry);
              }
            }
          }
  
          append(extractTaskManagementReleaseEntriesFromHistoryValue(result));
          append(extractTaskManagementReleaseEntriesFromHistoryValue(args));
          append(extractTaskManagementReleaseEntriesFromHistoryText(output));
          append(extractTaskManagementReleaseEntriesFromHistoryText(log?.message || ""));
          for (const value of fileContents) {
            append(extractTaskManagementReleaseEntriesFromHistoryText(typeof value === "string" ? value : ""));
          }
  
          if (entries.size === 0 && isTaskManagementReleaseCreateHistoryLog(log)) {
            const fallbackName = extractHistoryCommandFlagValue(command, "--name");
            if (fallbackName) {
              const fallbackEntry = createHistoryResourceEntry("release", {
                id: extractHistoryCommandFlagValue(command, "--id") || "",
                name: fallbackName,
                description: extractHistoryCommandFlagValue(command, "--description") || "",
                projectId: extractHistoryCommandFlagValue(command, "--project-id") || "",
                startAt: extractHistoryCommandFlagValue(command, "--start-at") || "",
                endAt: extractHistoryCommandFlagValue(command, "--end-at") || "",
                status: "planned",
              });
              if (fallbackEntry) {
                entries.set(fallbackEntry.path, fallbackEntry);
              }
            }
          }
  
          return Array.from(entries.values());
        }
  
        function extractGeneratedImagePathsFromHistoryOutput(output) {
          if (typeof output !== "string" || !output.trim()) {
            return [];
          }
  
          const matches = new Set();
          const patterns = [
            /image saved to:\s*["']?([^\s"'\n]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))["']?/ig,
            /saved to:\s*["']?([^\s"'\n]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))["']?/ig,
            /((?:\/workspace\/|workspace\/)?[A-Za-z0-9_./-]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))/ig,
          ];
  
          for (const pattern of patterns) {
            for (const match of output.matchAll(pattern)) {
              const normalized = normalizeGeneratedHistoryImagePath(match[1]);
              if (normalized) {
                matches.add(normalized);
              }
            }
          }
  
          return Array.from(matches);
        }
  
        function extractGeneratedImagePathsFromHistoryResult(result) {
          const matches = new Set();
  
          function visit(value) {
            if (!value) return;
            if (typeof value === "string") {
              for (const match of extractGeneratedImagePathsFromHistoryOutput(value)) {
                matches.add(match);
              }
              return;
            }
            if (Array.isArray(value)) {
              for (const item of value) visit(item);
              return;
            }
            if (typeof value === "object") {
              const record = value;
              const structured = record.structuredContent && typeof record.structuredContent === "object"
                ? record.structuredContent
                : record.structured_content && typeof record.structured_content === "object"
                  ? record.structured_content
                  : null;
              if (structured) {
                visit(structured.workspace_file_paths);
                visit(structured.file_paths);
                visit(structured.original_file_paths);
              }
              if (typeof record.path === "string") {
                const normalized = normalizeGeneratedHistoryImagePath(record.path);
                if (normalized) matches.add(normalized);
              }
              if (typeof record.outputPath === "string") {
                const normalized = normalizeGeneratedHistoryImagePath(record.outputPath);
                if (normalized) matches.add(normalized);
              }
              if (typeof record.output_path === "string") {
                const normalized = normalizeGeneratedHistoryImagePath(record.output_path);
                if (normalized) matches.add(normalized);
              }
              for (const nestedValue of Object.values(record)) {
                visit(nestedValue);
              }
            }
          }
  
          visit(result);
          return Array.from(matches);
        }
  
        function extractGeneratedImageEntriesFromHistoryLog(log) {
          const metadata = log && log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const command = typeof metadata.command === "string" ? metadata.command : "";
          const output = typeof metadata.output === "string" ? metadata.output : "";
          const eventType = typeof log?.eventType === "string" ? log.eventType : "";
          const savedImagePath = typeof metadata.savedImagePath === "string" ? metadata.savedImagePath : "";
          const explicitFilePaths = Array.isArray(metadata.filePaths) ? metadata.filePaths : [];
          const explicitChangeKinds = Array.isArray(metadata.changeKinds) ? metadata.changeKinds : [];
          const result = metadata.result;
          const structuredResultPaths = extractGeneratedImagePathsFromHistoryResult(result);
  
          const looksLikeImageGeneration =
            metadata.isImageGeneration
            || command.includes("generate-image.py")
            || command.includes(".claude/skills/image-generation/")
            || /image saved to:/i.test(output);
          const hasExplicitImageMetadata = Boolean(savedImagePath) || explicitFilePaths.length > 0 || structuredResultPaths.length > 0;
  
          if (eventType !== "file_change" && isReadOnlyHistorySyntheticFileCommand(command)) {
            return [];
          }
  
          if (!looksLikeImageGeneration && eventType !== "file_change") {
            return [];
          }
  
          if (eventType !== "file_change" && !hasExplicitImageMetadata) {
            return [];
          }
  
          const entries = new Map();
          const fallbackChangeKind =
            normalizeHistoryChangeKind(eventType === "file_change" ? explicitChangeKinds[0] : null)
            || (looksLikeImageGeneration ? "created" : "modified");
          const push = (value, changeKind) => {
            const entry = createHistoryImageFileEntry(value, changeKind || fallbackChangeKind);
            if (entry) {
              const existing = entries.get(entry.path);
              entries.set(entry.path, existing ? { ...existing, ...entry, changeKind: existing.changeKind || entry.changeKind } : entry);
            }
          };
  
          push(savedImagePath, looksLikeImageGeneration ? "created" : fallbackChangeKind);
          for (let index = 0; index < explicitFilePaths.length; index += 1) {
            push(explicitFilePaths[index], explicitChangeKinds[index]);
          }
          for (const filePath of structuredResultPaths) push(filePath, fallbackChangeKind);
  
          return Array.from(entries.values());
        }
  
        function buildSupplementalHistoryStepEntriesById(steps, logs, historyLogsById) {
          const nextMap = new Map();
          const orderedSteps = Array.isArray(steps)
            ? [...steps].sort((left, right) => String(left?.createdAt || "").localeCompare(String(right?.createdAt || "")))
            : [];
          const orderedTurnSteps = orderedSteps.filter((step) => step && step.eventType === "turn_completed");
          const orderedLogs = Array.isArray(logs)
            ? logs
                .filter((log) => log && typeof log.createdAt === "string" && log.createdAt)
                .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
            : [];
          const assignedLogIds = new Set();
  
          function appendEntries(stepId, entries) {
            if (!stepId || !Array.isArray(entries) || entries.length === 0) {
              return;
            }
            const currentEntries = nextMap.get(stepId) || [];
            const entriesByPath = new Map(currentEntries.map((entry) => [normalizeHistoryPath(entry.path), entry]));
            for (const entry of entries) {
              const normalizedPath = normalizeHistoryPath(entry.path);
              if (!normalizedPath) {
                continue;
              }
              const existing = entriesByPath.get(normalizedPath);
              entriesByPath.set(
                normalizedPath,
                existing
                  ? {
                      ...existing,
                      ...entry,
                      changeKind: existing.changeKind || entry.changeKind,
                    }
                  : entry,
              );
            }
            nextMap.set(stepId, Array.from(entriesByPath.values()));
          }
  
          const stepsBySourceMessageId = new Map();
          for (const step of orderedSteps) {
            if (step && typeof step.sourceMessageId === "string" && step.sourceMessageId) {
              stepsBySourceMessageId.set(step.sourceMessageId, step);
            }
          }
  
          for (const log of orderedLogs) {
            if (!log || typeof log.id !== "string" || !log.id) {
              continue;
            }
            const targetStep = stepsBySourceMessageId.get(log.id);
            if (!targetStep) {
              continue;
            }
            const supplementalEntries = [
              ...extractGeneratedImageEntriesFromHistoryLog(log),
              ...extractLoggedFileChangeEntriesFromHistoryLog(log),
              ...extractComputerAgentsResourceEntriesFromHistoryLog(log),
              ...extractTaskManagementTaskEntriesFromHistoryLog(log),
              ...extractTaskManagementReleaseEntriesFromHistoryLog(log),
            ];
            if (supplementalEntries.length === 0) {
              continue;
            }
            assignedLogIds.add(log.id);
            appendEntries(targetStep.id, supplementalEntries);
          }
  
          const timelineAnchorSteps = orderedTurnSteps.length > 0 ? orderedTurnSteps : orderedSteps;
  
          for (let index = 0; index < timelineAnchorSteps.length; index += 1) {
            const step = timelineAnchorSteps[index];
            const windowStart = index > 0 ? String(timelineAnchorSteps[index - 1].createdAt || "") : "";
            const windowEnd = String(step.createdAt || "");
            const explicitChangedSteps = orderedSteps.filter((candidate) => {
              if (!candidate) return false;
              const createdAt = String(candidate.createdAt || "");
              if (!createdAt || createdAt > windowEnd || (windowStart && createdAt <= windowStart)) {
                return false;
              }
              return extractStepChangedFileEntries(candidate, historyLogsById).length > 0;
            });
  
            for (const log of orderedLogs) {
              if (typeof log?.id === "string" && assignedLogIds.has(log.id)) {
                continue;
              }
              const createdAt = String(log.createdAt || "");
              if (!createdAt || createdAt > windowEnd || (windowStart && createdAt <= windowStart)) {
                continue;
              }
              const supplementalEntries = [
                ...extractGeneratedImageEntriesFromHistoryLog(log),
                ...extractLoggedFileChangeEntriesFromHistoryLog(log),
                ...extractComputerAgentsResourceEntriesFromHistoryLog(log),
                ...extractTaskManagementTaskEntriesFromHistoryLog(log),
                ...extractTaskManagementReleaseEntriesFromHistoryLog(log),
              ];
              if (supplementalEntries.length === 0) {
                continue;
              }
              const targetStep = explicitChangedSteps.find((candidate) => String(candidate.createdAt || "") >= createdAt)
                || explicitChangedSteps[explicitChangedSteps.length - 1]
                || step;
              appendEntries(targetStep.id, supplementalEntries);
            }
          }
  
          return nextMap;
        }
  
        function buildThreadStepFileDownloadUrl(threadId, stepId, filePath) {
          const search = new URLSearchParams({ path: normalizeHistoryPath(filePath) });
          return "/api/real/threads/" + encodeURIComponent(threadId) + "/steps/" + encodeURIComponent(stepId) + "/file/download?" + search.toString();
        }
  
        function resolveHistoryDiffEntry(diffs, path) {
          if (!diffs || typeof diffs !== "object") return null;
          const normalizedPath = normalizeHistoryPath(path);
          if (!normalizedPath) return null;
          const candidates = [
            path,
            normalizedPath,
            "/workspace/" + normalizedPath,
            "workspace/" + normalizedPath,
          ].filter(Boolean);
          for (const candidate of candidates) {
            const entry = diffs[candidate];
            if (entry && typeof entry === "object") {
              return entry;
            }
          }
          return null;
        }
  
        function inferHistoryChangeKindFromDiffText(diffText) {
          const normalizedDiff = typeof diffText === "string" ? diffText.trim() : "";
          if (!normalizedDiff) return null;
          if (/^new file mode\b/m.test(normalizedDiff)) return "created";
          if (/^deleted file mode\b/m.test(normalizedDiff)) return "deleted";
          return "modified";
        }
  
        function extractLoggedFileChangeEntriesFromHistoryLog(log) {
          if (!log) {
            return [];
          }
  
          const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata : {};
          const filePaths = Array.isArray(metadata.filePaths) ? metadata.filePaths : [];
          const changeKinds = Array.isArray(metadata.changeKinds) ? metadata.changeKinds : [];
          const diffs = metadata.diffs && typeof metadata.diffs === "object" ? metadata.diffs : {};
          const entries = new Map();
  
          function upsertEntry(rawPath, extra) {
            const normalizedPath = normalizeHistoryPath(rawPath);
            if (!normalizedPath || shouldHideHistoryChangePath(normalizedPath)) return;
            const existing = entries.get(normalizedPath) || {
              path: normalizedPath,
              name: getHistoryPathName(normalizedPath),
              type: "file",
              size: null,
              changeKind: null,
              additions: null,
              deletions: null,
              diffText: "",
              isChanged: true,
            };
            entries.set(normalizedPath, {
              ...existing,
              ...(extra || {}),
              path: normalizedPath,
              name: getHistoryPathName(normalizedPath),
              type: "file",
              size: null,
              isChanged: true,
            });
          }
  
          if (log.eventType === "command_execution") {
            const command = typeof metadata.command === "string" ? metadata.command.trim().toLowerCase() : "";
            const structuredWrite = extractHistoryStructuredWritePayload(typeof metadata.output === "string" ? metadata.output : "");
            if (command === "write_file" || command === "edit_file") {
              const filePath = structuredWrite?.filePath || filePaths[0];
              const diffText = typeof structuredWrite?.diffText === "string" ? structuredWrite.diffText.trim() : "";
              const derivedStats = diffText ? summarizeUnifiedDiffStats(diffText) : null;
              const changeKind =
                normalizeHistoryChangeKind(changeKinds[0])
                || normalizeHistoryChangeKind(structuredWrite?.operation)
                || inferHistoryChangeKindFromDiffText(diffText)
                || (command === "write_file" ? "created" : "modified");
              upsertEntry(filePath, {
                changeKind,
                additions:
                  Number.isFinite(structuredWrite?.additions) && structuredWrite.additions > 0
                    ? structuredWrite.additions
                    : derivedStats?.additions ?? null,
                deletions:
                  Number.isFinite(structuredWrite?.deletions) && structuredWrite.deletions > 0
                    ? structuredWrite.deletions
                    : derivedStats?.deletions ?? null,
                diffText,
              });
            }
  
            const deletedPath = extractDeletedHistoryPathFromCommandOutput(log);
            if (deletedPath) {
              upsertEntry(deletedPath, {
                changeKind: "deleted",
              });
            }
  
            return Array.from(entries.values());
          }
  
          if (log.eventType !== "file_change") {
            return [];
          }
  
          for (let index = 0; index < filePaths.length; index += 1) {
            const filePath = filePaths[index];
            const diffEntry = resolveHistoryDiffEntry(diffs, filePath);
            const diffText =
              typeof diffEntry?.diff === "string" && diffEntry.diff.trim()
                ? diffEntry.diff
                : typeof diffEntry?.changes === "string" && diffEntry.changes.trim()
                  ? diffEntry.changes
                  : "";
            const derivedStats = diffText ? summarizeUnifiedDiffStats(diffText) : null;
            const changeKind =
              normalizeHistoryChangeKind(changeKinds[index])
              || inferHistoryChangeKindFromDiffText(diffText);
            upsertEntry(filePath, {
              changeKind,
              additions: Number.isFinite(diffEntry?.additions) && diffEntry.additions > 0 ? diffEntry.additions : derivedStats?.additions ?? null,
              deletions: Number.isFinite(diffEntry?.deletions) && diffEntry.deletions > 0 ? diffEntry.deletions : derivedStats?.deletions ?? null,
              diffText,
            });
          }
  
          for (const [diffPath, rawDiffEntry] of Object.entries(diffs)) {
            const diffEntry = rawDiffEntry && typeof rawDiffEntry === "object" ? rawDiffEntry : {};
            const diffText =
              typeof diffEntry?.diff === "string" && diffEntry.diff.trim()
                ? diffEntry.diff
                : typeof diffEntry?.changes === "string" && diffEntry.changes.trim()
                  ? diffEntry.changes
                  : "";
            const derivedStats = diffText ? summarizeUnifiedDiffStats(diffText) : null;
            upsertEntry(diffPath, {
              changeKind: inferHistoryChangeKindFromDiffText(diffText),
              additions: Number.isFinite(diffEntry?.additions) && diffEntry.additions > 0 ? diffEntry.additions : derivedStats?.additions ?? null,
              deletions: Number.isFinite(diffEntry?.deletions) && diffEntry.deletions > 0 ? diffEntry.deletions : derivedStats?.deletions ?? null,
              diffText,
            });
          }
  
          return Array.from(entries.values());
        }
  
        function extractStepChangedFileEntries(step, historyLogsById) {
          if (shouldIgnoreSyntheticHistoryFileStep(step, historyLogsById)) {
            return [];
          }
          const metadata = step && step.metadata && typeof step.metadata === "object" ? step.metadata : {};
          const filePaths = Array.isArray(metadata.filePaths) ? metadata.filePaths : [];
          const changeKinds = Array.isArray(metadata.changeKinds) ? metadata.changeKinds : [];
          const savedImagePath = typeof metadata.savedImagePath === "string" ? metadata.savedImagePath : "";
          const isImageGeneration = Boolean(metadata.isImageGeneration);
          const diffs = metadata.diffs && typeof metadata.diffs === "object" ? metadata.diffs : {};
          const entries = new Map();
  
          function upsertEntry(rawPath, extra) {
            const normalizedPath = normalizeHistoryPath(rawPath);
            if (!normalizedPath || shouldHideHistoryChangePath(normalizedPath)) return;
            const existing = entries.get(normalizedPath) || {
              path: normalizedPath,
              name: getHistoryPathName(normalizedPath),
              type: "file",
              size: null,
              changeKind: null,
              additions: null,
              deletions: null,
              diffText: "",
              isChanged: true,
            };
            const nextEntry = {
              ...existing,
              ...(extra || {}),
              path: normalizedPath,
              name: getHistoryPathName(normalizedPath),
              isChanged: true,
            };
            entries.set(normalizedPath, nextEntry);
          }
  
          for (let index = 0; index < filePaths.length; index += 1) {
            const filePath = filePaths[index];
            const diffEntry = resolveHistoryDiffEntry(diffs, filePath);
            const diffText =
              typeof diffEntry?.diff === "string" && diffEntry.diff.trim()
                ? diffEntry.diff
                : typeof diffEntry?.changes === "string" && diffEntry.changes.trim()
                  ? diffEntry.changes
                  : "";
            const derivedStats = diffText ? summarizeUnifiedDiffStats(diffText) : null;
            const rawChangeKind = typeof changeKinds[index] === "string" ? changeKinds[index].trim().toLowerCase() : "";
            const changeKind = rawChangeKind === "created" || rawChangeKind === "modified" || rawChangeKind === "deleted"
              ? rawChangeKind
              : null;
            upsertEntry(filePath, {
              changeKind,
              additions: Number.isFinite(diffEntry?.additions) && diffEntry.additions > 0 ? diffEntry.additions : derivedStats?.additions ?? null,
              deletions: Number.isFinite(diffEntry?.deletions) && diffEntry.deletions > 0 ? diffEntry.deletions : derivedStats?.deletions ?? null,
              diffText,
            });
          }
  
          for (const [diffPath, rawDiffEntry] of Object.entries(diffs)) {
            const diffEntry = rawDiffEntry && typeof rawDiffEntry === "object" ? rawDiffEntry : {};
            const diffText =
              typeof diffEntry?.diff === "string" && diffEntry.diff.trim()
                ? diffEntry.diff
                : typeof diffEntry?.changes === "string" && diffEntry.changes.trim()
                  ? diffEntry.changes
                  : "";
            const derivedStats = diffText ? summarizeUnifiedDiffStats(diffText) : null;
            upsertEntry(diffPath, {
              additions: Number.isFinite(diffEntry?.additions) && diffEntry.additions > 0 ? diffEntry.additions : derivedStats?.additions ?? null,
              deletions: Number.isFinite(diffEntry?.deletions) && diffEntry.deletions > 0 ? diffEntry.deletions : derivedStats?.deletions ?? null,
              diffText,
            });
          }
  
          for (const changedPath of extractStepChangedPaths(step, historyLogsById)) {
            upsertEntry(changedPath, {});
          }
  
          if (savedImagePath && step?.eventType === "file_change") {
            upsertEntry(savedImagePath, {
              changeKind: normalizeHistoryChangeKind(changeKinds[0]) || (isImageGeneration ? "created" : null),
            });
          }
  
          return Array.from(entries.values());
        }
  
        function buildStepFileEntries(step, diffSummary, snapshotFiles, supplementalEntries, historyLogsById) {
          const entries = new Map();
  
          function upsertEntry(rawPath, extra) {
            const normalizedPath = normalizeHistoryPath(rawPath);
            if (!normalizedPath || shouldHideHistoryChangePath(normalizedPath)) return;
            const existing = entries.get(normalizedPath) || {
              path: normalizedPath,
              name: getHistoryPathName(normalizedPath),
              type: "file",
              size: null,
              changeKind: null,
              additions: null,
              deletions: null,
              diffText: "",
              isChanged: false,
            };
            const nextName =
              extra && extra.type === "resource" && extra.name
                ? extra.name
                : existing.type === "resource" && existing.name
                  ? existing.name
                  : getHistoryPathName(normalizedPath);
            entries.set(normalizedPath, {
              ...existing,
              ...(extra || {}),
              path: normalizedPath,
              name: nextName,
            });
          }
  
          for (const entry of extractStepChangedFileEntries(step, historyLogsById)) {
            upsertEntry(entry.path, entry);
          }
  
          for (const entry of Array.isArray(supplementalEntries) ? supplementalEntries : []) {
            if (entry && typeof entry === "object") {
              upsertEntry(entry.path, entry);
            }
          }
  
          const diffChangedPaths = Array.isArray(diffSummary?.changedPaths) ? diffSummary.changedPaths : [];
          const singleChangedPath = diffChangedPaths.length === 1 ? diffChangedPaths[0] : null;
          for (const changedPath of diffChangedPaths) {
            upsertEntry(changedPath, {
              isChanged: true,
              additions:
                singleChangedPath && historyPathsMatch(singleChangedPath, changedPath) && Number.isFinite(diffSummary?.additions)
                  ? diffSummary.additions
                  : entries.get(normalizeHistoryPath(changedPath))?.additions ?? null,
              deletions:
                singleChangedPath && historyPathsMatch(singleChangedPath, changedPath) && Number.isFinite(diffSummary?.deletions)
                  ? diffSummary.deletions
                  : entries.get(normalizeHistoryPath(changedPath))?.deletions ?? null,
            });
          }
  
          const normalizedSnapshotFiles = Array.isArray(snapshotFiles)
            ? snapshotFiles.map((entry) => ({
                ...entry,
                path: normalizeHistoryPath(entry.path),
                name: getHistoryPathName(entry.path),
              })).filter((entry) => entry.path)
            : [];
  
          for (const snapshotEntry of normalizedSnapshotFiles) {
            const existing = entries.get(snapshotEntry.path);
            if (!existing) continue;
            upsertEntry(snapshotEntry.path, {
              type: snapshotEntry.type,
              size: snapshotEntry.size,
            });
          }
  
          if (entries.size > 0) {
            return Array.from(entries.values());
          }
  
          return normalizedSnapshotFiles
            .sort((left, right) => {
              if (left.type !== right.type) {
                return left.type === "directory" ? -1 : 1;
              }
              return left.path.localeCompare(right.path);
            })
            .map((entry) => ({
              ...entry,
              changeKind: null,
              additions: null,
              deletions: null,
              diffText: "",
              isChanged: false,
            }));
        }
  
        function getHistoryChangeKindLabel(changeKind) {
          if (changeKind === "created") return "Created";
          if (changeKind === "modified") return "Modified";
          if (changeKind === "deleted") return "Deleted";
          return "";
        }
  
        function renderHistoryResourceIcon(resourceType) {
          if (resourceType === "agent") {
            return React.createElement(Bot, { strokeWidth: 1.8 });
          }
          if (resourceType === "skill") {
            return React.createElement(Cpu, { strokeWidth: 1.8 });
          }
          if (resourceType === "task") {
            return React.createElement(ListTodo, { strokeWidth: 1.8 });
          }
          if (resourceType === "release") {
            return React.createElement(CalendarIcon, { strokeWidth: 1.8 });
          }
          if (resourceType === "environment") {
            return React.createElement(HardDrive, { strokeWidth: 1.8 });
          }
          return React.createElement(File, { strokeWidth: 1.8 });
        }
  
        function buildHistoryResourceMetaRows(entry) {
          const rows = [];
          if (!entry || entry.type !== "resource") {
            return rows;
          }
          if (entry.ticketNumber) {
            rows.push({ label: "Ticket", value: entry.ticketNumber });
          }
          if (entry.resourceId) {
            rows.push({ label: "ID", value: entry.resourceId });
          }
          if (entry.taskType) {
            rows.push({ label: "Type", value: formatHistoryTaskTypeLabel(entry.taskType) });
          }
          if (entry.status) {
            rows.push({ label: "Status", value: formatHistoryResourceStatusLabel(entry.status) });
          }
          if (entry.priority) {
            rows.push({ label: "Priority", value: formatHistoryTaskPriorityLabel(entry.priority) });
          }
          if (entry.assigneeName) {
            rows.push({ label: "Assignee", value: entry.assigneeName });
          }
          if (entry.model) {
            rows.push({ label: "Model", value: entry.model });
          }
          if (entry.category) {
            rows.push({ label: "Category", value: entry.category });
          }
          if (entry.environmentId) {
            rows.push({ label: "Environment", value: entry.environmentId });
          }
          if (entry.projectId) {
            rows.push({ label: "Project", value: entry.projectId });
          }
          if (entry.startAt || entry.endAt) {
            rows.push({
              label: "Window",
              value: [entry.startAt || "", entry.endAt || ""].filter(Boolean).join(" → "),
            });
          }
          if (typeof entry.taskCount === "number") {
            rows.push({ label: "Tasks", value: String(entry.taskCount) });
          }
          if (typeof entry.openTaskCount === "number") {
            rows.push({ label: "Open tasks", value: String(entry.openTaskCount) });
          }
          if (entry.isDefault) {
            rows.push({ label: "Default", value: "Yes" });
          }
          return rows;
        }
  
        function buildHistoryResourceSubtitle(entry) {
          if (!entry || entry.type !== "resource") {
            return "";
          }
          if (entry.resourceType === "task") {
            return [
              entry.ticketNumber || "",
              formatHistoryResourceStatusLabel(entry.status),
              entry.assigneeName || "",
            ].filter(Boolean).join(" · ");
          }
          if (entry.resourceType === "release") {
            const dateWindow = [entry.startAt || "", entry.endAt || ""].filter(Boolean).join(" → ");
            return [
              formatHistoryResourceStatusLabel(entry.status),
              dateWindow,
              typeof entry.openTaskCount === "number" && typeof entry.taskCount === "number"
                ? entry.openTaskCount + "/" + entry.taskCount + " open"
                : "",
            ].filter(Boolean).join(" · ");
          }
          if (entry.resourceType === "agent") {
            return [entry.model || "", entry.resourceId || ""].filter(Boolean).join(" · ");
          }
          if (entry.resourceType === "skill") {
            return [entry.category || "", entry.resourceId || ""].filter(Boolean).join(" · ");
          }
          if (entry.resourceType === "environment") {
            return [entry.projectId || "", entry.isDefault ? "Default" : "", entry.resourceId || ""].filter(Boolean).join(" · ");
          }
          return entry.resourceId || entry.description || "";
        }
  
        function readRevertedChangeStepId(step) {
          const metadata = step && typeof step === "object" && step.metadata && typeof step.metadata === "object"
            ? step.metadata
            : null;
          const revertedChangeStepId = metadata && typeof metadata.revertedChangeStepId === "string"
            ? metadata.revertedChangeStepId.trim()
            : "";
          return revertedChangeStepId || "";
        }
  
        function readHistoryOperation(step) {
          const metadata = step && typeof step === "object" && step.metadata && typeof step.metadata === "object"
            ? step.metadata
            : null;
          const historyOperation = metadata && typeof metadata.historyOperation === "string"
            ? metadata.historyOperation.trim().toLowerCase()
            : "";
          return historyOperation === "reapply" ? "reapply" : historyOperation === "revert" ? "revert" : "";
        }
  
        function shouldDisplayHistoryStep(step, historyLogsById) {
          if (!step || typeof step !== "object") return false;
          return extractStepChangedFileEntries(step, historyLogsById).length > 0;
        }
  
        function getPreferredHistoryStep(steps, historyLogsById) {
          if (!Array.isArray(steps) || steps.length === 0) return null;
          return (
            steps.find((step) => extractStepChangedFileEntries(step, historyLogsById).length > 0)
            || steps.find((step) => shouldDisplayHistoryStep(step, historyLogsById))
            || steps[0]
            || null
          );
        }
  
        function parseUnifiedDiffRange(value) {
          const parsed = Number(value || 0);
          return Number.isFinite(parsed) ? parsed : 0;
        }
  
        function summarizeUnifiedDiffStats(diffText) {
          const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
          let additions = 0;
          let deletions = 0;
          let insideHunk = false;
  
          for (const line of lines) {
            if (line.startsWith("@@")) {
              insideHunk = true;
              continue;
            }
            if (!insideHunk || line === "\\ No newline at end of file") {
              continue;
            }
            if (line.startsWith("+++")) continue;
            if (line.startsWith("---")) continue;
            if (line.startsWith("+")) {
              additions += 1;
              continue;
            }
            if (line.startsWith("-")) {
              deletions += 1;
            }
          }
  
          return { additions, deletions };
        }
  
        function parseUnifiedDiffRows(diffText) {
          const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
          const rows = [];
          let oldLineNumber = 0;
          let newLineNumber = 0;
          let insideHunk = false;
  
          for (const line of lines) {
            if (line.startsWith("@@")) {
              const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
              oldLineNumber = match ? parseUnifiedDiffRange(match[1]) : 0;
              newLineNumber = match ? parseUnifiedDiffRange(match[3]) : 0;
              insideHunk = true;
              rows.push({ kind: "hunk", content: line, oldLineNumber: null, newLineNumber: null });
              continue;
            }
  
            if (line === "\\ No newline at end of file") {
              rows.push({ kind: "note", content: line, oldLineNumber: null, newLineNumber: null });
              continue;
            }
  
            if (!insideHunk || line.startsWith("diff --git ") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
              rows.push({ kind: "meta", content: line, oldLineNumber: null, newLineNumber: null });
              continue;
            }
  
            if (line.startsWith("+")) {
              rows.push({
                kind: "added",
                content: line.slice(1),
                oldLineNumber: null,
                newLineNumber: newLineNumber || 0,
              });
              newLineNumber += 1;
              continue;
            }
  
            if (line.startsWith("-")) {
              rows.push({
                kind: "removed",
                content: line.slice(1),
                oldLineNumber: oldLineNumber || 0,
                newLineNumber: null,
              });
              oldLineNumber += 1;
              continue;
            }
  
            if (line.startsWith(" ")) {
              rows.push({
                kind: "context",
                content: line.slice(1),
                oldLineNumber: oldLineNumber || 0,
                newLineNumber: newLineNumber || 0,
              });
              oldLineNumber += 1;
              newLineNumber += 1;
              continue;
            }
  
            rows.push({ kind: "meta", content: line, oldLineNumber: null, newLineNumber: null });
          }
  
          return rows;
        }
  
        function buildDiffSnippetFromUnifiedDiff(diffText) {
          const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
          const original = [];
          const modified = [];
          let insideHunk = false;
  
          for (const line of lines) {
            if (line.startsWith("@@")) {
              insideHunk = true;
              continue;
            }
            if (!insideHunk || line === "\\ No newline at end of file") {
              continue;
            }
            if (line.startsWith("+")) {
              if (!line.startsWith("+++")) modified.push(line.slice(1));
              continue;
            }
            if (line.startsWith("-")) {
              if (!line.startsWith("---")) original.push(line.slice(1));
              continue;
            }
            if (line.startsWith(" ")) {
              const content = line.slice(1);
              original.push(content);
              modified.push(content);
            }
          }
  
          return {
            original: original.join("\n"),
            modified: modified.join("\n"),
          };
        }
  
        function buildDiffModels(diffText, fileContent) {
          const normalizedDiff = typeof diffText === "string" ? diffText.replace(/\r\n/g, "\n") : "";
          const normalizedFileContent = typeof fileContent === "string" ? fileContent.replace(/\r\n/g, "\n") : "";
          if (!normalizedDiff.trim()) {
            return {
              original: "",
              modified: normalizedFileContent,
            };
          }
  
          const lines = normalizedDiff.split("\n");
          const hunkRegex = new RegExp("^@@\\s+-(\\d+)(?:,(\\d+))?\\s+\\+(\\d+)(?:,(\\d+))?\\s+@@");
          const hunks = [];
          let currentHunk = null;
  
          for (const line of lines) {
            const hunkMatch = line.match(hunkRegex);
            if (hunkMatch) {
              currentHunk = {
                oldStart: parseUnifiedDiffRange(hunkMatch[1]),
                oldCount: parseUnifiedDiffRange(hunkMatch[2] || "1"),
                newStart: parseUnifiedDiffRange(hunkMatch[3]),
                newCount: parseUnifiedDiffRange(hunkMatch[4] || "1"),
                lines: [],
              };
              hunks.push(currentHunk);
              continue;
            }
            if (!currentHunk) continue;
            if (line === "\\ No newline at end of file") continue;
            currentHunk.lines.push(line);
          }
  
          if (!normalizedFileContent.trim() || hunks.length === 0) {
            return buildDiffSnippetFromUnifiedDiff(normalizedDiff);
          }
  
          const modifiedLines = normalizedFileContent.split("\n");
          const originalLines = [...modifiedLines];
  
          for (let index = hunks.length - 1; index >= 0; index -= 1) {
            const hunk = hunks[index];
            const oldSegment = [];
            for (const line of hunk.lines) {
              if (line.startsWith("+")) continue;
              if (line.startsWith("-") || line.startsWith(" ")) {
                oldSegment.push(line.slice(1));
              }
            }
            const spliceIndex = Math.max((hunk.newStart || 1) - 1, 0);
            originalLines.splice(spliceIndex, hunk.newCount, ...oldSegment);
          }
  
          return {
            original: originalLines.join("\n"),
            modified: modifiedLines.join("\n"),
          };
        }
  
        function inferHistoryLanguage(filePath) {
          const lower = String(filePath || "").toLowerCase();
          if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "typescript";
          if (lower.endsWith(".jsx") || lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return "javascript";
          if (lower.endsWith(".json")) return "json";
          if (lower.endsWith(".html")) return "html";
          if (lower.endsWith(".css")) return "css";
          if (lower.endsWith(".md")) return "markdown";
          if (lower.endsWith(".py")) return "python";
          if (lower.endsWith(".sh")) return "shell";
          if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
          return "plaintext";
        }
  
        function HistoryDiffViewer({ diffText, fileContent, filePath, emptyMessage }) {
          if (!(diffText && diffText.trim())) {
            return React.createElement("div", { className: "changes-code-block is-empty" }, emptyMessage);
          }
  
          const rows = parseUnifiedDiffRows(diffText);
          return React.createElement("div", { className: "changes-diff-view", "aria-label": "Unified diff for " + (filePath || "selected file") },
            rows.map((row, index) =>
              React.createElement("div", {
                key: row.kind + ":" + index,
                className: "changes-diff-row is-" + row.kind,
              },
                React.createElement("span", { className: "changes-diff-line-number" }, Number.isFinite(row.oldLineNumber) ? String(row.oldLineNumber) : ""),
                React.createElement("span", { className: "changes-diff-line-number" }, Number.isFinite(row.newLineNumber) ? String(row.newLineNumber) : ""),
                React.createElement("span", { className: "changes-diff-line-prefix", "aria-hidden": "true" },
                  row.kind === "added"
                    ? "+"
                    : row.kind === "removed"
                      ? "-"
                      : row.kind === "context"
                        ? " "
                        : row.kind === "hunk"
                          ? "@"
                          : ""
                ),
                React.createElement("span", { className: "changes-diff-line-content" }, row.content || " ")
              )
            )
          );
        }
  
        function buildSyntheticHistoryDiff({ filePath, fileContent, changeKind }) {
          const normalizedPath = normalizeHistoryPath(filePath) || "unknown-file";
          const normalizedContent = typeof fileContent === "string" ? fileContent.replace(/\r\n/g, "\n") : "";
          const lines = normalizedContent.length > 0 ? normalizedContent.split("\n") : [];
  
          if (changeKind === "created") {
            const header = [
              "diff --git a/" + normalizedPath + " b/" + normalizedPath,
              "new file mode 100644",
              "--- /dev/null",
              "+++ b/" + normalizedPath,
            ];
            if (lines.length === 0) {
              return header.join("\n");
            }
            return header.concat(
              "@@ -0,0 +" + 1 + "," + lines.length + " @@",
              lines.map((line) => "+" + line)
            ).join("\n");
          }
  
          if (changeKind === "deleted" && lines.length > 0) {
            return [
              "diff --git a/" + normalizedPath + " b/" + normalizedPath,
              "deleted file mode 100644",
              "--- a/" + normalizedPath,
              "+++ /dev/null",
              "@@ -" + 1 + "," + lines.length + " +0,0 @@",
              ...lines.map((line) => "-" + line),
            ].join("\n");
          }
  
          return "";
        }
  
        function buildHistorySplitDiffRows(diffText) {
          const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
          const rows = [];
          let oldLineNumber = 0;
          let newLineNumber = 0;
          let insideHunk = false;
          let pendingRemoved = [];
  
          function flushPendingRemoved() {
            if (pendingRemoved.length === 0) return;
            for (const removedCell of pendingRemoved) {
              rows.push({
                kind: "content",
                left: removedCell,
                right: null,
              });
            }
            pendingRemoved = [];
          }
  
          for (const line of lines) {
            if (line.startsWith("@@")) {
              flushPendingRemoved();
              const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
              oldLineNumber = match ? parseUnifiedDiffRange(match[1]) : 0;
              newLineNumber = match ? parseUnifiedDiffRange(match[3]) : 0;
              insideHunk = true;
              rows.push({ kind: "hunk", content: line });
              continue;
            }
  
            if (line === "\\ No newline at end of file") {
              flushPendingRemoved();
              rows.push({ kind: "note", content: line });
              continue;
            }
  
            if (!insideHunk || line.startsWith("diff --git ") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
              continue;
            }
  
            if (line.startsWith("-")) {
              pendingRemoved.push({
                kind: "removed",
                lineNumber: oldLineNumber || 0,
                content: line.slice(1),
              });
              oldLineNumber += 1;
              continue;
            }
  
            if (line.startsWith("+")) {
              const addedCell = {
                kind: "added",
                lineNumber: newLineNumber || 0,
                content: line.slice(1),
              };
              const pairedRemoved = pendingRemoved.shift() || null;
              rows.push({
                kind: "content",
                left: pairedRemoved,
                right: addedCell,
              });
              newLineNumber += 1;
              continue;
            }
  
            if (line.startsWith(" ")) {
              flushPendingRemoved();
              const content = line.slice(1);
              rows.push({
                kind: "content",
                left: {
                  kind: "context",
                  lineNumber: oldLineNumber || 0,
                  content,
                },
                right: {
                  kind: "context",
                  lineNumber: newLineNumber || 0,
                  content,
                },
              });
              oldLineNumber += 1;
              newLineNumber += 1;
            }
          }
  
          flushPendingRemoved();
          return rows;
        }
  
        function HistorySplitDiffCell({ side, cell }) {
          const tone = cell?.kind || "empty";
          return React.createElement("div", {
            className: "changes-split-diff-cell is-" + side + " is-" + tone,
          },
            React.createElement("span", {
              className: "changes-split-diff-line-number",
            }, Number.isFinite(cell?.lineNumber) ? String(cell.lineNumber) : ""),
            React.createElement("span", {
              className: "changes-split-diff-line-content",
            }, cell?.content || " ")
          );
        }
  
        function HistorySplitDiffFallbackViewer({ diffText, filePath, emptyMessage }) {
          if (!(diffText && diffText.trim())) {
            return React.createElement("div", { className: "changes-code-block is-empty" }, emptyMessage);
          }
  
          const rows = buildHistorySplitDiffRows(diffText);
          return React.createElement("div", {
            className: "changes-split-diff-view",
            "aria-label": "Split diff for " + (filePath || "selected file"),
          },
            rows.length === 0
              ? React.createElement("div", { className: "changes-code-block is-empty" }, emptyMessage)
              : rows.map((row, index) => {
                  if (row.kind === "hunk") {
                    return React.createElement("div", {
                      key: "hunk:" + index,
                      className: "changes-split-diff-hunk",
                    }, row.content);
                  }
                  if (row.kind === "note") {
                    return React.createElement("div", {
                      key: "note:" + index,
                      className: "changes-split-diff-note",
                    }, row.content);
                  }
                  return React.createElement("div", {
                    key: "row:" + index,
                    className: "changes-split-diff-row",
                  },
                    React.createElement(HistorySplitDiffCell, {
                      side: "left",
                      cell: row.left,
                    }),
                    React.createElement(HistorySplitDiffCell, {
                      side: "right",
                      cell: row.right,
                    })
                  );
                })
          );
        }
  
        function HistoryDiffToggleButton({ isActive, onClick, children }) {
          return React.createElement("button", {
            type: "button",
            className: "changes-diff-toggle-button" + (isActive ? " is-active" : ""),
            onClick,
          }, children);
        }
  
        function HistorySplitDiffViewer({ diffText, fileContent, filePath, emptyMessage, additions, deletions }) {
          const [DiffEditorComponent, setDiffEditorComponent] = useState(null);
          const [viewMode, setViewMode] = useState("split");
          const [viewMenuOpen, setViewMenuOpen] = useState(false);
          const [hideUnchanged, setHideUnchanged] = useState(true);
          const [editorHeight, setEditorHeight] = useState(180);
          const [diffEditorInstance, setDiffEditorInstance] = useState(null);
          const viewMenuRef = useRef(null);
  
          useEffect(() => {
            let cancelled = false;
            void loadHistoryMonacoModule().then((module) => {
              const nextComponent = module?.DiffEditor || null;
              if (!cancelled && nextComponent) {
                setDiffEditorComponent(() => nextComponent);
              }
            });
            return () => {
              cancelled = true;
            };
          }, []);
  
          useEffect(() => {
            if (!viewMenuOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (viewMenuRef.current && !viewMenuRef.current.contains(event.target)) {
                setViewMenuOpen(false);
              }
            };
            const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                setViewMenuOpen(false);
              }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
              document.removeEventListener("pointerdown", handlePointerDown);
              document.removeEventListener("keydown", handleKeyDown);
            };
          }, [viewMenuOpen]);
  
          if (!(diffText && diffText.trim())) {
            return React.createElement("div", { className: "changes-code-block is-empty" }, emptyMessage);
          }
  
          const models = buildDiffModels(diffText, fileContent);
  
          useEffect(() => {
            if (!diffEditorInstance) {
              return;
            }
  
            const updateHeight = () => {
              const contentHeight = typeof diffEditorInstance.getContentHeight === "function"
                ? diffEditorInstance.getContentHeight()
                : 0;
              const minHeight = 72;
              const maxHeight = hideUnchanged ? 680 : 760;
              setEditorHeight(Math.min(Math.max(contentHeight, minHeight), maxHeight));
            };
  
            updateHeight();
            const disposable = typeof diffEditorInstance.onDidContentSizeChange === "function"
              ? diffEditorInstance.onDidContentSizeChange(() => {
                  updateHeight();
                })
              : null;
  
            return () => {
              if (disposable && typeof disposable.dispose === "function") {
                disposable.dispose();
              }
            };
          }, [diffEditorInstance, hideUnchanged, viewMode, diffText]);
  
          return React.createElement("section", { className: "changes-diff-box" },
            React.createElement("div", { className: "changes-diff-box-header" },
              React.createElement("div", { className: "changes-diff-box-path" }, filePath || "Selected file"),
              React.createElement("div", { className: "changes-diff-box-header-right" },
                React.createElement("div", { className: "changes-diff-stats is-box-header" },
                  React.createElement("span", { className: "changes-diff-stat additions" }, "+" + additions),
                  React.createElement("span", { className: "changes-diff-stat deletions" }, "-" + deletions)
                ),
                React.createElement(HistoryDiffToggleButton, {
                  isActive: hideUnchanged,
                  onClick: () => setHideUnchanged((current) => !current),
                }, hideUnchanged ? "Collapsed" : "Expanded"),
                React.createElement("div", { className: "changes-diff-view-menu-shell", ref: viewMenuRef },
                  React.createElement("button", {
                      type: "button",
                      className: "changes-diff-menu-trigger" + (viewMenuOpen ? " is-active" : ""),
                      onClick: () => setViewMenuOpen((current) => !current),
                      "aria-haspopup": "menu",
                      "aria-expanded": viewMenuOpen ? "true" : "false",
                      "aria-label": "Diff view options",
                    },
                    React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })
                  ),
                  viewMenuOpen
                    ? React.createElement(PlatformPopupSurface, { className: "changes-diff-view-menu", role: "menu" },
                        [
                          { id: "split", label: "Split view" },
                          { id: "unified", label: "Unified view" },
                        ].map((item) =>
                          React.createElement("button", {
                              key: item.id,
                              type: "button",
                              role: "menuitemradio",
                              "aria-checked": viewMode === item.id ? "true" : "false",
                              className: "changes-diff-view-menu-item" + (viewMode === item.id ? " is-active" : ""),
                              onClick: () => {
                                setViewMode(item.id);
                                setViewMenuOpen(false);
                              },
                            },
                            React.createElement("span", { className: "changes-diff-view-menu-check" },
                              viewMode === item.id
                                ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 2 })
                                : null
                            ),
                            React.createElement("span", null, item.label)
                          )
                        )
                      )
                    : null
                )
              )
            ),
            React.createElement("div", { className: "changes-diff-box-body" },
              DiffEditorComponent
                ? React.createElement(DiffEditorComponent, {
                    key: [
                      "monaco-diff",
                      filePath || "selected-file",
                      viewMode,
                      hideUnchanged ? "collapsed" : "expanded",
                      diffText.length,
                      models.original.length,
                      models.modified.length,
                    ].join(":"),
                    beforeMount: ensureHistoryMonacoTheme,
                    onMount: (editor) => {
                      setDiffEditorInstance(editor);
                    },
                    theme: HISTORY_MONACO_THEME_NAME,
                    original: models.original,
                    modified: models.modified,
                    language: inferHistoryLanguage(filePath),
                    height: editorHeight,
                    options: {
                      readOnly: true,
                      originalEditable: false,
                      renderSideBySide: viewMode === "split",
                      useInlineViewWhenSpaceIsLimited: false,
                      enableSplitViewResizing: true,
                      renderIndicators: true,
                      hideUnchangedRegions: {
                        enabled: hideUnchanged,
                        contextLineCount: 4,
                        minimumLineCount: 3,
                        revealLineCount: 3,
                      },
                      diffAlgorithm: "advanced",
                      ignoreTrimWhitespace: false,
                      renderOverviewRuler: false,
                      overviewRulerBorder: false,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      fontSize: 12,
                      lineHeight: 20,
                      lineNumbers: "on",
                      lineNumbersMinChars: 4,
                      glyphMargin: false,
                      folding: false,
                      wordWrap: "off",
                      diffWordWrap: "off",
                      renderValidationDecorations: "off",
                      codeLens: false,
                      contextmenu: false,
                      selectionHighlight: false,
                      occurrencesHighlight: "off",
                      renderLineHighlight: "none",
                      stickyScroll: { enabled: false },
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                        alwaysConsumeMouseWheel: false,
                      },
                    },
                  })
                : React.createElement(HistorySplitDiffFallbackViewer, {
                    diffText,
                    filePath,
                    emptyMessage,
                  })
            )
          );
        }
  
        function getPreferredHistoryEntryPath(entries, changedPaths) {
          const changedSet = new Set(uniqueHistoryPaths(changedPaths));
          const files = entries.filter((entry) => entry.type === "file");
          const changedMatch = files.find((entry) => changedSet.has(normalizeHistoryPath(entry.path)));
          return changedMatch?.path || files[0]?.path || entries[0]?.path || "";
        }
  
        async function fetchHistoryThreadMessages({ backendUrl, threadId, headers }) {
          const pageSize = 200;
          const messages = [];
          let offset = 0;
  
          while (true) {
            const response = await fetch(
              backendUrl + "/threads/" + encodeURIComponent(threadId) + "/messages?limit=" + pageSize + "&offset=" + offset + "&compact=1",
              {
                method: "GET",
                headers,
              }
            );
  
            const bodyText = await response.text();
            let parsed = {};
            try {
              parsed = bodyText ? JSON.parse(bodyText) : {};
            } catch {
              parsed = {};
            }
  
            if (!response.ok) {
              throw new Error(parsed.message || parsed.error || ("Failed to load thread messages (" + response.status + ")"));
            }
  
            const pageItems = Array.isArray(parsed.data) ? parsed.data : [];
            messages.push(...pageItems);
  
            if (!parsed.has_more || pageItems.length === 0) {
              break;
            }
  
            offset += pageItems.length;
          }
  
          return messages;
        }
  
        async function fetchHistoryThreadLogs({ client, backendUrl, threadId, headers }) {
          return client.getThreadLogs({
            backendUrl,
            threadId,
            headers,
            compact: true,
            includeConversation: false,
          });
        }
  
        function normalizeTraceItems(data, primaryKey, fallbackKey) {
          if (Array.isArray(data)) {
            return data;
          }
          if (Array.isArray(data?.[primaryKey])) {
            return data[primaryKey];
          }
          if (fallbackKey && Array.isArray(data?.[fallbackKey])) {
            return data[fallbackKey];
          }
          if (Array.isArray(data?.data)) {
            return data.data;
          }
          return [];
        }
  
        async function fetchThreadTraceDetails({ backendUrl, threadId, headers, messageLimit = 160, stepLimit = 160 }) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) {
            throw new Error("Thread id is required.");
          }
  
          const fetchJson = async (path) => {
            const response = await fetch(backendUrl + path, {
              method: "GET",
              headers,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load trace data.");
            }
            return data;
          };
  
          const encodedThreadId = encodeURIComponent(normalizedThreadId);
          const [threadResult, logsResult, messagesResult, stepsResult, traceClustersResult] = await Promise.allSettled([
            fetchJson("/threads/" + encodedThreadId),
            fetchJson("/threads/" + encodedThreadId + "/logs?compact=1&includeConversation=0"),
            fetchJson("/threads/" + encodedThreadId + "/messages?limit=" + encodeURIComponent(String(messageLimit)) + "&compact=1"),
            fetchJson("/threads/" + encodedThreadId + "/steps?limit=" + encodeURIComponent(String(stepLimit)) + "&compact=1"),
            fetchJson("/threads/" + encodedThreadId + "/trace-clusters?limit=" + encodeURIComponent(String(stepLimit))),
          ]);
  
          const firstRejected = [threadResult, logsResult, messagesResult, stepsResult].find((result) => result.status === "rejected");
          const threadData = threadResult.status === "fulfilled" ? threadResult.value : {};
          const logsData = logsResult.status === "fulfilled" ? logsResult.value : {};
          const messagesData = messagesResult.status === "fulfilled" ? messagesResult.value : {};
          const stepsData = stepsResult.status === "fulfilled" ? stepsResult.value : {};
          const traceClustersData = traceClustersResult.status === "fulfilled" ? traceClustersResult.value : {};
          const traceClusters = traceClustersData?.traceClusters || traceClustersData?.data?.traceClusters || null;
          const traceClusterSequences = Array.isArray(traceClusters?.sequences)
            ? traceClusters.sequences
            : normalizeTraceItems(traceClustersData, "sequences");
          const traceClusterActions = Array.isArray(traceClusters?.actions)
            ? traceClusters.actions
            : normalizeTraceItems(traceClustersData, "actions");
          const nextDetails = {
            status: "loaded",
            error: firstRejected?.reason instanceof Error ? firstRejected.reason.message : "",
            thread: threadData?.thread || threadData?.data || null,
            logs: normalizeTraceItems(logsData, "logs"),
            messages: normalizeTraceItems(messagesData, "messages"),
            steps: normalizeTraceItems(stepsData, "steps"),
            traceClusters: traceClusters
              ? {
                  ...traceClusters,
                  sequences: traceClusterSequences,
                  actions: traceClusterActions,
                }
              : null,
            traceClusterError: traceClustersResult.status === "rejected"
              ? traceClustersResult.reason instanceof Error ? traceClustersResult.reason.message : "Failed to load trace clusters."
              : "",
            decisions: [
              ...traceClusterSequences,
              ...normalizeTraceItems(threadData, "decisions"),
              ...normalizeTraceItems(stepsData, "decisions"),
            ].filter((decision, index, decisions) => {
              const decisionId = String(decision?.id || decision?.decisionId || decision?.decision_id || "").trim();
              if (!decisionId) return true;
              return decisions.findIndex((candidate) => (
                String(candidate?.id || candidate?.decisionId || candidate?.decision_id || "").trim() === decisionId
              )) === index;
            }),
            loadedAt: new Date().toISOString(),
          };
  
          if (firstRejected && !nextDetails.thread && nextDetails.logs.length === 0 && nextDetails.messages.length === 0 && nextDetails.steps.length === 0 && nextDetails.decisions.length === 0) {
            throw firstRejected.reason instanceof Error ? firstRejected.reason : new Error("Failed to load trace data.");
          }
  
          return nextDetails;
        }
  
        function parseTraceTimestampValue(value) {
          if (value == null || value === "") {
            return 0;
          }
          if (typeof value === "number") {
            if (!Number.isFinite(value) || value <= 0) {
              return 0;
            }
            return value > 1000000000000 ? value : value > 1000000000 ? value * 1000 : 0;
          }
          if (value instanceof Date) {
            const timestamp = value.getTime();
            return Number.isFinite(timestamp) ? timestamp : 0;
          }
          if (value && typeof value === "object") {
            const seconds = Number(value.seconds ?? value._seconds ?? value.secs ?? value._secs);
            if (Number.isFinite(seconds) && seconds > 0) {
              const nanos = Number(value.nanoseconds ?? value._nanoseconds ?? value.nanos ?? value._nanos ?? 0);
              return Math.round((seconds * 1000) + (Number.isFinite(nanos) ? nanos / 1000000 : 0));
            }
            if (typeof value.toDate === "function") {
              try {
                const timestamp = value.toDate().getTime();
                return Number.isFinite(timestamp) ? timestamp : 0;
              } catch {}
            }
          }
          const timestamp = Date.parse(String(value || ""));
          return Number.isFinite(timestamp) ? timestamp : 0;
        }
  
        function readTraceTimestamp(record) {
          const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
          const candidates = [
            record?.timestamp,
            record?.created_at,
            record?.createdAt,
            record?.updated_at,
            record?.updatedAt,
            record?.started_at,
            record?.startedAt,
            record?.completed_at,
            record?.completedAt,
            record?.finished_at,
            record?.finishedAt,
            record?.ended_at,
            record?.endedAt,
            metadata?.timestamp,
            metadata?.created_at,
            metadata?.createdAt,
            metadata?.updated_at,
            metadata?.updatedAt,
            metadata?.started_at,
            metadata?.startedAt,
            metadata?.completed_at,
            metadata?.completedAt,
            metadata?.finished_at,
            metadata?.finishedAt,
            metadata?.ended_at,
            metadata?.endedAt,
          ];
          for (const value of candidates) {
            const timestamp = parseTraceTimestampValue(value);
            if (timestamp > 0) {
              return timestamp;
            }
          }
          return 0;
        }
  
        function getTraceEventCreatedAt(record) {
          const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
          const candidates = [
            record?.createdAt,
            record?.created_at,
            record?.timestamp,
            record?.startedAt,
            record?.started_at,
            metadata?.createdAt,
            metadata?.created_at,
            metadata?.timestamp,
            metadata?.startedAt,
            metadata?.started_at,
          ];
          for (const value of candidates) {
            if (value == null || value === "") {
              continue;
            }
            const timestamp = parseTraceTimestampValue(value);
            if (timestamp > 0) {
              return new Date(timestamp).toISOString();
            }
          }
          return "";
        }
  
        function formatTraceTimestampLabel(value) {
          const timestamp = Number(value);
          if (!Number.isFinite(timestamp) || timestamp <= 0) {
            return "—";
          }
          return new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(timestamp));
        }
  
        function formatTraceRowTimeLabel(entry) {
          if (entry?.durationMs != null) {
            return formatTraceDurationMs(entry.durationMs);
          }
          return formatTraceTimestampLabel(entry?.timestamp);
        }
  
        function readTraceText(value, maxLength = 260) {
          const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();
          let text = "";
  
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            text = String(value);
          } else if (Array.isArray(value)) {
            text = value
              .map((entry) => readTraceText(entry, maxLength))
              .filter(Boolean)
              .join(" ");
          } else if (value && typeof value === "object") {
            if (typeof value.content === "string") {
              text = value.content;
            } else if (typeof value.text === "string") {
              text = value.text;
            } else if (value.text && typeof value.text === "object" && typeof value.text.value === "string") {
              text = value.text.value;
            } else if (typeof value.message === "string") {
              text = value.message;
            } else if (typeof value.summary === "string") {
              text = value.summary;
            } else if (typeof value.body === "string") {
              text = value.body;
            } else if (typeof value.name === "string") {
              text = value.name;
            } else if (Array.isArray(value.content)) {
              text = value.content.map((entry) => readTraceText(entry, maxLength)).filter(Boolean).join(" ");
            } else {
              try {
                text = JSON.stringify(value);
              } catch {
                text = "";
              }
            }
          }
  
          const normalized = normalize(text);
          if (!maxLength || normalized.length <= maxLength) {
            return normalized;
          }
          return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + "...";
        }
  
        function getTraceThreadTitle(thread, fallbackTitle = "") {
          const normalizedThread = thread ? normalizeThreadItem(thread) : null;
          const titleParts = normalizedThread ? getSidebarThreadTitleParts(normalizedThread) : null;
          return titleParts?.displayThreadTitle || String(fallbackTitle || "").trim() || normalizedThread?.title || "Untitled thread";
        }
  
        function getTraceStatusLabel(value) {
          const normalized = String(value || "").trim().replace(/_/g, " ");
          return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Unknown";
        }
  
        function getTraceEventType(log) {
          return String(log?.eventType || log?.type || log?.logType || log?.kind || "").trim().toLowerCase();
        }
  
        function getTraceEventTitle(log) {
          const eventType = getTraceEventType(log);
          const metadata = log?.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata) ? log.metadata : {};
          const action = String(log?.action || metadata?.action || metadata?.toolName || metadata?.command || "").trim();
          if (action) {
            return action.length > 80 ? action.slice(0, 79).trimEnd() + "..." : action;
          }
          if (eventType === "agent_message" || eventType === "assistant_message") return "Assistant message";
          if (eventType === "user_message") return "User message";
          if (eventType === "reasoning") return "Reasoning";
          if (eventType === "command_execution") return "Command execution";
          if (eventType === "mcp_tool_call") return "Tool call";
          if (eventType === "subagent_invocation") return "Subagent";
          if (eventType === "permission_request") return "Permission request";
          if (eventType === "turn_completed") return "Run summary";
          if (eventType === "file_change") return "File change";
          return eventType ? getTraceStatusLabel(eventType) : "Log event";
        }
  
        function getTraceEventCopy(log) {
          const metadata = log?.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata) ? log.metadata : {};
          return readTraceText(
            log?.message
            || log?.content
            || log?.summary
            || metadata?.summary
            || metadata?.message
            || metadata?.stdout
            || metadata?.stderr
            || metadata?.result
            || "",
            180
          );
        }
  
        function getTraceEventIcon(eventType) {
          const type = String(eventType || "").toLowerCase();
          if (type.includes("message")) return MessageSquare;
          if (type.includes("command") || type.includes("tool")) return Terminal;
          if (type.includes("subagent")) return Bot;
          if (type.includes("permission")) return Shield;
          if (type.includes("file")) return FileText;
          if (type.includes("reasoning") || type.includes("summary")) return Lightbulb;
          return Clock;
        }
  
        function getTraceEventKindClass(eventType) {
          const type = String(eventType || "").toLowerCase();
          if (type.includes("command") || type.includes("tool")) return "tool";
          if (type.includes("permission")) return "permission";
          if (type.includes("subagent")) return "subagent";
          if (type.includes("message")) return "message";
          return "log";
        }
  
        function getTraceRecordMetadata(record) {
          return record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
            ? record.metadata
            : {};
        }
  
        function getTraceStepType(step) {
          return String(step?.stepKind || step?.step_kind || step?.eventType || step?.event_type || step?.type || "step")
            .trim()
            .toLowerCase();
        }
  
        function getTraceStepTitle(step) {
          const metadata = getTraceRecordMetadata(step);
          const explicitTitle = String(step?.title || metadata?.title || metadata?.decision || "").trim();
          if (explicitTitle) {
            return explicitTitle.length > 96 ? explicitTitle.slice(0, 95).trimEnd() + "..." : explicitTitle;
          }
          const stepType = getTraceStepType(step);
          if (stepType === "user_message") return "User intent received";
          if (stepType === "assistant_message") return "Assistant response";
          if (stepType === "reasoning") return "Reasoning checkpoint";
          if (stepType === "command_execution") return "Ran command";
          if (stepType === "mcp_tool_call") return "Called tool";
          if (stepType === "file_change") return "Changed files";
          if (stepType === "turn_completed") return "Turn completed";
          if (stepType === "system") return "System event";
          return stepType ? getTraceStatusLabel(stepType) : "Trace step";
        }
  
        function getTraceStepCopy(step) {
          const metadata = getTraceRecordMetadata(step);
          return readTraceText(
            metadata?.decision
            || metadata?.summary
            || metadata?.message
            || metadata?.reasoning
            || metadata?.command
            || metadata?.toolName
            || metadata?.tool_name
            || metadata?.filePath
            || metadata?.file_path
            || step?.summary
            || step?.message
            || step?.content
            || "",
            220
          );
        }
  
        function getTraceDecisionTitle(record) {
          const metadata = getTraceRecordMetadata(record);
          const explicitTitle = readTraceText(
            record?.title
            || record?.decision
            || record?.summary
            || metadata?.title
            || metadata?.decision
            || metadata?.summary
            || "",
            96
          );
          return explicitTitle || getTraceStepTitle(record);
        }
  
        function getTraceDecisionCopy(record) {
          const metadata = getTraceRecordMetadata(record);
          return readTraceText(
            record?.rationale
            || record?.reason
            || record?.summary
            || record?.description
            || record?.decision
            || record?.content
            || metadata?.rationale
            || metadata?.reason
            || metadata?.summary
            || metadata?.description
            || metadata?.decision
            || "",
            240
          ) || getTraceStepCopy(record);
        }
  
        function getTraceDecisionStepId(record) {
          const metadata = getTraceRecordMetadata(record);
          const stepIds = Array.isArray(record?.stepIds)
            ? record.stepIds
            : Array.isArray(record?.step_ids)
              ? record.step_ids
              : Array.isArray(metadata?.stepIds)
                ? metadata.stepIds
                : Array.isArray(metadata?.step_ids)
                  ? metadata.step_ids
                  : [];
          return String(
            record?.stepId
            || record?.step_id
            || record?.startStepId
            || record?.start_step_id
            || record?.firstStepId
            || record?.first_step_id
            || metadata?.stepId
            || metadata?.step_id
            || metadata?.startStepId
            || metadata?.start_step_id
            || metadata?.firstStepId
            || metadata?.first_step_id
            || stepIds[0]
            || ""
          ).trim();
        }
  
        function getTraceDecisionStepSequence(record) {
          const metadata = getTraceRecordMetadata(record);
          const value = Number(
            record?.stepSequence
            ?? record?.step_sequence
            ?? record?.startStepSequence
            ?? record?.start_step_sequence
            ?? metadata?.stepSequence
            ?? metadata?.step_sequence
            ?? metadata?.startStepSequence
            ?? metadata?.start_step_sequence
          );
          return Number.isFinite(value) ? value : null;
        }
  
        function getTraceDecisionSnapshotId(record, side) {
          const metadata = getTraceRecordMetadata(record);
          const isBefore = side === "before";
          return String(
            isBefore
              ? record?.snapshotBeforeId
                || record?.snapshot_before_id
                || record?.startSnapshotId
                || record?.start_snapshot_id
                || metadata?.snapshotBeforeId
                || metadata?.snapshot_before_id
                || metadata?.startSnapshotId
                || metadata?.start_snapshot_id
                || ""
              : record?.snapshotAfterId
                || record?.snapshot_after_id
                || record?.endSnapshotId
                || record?.end_snapshot_id
                || metadata?.snapshotAfterId
                || metadata?.snapshot_after_id
                || metadata?.endSnapshotId
                || metadata?.end_snapshot_id
                || ""
          ).trim();
        }
  
        function isTraceDecisionEntry(entry) {
          return entry?.source === "step" || entry?.source === "decision" || entry?.source === "trace_sequence";
        }
  
        function collectTraceTouchedResources(record) {
          const metadata = getTraceRecordMetadata(record);
          const resources = [];
          const addResource = (value) => {
            if (value == null || value === "") return;
            if (Array.isArray(value)) {
              value.forEach(addResource);
              return;
            }
            if (value && typeof value === "object") {
              addResource(value.path || value.filePath || value.file_path || value.name || value.id || value.resourceId || value.resource_id);
              return;
            }
            const text = String(value || "").trim();
            if (!text) return;
            if (!resources.includes(text)) {
              resources.push(text);
            }
          };
  
          [
            record?.touchedResources,
            record?.touched_resources,
            record?.environmentId,
            record?.environment_id,
            record?.sourceMessageId,
            record?.source_message_id,
            metadata?.filePath,
            metadata?.file_path,
            metadata?.path,
            metadata?.relativePath,
            metadata?.relative_path,
            metadata?.changedFile,
            metadata?.changed_file,
            metadata?.changedFiles,
            metadata?.changed_files,
            metadata?.filenames,
            metadata?.fileNames,
            metadata?.files,
            metadata?.resourceId,
            metadata?.resource_id,
            metadata?.toolName,
            metadata?.tool_name,
            metadata?.command,
          ].forEach(addResource);
  
          return resources.slice(0, 8);
        }
  
        function getTraceRingNumber(record) {
          const stepType = getTraceStepType(record);
          const eventType = getTraceEventType(record);
          const type = String(stepType && stepType !== "step" ? stepType : (eventType || stepType)).toLowerCase();
          const metadata = getTraceRecordMetadata(record);
          const directRing = Number(record?.ring ?? record?.permissionRing ?? record?.permission_ring ?? metadata?.ring ?? metadata?.permissionRing ?? metadata?.permission_ring);
          if (directRing === 1 || directRing === 2 || directRing === 3) {
            return directRing;
          }
          const directRingId = String(record?.ringId || record?.ring_id || record?.permissionRingId || record?.permission_ring_id || metadata?.ringId || metadata?.ring_id || metadata?.permissionRingId || metadata?.permission_ring_id || "").trim().toLowerCase();
          if (directRingId === "ring_3" || directRingId === "ring-3" || directRingId === "ring3") return 3;
          if (directRingId === "ring_2" || directRingId === "ring-2" || directRingId === "ring2") return 2;
          if (directRingId === "ring_1" || directRingId === "ring-1" || directRingId === "ring1") return 1;
          const searchableText = [
            type,
            record?.title,
            record?.message,
            record?.summary,
            metadata?.action,
            metadata?.toolName,
            metadata?.tool_name,
            metadata?.command,
            metadata?.summary,
            metadata?.message,
            metadata?.resourceType,
            metadata?.resource_type,
          ].map((value) => readTraceText(value, 240)).join(" ").toLowerCase();
  
          if (
            type.includes("permission")
            || searchableText.includes("payment")
            || searchableText.includes("stripe")
            || searchableText.includes("send email")
            || searchableText.includes("email send")
            || searchableText.includes("delete")
            || searchableText.includes("secret")
            || searchableText.includes("external api")
          ) {
            return 3;
          }
          if (
            searchableText.includes("deploy")
            || searchableText.includes("publish")
            || searchableText.includes("webhook")
            || searchableText.includes("github")
            || searchableText.includes("google drive")
            || searchableText.includes("onedrive")
            || searchableText.includes("notion")
          ) {
            return 2;
          }
          return 1;
        }
  
        function getTraceRingLabel(ring) {
          const numericRing = Number(ring);
          if (numericRing === 3) return "Ring 3";
          if (numericRing === 2) return "Ring 2";
          return "Ring 1";
        }
  
        function getTracePermissionRingId(ring) {
          const numericRing = Number(ring);
          if (numericRing === 3) return "ring_3";
          if (numericRing === 2) return "ring_2";
          return "ring_1";
        }
  
        function renderTracePermissionRingIcon(ring) {
          return React.createElement(PlatformPermissionMiniRingIcon, {
            ringId: getTracePermissionRingId(ring),
          });
        }
  
        function getTraceRingDescription(ring) {
          const numericRing = Number(ring);
          if (numericRing === 3) return "High-blast-radius action";
          if (numericRing === 2) return "Externally visible action";
          return "Sandbox-local action";
        }
  
        function getTraceDecisionStatus(record) {
          const metadata = getTraceRecordMetadata(record);
          const status = String(
            record?.decisionStatus
            || record?.decision_status
            || metadata?.decisionStatus
            || metadata?.decision_status
            || metadata?.status
            || ""
          ).trim().toLowerCase();
          const supersededBy = String(record?.supersededBy || record?.superseded_by || metadata?.supersededBy || metadata?.superseded_by || "").trim();
          const needsReview = Boolean(
            record?.needsReview
            || record?.needs_review
            || metadata?.needsReview
            || metadata?.needs_review
            || metadata?.requiresReview
            || metadata?.requires_review
          );
          if (supersededBy || status === "superseded") return "superseded";
          if (needsReview || status === "needs_review" || status === "review" || status === "blocked") return "needs-review";
          if (status === "verified" || status === "accepted" || status === "complete") return "verified";
          return "grounded";
        }
  
        function getTraceDecisionStatusLabel(status) {
          const normalized = String(status || "").trim().toLowerCase();
          if (normalized === "superseded") return "Superseded";
          if (normalized === "needs-review") return "Needs review";
          if (normalized === "verified") return "Verified";
          return "Grounded";
        }
  
        function getTraceEvidenceLabel(entry) {
          if (!entry || typeof entry !== "object") return "No evidence";
          const parts = [];
          if (entry.stepSequence != null) {
            parts.push("step #" + entry.stepSequence);
          } else if (entry.stepId) {
            parts.push("step");
          }
          const touchedCount = Array.isArray(entry.touchedResources) ? entry.touchedResources.length : 0;
          if (touchedCount > 0) {
            parts.push(touchedCount + " " + (touchedCount === 1 ? "resource" : "resources"));
          }
          if (entry.snapshotBeforeId || entry.snapshotAfterId) {
            parts.push("snapshots");
          }
          return parts.length > 0 ? parts.join(" · ") : "event evidence";
        }
  
        function getTraceEventDurationMs(record) {
          const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
          const candidates = [
            record?.durationMs,
            record?.duration_ms,
            record?.duration,
            record?.elapsedMs,
            record?.elapsed_ms,
            metadata?.durationMs,
            metadata?.duration_ms,
            metadata?.duration,
            metadata?.elapsedMs,
            metadata?.elapsed_ms,
          ];
          for (const value of candidates) {
            const numeric = Number(value);
            if (Number.isFinite(numeric) && numeric >= 0) {
              return numeric;
            }
          }
          const startedAt = Date.parse(String(record?.startedAt || record?.createdAt || metadata?.startedAt || ""));
          const endedAt = Date.parse(String(record?.completedAt || record?.finishedAt || record?.endedAt || metadata?.completedAt || ""));
          if (Number.isFinite(startedAt) && Number.isFinite(endedAt) && endedAt >= startedAt) {
            return endedAt - startedAt;
          }
          return null;
        }
  
        function readTraceTokenNumber(value) {
          const numeric = Number(value);
          return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
        }
  
        function readTraceTokensFromObject(value) {
          if (!value || typeof value !== "object" || Array.isArray(value)) {
            return 0;
          }
  
          const totalCandidates = [
            value.totalTokens,
            value.total_tokens,
            value.tokenCount,
            value.token_count,
            value.tokens,
            value.total,
            value.completionTokensTotal,
            value.completion_tokens_total,
            value.llmTokens,
            value.llm_tokens,
            value["usage.total_tokens"],
            value["gen_ai.usage.total_tokens"],
            value["llm.token_count.total"],
          ];
          for (const candidate of totalCandidates) {
            const numeric = readTraceTokenNumber(candidate);
            if (numeric) {
              return Math.round(numeric);
            }
          }
  
          const inputCandidates = [
            value.inputTokens,
            value.input_tokens,
            value.promptTokens,
            value.prompt_tokens,
            value.cachedInputTokens,
            value.cached_input_tokens,
            value["usage.input_tokens"],
            value["usage.prompt_tokens"],
            value["gen_ai.usage.input_tokens"],
            value["llm.token_count.prompt"],
          ];
          const outputCandidates = [
            value.outputTokens,
            value.output_tokens,
            value.completionTokens,
            value.completion_tokens,
            value.reasoningTokens,
            value.reasoning_tokens,
            value["usage.output_tokens"],
            value["usage.completion_tokens"],
            value["gen_ai.usage.output_tokens"],
            value["llm.token_count.completion"],
          ];
          const inputTotal = inputCandidates.reduce((total, candidate) => total + readTraceTokenNumber(candidate), 0);
          const outputTotal = outputCandidates.reduce((total, candidate) => total + readTraceTokenNumber(candidate), 0);
          return inputTotal + outputTotal > 0 ? Math.round(inputTotal + outputTotal) : 0;
        }
  
        function getTraceEventTokens(record) {
          const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
          const directCandidates = [
            record,
            metadata,
            record?.usage,
            metadata?.usage,
            record?.response?.usage,
            metadata?.response?.usage,
            record?.result?.usage,
            metadata?.result?.usage,
            record?.data?.usage,
            metadata?.data?.usage,
            record?.spanData,
            record?.span_data,
            metadata?.spanData,
            metadata?.span_data,
            record?.attributes,
            metadata?.attributes,
          ];
          for (const candidate of directCandidates) {
            const total = readTraceTokensFromObject(candidate);
            if (total) {
              return total;
            }
          }
  
          const visited = new WeakSet();
          const searchNested = (value, depth = 0) => {
            if (!value || typeof value !== "object" || depth > 4) {
              return 0;
            }
            if (visited.has(value)) {
              return 0;
            }
            visited.add(value);
  
            const localTotal = readTraceTokensFromObject(value);
            if (localTotal) {
              return localTotal;
            }
  
            if (Array.isArray(value)) {
              for (const entry of value) {
                const nestedTotal = searchNested(entry, depth + 1);
                if (nestedTotal) {
                  return nestedTotal;
                }
              }
              return 0;
            }
  
            for (const entry of Object.values(value)) {
              const nestedTotal = searchNested(entry, depth + 1);
              if (nestedTotal) {
                return nestedTotal;
              }
            }
            return 0;
          };
  
          return searchNested(record);
        }
  
        function formatTraceTokenLabel(value, suffix = " total") {
          const numeric = Number(value);
          if (!Number.isFinite(numeric) || numeric <= 0) {
            return "-";
          }
          return Math.round(numeric).toLocaleString("en-US") + suffix;
        }
  
        function formatTraceDateTime(value) {
          if (!value) return "-";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "-";
          return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(date);
        }
  
        function formatTraceDurationMs(value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue) || numericValue < 0) {
            return "—";
          }
          return Math.round(numericValue).toLocaleString("en-US") + " ms";
        }
  
        function formatTraceRawJson(value) {
          try {
            return JSON.stringify(value || {}, null, 2);
          } catch {
            return "{}";
          }
        }
  
        function ThreadTraceRawEventEditor({ eventId, value }) {
          const [editorModule, setEditorModule] = useState(null);
          const [editorModuleError, setEditorModuleError] = useState("");
          const rawText = useMemo(() => formatTraceRawJson(value), [value]);
          const editorHeight = useMemo(() => {
            const lineCount = String(rawText || "").split(/\n/).length;
            return Math.min(420, Math.max(160, (lineCount + 2) * 20)) + "px";
          }, [rawText]);
          const MonacoEditorComponent = editorModule?.default || null;
  
          useEffect(() => {
            let cancelled = false;
  
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled || !module) return;
                setEditorModule(module);
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled) {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (cancelled) return;
                setEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });
  
            return () => {
              cancelled = true;
            };
          }, []);
  
          if (MonacoEditorComponent) {
            const normalizedEventId = String(eventId || "event").replace(/[^A-Za-z0-9_.:-]+/g, "_");
            return React.createElement("div", {
                className: "playground-code-preview-editor-shell playground-thread-observability-expanded-raw-editor",
                style: { height: editorHeight },
              },
              React.createElement(MonacoEditorComponent, {
                path: "thread-trace-raw-" + normalizedEventId + ".json",
                height: editorHeight,
                language: "json",
                theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                value: rawText,
                beforeMount: ensurePlaygroundCodeEditorTheme,
                options: {
                  automaticLayout: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  readOnly: true,
                  fontSize: 12,
                  lineHeight: 20,
                  tabSize: 2,
                  insertSpaces: true,
                  renderLineHighlight: "none",
                  lineNumbersMinChars: 3,
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  wordWrap: "on",
                  padding: { top: 12, bottom: 12 },
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
              })
            );
          }
  
          if (!editorModuleError) {
            return React.createElement("div", {
              className: "playground-code-preview-state playground-thread-observability-expanded-raw-editor",
              style: { height: editorHeight },
            },
              React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
              React.createElement("span", null, "Loading editor...")
            );
          }
  
          return React.createElement("pre", { className: "playground-thread-observability-expanded-raw" }, rawText);
        }
  
        function buildThreadTraceTimeline(thread, details, fallbackTitle = "") {
          const normalizedThread = thread ? normalizeThreadItem(thread) : normalizeThreadItem({
            id: "",
            title: fallbackTitle || "Thread",
          });
          const logs = Array.isArray(details?.logs) ? details.logs : [];
          const messages = Array.isArray(details?.messages) ? details.messages : [];
          const steps = Array.isArray(details?.steps) ? details.steps : [];
          const traceSequences = Array.isArray(details?.traceClusters?.sequences) ? details.traceClusters.sequences : [];
          const decisions = traceSequences.length > 0 ? traceSequences : Array.isArray(details?.decisions) ? details.decisions : [];
          const timeline = [];
          const startedAt = normalizedThread.startedAt || normalizedThread.createdAt || details?.thread?.startedAt || details?.thread?.createdAt || "";
          const completedAt = normalizedThread.completedAt || normalizedThread.finishedAt || normalizedThread.endedAt || details?.thread?.completedAt || details?.thread?.finishedAt || details?.thread?.endedAt || "";
          const threadStartMs = Date.parse(String(startedAt || "")) || 0;
          const threadEndMs = Date.parse(String(completedAt || "")) || 0;
          const threadDurationMs = threadStartMs && threadEndMs && threadEndMs >= threadStartMs
            ? threadEndMs - threadStartMs
            : Number(details?.thread?.durationMs || details?.thread?.duration || 0) || null;
  
          timeline.push({
            id: "thread",
            Icon: GitFork,
            kind: "thread",
            type: "thread",
            title: getTraceThreadTitle(normalizedThread, fallbackTitle),
            copy: normalizedThread.status ? getTraceStatusLabel(normalizedThread.status) : "Thread",
            createdAt: startedAt,
            timestamp: threadStartMs,
            durationMs: threadDurationMs,
            raw: normalizedThread,
            tokenCount: getTraceEventTokens(normalizedThread) || getTraceEventTokens(details?.thread || {}),
          });
  
          const stepEvents = steps.map((step, index) => {
            const type = getTraceStepType(step);
            const ring = getTraceRingNumber(step);
            return {
              source: "step",
              record: step,
              index,
              idPrefix: "step",
              type,
              title: getTraceStepTitle(step),
              copy: getTraceStepCopy(step),
              createdAt: getTraceEventCreatedAt(step),
              raw: step,
              stepId: String(step?.id || "").trim(),
              stepSequence: Number.isFinite(Number(step?.sequence)) ? Number(step.sequence) : null,
              snapshotBeforeId: String(step?.snapshotBeforeId || step?.snapshot_before_id || "").trim(),
              snapshotAfterId: String(step?.snapshotAfterId || step?.snapshot_after_id || "").trim(),
              ring,
              ringLabel: getTraceRingLabel(ring),
              ringDescription: getTraceRingDescription(ring),
              decisionStatus: getTraceDecisionStatus(step),
              touchedResources: collectTraceTouchedResources(step),
            };
          });
  
          const decisionEvents = decisions.map((decision, index) => {
            const type = getTraceStepType(decision);
            const ring = getTraceRingNumber(decision);
            const source = String(decision?.source || "").trim() === "trace_sequence" ? "trace_sequence" : "decision";
            return {
              source,
              record: decision,
              index,
              idPrefix: source === "trace_sequence" ? "trace-sequence" : "decision",
              type,
              title: getTraceDecisionTitle(decision),
              copy: getTraceDecisionCopy(decision),
              createdAt: getTraceEventCreatedAt(decision),
              raw: decision,
              stepId: getTraceDecisionStepId(decision),
              stepSequence: getTraceDecisionStepSequence(decision),
              snapshotBeforeId: getTraceDecisionSnapshotId(decision, "before"),
              snapshotAfterId: getTraceDecisionSnapshotId(decision, "after"),
              ring,
              ringLabel: getTraceRingLabel(ring),
              ringDescription: getTraceRingDescription(ring),
              decisionStatus: getTraceDecisionStatus(decision),
              touchedResources: collectTraceTouchedResources(decision),
            };
          });
  
          const sourceEvents = decisionEvents.length > 0
            ? decisionEvents
            : stepEvents.length > 0
            ? stepEvents
            : logs.length > 0
            ? logs.map((log, index) => ({
                source: "log",
                record: log,
                index,
                idPrefix: "log",
                type: getTraceEventType(log),
                title: getTraceEventTitle(log),
                copy: getTraceEventCopy(log),
                createdAt: getTraceEventCreatedAt(log),
                raw: log,
              }))
            : messages.map((message, index) => ({
                source: "message",
                record: message,
                index,
                idPrefix: "message",
                type: String(message?.role || "message").trim().toLowerCase() + "_message",
                title: getTraceStatusLabel(message?.role || "message") + " message",
                copy: readTraceText(message?.content || "", 180),
                createdAt: getTraceEventCreatedAt(message),
                raw: message,
              }));
  
          sourceEvents
            .map((event, index) => ({
              id: String(event.record?.id || event.idPrefix + ":" + index),
              kind: getTraceEventKindClass(event.type),
              source: event.source,
              type: event.type,
              timestamp: readTraceTimestamp(event.record),
              title: event.title,
              copy: event.copy,
              createdAt: event.createdAt,
              durationMs: getTraceEventDurationMs(event.record),
              raw: event.raw,
              tokenCount: getTraceEventTokens(event.record),
              actionCount: Number.isFinite(Number(event.record?.actionCount || event.record?.action_count))
                ? Number(event.record?.actionCount || event.record?.action_count)
                : null,
              stepId: event.stepId || "",
              stepSequence: event.stepSequence,
              snapshotBeforeId: event.snapshotBeforeId || "",
              snapshotAfterId: event.snapshotAfterId || "",
              ring: event.ring || getTraceRingNumber(event.record),
              ringLabel: event.ringLabel || getTraceRingLabel(getTraceRingNumber(event.record)),
              ringDescription: event.ringDescription || getTraceRingDescription(getTraceRingNumber(event.record)),
              decisionStatus: event.decisionStatus || getTraceDecisionStatus(event.record),
              touchedResources: Array.isArray(event.touchedResources) ? event.touchedResources : collectTraceTouchedResources(event.record),
            }))
            .filter((entry) => entry.title || entry.copy)
            .sort((left, right) => {
              if (left.timestamp !== right.timestamp) {
                return left.timestamp - right.timestamp;
              }
              return left.id.localeCompare(right.id);
            })
            .forEach((entry) => {
              timeline.push({
                ...entry,
                Icon: getTraceEventIcon(entry.type),
              });
            });
  
          return timeline;
        }
  
        function getTraceClusterActionCandidates(record, actionById = new Map()) {
          const safeRecord = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          const metadata = getTraceRecordMetadata(safeRecord);
          const raw = safeRecord.raw && typeof safeRecord.raw === "object" && !Array.isArray(safeRecord.raw) ? safeRecord.raw : {};
          const candidates = [];
          const appendActionList = (value) => {
            if (!Array.isArray(value)) return;
            value.forEach((entry) => {
              if (entry && typeof entry === "object" && !Array.isArray(entry)) {
                candidates.push(entry);
              } else if (typeof entry === "string" && entry.trim()) {
                candidates.push({ id: entry, message: entry, title: entry });
              }
            });
          };
          appendActionList(safeRecord.actions);
          appendActionList(safeRecord.traceActions);
          appendActionList(safeRecord.trace_actions);
          appendActionList(metadata.actions);
          appendActionList(metadata.traceActions);
          appendActionList(metadata.trace_actions);
          appendActionList(raw.actions);
          appendActionList(raw.traceActions);
          appendActionList(raw.trace_actions);
  
          const actionIds = [];
          const appendIds = (value) => {
            if (Array.isArray(value)) {
              value.forEach(appendIds);
              return;
            }
            const text = String(value || "").trim();
            if (text) actionIds.push(text);
          };
          appendIds(safeRecord.actionIds);
          appendIds(safeRecord.action_ids);
          appendIds(metadata.actionIds);
          appendIds(metadata.action_ids);
          appendIds(raw.actionIds);
          appendIds(raw.action_ids);
          actionIds.forEach((actionId) => {
            const action = actionById.get(actionId);
            if (action) candidates.push(action);
          });
  
          const seen = new Set();
          return candidates.filter((action, index) => {
            const id = String(action?.id || action?.sourceId || action?.source_id || action?.stepId || action?.step_id || index).trim();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        }
  
        function getTraceClusterActionEntries(record, actionById = new Map()) {
          return getTraceClusterActionCandidates(record, actionById).map((action, index) => {
            const metadata = getTraceRecordMetadata(action);
            const type = getTraceStepType(action) || getTraceEventType(action) || String(action?.type || action?.source || "action").trim().toLowerCase();
            const ring = getTraceRingNumber(action);
            const createdAt = getTraceEventCreatedAt(action);
            return {
              id: String(action?.id || action?.sourceId || action?.source_id || action?.stepId || action?.step_id || "action:" + index).trim(),
              type,
              title: getTraceDecisionTitle(action) || getTraceStepTitle(action) || getTraceEventTitle(action) || "Trace action",
              copy: getTraceDecisionCopy(action) || getTraceStepCopy(action) || getTraceEventCopy(action) || "",
              createdAt,
              timestamp: readTraceTimestamp(action),
              durationMs: getTraceEventDurationMs(action),
              tokenCount: getTraceEventTokens(action),
              ring,
              ringLabel: action?.ringLabel || action?.ring_label || getTraceRingLabel(ring),
              ringDescription: action?.ringDescription || action?.ring_description || getTraceRingDescription(ring),
              stepId: String(action?.stepId || action?.step_id || (action?.source === "step" ? action?.id : "") || "").trim(),
              stepSequence: Number.isFinite(Number(action?.stepSequence || action?.step_sequence || action?.sequence))
                ? Number(action?.stepSequence || action?.step_sequence || action?.sequence)
                : null,
              touchedResources: collectTraceTouchedResources(action),
              raw: action,
              category: String(metadata?.category || action?.category || "").trim(),
            };
          });
        }
  
        function getTraceClusterSearchText(record, actionById = new Map()) {
          const actionText = getTraceClusterActionEntries(record, actionById)
            .map((action) => [
              action.id,
              action.title,
              action.copy,
              action.type,
              action.ringLabel,
              action.touchedResources.join(" "),
            ].join(" "))
            .join(" ");
          return actionText.toLowerCase();
        }
  
        function renderThreadTraceDetailView({
          thread,
          details,
          fallbackThreadId = "",
          fallbackTitle = "",
          loadingLabel = "Loading trace...",
          backendUrl = "",
          requestHeaders = null,
          onOpenChat,
          onOpenTrace,
          onForkCreated,
          traceSearchQuery = "",
          traceEventFilter = "all",
          traceEventSort = "timeline",
        }) {
          return React.createElement(ThreadTraceDetailInspector, {
            thread,
            details,
            fallbackThreadId,
            fallbackTitle,
            loadingLabel,
            backendUrl,
            requestHeaders,
            onOpenChat,
            onOpenTrace,
            onForkCreated,
            traceSearchQuery,
            traceEventFilter,
            traceEventSort,
          });
        }
  
        function ThreadTraceDetailInspector({
          thread,
          details,
          fallbackThreadId = "",
          fallbackTitle = "",
          loadingLabel = "Loading trace...",
          backendUrl = "",
          requestHeaders = null,
          onOpenChat,
          onOpenTrace,
          onForkCreated,
          traceSearchQuery = "",
          traceEventFilter = "all",
          traceEventSort = "timeline",
        }) {
          if (!details || details.status === "loading") {
            return React.createElement("div", { className: "playground-agents-observability-detail is-loading" }, loadingLabel);
          }
  
          if (details.status === "error") {
            return React.createElement("div", { className: "playground-agents-observability-detail is-error" }, details.error || "Failed to load trace data.");
          }
  
          return React.createElement(ThreadTraceDetailLoadedInspector, {
            thread,
            details,
            fallbackThreadId,
            fallbackTitle,
            backendUrl,
            requestHeaders,
            onOpenChat,
            onOpenTrace,
            onForkCreated,
            traceSearchQuery,
            traceEventFilter,
            traceEventSort,
          });
        }
  
        function ThreadTraceDetailLoadedInspector({
          thread,
          details,
          fallbackThreadId = "",
          fallbackTitle = "",
          backendUrl = "",
          requestHeaders = null,
          onOpenChat,
          onOpenTrace,
          onForkCreated,
          traceSearchQuery = "",
          traceEventFilter = "all",
          traceEventSort = "timeline",
        }) {
          const mergedThread = details.thread || thread || { id: fallbackThreadId, title: fallbackTitle };
          const normalizedThread = normalizeThreadItem({
            ...mergedThread,
            id: String(mergedThread?.id || fallbackThreadId || "").trim() || String(fallbackThreadId || "").trim(),
            title: String(mergedThread?.title || fallbackTitle || "").trim() || getTraceThreadTitle(thread, fallbackTitle),
          });
          const messages = Array.isArray(details.messages) ? details.messages : [];
          const steps = Array.isArray(details.steps) ? details.steps : [];
          const logs = Array.isArray(details.logs) ? details.logs : [];
          const traceClusterActions = Array.isArray(details?.traceClusters?.actions) ? details.traceClusters.actions : [];
          const traceClusterActionById = useMemo(() => {
            const next = new Map();
            traceClusterActions.forEach((action, index) => {
              [
                action?.id,
                action?.sourceId,
                action?.source_id,
                action?.stepId,
                action?.step_id,
                action?.logId,
                action?.log_id,
                index,
              ].forEach((candidate) => {
                const key = String(candidate || "").trim();
                if (key && !next.has(key)) {
                  next.set(key, action);
                }
              });
            });
            return next;
          }, [traceClusterActions]);
          const [traceForkState, setTraceForkState] = useState({
            itemId: "",
            status: "",
            error: "",
          });
          const timeline = useMemo(() => buildThreadTraceTimeline(normalizedThread, details, fallbackTitle), [
            details,
            fallbackTitle,
            normalizedThread.completedAt,
            normalizedThread.createdAt,
            normalizedThread.endedAt,
            normalizedThread.finishedAt,
            normalizedThread.id,
            normalizedThread.startedAt,
            normalizedThread.status,
            normalizedThread.title,
          ]);
          const visibleTimeline = useMemo(() => {
            const normalizedSearchQuery = String(traceSearchQuery || "").trim().toLowerCase();
            const normalizedFilter = String(traceEventFilter || "all").trim().toLowerCase() || "all";
            const normalizedSort = String(traceEventSort || "timeline").trim().toLowerCase() || "timeline";
            const hasDecisionEntries = timeline.some((entry) => isTraceDecisionEntry(entry));
            const matchesFilter = (entry) => {
              if (normalizedFilter === "all") return true;
              if (normalizedFilter === "decisions") return hasDecisionEntries ? isTraceDecisionEntry(entry) : true;
              if (normalizedFilter === "needs-review") return entry.decisionStatus === "needs-review";
              if (normalizedFilter === "ring-2-plus") return Number(entry.ring || 1) >= 2;
              if (normalizedFilter === "ring-3") return Number(entry.ring || 1) >= 3;
              if (normalizedFilter === "messages") return entry.kind === "message";
              if (normalizedFilter === "tools") return entry.kind === "tool";
              if (normalizedFilter === "reasoning") return String(entry.type || "").includes("reasoning") || String(entry.type || "").includes("summary");
              if (normalizedFilter === "subagents") return entry.kind === "subagent";
              if (normalizedFilter === "permissions") return entry.kind === "permission";
              return true;
            };
            const matchesSearch = (entry) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                entry.id,
                entry.title,
                entry.copy,
                entry.type,
                entry.kind,
                entry.source,
                entry.ringLabel,
                entry.decisionStatus,
                getTraceEvidenceLabel(entry),
                entry.source === "trace_sequence" ? getTraceClusterSearchText(entry.raw || entry, traceClusterActionById) : "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            };
            const items = timeline
              .filter((entry) => matchesFilter(entry) && matchesSearch(entry));
            return items.sort((left, right) => {
              if (normalizedSort === "newest") {
                return (right.timestamp || 0) - (left.timestamp || 0);
              }
              if (normalizedSort === "duration") {
                const leftDuration = Number(left.durationMs || 0);
                const rightDuration = Number(right.durationMs || 0);
                if (leftDuration !== rightDuration) return rightDuration - leftDuration;
              } else if (normalizedSort === "tokens") {
                const leftTokens = Number(left.tokenCount || 0);
                const rightTokens = Number(right.tokenCount || 0);
                if (leftTokens !== rightTokens) return rightTokens - leftTokens;
              }
              if ((left.timestamp || 0) !== (right.timestamp || 0)) {
                return (left.timestamp || 0) - (right.timestamp || 0);
              }
              return String(left.id || "").localeCompare(String(right.id || ""));
            });
          }, [timeline, traceClusterActionById, traceEventFilter, traceEventSort, traceSearchQuery]);
          const [selectedTraceItemId, setSelectedTraceItemId] = useState("");
          useEffect(() => {
            if (visibleTimeline.length === 0) {
              setSelectedTraceItemId("");
              return;
            }
            setSelectedTraceItemId((current) => (
              current && visibleTimeline.some((entry) => entry.id === current) ? current : ""
            ));
          }, [visibleTimeline]);
          const selectedTraceItem = visibleTimeline.find((entry) => entry.id === selectedTraceItemId) || null;
          const selectedTraceClusterActions = useMemo(
            () => getTraceClusterActionEntries(selectedTraceItem?.raw || selectedTraceItem, traceClusterActionById),
            [selectedTraceItem, traceClusterActionById]
          );
          const handleForkFromSelectedTraceItem = useCallback(async () => {
            const normalizedThreadId = String(normalizedThread.id || fallbackThreadId || "").trim();
            const normalizedStepId = String(selectedTraceItem?.stepId || "").trim();
            const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
            if (!normalizedThreadId || !normalizedStepId || !normalizedBackendUrl) {
              return;
            }
  
            setTraceForkState({
              itemId: selectedTraceItem.id,
              status: "loading",
              error: "",
            });
  
            try {
              const response = await fetch(
                normalizedBackendUrl
                  + "/threads/" + encodeURIComponent(normalizedThreadId)
                  + "/steps/" + encodeURIComponent(normalizedStepId)
                  + "/fork",
                {
                  method: "POST",
                  headers: {
                    ...(requestHeaders || {}),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    mode: "historical",
                    title: "Fork from " + (selectedTraceItem.title || "trace decision"),
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to fork from this decision.");
              }
              const nextThread = data?.thread || data?.data?.thread || null;
              setTraceForkState({
                itemId: selectedTraceItem.id,
                status: "success",
                error: "",
              });
              if (nextThread?.id && typeof onForkCreated === "function") {
                onForkCreated(nextThread);
              }
            } catch (error) {
              setTraceForkState({
                itemId: selectedTraceItem.id,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to fork from this decision.",
              });
            }
          }, [
            backendUrl,
            fallbackThreadId,
            normalizedThread.id,
            onForkCreated,
            requestHeaders,
            selectedTraceItem?.id,
            selectedTraceItem?.stepId,
            selectedTraceItem?.title,
          ]);
          const timelineRangeSource = visibleTimeline.length > 0 ? visibleTimeline : timeline;
          const timelineStartMs = Math.min(...timelineRangeSource.map((entry) => entry.timestamp).filter((value) => Number.isFinite(value) && value > 0), Date.now());
          const timelineEndMs = Math.max(
            ...timelineRangeSource.map((entry) => {
              const start = Number(entry.timestamp || 0);
              const duration = Number(entry.durationMs || 0);
              return start > 0 ? start + Math.max(duration, 1) : duration;
            }),
            timelineStartMs + 1
          );
          const timelineRangeMs = Math.max(1, timelineEndMs - timelineStartMs);
          const selectedRaw = selectedTraceItem?.raw || {};
          const selectedMetadata = selectedRaw?.metadata && typeof selectedRaw.metadata === "object" && !Array.isArray(selectedRaw.metadata)
            ? selectedRaw.metadata
            : {};
          const selectedContent = readTraceText(
            selectedRaw?.summary
            || selectedRaw?.message
            || selectedRaw?.content
            || selectedMetadata?.summary
            || selectedMetadata?.message
            || selectedMetadata?.stdout
            || selectedMetadata?.stderr
            || selectedTraceItem?.copy
            || "",
            1800
          );
          const selectedDurationLabel = selectedTraceItem?.durationMs == null
            ? "-"
            : formatTraceDurationMs(selectedTraceItem.durationMs);
          const selectedTokenLabel = formatTraceTokenLabel(selectedTraceItem?.tokenCount || 0);
          const SelectedTraceIcon = selectedTraceItem?.Icon || Clock;
          const selectedTouchedResources = Array.isArray(selectedTraceItem?.touchedResources) ? selectedTraceItem.touchedResources : [];
          const selectedDecisionStatus = selectedTraceItem?.decisionStatus || getTraceDecisionStatus(selectedRaw);
          const selectedForkStatus = traceForkState.itemId === selectedTraceItem?.id ? traceForkState.status : "";
          const selectedForkError = traceForkState.itemId === selectedTraceItem?.id ? traceForkState.error : "";
          const traceDecisionCount = timeline.filter((entry) => isTraceDecisionEntry(entry)).length;
          const traceRingTwoPlusCount = timeline.filter((entry) => Number(entry.ring || 1) >= 2).length;
          const traceNeedsReviewCount = timeline.filter((entry) => entry.decisionStatus === "needs-review").length;
          const traceForkPointCount = timeline.filter((entry) => entry.stepId && entry.snapshotBeforeId).length;
          const traceSummaryItems = [
            { label: "Trace clusters", value: String(traceDecisionCount || 0) },
            { label: "Ring 2+", value: String(traceRingTwoPlusCount || 0) },
            { label: "Needs review", value: String(traceNeedsReviewCount || 0) },
            { label: "Fork points", value: String(traceForkPointCount || 0) },
          ];
          const selectedProperties = [
            { label: "Created", value: formatTraceDateTime(selectedTraceItem?.createdAt || selectedRaw?.createdAt || selectedRaw?.timestamp || "") },
            { label: "ID", value: selectedTraceItem?.id || "-" },
            { label: "Type", value: getTraceStatusLabel(selectedTraceItem?.type || selectedTraceItem?.kind || "") },
            { label: "Source", value: selectedTraceItem?.source === "trace_sequence" ? "Trace sequence" : isTraceDecisionEntry(selectedTraceItem) ? "Decision record" : getTraceStatusLabel(selectedTraceItem?.source || "event") },
            selectedTraceItem?.stepSequence != null ? { label: "Step", value: "#" + selectedTraceItem.stepSequence } : null,
            selectedTraceItem?.actionCount ? { label: "Actions", value: String(selectedTraceItem.actionCount) } : null,
            isTraceDecisionEntry(selectedTraceItem) ? { label: "Decision status", value: getTraceDecisionStatusLabel(selectedDecisionStatus) } : null,
            { label: "Evidence", value: getTraceEvidenceLabel(selectedTraceItem) },
            selectedTraceItem?.snapshotBeforeId ? { label: "Snapshot before", value: selectedTraceItem.snapshotBeforeId } : null,
            selectedTraceItem?.snapshotAfterId ? { label: "Snapshot after", value: selectedTraceItem.snapshotAfterId } : null,
            selectedTouchedResources.length > 0 ? { label: "Touched", value: selectedTouchedResources.join(", ") } : null,
            { label: "Tokens", value: selectedTokenLabel },
            { label: "Logs", value: String(logs.length) },
            { label: "Steps", value: String(steps.length) },
          ].filter(Boolean);
  
          return React.createElement("div", { className: "playground-agents-observability-detail" },
            React.createElement("div", { className: "playground-thread-observability-summary" },
              traceSummaryItems.map((item) =>
                React.createElement("div", { key: item.label, className: "playground-thread-observability-summary-item" },
                  React.createElement("span", { className: "playground-thread-observability-summary-label" }, item.label),
                  React.createElement("span", { className: "playground-thread-observability-summary-value" }, item.value)
                )
              )
            ),
            React.createElement("div", { className: "playground-agents-observability-tree" },
              visibleTimeline.length > 0
                ? visibleTimeline.map((entry) => {
                    const isSelected = selectedTraceItem?.id === entry.id;
                    const isTraceCluster = entry.source === "trace_sequence";
                    const entryActions = isTraceCluster ? getTraceClusterActionEntries(entry.raw || entry, traceClusterActionById) : [];
                    const entryActionCount = Number(entry.actionCount || entryActions.length || 0);
                    const hasTiming = Number.isFinite(entry.timestamp) && entry.timestamp > 0;
                    const leftPercent = hasTiming
                      ? Math.max(0, Math.min(100, ((entry.timestamp - timelineStartMs) / timelineRangeMs) * 100))
                      : 0;
                    const widthPercent = entry.durationMs == null
                      ? 1.2
                      : Math.max(1.2, Math.min(100 - leftPercent, (Math.max(1, entry.durationMs) / timelineRangeMs) * 100));
                    return React.createElement("div", { key: entry.id, className: "playground-thread-observability-row" },
                      React.createElement("button", {
                          type: "button",
                          className: "playground-agents-observability-node is-" + (entry.kind || "log")
                            + (isTraceDecisionEntry(entry) ? " is-step" : "")
                            + (entry.ring ? " is-ring-" + entry.ring : "")
                            + (isSelected ? " is-selected" : ""),
                          onClick: () => setSelectedTraceItemId((current) => current === entry.id ? "" : entry.id),
                        },
                        React.createElement("span", { className: "playground-agents-observability-node-icon", "aria-hidden": "true" },
                          renderTracePermissionRingIcon(entry.ring || 1)
                        ),
                        React.createElement("div", { className: "playground-agents-observability-node-copy" },
                          React.createElement("div", {
                            className: "playground-agents-observability-node-title",
                            title: entry.title,
                          }, entry.title),
                          isTraceDecisionEntry(entry)
                            ? React.createElement("div", { className: "playground-agents-observability-node-badges" },
                                isTraceCluster && entryActionCount
                                  ? React.createElement("span", { className: "playground-agents-observability-node-badge" }, entryActionCount + " " + (entryActionCount === 1 ? "action" : "actions"))
                                  : React.createElement("span", { className: "playground-agents-observability-node-badge" }, getTraceDecisionStatusLabel(entry.decisionStatus)),
                                React.createElement("span", {
                                  className: "playground-agents-observability-node-badge is-ring is-ring-" + (entry.ring || 1),
                                  title: entry.ringDescription || "",
                                }, entry.ringLabel || getTraceRingLabel(entry.ring))
                              )
                            : null,
                          entry.copy || entry.createdAt
                            ? React.createElement("div", {
                                className: "playground-agents-observability-node-meta",
                                title: [entry.copy, entry.createdAt ? formatTraceDateTime(entry.createdAt) : ""].filter(Boolean).join(" - "),
                              }, entry.copy || formatTraceDateTime(entry.createdAt))
                            : null
                        ),
                        React.createElement("div", { className: "playground-agents-observability-node-duration" },
                          React.createElement("span", null, isTraceCluster && entryActionCount ? entryActionCount + "x" : formatTraceRowTimeLabel(entry)),
                          isSelected
                            ? React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                            : React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.8 })
                        ),
                        React.createElement("div", { className: "playground-agents-observability-node-bar", "aria-hidden": "true" },
                          React.createElement("span", {
                            className: "playground-agents-observability-node-bar-fill",
                            style: {
                              left: leftPercent.toFixed(3) + "%",
                              width: widthPercent.toFixed(3) + "%",
                            },
                          })
                        )
                      ),
                      isSelected
                        ? React.createElement("div", { className: "playground-thread-observability-expanded" },
                            React.createElement("div", { className: "playground-thread-observability-expanded-header" },
                              React.createElement("div", { className: "playground-thread-observability-expanded-title" },
                                selectedTraceItem?.title || "Trace decision"
                              ),
                              React.createElement("div", { className: "playground-thread-observability-expanded-chips" },
                                selectedTraceItem?.ring
                                  ? React.createElement("span", {
                                      className: "playground-thread-observability-expanded-chip is-ring is-ring-" + selectedTraceItem.ring,
                                      title: selectedTraceItem.ringDescription || "",
                                    },
                                      React.createElement(Shield, { strokeWidth: 1.8 }),
                                      React.createElement("span", null, selectedTraceItem.ringLabel || getTraceRingLabel(selectedTraceItem.ring))
                                    )
                                  : null,
                                React.createElement("span", { className: "playground-thread-observability-expanded-chip is-kind" },
                                  React.createElement(SelectedTraceIcon, { strokeWidth: 1.8 }),
                                  React.createElement("span", null, getTraceStatusLabel(selectedTraceItem?.type || selectedTraceItem?.kind || ""))
                                ),
                                isTraceDecisionEntry(selectedTraceItem)
                                  ? React.createElement("span", {
                                      className: "playground-thread-observability-expanded-chip is-decision-status is-" + selectedDecisionStatus,
                                    },
                                      React.createElement(Check, { strokeWidth: 1.8 }),
                                      React.createElement("span", null, getTraceDecisionStatusLabel(selectedDecisionStatus))
                                    )
                                  : null,
                                selectedTraceItem?.tokenCount
                                  ? React.createElement("span", { className: "playground-thread-observability-expanded-chip" },
                                      React.createElement(Coins, { strokeWidth: 1.8 }),
                                      React.createElement("span", null, formatTraceTokenLabel(selectedTraceItem.tokenCount, "t"))
                                    )
                                  : null,
                                selectedTraceItem?.durationMs != null
                                  ? React.createElement("span", { className: "playground-thread-observability-expanded-chip" },
                                      React.createElement(Clock, { strokeWidth: 1.8 }),
                                      React.createElement("span", null, selectedDurationLabel)
                                    )
                                  : null
                              )
                            ),
                            selectedTraceItem?.stepId
                              ? React.createElement("div", { className: "playground-thread-observability-expanded-actions" },
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-environments-action-button" + (selectedForkStatus === "loading" ? " is-loading" : ""),
                                    onClick: handleForkFromSelectedTraceItem,
                                    disabled: selectedForkStatus === "loading",
                                  },
                                    selectedForkStatus === "loading"
                                      ? React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                                      : React.createElement(GitFork, { width: 14, height: 14, strokeWidth: 1.8 }),
                                    React.createElement("span", null, selectedForkStatus === "success" ? "Fork created" : "Fork from here")
                                  ),
                                  selectedForkError
                                    ? React.createElement("span", { className: "playground-thread-observability-expanded-error" }, selectedForkError)
                                    : null
                                )
                              : null,
                            isTraceDecisionEntry(selectedTraceItem) && Number(selectedTraceItem?.ring || 1) >= 2
                              ? React.createElement("div", { className: "playground-thread-observability-expanded-warning" },
                                  "Forking from this point restores the local thread and computer state only. Externally visible actions after this decision are not undone."
                                )
                              : null,
                            selectedTraceClusterActions.length > 0
                              ? React.createElement("div", { className: "playground-thread-observability-expanded-section" },
                                  React.createElement("div", { className: "playground-thread-observability-expanded-section-header" },
                                    React.createElement("span", null, "Concrete steps"),
                                    React.createElement("span", { className: "playground-thread-observability-expanded-section-count" },
                                      selectedTraceClusterActions.length + " " + (selectedTraceClusterActions.length === 1 ? "action" : "actions")
                                    )
                                  ),
                                  React.createElement("div", { className: "playground-thread-observability-action-list" },
                                    selectedTraceClusterActions.map((action, actionIndex) => {
                                      return React.createElement("div", {
                                          key: action.id || actionIndex,
                                          className: "playground-thread-observability-action-item is-ring-" + (action.ring || 1),
                                        },
                                        React.createElement("span", { className: "playground-thread-observability-action-icon", "aria-hidden": "true" },
                                          renderTracePermissionRingIcon(action.ring || 1)
                                        ),
                                        React.createElement("div", { className: "playground-thread-observability-action-copy" },
                                          React.createElement("div", { className: "playground-thread-observability-action-title", title: action.title },
                                            action.title || "Trace action"
                                          ),
                                          action.copy
                                            ? React.createElement("div", { className: "playground-thread-observability-action-summary", title: action.copy }, action.copy)
                                            : null,
                                          action.touchedResources.length > 0
                                            ? React.createElement("div", { className: "playground-thread-observability-action-resources" },
                                                action.touchedResources.slice(0, 4).map((resource) =>
                                                  React.createElement("span", { key: resource, title: resource }, resource)
                                                )
                                              )
                                            : null
                                        ),
                                        React.createElement("div", { className: "playground-thread-observability-action-meta" },
                                          React.createElement("span", {
                                            className: "playground-thread-observability-action-ring is-ring-" + (action.ring || 1),
                                            title: action.ringDescription || "",
                                          }, action.ringLabel || getTraceRingLabel(action.ring)),
                                          action.stepSequence != null
                                            ? React.createElement("span", null, "#" + action.stepSequence)
                                            : action.createdAt
                                              ? React.createElement("span", null, formatTraceTimestampLabel(action.createdAt))
                                              : null
                                        )
                                      );
                                    })
                                  )
                                )
                              : null,
                            React.createElement("div", { className: "playground-thread-observability-expanded-section" },
                              React.createElement("div", { className: "playground-thread-observability-expanded-section-header" },
                                React.createElement("span", null, "Properties"),
                                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                              ),
                              React.createElement("div", { className: "playground-thread-observability-expanded-properties" },
                                selectedProperties.map((item) =>
                                  React.createElement("div", { key: item.label, className: "playground-thread-observability-expanded-property" },
                                    React.createElement("div", { className: "playground-thread-observability-expanded-property-label" }, item.label),
                                    React.createElement("div", {
                                      className: "playground-thread-observability-expanded-property-value",
                                      title: item.value,
                                    }, item.value)
                                  )
                                )
                              )
                            ),
                            React.createElement("div", { className: "playground-thread-observability-expanded-section" },
                              React.createElement("div", { className: "playground-thread-observability-expanded-section-header" },
                                React.createElement("span", null, selectedTraceItem?.kind === "thread" ? "Thread context" : isTraceDecisionEntry(selectedTraceItem) ? "Decision summary" : "Event content"),
                                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                              ),
                              React.createElement("div", { className: "playground-thread-observability-expanded-message" },
                                selectedContent || selectedTraceItem?.copy || "No content recorded for this event."
                              )
                            ),
                            React.createElement("div", { className: "playground-thread-observability-expanded-section is-raw-event" },
                              React.createElement("div", { className: "playground-thread-observability-expanded-section-header" },
                                React.createElement("span", null, "Raw event"),
                                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                              ),
                              React.createElement(ThreadTraceRawEventEditor, {
                                eventId: selectedTraceItem?.id || "trace-event",
                                value: selectedRaw,
                              })
                            ),
                            onOpenChat || onOpenTrace
                              ? React.createElement("div", { className: "playground-agents-observability-actions" },
                                  onOpenChat
                                    ? React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-action-button",
                                        onClick: onOpenChat,
                                      }, "Open Chat")
                                    : null,
                                  onOpenTrace
                                    ? React.createElement(PlatformPrimaryButton, {
                                      size: "medium",
                                        type: "button",
                                        className: "playground-environments-action-button is-primary",
                                        onClick: onOpenTrace,
                                      }, "Open Trace")
                                    : null
                                )
                              : null
                          )
                        : null
                    );
                  })
                : React.createElement("div", { className: "playground-agents-observability-empty" }, "No matching trace events.")
            )
          );
        }
  
        function ThreadObservabilityView({ threadId, threadTitle, backendUrl, requestHeaders, hasRealAccess, onOpenChat, onForkCreated }) {
          const traceToolbarRef = useRef(null);
          const [traceDetails, setTraceDetails] = useState(null);
          const [traceSearchQuery, setTraceSearchQuery] = useState("");
          const [traceEventSort, setTraceEventSort] = useState("timeline");
          const [traceEventFilter, setTraceEventFilter] = useState("decisions");
          const [traceToolbarPopover, setTraceToolbarPopover] = useState("");
  
          useEffect(() => {
            if (!traceToolbarPopover) return undefined;
  
            function handleTraceToolbarPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !traceToolbarRef.current || traceToolbarRef.current.contains(target)) {
                return;
              }
              setTraceToolbarPopover("");
            }
  
            document.addEventListener("mousedown", handleTraceToolbarPointerDown);
            return () => document.removeEventListener("mousedown", handleTraceToolbarPointerDown);
          }, [traceToolbarPopover]);
  
          useEffect(() => {
            let cancelled = false;
            let refreshTimer = null;
            const normalizedThreadId = String(threadId || "").trim();
            setTraceDetails(null);
  
            if (!normalizedThreadId) {
              setTraceDetails({
                status: "error",
                error: "Select a thread to inspect its trace.",
              });
              return () => {
                cancelled = true;
              };
            }
  
            if (!hasRealAccess) {
              setTraceDetails({
                status: "error",
                error: "Sign in with your Computer Agents account to inspect thread traces.",
              });
              return () => {
                cancelled = true;
              };
            }
  
            const scheduleRefreshIfRunning = (details) => {
              if (cancelled) return;
              const status = String(details?.thread?.status || "").trim().toLowerCase();
              if (status !== "running" && status !== "queued" && status !== "requires_action" && status !== "waiting") {
                return;
              }
              refreshTimer = window.setTimeout(() => {
                void loadTraceDetails(false);
              }, 8000);
            };
  
            const loadTraceDetails = async (showLoading) => {
              if (refreshTimer) {
                window.clearTimeout(refreshTimer);
                refreshTimer = null;
              }
              if (showLoading) {
                setTraceDetails({ status: "loading", error: "" });
              }
              try {
                const details = await fetchThreadTraceDetails({
                  backendUrl,
                  threadId: normalizedThreadId,
                  headers: requestHeaders,
                  messageLimit: 160,
                  stepLimit: 160,
                });
                if (!cancelled) {
                  setTraceDetails(details);
                  scheduleRefreshIfRunning(details);
                }
              } catch (error) {
                if (!cancelled) {
                  setTraceDetails((current) => (
                    current && current.status === "loaded"
                      ? { ...current, error: error instanceof Error ? error.message : "Failed to refresh trace data." }
                      : {
                          status: "error",
                          error: error instanceof Error ? error.message : "Failed to load trace data.",
                        }
                  ));
                }
              }
            };
  
            void loadTraceDetails(true);
  
            return () => {
              cancelled = true;
              if (refreshTimer) {
                window.clearTimeout(refreshTimer);
                refreshTimer = null;
              }
            };
          }, [backendUrl, hasRealAccess, requestHeaders, threadId]);
  
          const normalizedThreadId = String(threadId || "").trim();
          const sortOptions = [
            { id: "timeline", label: "Timeline" },
            { id: "newest", label: "Newest first" },
            { id: "duration", label: "Slowest first" },
            { id: "tokens", label: "Most tokens" },
          ];
          const filterOptions = [
            { id: "decisions", label: "Clusters" },
            { id: "needs-review", label: "Needs review" },
            { id: "ring-2-plus", label: "Ring 2+" },
            { id: "ring-3", label: "Ring 3" },
            { id: "all", label: "All events" },
            { id: "messages", label: "Messages" },
            { id: "tools", label: "Tools" },
            { id: "reasoning", label: "Reasoning" },
            { id: "subagents", label: "Subagents" },
            { id: "permissions", label: "Permissions" },
          ];
          const activeTraceFilterLabel = filterOptions.find((option) => option.id === traceEventFilter)?.label || "All events";
          return React.createElement("div", { className: "playground-thread-observability-view" },
            React.createElement("div", { className: "playground-thread-observability-card" },
              React.createElement("div", { className: "playground-plugins-search-row playground-agents-overview-search-row playground-thread-observability-toolbar", ref: traceToolbarRef },
                React.createElement("div", { className: "playground-plugins-search-shell" },
                  React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    type: "search",
                    value: traceSearchQuery,
                    onChange: (event) => setTraceSearchQuery(event.target.value),
                    className: "playground-plugins-search",
                    placeholder: "Search trace events",
                  })
                ),
                React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-sort" + (traceToolbarPopover === "sort" || traceEventSort !== "timeline" ? " is-active" : ""),
                      onClick: () => setTraceToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    },
                      React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Sort")
                    ),
                    traceToolbarPopover === "sort"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          sortOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (traceEventSort === option.id ? " selected" : ""),
                                onClick: () => {
                                  setTraceEventSort(option.id);
                                  setTraceToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                traceEventSort === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-filter" + (traceToolbarPopover === "filter" || traceEventFilter !== "all" ? " is-active" : ""),
                      onClick: () => setTraceToolbarPopover((current) => current === "filter" ? "" : "filter"),
  	                  },
  	                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
  	                    React.createElement("span", null, "Filter: " + activeTraceFilterLabel)
  	                  ),
                    traceToolbarPopover === "filter"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          filterOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (traceEventFilter === option.id ? " selected" : ""),
                                onClick: () => {
                                  setTraceEventFilter(option.id);
                                  setTraceToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                traceEventFilter === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            )
                          )
                        )
                      : null
                  )
                )
              ),
              renderThreadTraceDetailView({
                thread: traceDetails?.thread || { id: normalizedThreadId, title: threadTitle },
                details: traceDetails,
                fallbackThreadId: normalizedThreadId,
                fallbackTitle: threadTitle,
                backendUrl,
                requestHeaders,
                onOpenChat: null,
                onOpenTrace: null,
                onForkCreated,
                traceSearchQuery,
                traceEventFilter,
                traceEventSort,
              })
            )
          );
        }
  
        function resolveHistoryStepPrompt(step, messages) {
          if (!step || typeof step !== "object") {
            return "";
          }
  
          if (Array.isArray(messages) && messages.length > 0) {
            const sourceIndex = typeof step.sourceMessageId === "string" && step.sourceMessageId
              ? messages.findIndex((message) => message && message.id === step.sourceMessageId)
              : -1;
            if (sourceIndex >= 0) {
              for (let index = sourceIndex; index >= 0; index -= 1) {
                const candidate = messages[index];
                if (candidate?.role === "user") {
                  const preview = normalizeHistoryPreviewText(candidate.content, 160);
                  if (preview) return preview;
                }
              }
            }
  
            const stepTimestamp = step.createdAt ? new Date(step.createdAt).getTime() : Number.NaN;
            if (Number.isFinite(stepTimestamp)) {
              let fallbackCandidate = null;
              for (const message of messages) {
                if (!message || message.role !== "user") continue;
                const createdAt = message.createdAt ? new Date(message.createdAt).getTime() : Number.NaN;
                if (!Number.isFinite(createdAt) || createdAt > stepTimestamp) continue;
                fallbackCandidate = message;
              }
              if (fallbackCandidate?.content) {
                const preview = normalizeHistoryPreviewText(fallbackCandidate.content, 160);
                if (preview) return preview;
              }
            }
          }
  
          return normalizeHistoryPreviewText(step.title || "Changes", 160);
        }
  
        function ThreadChangesView({ threadId, threadTitle, backendUrl, apiKey, upstreamUrl, hasRealAccess, onThreadMutated, navigationTarget, onNavigationTargetHandled }) {
          const client = useMemo(() => new RunnerClient(), []);
          const historyHeaders = useMemo(() => ({
            ...(apiKey.trim() ? { "X-API-Key": apiKey.trim() } : {}),
            "X-Runner-Upstream-Url": upstreamUrl,
          }), [apiKey, upstreamUrl]);
  
          const [steps, setSteps] = useState([]);
          const [stepsLoading, setStepsLoading] = useState(false);
          const [stepsLoadedOnce, setStepsLoadedOnce] = useState(false);
          const [stepsError, setStepsError] = useState("");
          const [threadMessages, setThreadMessages] = useState([]);
          const [threadLogs, setThreadLogs] = useState([]);
          const [changesScreenMode, setChangesScreenMode] = useState("timeline");
          const [selectedStepId, setSelectedStepId] = useState("");
          const [stepFiles, setStepFiles] = useState([]);
          const [stepDiffSummary, setStepDiffSummary] = useState(null);
          const [stepDataLoading, setStepDataLoading] = useState(false);
          const [stepDataError, setStepDataError] = useState("");
          const [selectedFilePath, setSelectedFilePath] = useState("");
          const [selectedFileContent, setSelectedFileContent] = useState("");
          const [selectedFileDiff, setSelectedFileDiff] = useState(null);
          const [filePreviewLoading, setFilePreviewLoading] = useState(false);
          const [filePreviewError, setFilePreviewError] = useState("");
          const [historyMutationLoading, setHistoryMutationLoading] = useState(null);
          const [historyMutationError, setHistoryMutationError] = useState("");
          const [reloadNonce, setReloadNonce] = useState(0);
  
          const historyLogsById = useMemo(() => {
            const nextMap = new Map();
            for (const log of Array.isArray(threadLogs) ? threadLogs : []) {
              if (log && typeof log.id === "string" && log.id) {
                nextMap.set(log.id, log);
              }
            }
            return nextMap;
          }, [threadLogs]);
  
          const supplementalStepEntriesById = useMemo(() => {
            return buildSupplementalHistoryStepEntriesById(steps, threadLogs, historyLogsById);
          }, [historyLogsById, steps, threadLogs]);
  
          const displaySteps = useMemo(() => {
            return steps.filter((step) => {
              return shouldDisplayHistoryStep(step, historyLogsById) || (supplementalStepEntriesById.get(step.id) || []).length > 0;
            });
          }, [historyLogsById, supplementalStepEntriesById, steps]);
  
          const sortedSteps = useMemo(() => {
            return [...displaySteps].sort((left, right) => right.sequence - left.sequence);
          }, [displaySteps]);
  
          const allStepsBySequence = useMemo(() => {
            return [...steps].sort((left, right) => right.sequence - left.sequence);
          }, [steps]);
  
          const revertedChangeStepIds = useMemo(() => {
            const nextSet = new Set();
            const orderedSteps = [...steps].sort((left, right) => left.sequence - right.sequence);
            for (const step of orderedSteps) {
              const revertedChangeStepId = readRevertedChangeStepId(step);
              if (!revertedChangeStepId) {
                continue;
              }
              if (readHistoryOperation(step) === "reapply") {
                nextSet.delete(revertedChangeStepId);
              } else {
                nextSet.add(revertedChangeStepId);
              }
            }
            return nextSet;
          }, [steps]);
  
          const selectedStep = useMemo(() => {
            return sortedSteps.find((step) => step.id === selectedStepId) || null;
          }, [selectedStepId, sortedSteps]);
  
          const selectedStepPrompt = selectedStep ? resolveHistoryStepPrompt(selectedStep, threadMessages) : "";
          const selectedStepReverted = Boolean(selectedStep?.id && revertedChangeStepIds.has(selectedStep.id));
          const revertTargetStep = useMemo(() => {
            if (!selectedStep) {
              return null;
            }
  
            if (selectedStep.snapshotBeforeId) {
              const matchedBySnapshot = allStepsBySequence.find((step) => {
                return (
                  step.id !== selectedStep.id
                  && (
                    (step.snapshotAfterId && step.snapshotAfterId === selectedStep.snapshotBeforeId)
                    || (step.snapshotBeforeId && step.snapshotBeforeId === selectedStep.snapshotBeforeId)
                  )
                );
              });
              if (matchedBySnapshot) {
                return matchedBySnapshot;
              }
            }
  
            const previousSteps = allStepsBySequence
              .filter((step) => {
                return (
                  step.id !== selectedStep.id
                  && Number.isFinite(step.sequence)
                  && step.sequence < selectedStep.sequence
                  && (step.snapshotAfterId || step.snapshotBeforeId)
                );
              })
              .sort((left, right) => right.sequence - left.sequence);
  
            return previousSteps[0] || null;
          }, [allStepsBySequence, selectedStep]);
  
          const previewStepFilesById = useMemo(() => {
            const nextMap = new Map();
            for (const step of sortedSteps) {
              nextMap.set(step.id, buildStepFileEntries(step, null, [], supplementalStepEntriesById.get(step.id) || [], historyLogsById));
            }
            if (selectedStep?.id) {
              nextMap.set(
                selectedStep.id,
                stepFiles.length > 0
                  ? stepFiles
                  : buildStepFileEntries(selectedStep, stepDiffSummary, [], supplementalStepEntriesById.get(selectedStep.id) || [], historyLogsById)
              );
            }
            return nextMap;
          }, [historyLogsById, selectedStep, sortedSteps, stepDiffSummary, stepFiles, supplementalStepEntriesById]);
  
          const selectedStepFiles = selectedStep ? (previewStepFilesById.get(selectedStep.id) || []) : [];
  
          const changedPaths = useMemo(() => {
            return uniqueHistoryPaths([
              ...(selectedStep ? extractStepChangedPaths(selectedStep, historyLogsById) : []),
              ...(Array.isArray(stepDiffSummary?.changedPaths) ? stepDiffSummary.changedPaths : []),
            ]);
          }, [historyLogsById, selectedStep, stepDiffSummary]);
  
          const selectedFileEntry = useMemo(() => {
            return selectedStepFiles.find((entry) => historyPathsMatch(entry.path, selectedFilePath)) || null;
          }, [selectedFilePath, selectedStepFiles]);
          const selectedFileIsImage = Boolean(selectedFileEntry && selectedFileEntry.type === "file" && isHistoryImagePath(selectedFileEntry.path));
          const selectedFileImageUrl = selectedFileEntry && selectedStep && selectedFileIsImage
            ? buildThreadStepFileDownloadUrl(threadId, selectedStep.id, selectedFileEntry.path)
            : "";
  
          const groupedTimelineSteps = useMemo(() => {
            const groups = [];
            let currentGroup = null;
  
            for (const step of sortedSteps) {
              const groupKey = getHistoryDateGroupKey(step.createdAt);
              if (!currentGroup || currentGroup.key !== groupKey) {
                currentGroup = {
                  key: groupKey,
                  label: formatHistoryDateHeading(step.createdAt),
                  steps: [],
                };
                groups.push(currentGroup);
              }
  
                currentGroup.steps.push({
                step,
                prompt: resolveHistoryStepPrompt(step, threadMessages),
                files: previewStepFilesById.get(step.id) || [],
              });
            }
  
            return groups;
          }, [previewStepFilesById, sortedSteps, threadMessages]);
  
          useEffect(() => {
            let cancelled = false;
  
            setSteps([]);
            setStepsError("");
            setStepsLoadedOnce(false);
            setThreadMessages([]);
            setThreadLogs([]);
            setChangesScreenMode("timeline");
            setSelectedStepId("");
            setStepFiles([]);
            setStepDiffSummary(null);
            setStepDataError("");
            setSelectedFilePath("");
            setSelectedFileContent("");
            setSelectedFileDiff(null);
            setFilePreviewError("");
            setHistoryMutationError("");
  
            if (!threadId) {
              setStepsLoading(false);
              setStepsLoadedOnce(true);
              return () => {
                cancelled = true;
              };
            }
  
            if (!hasRealAccess) {
              setStepsLoading(false);
              setStepsError("Sign in with your Computer Agents account to inspect thread changes.");
              setStepsLoadedOnce(true);
              return () => {
                cancelled = true;
              };
            }
  
            setStepsLoading(true);
  
            Promise.allSettled([
              client.listThreadSteps({
                backendUrl,
                threadId,
                limit: 500,
                headers: historyHeaders,
              }),
              fetchHistoryThreadMessages({
                backendUrl,
                threadId,
                headers: historyHeaders,
              }),
              fetchHistoryThreadLogs({
                client,
                backendUrl,
                threadId,
                headers: historyHeaders,
              }),
            ]).then((results) => {
              if (cancelled) return;
              const [stepsResult, messagesResult, logsResult] = results;
  
              if (stepsResult.status === "fulfilled") {
                setSteps(Array.isArray(stepsResult.value) ? stepsResult.value : []);
                setStepsError("");
              } else {
                setSteps([]);
                setStepsError(stepsResult.reason instanceof Error ? stepsResult.reason.message : "Failed to load thread changes.");
              }
  
              if (messagesResult.status === "fulfilled") {
                setThreadMessages(Array.isArray(messagesResult.value) ? messagesResult.value : []);
              } else {
                setThreadMessages([]);
              }
  
              if (logsResult.status === "fulfilled") {
                setThreadLogs(Array.isArray(logsResult.value) ? logsResult.value : []);
              } else {
                setThreadLogs([]);
              }
            }).finally(() => {
              if (!cancelled) {
                setStepsLoading(false);
                setStepsLoadedOnce(true);
              }
            });
  
            return () => {
              cancelled = true;
            };
          }, [backendUrl, client, hasRealAccess, historyHeaders, reloadNonce, threadId]);
  
          useEffect(() => {
            if (!navigationTarget || !threadId || navigationTarget.threadId !== threadId) {
              return;
            }
  
            const targetStep = sortedSteps.find((step) => step.id === navigationTarget.stepId);
            if (!targetStep) {
              if (stepsLoadedOnce) {
                onNavigationTargetHandled?.(navigationTarget.token);
              }
              return;
            }
  
            const fallbackPath = getPreferredHistoryEntryPath(previewStepFilesById.get(targetStep.id) || [], extractStepChangedPaths(targetStep, historyLogsById));
            setSelectedStepId(targetStep.id);
            setSelectedFilePath(navigationTarget.filePath || fallbackPath);
            setChangesScreenMode(navigationTarget.openDetail ? "detail" : "timeline");
            onNavigationTargetHandled?.(navigationTarget.token);
          }, [historyLogsById, navigationTarget, onNavigationTargetHandled, previewStepFilesById, sortedSteps, stepsLoadedOnce, threadId]);
  
          useEffect(() => {
            if (sortedSteps.length === 0) {
              setSelectedStepId("");
              return;
            }
  
            if (selectedStepId && sortedSteps.some((step) => step.id === selectedStepId)) {
              return;
            }
  
            const preferredStep = getPreferredHistoryStep(sortedSteps, historyLogsById);
            setSelectedStepId(preferredStep?.id || "");
          }, [historyLogsById, selectedStepId, sortedSteps]);
  
          useEffect(() => {
            let cancelled = false;
  
            setStepFiles([]);
            setStepDiffSummary(null);
            setStepDataError("");
  
            if (!threadId || !selectedStep || selectedStep.threadId !== threadId) {
              setStepDataLoading(false);
              return () => {
                cancelled = true;
              };
            }
  
            setStepDataLoading(true);
  
            client.getThreadStepDiff({
              backendUrl,
              threadId,
              stepId: selectedStep.id,
              headers: historyHeaders,
            }).then((nextDiffSummary) => {
              if (cancelled) return;
              setStepDiffSummary(nextDiffSummary);
              setStepFiles(buildStepFileEntries(selectedStep, nextDiffSummary, [], supplementalStepEntriesById.get(selectedStep.id) || [], historyLogsById));
              setStepDataError("");
            }).catch((error) => {
              if (cancelled) return;
              const fallbackFiles = buildStepFileEntries(selectedStep, null, [], supplementalStepEntriesById.get(selectedStep.id) || [], historyLogsById);
              setStepFiles(fallbackFiles);
              setStepDiffSummary(null);
              if (fallbackFiles.length === 0) {
                setStepDataError(error instanceof Error ? error.message : "Failed to load step state.");
              } else {
                setStepDataError("");
              }
            }).finally(() => {
              if (!cancelled) {
                setStepDataLoading(false);
              }
            });
  
            return () => {
              cancelled = true;
            };
          }, [backendUrl, client, historyHeaders, historyLogsById, selectedStep, supplementalStepEntriesById, threadId]);
  
          useEffect(() => {
            const currentEntryStillExists = selectedStepFiles.some((entry) => historyPathsMatch(entry.path, selectedFilePath));
            if (currentEntryStillExists) {
              return;
            }
            setSelectedFilePath(getPreferredHistoryEntryPath(selectedStepFiles, changedPaths));
          }, [changedPaths, selectedFilePath, selectedStepFiles]);
  
          useEffect(() => {
            let cancelled = false;
  
            setSelectedFileContent("");
            setSelectedFileDiff(null);
            setFilePreviewError("");
  
            if (!threadId || !selectedStep || selectedStep.threadId !== threadId || !selectedFileEntry || selectedFileEntry.type !== "file") {
              setFilePreviewLoading(false);
              return () => {
                cancelled = true;
              };
            }
  
            if (isHistoryImagePath(selectedFileEntry.path)) {
              setFilePreviewLoading(false);
              return () => {
                cancelled = true;
              };
            }
  
            setFilePreviewLoading(true);
            client.getThreadStepDiff({
              backendUrl,
              threadId,
              stepId: selectedStep.id,
              path: selectedFileEntry.path,
              headers: historyHeaders,
            }).then(async (diffResult) => {
              if (cancelled) return;
              setSelectedFileDiff(diffResult);
  
              const hasRenderableDiff = typeof diffResult?.diff === "string" && diffResult.diff.trim().length > 0;
              const hasStepMetadataDiff = typeof selectedFileEntry.diffText === "string" && selectedFileEntry.diffText.trim().length > 0;
              const hasSingleStepFallbackDiff =
                typeof stepDiffSummary?.diff === "string" &&
                selectedStepFiles.length === 1 &&
                stepDiffSummary.diff.trim().length > 0;
              if (hasRenderableDiff || hasStepMetadataDiff || hasSingleStepFallbackDiff || selectedFileEntry.changeKind === "deleted") {
                return;
              }
  
              try {
                const fileResult = await client.getThreadStepFile({
                  backendUrl,
                  threadId,
                  stepId: selectedStep.id,
                  path: selectedFileEntry.path,
                  headers: historyHeaders,
                });
                if (!cancelled) {
                  setSelectedFileContent(typeof fileResult?.content === "string" ? fileResult.content : "");
                }
              } catch {
                if (!cancelled) {
                  setFilePreviewError("Failed to load file preview for this step.");
                }
              }
            }).catch(async () => {
              if (cancelled) return;
              try {
                const fileResult = await client.getThreadStepFile({
                  backendUrl,
                  threadId,
                  stepId: selectedStep.id,
                  path: selectedFileEntry.path,
                  headers: historyHeaders,
                });
                if (!cancelled) {
                  setSelectedFileContent(typeof fileResult?.content === "string" ? fileResult.content : "");
                }
              } catch {
                if (!cancelled) {
                  setFilePreviewError("Failed to load file preview for this step.");
                }
              }
            }).finally(() => {
              if (!cancelled) {
                setFilePreviewLoading(false);
              }
            });
  
            return () => {
              cancelled = true;
            };
          }, [backendUrl, client, historyHeaders, selectedFileEntry, selectedStep, threadId]);
  
          const changedPathSet = useMemo(() => new Set(uniqueHistoryPaths(changedPaths)), [changedPaths]);
          const selectedFileChanged = selectedFileEntry ? changedPathSet.has(normalizeHistoryPath(selectedFileEntry.path)) : false;
          const detailTitle = selectedFileEntry?.name || selectedStep?.title || "Changes";
          const selectedResourceMetaRows = selectedFileEntry ? buildHistoryResourceMetaRows(selectedFileEntry) : [];
          const resolvedDiffText = selectedFileIsImage
            ? ""
            : selectedFileEntry?.type !== "file"
              ? ""
              : typeof selectedFileDiff?.diff === "string" && selectedFileDiff.diff.trim()
              ? selectedFileDiff.diff
              : typeof selectedFileEntry?.diffText === "string" && selectedFileEntry.diffText.trim()
                ? selectedFileEntry.diffText
                : typeof stepDiffSummary?.diff === "string" && selectedStepFiles.length === 1 && stepDiffSummary.diff.trim()
                  ? stepDiffSummary.diff
                  : buildSyntheticHistoryDiff({
                      filePath: selectedFileEntry?.path,
                      fileContent: selectedFileContent,
                      changeKind: selectedFileEntry?.changeKind,
                    });
          const derivedDiffStats = resolvedDiffText ? summarizeUnifiedDiffStats(resolvedDiffText) : { additions: 0, deletions: 0 };
          const additions = Number.isFinite(selectedFileDiff?.additions)
            ? selectedFileDiff.additions > 0 || !resolvedDiffText
              ? selectedFileDiff.additions
              : derivedDiffStats.additions
            : Number.isFinite(selectedFileEntry?.additions)
              ? selectedFileEntry.additions > 0 || !resolvedDiffText
                ? selectedFileEntry.additions
                : derivedDiffStats.additions
              : Number.isFinite(stepDiffSummary?.additions) && selectedStepFiles.length === 1
                ? stepDiffSummary.additions > 0 || !resolvedDiffText
                  ? stepDiffSummary.additions
                  : derivedDiffStats.additions
                : derivedDiffStats.additions;
          const deletions = Number.isFinite(selectedFileDiff?.deletions)
            ? selectedFileDiff.deletions > 0 || !resolvedDiffText
              ? selectedFileDiff.deletions
              : derivedDiffStats.deletions
            : Number.isFinite(selectedFileEntry?.deletions)
              ? selectedFileEntry.deletions > 0 || !resolvedDiffText
                ? selectedFileEntry.deletions
                : derivedDiffStats.deletions
              : Number.isFinite(stepDiffSummary?.deletions) && selectedStepFiles.length === 1
                ? stepDiffSummary.deletions > 0 || !resolvedDiffText
                  ? stepDiffSummary.deletions
                  : derivedDiffStats.deletions
                : derivedDiffStats.deletions;
          const diffEmptyMessage = selectedFileIsImage
            ? ""
            : selectedFileChanged
              ? "No stored diff is available for this file at the selected step."
              : "This file did not change in the selected step.";
          const filePreview = typeof selectedFileContent === "string" && selectedFileContent.length > 0
            ? selectedFileContent
            : selectedFileEntry && selectedFileEntry.type === "file" && selectedFileEntry.changeKind === "deleted"
              ? "This file was deleted at the selected step."
              : selectedFileEntry && selectedFileEntry.type === "file"
                ? "No file content is available for the selected step."
                : "Select a file to inspect its full content at this step.";
  
          function handleStepSelection(step, files) {
            setSelectedStepId(step.id);
            setSelectedFilePath(getPreferredHistoryEntryPath(files, extractStepChangedPaths(step, historyLogsById)));
          }
  
          function handleFileSelection(step, path) {
            setSelectedStepId(step.id);
            setSelectedFilePath(path);
            setChangesScreenMode("detail");
          }
  
          async function handleApplyHistoryAction(historyActionType) {
            const targetStep = historyActionType === "reapply" ? selectedStep : revertTargetStep;
  
            if (!threadId || !selectedStep || !targetStep || historyMutationLoading) {
              return;
            }
  
            setHistoryMutationLoading(historyActionType);
            setHistoryMutationError("");
  
            try {
              await client.revertThreadToStep({
                backendUrl,
                threadId,
                stepId: targetStep.id,
                headers: historyHeaders,
                historyActionType,
                revertedChangeStepId: selectedStep.id,
                revertedFilePath: selectedFileEntry?.path || undefined,
                revertedFileName: selectedFileEntry?.name || detailTitle,
              });
              setChangesScreenMode("timeline");
              setSelectedStepId("");
              setSelectedFilePath("");
              setSelectedFileContent("");
              setSelectedFileDiff(null);
              setReloadNonce((current) => current + 1);
              if (typeof onThreadMutated === "function") {
                await Promise.resolve(onThreadMutated());
              }
            } catch (error) {
              setHistoryMutationError(
                error instanceof Error
                  ? error.message
                  : historyActionType === "reapply"
                    ? "Failed to re-apply this change."
                    : "Failed to revert this change."
              );
            } finally {
              setHistoryMutationLoading(null);
            }
          }
  
          if (!threadId) {
            return React.createElement("div", { className: "changes-view is-timeline" },
              React.createElement("section", { className: "changes-panel", style: { gridColumn: "1 / -1" } },
                React.createElement("div", { className: "changes-empty-state" }, "Select a thread to inspect its changes.")
              )
            );
          }
  
          if (changesScreenMode === "detail") {
            return React.createElement("div", { className: "changes-view is-detail" },
              React.createElement("section", { className: "changes-panel changes-diff-screen-panel" },
                React.createElement("div", { className: "changes-diff-screen-header" },
                  React.createElement("button", {
                    type: "button",
                    className: "changes-diff-back-button",
                    onClick: () => setChangesScreenMode("timeline"),
                  },
                    React.createElement(ArrowLeft, null),
                    React.createElement("span", null, "Back")
                  ),
                  React.createElement("div", { className: "changes-diff-screen-header-main" },
                      React.createElement("div", { className: "changes-diff-screen-title-row" },
                        React.createElement("div", { className: "changes-detail-path-group" },
                          React.createElement("div", { className: "changes-detail-path" }, detailTitle)
                        ),
                        React.createElement("div", { className: "changes-diff-title-actions" },
                        React.createElement("div", { className: "changes-diff-title-meta" },
                          selectedStep
                            ? React.createElement("span", { className: "changes-diff-title-date" }, formatHistoryTimestamp(selectedStep.createdAt))
                            : null
                        ),
                        selectedStepReverted
                          ? React.createElement(React.Fragment, null,
                              React.createElement("span", { className: "changes-diff-reverted-label" }, "Reverted"),
                              React.createElement("button", {
                                type: "button",
                                className: "changes-diff-revert-button",
                                onClick: () => handleApplyHistoryAction("reapply"),
                                disabled: Boolean(historyMutationLoading),
                                title: "Re-apply this file change by restoring the thread to the selected step.",
                              },
                                React.createElement(RotateCw, { strokeWidth: 1.75 }),
                                React.createElement("span", null, historyMutationLoading === "reapply" ? "Re-Applying..." : "Re-Apply Changes")
                              )
                            )
                          : React.createElement("button", {
                              type: "button",
                              className: "changes-diff-revert-button",
                              onClick: () => handleApplyHistoryAction("revert"),
                              disabled: !revertTargetStep || Boolean(historyMutationLoading),
                              title: revertTargetStep
                                ? "Revert this change by restoring the thread to the state before this step."
                                : "No earlier historical state is available for this step.",
                            },
                              React.createElement(RotateCcw, { strokeWidth: 1.75 }),
                              React.createElement("span", null, historyMutationLoading === "revert" ? "Reverting..." : "Revert")
                            )
                      )
                    ),
                    selectedStepPrompt
                      ? React.createElement("div", { className: "changes-detail-context" }, selectedStepPrompt)
                      : null,
                    historyMutationError
                      ? React.createElement("div", { className: "changes-diff-revert-error" }, historyMutationError)
                      : null
                  )
                ),
                React.createElement("div", { className: "changes-panel-body changes-diff-screen-body" },
                  filePreviewLoading
                    ? React.createElement("div", { className: "changes-loading-state" }, "Loading diff…")
                    : filePreviewError
                      ? React.createElement("div", { className: "changes-empty-state" }, filePreviewError)
                      : selectedFileEntry && selectedFileEntry.type === "resource"
                        ? React.createElement("div", { className: "changes-resource-detail-card" },
                            React.createElement("div", { className: "changes-resource-detail-header" },
                              React.createElement("div", { className: "changes-resource-detail-icon", "aria-hidden": "true" }, renderHistoryResourceIcon(selectedFileEntry.resourceType)),
                              React.createElement("div", { className: "changes-resource-detail-copy" },
                                React.createElement("div", { className: "changes-resource-detail-label" }, selectedFileEntry.resourceTypeLabel || "Resource"),
                                React.createElement("div", { className: "changes-resource-detail-name" }, selectedFileEntry.name || "Created resource"),
                                selectedFileEntry.resourceId
                                  ? React.createElement("div", { className: "changes-resource-detail-id" }, selectedFileEntry.resourceId)
                                  : null
                              )
                            ),
                            selectedFileEntry.description
                              ? React.createElement("div", { className: "changes-resource-detail-description" }, selectedFileEntry.description)
                              : React.createElement("div", { className: "changes-empty-state" }, "This step created a " + String((selectedFileEntry.resourceTypeLabel || "resource")).toLowerCase() + "."),
                            selectedResourceMetaRows.length > 0
                              ? React.createElement("div", { className: "changes-resource-detail-meta" },
                                  selectedResourceMetaRows.map((row) =>
                                    React.createElement("div", { key: row.label, className: "changes-resource-detail-meta-row" },
                                      React.createElement("span", { className: "changes-resource-detail-meta-label" }, row.label),
                                      React.createElement("span", { className: "changes-resource-detail-meta-value" }, row.value)
                                    )
                                  )
                                )
                              : null
                          )
                      : selectedFileEntry && selectedFileEntry.type === "file" && selectedFileIsImage && selectedFileImageUrl
                        ? React.createElement("div", { className: "changes-detail-image-preview" },
                            React.createElement(RunnerImagePreviewSurface, {
                              src: selectedFileImageUrl,
                              alt: detailTitle,
                              fetchHeaders: historyHeaders,
                            })
                          )
                      : selectedFileEntry && selectedFileEntry.type === "file" && resolvedDiffText
                        ? React.createElement(RunnerFileDiffSurface, {
                            diffContent: resolvedDiffText,
                            fileContent: selectedFileContent,
                            filePath: selectedFileEntry.path,
                            emptyMessage: diffEmptyMessage,
                            additions,
                            deletions,
                          })
                        : React.createElement("pre", {
                            className: "changes-code-block" + (selectedFileEntry && selectedFileEntry.type === "file" ? "" : " is-empty")
                          }, selectedFileEntry && selectedFileEntry.type === "file" ? filePreview : (stepDataLoading ? "Loading selected step…" : stepDataError || "Select a changed file to inspect its diff."))
                )
              )
            );
  
          }
  
          return React.createElement("div", { className: "changes-view is-timeline" },
            React.createElement("section", { className: "changes-panel changes-timeline-panel" },
              React.createElement("div", { className: "changes-panel-header" },
                React.createElement("div", { className: "changes-panel-title" }, "Changes"),
                React.createElement("div", { className: "changes-panel-subtitle" }, sortedSteps.length > 0 ? sortedSteps.length + " " + (sortedSteps.length === 1 ? "step" : "steps") : "")
              ),
              React.createElement("div", { className: "changes-panel-body changes-timeline-body" },
                stepsLoading
                  ? React.createElement("div", { className: "changes-loading-state" }, "Loading thread steps…")
                  : stepsError
                    ? React.createElement("div", { className: "changes-empty-state" }, stepsError)
                    : sortedSteps.length === 0
                      ? React.createElement("div", { className: "changes-empty-state" }, "No step history has been recorded for this thread yet.")
                      : React.createElement("div", { className: "changes-timeline" },
                          groupedTimelineSteps.map((group) =>
                            React.createElement("section", { key: group.key, className: "changes-timeline-group" },
                              React.createElement("div", { className: "changes-timeline-track" },
                                group.steps.map(({ step, prompt, files }) => {
                                  const isActiveStep = selectedStepId === step.id;
                                  const changeCount = files.length;
                                  return React.createElement("article", {
                                    key: step.id,
                                    className: "changes-step-card" + (isActiveStep ? " is-active" : "")
                                  },
                                    React.createElement("div", { className: "changes-step-card-header" },
                                      React.createElement("span", {
                                        className: "changes-step-card-commit",
                                        "aria-hidden": "true",
                                      }, React.createElement(GitCommitHorizontal, null)),
                                      React.createElement("button", {
                                        type: "button",
                                        className: "changes-step-card-summary",
                                        onClick: () => handleStepSelection(step, files),
                                      },
                                        React.createElement("div", { className: "changes-step-card-title" }, prompt || step.title || "Changes"),
                                        React.createElement("div", { className: "changes-step-card-meta" },
                                          React.createElement("span", null, formatHistoryTimestamp(step.createdAt)),
                                          React.createElement("span", null, changeCount + " " + (changeCount === 1 ? "change" : "changes"))
                                        )
                                      )
                                    ),
                                    React.createElement("div", { className: "changes-step-card-files" },
                                      changeCount === 0
                                        ? React.createElement("div", { className: "changes-step-card-empty" }, "No changes were recorded for this step.")
                                        : files.map((entry) => {
                                            const isSelectedFile = isActiveStep && selectedFileEntry && historyPathsMatch(selectedFileEntry.path, entry.path);
                                            const changeKindLabel = getHistoryChangeKindLabel(entry.changeKind);
                                            const isRevertedStep = revertedChangeStepIds.has(step.id);
                                            const isImageFile = entry.type === "file" && isHistoryImagePath(entry.path);
                                            const imagePreviewUrl = isImageFile ? buildThreadStepFileDownloadUrl(threadId, step.id, entry.path) : "";
                                            const isResourceEntry = entry.type === "resource";
                                            const resourceLabel = isResourceEntry ? (entry.resourceTypeLabel || "Resource") : "";
                                            const resourceSubtitle = isResourceEntry
                                              ? buildHistoryResourceSubtitle(entry)
                                              : "";
                                            return React.createElement("div", {
                                              key: step.id + ":" + entry.path,
                                              className: "changes-step-file-row" + (isSelectedFile ? " is-active" : ""),
                                            },
                                              React.createElement("button", {
                                                type: "button",
                                                className: "changes-step-file-row-main",
                                                onClick: () => handleFileSelection(step, entry.path),
                                              },
                                                React.createElement("div", { className: "changes-step-file-row-head" },
                                                  React.createElement("div", { className: "changes-step-file-head-main" },
                                                    isResourceEntry
                                                      ? React.createElement("div", { className: "changes-step-file-icon", "aria-hidden": "true" }, renderHistoryResourceIcon(entry.resourceType))
                                                      : null,
                                                    React.createElement("div", { className: "changes-step-file-main" + (isResourceEntry ? " is-resource" : "") },
                                                      React.createElement("div", { className: "changes-step-file-name" }, entry.name || entry.path),
                                                      resourceSubtitle
                                                        ? React.createElement("div", { className: "changes-step-file-path" }, resourceSubtitle)
                                                        : null
                                                    )
                                                  ),
                                                  React.createElement("div", { className: "changes-step-file-right" },
                                                    changeKindLabel
                                                      ? React.createElement("span", { className: "changes-step-file-kind is-" + entry.changeKind }, changeKindLabel)
                                                      : null,
                                                    isResourceEntry
                                                      ? React.createElement("span", { className: "changes-step-file-kind" }, resourceLabel)
                                                      : null,
                                                    typeof entry.additions === "number" && entry.additions > 0
                                                      ? React.createElement("span", { className: "changes-step-file-stat is-added" }, "+" + entry.additions)
                                                      : null,
                                                    typeof entry.deletions === "number" && entry.deletions > 0
                                                      ? React.createElement("span", { className: "changes-step-file-stat is-removed" }, "-" + entry.deletions)
                                                      : null,
                                                    isRevertedStep
                                                      ? React.createElement("span", { className: "changes-step-file-kind is-reverted" }, "Reverted")
                                                      : null
                                                  )
                                                ),
                                                isImageFile && imagePreviewUrl
                                                  ? React.createElement("div", { className: "changes-step-file-preview" },
                                                      React.createElement(RunnerImagePreviewSurface, {
                                                        src: imagePreviewUrl,
                                                        alt: entry.name || entry.path,
                                                        fetchHeaders: historyHeaders,
                                                        interactive: false,
                                                      })
                                                    )
                                                  : null
                                              )
                                            );
                                          })
                                    )
                                  );
                                })
                              )
                            )
                          )
                        )
              )
            )
          );
        }
  
        function isPlaygroundRasterThumbnailCandidate(entry) {
          if (!entry || entry.isFolder) return false;
          const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
          const extension = fileName.includes(".")
            ? fileName.split(".").pop().toLowerCase()
            : "";
          return ["avif", "bmp", "gif", "jpeg", "jpg", "png", "tif", "tiff", "webp"].includes(extension);
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_109__
  
  __PLATFORM_COMPATIBILITY_BINDING_110__
  __PLATFORM_COMPATIBILITY_BINDING_111__
  __PLATFORM_COMPATIBILITY_BINDING_112__
  __PLATFORM_COMPATIBILITY_BINDING_113__
  __PLATFORM_COMPATIBILITY_BINDING_114__
  __PLATFORM_COMPATIBILITY_BINDING_115__
  __PLATFORM_COMPATIBILITY_BINDING_116__
  __PLATFORM_COMPATIBILITY_BINDING_117__
  __PLATFORM_COMPATIBILITY_BINDING_118__
  __PLATFORM_COMPATIBILITY_BINDING_119__
  __PLATFORM_COMPATIBILITY_BINDING_120__
  
  __PLATFORM_COMPATIBILITY_BINDING_121__
  
        function handleComposerSubmitShortcut(event) {
          if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey) || event.altKey) {
            return;
          }
          if (!event.currentTarget || typeof event.currentTarget.requestSubmit !== "function") {
            return;
          }
          event.preventDefault();
          event.currentTarget.requestSubmit();
        }
  
        function getSideActionMenuPosition(event, menuHeight = 184, menuWidth = 220) {
          const rect = event.currentTarget.getBoundingClientRect();
          const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
          const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
          const gutter = 12;
          const sideGap = 8;
          const hasRoomOnLeft = rect.left - menuWidth - sideGap >= gutter;
          const preferredLeft = hasRoomOnLeft
            ? rect.left - menuWidth - sideGap
            : rect.right + sideGap;
          const maxLeft = Math.max(gutter, viewportWidth - menuWidth - gutter);
          const maxTop = Math.max(gutter, viewportHeight - menuHeight - gutter);
          return {
            top: Math.max(gutter, Math.min(maxTop, rect.top + rect.height / 2 - menuHeight / 2)),
            left: Math.max(gutter, Math.min(maxLeft, preferredLeft)),
          };
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_122__
  __PLATFORM_COMPATIBILITY_BINDING_123__
  __PLATFORM_COMPATIBILITY_BINDING_124__
  __PLATFORM_COMPATIBILITY_BINDING_125__
  
  __PLATFORM_COMPATIBILITY_BINDING_126__
        const PLAYGROUND_PLATFORM_NAVIGATION_STATE_KEY = "__runnerPlatformNavigation";
  __PLATFORM_COMPATIBILITY_BINDING_127__      const PLAYGROUND_PLATFORM_NAVIGATION_HISTORY_LIMIT = 200;
        const PLAYGROUND_PLATFORM_NAVIGATION_RESTORE_SUPPRESSION_MS = 1800;
        const PLAYGROUND_PLATFORM_NAVIGATION_FIELDS = [
          "page",
          "mode",
          "view",
          "threadId",
          "contentMode",
          "projectId",
          "detailMode",
          "taskId",
          "scheduleId",
          "workflowId",
          "editorMode",
          "resourceView",
          "resourceType",
          "resourceId",
          "serverKind",
          "environmentId",
          "path",
          "isFolder",
          "toolsView",
          "pluginId",
          "skillId",
          "sectionId",
          "teamId",
  	        "teamTab",
  	        "teamRoleId",
  	        "organizationId",
  	        "organizationTab",
  	        "organizationBillingSection",
          "modelsTab",
          "templateType",
          "templateId",
          "guardrailId",
          "evaluationId",
          "evaluationRunId",
          "fineTuneJobId",
          "developSection",
          "imagineView",
          "mediaMode",
          "filterMode",
          "sortMode",
        ];
  
  __PLATFORM_COMPATIBILITY_BINDING_128__      function createPlaygroundPlatformNavigationToken() {
          return Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
  
        function normalizePlaygroundPlatformNavigationValue(value) {
          if (value === undefined || value === null) return "";
          if (typeof value === "boolean") return value ? "true" : "";
          return String(value).trim();
        }
  
        function normalizePlaygroundPlatformNavigationEntry(entry) {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return null;
          }
          const normalized = {};
          PLAYGROUND_PLATFORM_NAVIGATION_FIELDS.forEach((field) => {
            const value = normalizePlaygroundPlatformNavigationValue(entry[field]);
            if (value || field === "page") {
              normalized[field] = value;
            }
          });
          if (!normalized.page) {
            return null;
          }
          return normalized;
        }
  
        function getPlaygroundPlatformNavigationEntryKey(entry) {
          const normalized = normalizePlaygroundPlatformNavigationEntry(entry);
          return normalized ? JSON.stringify(normalized) : "";
        }
  
        function buildPlaygroundPlatformNavigationState(entry) {
          const normalized = normalizePlaygroundPlatformNavigationEntry(entry);
          if (!normalized) return null;
          return {
            [PLAYGROUND_PLATFORM_NAVIGATION_STATE_KEY]: true,
            entry: normalized,
          };
        }
  
        function getPlaygroundPlatformNavigationStateEntry(state) {
          if (!state || typeof state !== "object" || !state[PLAYGROUND_PLATFORM_NAVIGATION_STATE_KEY]) {
            return null;
          }
          return normalizePlaygroundPlatformNavigationEntry(state.entry);
        }
  
        function appendPlaygroundPlatformNavigationHistory(history, entry) {
          const normalized = normalizePlaygroundPlatformNavigationEntry(entry);
          if (!normalized) return history;
          const entryKey = getPlaygroundPlatformNavigationEntryKey(normalized);
          const previous = history.length > 0 ? history[history.length - 1] : null;
          if (previous && getPlaygroundPlatformNavigationEntryKey(previous) === entryKey) {
            return history;
          }
          return history.concat({
            ...normalized,
            visitedAt: new Date().toISOString(),
          }).slice(-PLAYGROUND_PLATFORM_NAVIGATION_HISTORY_LIMIT);
        }
  
  __PLATFORM_COMPATIBILITY_BINDING_129__
        const root = createRoot(document.getElementById("app"));
        root.render(
          React.createElement(PlatformApplicationBoundary, {
            runtime: {
              apiOrigin: window.location.origin,
              appOrigin: __PLATFORM_COMPATIBILITY_BINDING_130__,
              aiosOrigin: __PLATFORM_COMPATIBILITY_BINDING_131__,
              environment: __PLATFORM_COMPATIBILITY_BINDING_132__,
            },
          }, React.createElement(LegacyPlatformApp))
        );
      

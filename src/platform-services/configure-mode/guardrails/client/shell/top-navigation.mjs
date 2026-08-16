export const GUARDRAILS_APP_TOP_NAVIGATION_SCRIPT = `        function renderGuardrailsPageNav() {
          const activeGuardrailSet = (Array.isArray(allGuardrailSets) ? allGuardrailSets : [])
            .find((set) => set?.id === selectedGuardrailSetId);
          const activeGuardrailVersions = activeGuardrailSet
            ? readPlaygroundGuardrailVersions(activeGuardrailSet)
            : [];
          const selectedGuardrailVersion = activeGuardrailSet
            ? (
                playgroundGuardrailVersionController.getSelectedVersion(activeGuardrailSet)
                || playgroundGuardrailVersionController.getActiveVersion(activeGuardrailSet)
                || activeGuardrailVersions[0]
                || null
              )
            : null;
          const latestGuardrailVersionNumber = activeGuardrailVersions.reduce((latestVersion, version) => {
            const versionNumber = Number(version?.version);
            return Number.isFinite(versionNumber)
              ? Math.max(latestVersion, versionNumber)
              : latestVersion;
          }, -1);
          const isGuardrailsOverview = guardrailsPageMode !== "detail";
          const isCustomGuardrailDetail = Boolean(
            guardrailsPageMode === "detail"
            && activeGuardrailSet
            && !isPlaygroundDefaultGuardrailSet(activeGuardrailSet)
          );
          const isGuardrailVersionHistoryOpen = Boolean(
            isCustomGuardrailDetail
            && guardrailVersionsSidebarOpen
          );
          const canShowGuardrailDetailActions = Boolean(
            isCustomGuardrailDetail
            && !isGuardrailVersionHistoryOpen
          );
          const guardrailHeaderBusy = guardrailVersionState.status === "loading";
          const formatGuardrailHeaderTimestamp = (value) => {
            if (!value) return "Never";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "Unknown";
            return new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(date);
          };
          const openGuardrailHeaderVersionHistory = () => {
            setGuardrailDetailActionsMenuOpen(false);
            setGuardrailPublishMenuOpen(false);
            setGuardrailVersionsHeaderMenuOpen(false);
            setGuardrailVersionsSidebarOpen(true);
          };
          const openGuardrailHeaderShareModal = () => {
            setGuardrailDetailActionsMenuOpen(false);
            setGuardrailShareTeamId("");
            setGuardrailShareTeamState({ status: "idle", error: "" });
            setGuardrailShareTeamModalOpen(true);
            if (typeof loadTeamPageData === "function") {
              void loadTeamPageData({ selectedTeamId: "" });
            }
          };
          const renameGuardrailFromHeader = () => {
            setGuardrailDetailActionsMenuOpen(false);
            handleRenameGuardrailSet(activeGuardrailSet?.id);
          };
          const deleteGuardrailFromHeader = () => {
            setGuardrailDetailActionsMenuOpen(false);
            void handleDeleteGuardrailSet(activeGuardrailSet?.id);
          };
          const copyGuardrailIdFromHeader = () => {
            setGuardrailDetailActionsMenuOpen(false);
            const guardrailId = String(activeGuardrailSet?.id || "");
            const copyPromise = navigator.clipboard?.writeText?.(guardrailId);
            if (copyPromise) void copyPromise.catch(() => undefined);
          };
          const guardrailBreadcrumbActions = isCustomGuardrailDetail
            ? React.createElement(PlatformResourceHeaderActions, {
                className: "playground-guardrails-detail-breadcrumb-actions",
              },
                selectedGuardrailVersion
                  ? React.createElement(PlatformResourceVersionLabel, {
                      resourceLabel: "guardrail",
                      version: selectedGuardrailVersion.version,
                      latestVersion: latestGuardrailVersionNumber >= 0
                        ? latestGuardrailVersionNumber
                        : undefined,
                      className: "playground-guardrail-breadcrumb-version-label",
                      disabled: guardrailHeaderBusy,
                      onOpenVersionHistory: openGuardrailHeaderVersionHistory,
                    })
                  : null,
                canShowGuardrailDetailActions
                  ? React.createElement(PlatformResourceActionsMenu, {
                      open: guardrailDetailActionsMenuOpen,
                      onOpenChange: (nextOpen) => {
                        if (nextOpen) {
                          setGuardrailPublishMenuOpen(false);
                          setGuardrailVersionsHeaderMenuOpen(false);
                        }
                        setGuardrailDetailActionsMenuOpen(nextOpen);
                      },
                      resourceLabel: "Guardrail",
                      disabled: guardrailHeaderBusy,
                      shortcutActions: {
                        share: { onInvoke: openGuardrailHeaderShareModal },
                        rename: { onInvoke: renameGuardrailFromHeader },
                        delete: { onInvoke: deleteGuardrailFromHeader },
                      },
                    },
                      React.createElement(PlatformResourceActionsInformation, {
                        resourceLabel: "Guardrail",
                        items: [
                          {
                            id: "id",
                            label: "ID",
                            value: String(activeGuardrailSet.id || "Unknown"),
                            title: String(activeGuardrailSet.id || ""),
                            monospace: true,
                            copyValue: String(activeGuardrailSet.id || ""),
                            copyAriaLabel: "Copy Guardrail ID",
                          },
                          {
                            id: "created",
                            label: "Created",
                            value: formatGuardrailHeaderTimestamp(activeGuardrailSet.createdAt),
                          },
                          {
                            id: "updated",
                            label: "Updated",
                            value: formatGuardrailHeaderTimestamp(activeGuardrailSet.updatedAt),
                          },
                        ],
                      }),
                      React.createElement(PlatformResourceVersionHistoryMenuItem, {
                        onClick: openGuardrailHeaderVersionHistory,
                      }),
                      React.createElement(PlatformResourceActionsDivider),
                      React.createElement(PlatformResourceActionMenuItem, {
                        icon: React.createElement(UsersRound, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                        label: "Share",
                        shortcut: "share",
                        onClick: openGuardrailHeaderShareModal,
                      }),
                      React.createElement(PlatformResourceActionMenuItem, {
                        icon: React.createElement(Copy, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                        label: "Copy Guardrail ID",
                        onClick: copyGuardrailIdFromHeader,
                      }),
                      React.createElement(PlatformResourceActionsDivider),
                      React.createElement(PlatformResourceActionMenuItem, {
                        icon: React.createElement(SquarePen, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                        label: "Rename",
                        shortcut: "rename",
                        onClick: renameGuardrailFromHeader,
                      }),
                      React.createElement(PlatformResourceActionMenuItem, {
                        icon: React.createElement(Trash2, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                        label: "Delete",
                        shortcut: "delete",
                        onClick: deleteGuardrailFromHeader,
                      })
                    )
                  : null
              )
            : null;
          const guardrailsPathItems = [
            { label: "Configure" },
            {
              label: "Guardrails",
              onClick: guardrailsPageMode === "detail"
                ? () => requestPlatformNavigation(openGuardrailsOverviewPage)
                : undefined,
            },
          ];
          if (guardrailsPageMode === "detail" && activeGuardrailSet?.name) {
            guardrailsPathItems.push({
              label: activeGuardrailSet.name,
              trailing: guardrailBreadcrumbActions,
            });
          }
          const guardrailDetailTopNavActions = canShowGuardrailDetailActions
            ? React.createElement("span", { className: "playground-guardrails-detail-topnav-actions" },
                React.createElement("span", {
                  id: "playground-guardrails-detail-publish-controls",
                  className: "playground-guardrails-detail-publish-controls",
                })
              )
            : null;
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: guardrailsPathItems,
            center: guardrailsPageMode === "detail" && activeGuardrailSet
              ? React.createElement(PlatformSwitch, {
                  className: "playground-guardrails-detail-header-switch",
                  value: ["general", "evaluation", "settings"].includes(guardrailDetailTab)
                    ? guardrailDetailTab
                    : "general",
                  options: [
                    { value: "general", label: "General" },
                    { value: "evaluation", label: "Evaluation" },
                    { value: "settings", label: "Settings" },
                  ],
                  onValueChange: (nextTab) => {
                    const normalizedTab = ["general", "evaluation", "settings"].includes(String(nextTab || ""))
                      ? String(nextTab)
                      : "general";
                    setGuardrailDetailTab(normalizedTab);
                    setGuardrailAccessMenuOpen(false);
                    if (normalizedTab !== "settings") {
                      setGuardrailAccessTeamId("");
                    }
                  },
                  ariaLabel: "Guardrail section",
                })
              : null,
            extraActions: isGuardrailsOverview
              ? React.createElement("div", {
                  id: "playground-guardrails-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : guardrailDetailTopNavActions,
            includeSearchDivider: isGuardrailsOverview || canShowGuardrailDetailActions,
            hideCommonActions: isGuardrailVersionHistoryOpen,
          });
        }

`;

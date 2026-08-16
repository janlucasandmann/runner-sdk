export const GUARDRAILS_APP_ACTIONS_SCRIPT = `        function clearGuardrailVersionModalTimers() {
          if (typeof window === "undefined") return;
          if (guardrailVersionModalCloseTimerRef.current) {
            window.clearTimeout(guardrailVersionModalCloseTimerRef.current);
            guardrailVersionModalCloseTimerRef.current = null;
          }
          if (guardrailVersionModalFrameRef.current) {
            window.cancelAnimationFrame(guardrailVersionModalFrameRef.current);
            guardrailVersionModalFrameRef.current = null;
          }
        }
        function resetGuardrailVersionTransientState(options = {}) {
          setGuardrailVersionsSidebarOpen(false);
          setGuardrailPublishMenuOpen(false);
          setGuardrailVersionsHeaderMenuOpen(false);
          setGuardrailSetActionMenuId("");
          setGuardrailDetailActionsMenuOpen(false);
          setGuardrailVersionChangesState(null);
          setGuardrailVersionSaveDialog(null);
          setOpenGuardrailVersionMenuId("");
          if (options.closeModal === false) {
            return;
          }
          clearGuardrailVersionModalTimers();
          setGuardrailVersionModal(null);
          setGuardrailVersionModalVisible(false);
          setGuardrailVersionModalClosing(false);
          setGuardrailVersionNameDraft("");
          setGuardrailVersionDescriptionDraft("");
          setIsGuardrailVersionDescriptionEditing(false);
        }
        function focusGuardrailTitleInput() {
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              const titleInput = guardrailTitleInputRef.current;
              if (!titleInput) return;
              titleInput.focus();
              if (typeof titleInput.select === "function") {
                titleInput.select();
              }
            });
          });
        }
        function handleRenameGuardrailSet(setId) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          const targetSet = allGuardrailSets.find((set) => set?.id === normalizedSetId);
          if (!targetSet || isPlaygroundDefaultGuardrailSet(targetSet)) return;
          setSelectedGuardrailSetId(normalizedSetId);
          setGuardrailsPageMode("detail");
          setGuardrailsToolbarPopover("");
          setGuardrailSetActionMenuId("");
          setGuardrailDetailActionsMenuOpen(false);
          setGuardrailPublishMenuOpen(false);
          setGuardrailVersionsHeaderMenuOpen(false);
          setOpenGuardrailVersionMenuId("");
          setActivePage("guardrails");
          focusGuardrailTitleInput();
        }
        async function handleDeleteGuardrailSet(setId) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          const targetSet = allGuardrailSets.find((set) => set?.id === normalizedSetId);
          if (!targetSet || isPlaygroundDefaultGuardrailSet(targetSet)) return;
          const confirmed = typeof window === "undefined" || window.confirm("Delete " + (targetSet?.name || "this guardrail set") + "?");
          if (!confirmed) return;
          setGuardrailSetActionMenuId("");
          setGuardrailDetailActionsMenuOpen(false);
          const previousSets = Array.isArray(guardrailSets) ? guardrailSets : [];
          setGuardrailSets((current) => (Array.isArray(current) ? current : []).filter((set) => set?.id !== normalizedSetId));
          if (selectedGuardrailSetId === normalizedSetId) {
            const fallbackSet = allGuardrailSets.find((set) => set?.id !== normalizedSetId);
            setSelectedGuardrailSetId(fallbackSet?.id || "");
            resetGuardrailVersionTransientState();
            if (guardrailsPageMode === "detail") {
              setGuardrailsPageMode("overview");
            }
          }
          try {
            await requestGuardrailBackendJson(
              "/guardrails/" + encodeURIComponent(normalizedSetId),
              { method: "DELETE" },
              "Failed to delete guardrail set."
            );
            guardrailPersistSignaturesRef.current.delete(normalizedSetId);
          } catch (error) {
            setGuardrailSets(previousSets);
            setGuardrailsBackendSyncState({ status: "error", error: error?.message || String(error) });
          }
        }
        function renderGuardrailActionMenuItems(setId, options = {}) {
          const targetSet = allGuardrailSets.find((set) => String(set?.id || "") === String(setId || "")) || null;
          return React.createElement(React.Fragment, null,
            options.includeMetadata
              ? React.createElement("div", { className: "playground-agents-detail-action-menu-meta" },
                  React.createElement("div", { className: "playground-agents-detail-action-menu-meta-row" },
                    React.createElement("span", { className: "playground-agents-detail-action-menu-meta-label" }, "ID"),
                    React.createElement("span", {
                      className: "playground-agents-detail-action-menu-meta-value",
                      title: targetSet?.id || "",
                    }, targetSet?.id || "Unknown")
                  )
                )
              : null,
            typeof options.onShareWithTeam === "function"
              ? React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  role: "menuitem",
                  onClick: options.onShareWithTeam,
                },
                React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Share with Team")
                )
              )
              : null,
            typeof options.onVersionHistory === "function"
              ? React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row",
                  role: "menuitem",
                  onClick: options.onVersionHistory,
                },
                React.createElement(History, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Version history")
                )
              )
              : null,
            React.createElement("button", {
              type: "button",
              className: "tb-popup-row",
              role: "menuitem",
              onClick: () => handleRenameGuardrailSet(setId),
            },
              React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, "Rename")
              )
            ),
            React.createElement("button", {
              type: "button",
              className: "tb-popup-row is-danger",
              role: "menuitem",
              onClick: () => handleDeleteGuardrailSet(setId),
            },
              React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, "Delete")
              )
            )
          );
        }

`;

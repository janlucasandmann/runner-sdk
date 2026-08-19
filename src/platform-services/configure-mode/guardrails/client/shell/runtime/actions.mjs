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
        async function handleDeleteGuardrailSets(setIds) {
          const normalizedSetIds = Array.from(new Set(
            (Array.isArray(setIds) ? setIds : [setIds])
              .map((setId) => String(setId || "").trim())
              .filter(Boolean)
          ));
          const targetSets = normalizedSetIds
            .map((setId) => allGuardrailSets.find((set) => set?.id === setId) || null)
            .filter((set) => set && !isPlaygroundDefaultGuardrailSet(set));
          if (!targetSets.length) return;
          const targetIds = new Set(targetSets.map((set) => set.id));
          const confirmationMessage = targetSets.length === 1
            ? "Delete " + (targetSets[0]?.name || "this guardrail set") + "?"
            : "Delete " + targetSets.length + " selected guardrail sets?";
          const confirmed = typeof window === "undefined" || window.confirm(confirmationMessage);
          if (!confirmed) return;
          setGuardrailSetActionMenuId("");
          setGuardrailDetailActionsMenuOpen(false);
          const previousSets = Array.isArray(guardrailSets) ? guardrailSets : [];
          setGuardrailSets((current) => (Array.isArray(current) ? current : []).filter((set) => !targetIds.has(set?.id)));
          if (targetIds.has(selectedGuardrailSetId)) {
            const fallbackSet = allGuardrailSets.find((set) => !targetIds.has(set?.id));
            setSelectedGuardrailSetId(fallbackSet?.id || "");
            resetGuardrailVersionTransientState();
            if (guardrailsPageMode === "detail") {
              setGuardrailsPageMode("overview");
            }
          }
          const results = await Promise.allSettled(targetSets.map((targetSet) =>
            requestGuardrailBackendJson(
              "/guardrails/" + encodeURIComponent(targetSet.id),
              { method: "DELETE" },
              "Failed to delete guardrail set."
            )
          ));
          const failedIds = new Set();
          results.forEach((result, index) => {
            const targetId = targetSets[index]?.id;
            if (!targetId) return;
            if (result.status === "fulfilled") {
              guardrailPersistSignaturesRef.current.delete(targetId);
              guardrailLocalPromptDraftsRef.current.delete(targetId);
            } else {
              failedIds.add(targetId);
            }
          });
          if (failedIds.size) {
            setGuardrailSets((current) => {
              const currentSets = Array.isArray(current) ? current : [];
              const restored = previousSets.filter((set) => failedIds.has(set?.id));
              const currentIds = new Set(currentSets.map((set) => set?.id));
              return [...currentSets, ...restored.filter((set) => !currentIds.has(set?.id))]
                .sort((left, right) => (Date.parse(right?.updatedAt || 0) || 0) - (Date.parse(left?.updatedAt || 0) || 0));
            });
            setGuardrailsBackendSyncState({
              status: "error",
              error: failedIds.size === 1
                ? "One guardrail set could not be deleted."
                : failedIds.size + " guardrail sets could not be deleted.",
            });
          }
        }
        async function handleDeleteGuardrailSet(setId) {
          return await handleDeleteGuardrailSets([setId]);
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

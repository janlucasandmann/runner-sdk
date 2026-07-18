export const GUARDRAILS_PAGE_TABLE_SCRIPT = `          function renderGuardrailsTable() {
            const guardrailOverviewRows = safeGuardrailSets
              .map((set) => {
                const id = String(set?.id || "").trim();
                const name = String(set?.name || "Untitled Guardrail Set").trim();
                const isDefaultSet = isGuardrailSetReadonly(set);
                const creator = getGuardrailCreatorIdentity(set);
                const creatorLabel = getGuardrailCreatorLabel(set);
                const updatedValue = set?.updatedAt || set?.createdAt || "";
                const updatedDate = new Date(updatedValue || "");
                const promptSearchText = (Array.isArray(set?.prompts) ? set.prompts : [])
                  .map((prompt) => [prompt?.title, prompt?.prompt].filter(Boolean).join(" "))
                  .join(" ");
                return {
                  id,
                  name,
                  type: isDefaultSet ? "default" : "custom",
                  typeLabel: isDefaultSet ? "Default" : "Custom",
                  creatorLabel,
                  creatorAvatarUrl: canRenderAvatarImage(creator.avatarUrl) ? creator.avatarUrl : "",
                  creatorFallback: getAccountInitials(creatorLabel),
                  updatedAt: Number.isFinite(updatedDate.getTime()) ? updatedDate.getTime() : 0,
                  updatedLabel: formatGuardrailDate(updatedValue),
                  updatedTitle: Number.isFinite(updatedDate.getTime()) ? updatedDate.toLocaleString() : "",
                  searchText: [name, set?.description, promptSearchText, creatorLabel, isDefaultSet ? "Default" : "Custom", id]
                    .filter(Boolean)
                    .join(" "),
                };
              })
              .filter((set) => set.id);

            return React.createElement(GuardrailsOverviewPage, {
              rows: guardrailOverviewRows,
              loading: guardrailsBackendSyncState.status === "loading" && guardrailOverviewRows.length === 0,
              error: guardrailsBackendSyncState.error || "",
              controlsPortalId: "playground-guardrails-overview-controls",
              onOpen: (set) => selectGuardrailSet(set.id),
              onCreate: createGuardrailSet,
              onRename: (set) => handleRenameGuardrailSet(set.id),
              onDelete: (set) => handleDeleteGuardrailSet(set.id),
            });
          }

`;

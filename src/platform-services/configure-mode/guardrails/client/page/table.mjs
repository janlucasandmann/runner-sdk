export const GUARDRAILS_PAGE_TABLE_SCRIPT = `          function renderGuardrailsTable() {
            const normalizedGuardrailsOverviewScope = guardrailsOverviewScope === "created"
              ? "created"
              : guardrailsOverviewScope === "shared"
                ? "shared"
                : "all";
            const currentGuardrailUser = getCurrentGuardrailUserIdentity();
            const currentGuardrailUserKeys = new Set(getGuardrailPersonIdentityKeys(currentGuardrailUser));
            const currentGuardrailUserName = String(currentGuardrailUser?.name || "").trim().toLowerCase();
            const isGuardrailCreatedByCurrentUser = (set) => {
              if (isGuardrailSetReadonly(set)) return false;
              const creator = getGuardrailCreatorIdentity(set);
              const creatorKeys = getGuardrailPersonIdentityKeys(creator);
              if (creatorKeys.some((key) => currentGuardrailUserKeys.has(key))) return true;
              if (creatorKeys.length) return false;
              const creatorName = String(creator?.name || "").trim().toLowerCase();
              if (!creatorName || ["unknown", "you", "me", "current user"].includes(creatorName)) return true;
              return Boolean(currentGuardrailUserName && creatorName === currentGuardrailUserName);
            };
            const scopedGuardrailSets = normalizedGuardrailsOverviewScope === "all"
              ? safeGuardrailSets
              : safeGuardrailSets.filter((set) => {
                  if (isGuardrailSetReadonly(set)) return false;
                  const createdByCurrentUser = isGuardrailCreatedByCurrentUser(set);
                  return normalizedGuardrailsOverviewScope === "created"
                    ? createdByCurrentUser
                    : !createdByCurrentUser;
                });
            const guardrailOverviewRows = scopedGuardrailSets
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
                  description: String(set?.description || "").trim(),
                  type: isDefaultSet ? "default" : "custom",
                  typeLabel: isDefaultSet ? "Default" : "Custom",
                  creatorName: creatorLabel,
                  creatorAvatarUrl: canRenderAvatarImage(creator.avatarUrl) ? creator.avatarUrl : "",
                  creatorFallback: getAccountInitials(creatorLabel),
                  updatedAt: Number.isFinite(updatedDate.getTime()) ? updatedDate.getTime() : 0,
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
              onDelete: (sets) => handleDeleteGuardrailSets(
                (Array.isArray(sets) ? sets : []).map((set) => set?.id)
              ),
            });
          }

`;

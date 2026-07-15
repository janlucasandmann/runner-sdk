export const GUARDRAILS_PAGE_CONTROLLER_SCRIPT = `        function renderGuardrailsPage() {
          const safeGuardrailSets = Array.isArray(allGuardrailSets) ? allGuardrailSets : [];
          const customGuardrailSets = Array.isArray(guardrailSets) ? guardrailSets : [];
          const normalizedQuery = String(guardrailsSearchQuery || "").trim().toLowerCase();
          const isGuardrailSetReadonly = (set) => isPlaygroundDefaultGuardrailSet(set);
          const formatGuardrailDate = (value) => {
            const date = new Date(value || "");
            if (Number.isNaN(date.getTime())) return "Never";
            return date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          };
          const formatGuardrailVersionTimestamp = (value) => {
            const date = new Date(value || "");
            if (Number.isNaN(date.getTime())) return "Just now";
            return date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          };
          const getGuardrailCreatorIdentity = (set) => {
            if (isGuardrailSetReadonly(set)) {
              return {
                name: "Computer Agents",
                avatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
                isSystem: true,
              };
            }
            const record = set && typeof set === "object" && !Array.isArray(set) ? set : {};
            const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
            const nested = record.creator && typeof record.creator === "object" && !Array.isArray(record.creator)
              ? record.creator
              : record.createdBy && typeof record.createdBy === "object" && !Array.isArray(record.createdBy)
                ? record.createdBy
                : record.created_by && typeof record.created_by === "object" && !Array.isArray(record.created_by)
                  ? record.created_by
                  : metadata.creator && typeof metadata.creator === "object" && !Array.isArray(metadata.creator)
                    ? metadata.creator
                    : metadata.createdBy && typeof metadata.createdBy === "object" && !Array.isArray(metadata.createdBy)
                      ? metadata.createdBy
                      : metadata.created_by && typeof metadata.created_by === "object" && !Array.isArray(metadata.created_by)
                        ? metadata.created_by
                        : {};
            const creatorName = String(
              nested.name
              || nested.displayName
              || nested.display_name
              || record.creatorName
              || record.creator_name
              || record.createdByName
              || record.created_by_name
              || metadata.creatorName
              || metadata.creator_name
              || metadata.createdByName
              || metadata.created_by_name
              || accountName
              || accountEmail
              || ""
            ).trim();
            const creatorAvatarUrl = String(
              nested.avatarUrl
              || nested.avatar_url
              || nested.photoUrl
              || nested.photoURL
              || nested.imageUrl
              || nested.imageURL
              || record.creatorAvatarUrl
              || record.creator_avatar_url
              || record.createdByAvatarUrl
              || record.created_by_avatar_url
              || metadata.creatorAvatarUrl
              || metadata.creator_avatar_url
              || metadata.createdByAvatarUrl
              || metadata.created_by_avatar_url
              || accountAvatarUrl
              || ""
            ).trim();
            return {
              id: String(nested.id || record.creatorId || record.creator_id || record.createdById || record.created_by_id || metadata.creatorId || metadata.creator_id || metadata.createdById || metadata.created_by_id || accountEmail || "").trim(),
              userId: String(nested.userId || nested.user_id || record.creatorUserId || record.creator_user_id || metadata.creatorUserId || metadata.creator_user_id || sessionState.userId || "").trim(),
              name: creatorName,
              email: String(nested.email || nested.mail || record.creatorEmail || record.creator_email || record.createdByEmail || record.created_by_email || metadata.creatorEmail || metadata.creator_email || metadata.createdByEmail || metadata.created_by_email || accountEmail || "").trim(),
              avatarUrl: creatorAvatarUrl,
              isSystem: false,
            };
          };
          const getGuardrailCreatorLabel = (set) => {
            const creator = getGuardrailCreatorIdentity(set);
            return String(creator.name || creator.email || creator.id || creator.userId || "Unknown").trim();
          };
          function renderGuardrailCreatorCell(set) {
            const creator = getGuardrailCreatorIdentity(set);
            const label = getGuardrailCreatorLabel(set);
            const avatarUrl = canRenderAvatarImage(creator.avatarUrl) ? creator.avatarUrl : "";
            return React.createElement("span", { className: "playground-guardrails-creator-cell", title: label },
              React.createElement("span", {
                className: "playground-guardrails-creator-avatar" + (creator.isSystem ? " is-system" : ""),
                "aria-hidden": "true",
              },
                avatarUrl
                  ? React.createElement("img", { src: avatarUrl, alt: "" })
                  : getAccountInitials(label)
              ),
              React.createElement("span", { className: "playground-guardrails-creator-label" }, label)
            );
          }
          const filteredGuardrailSets = safeGuardrailSets
            .filter((set) => {
              const isDefaultSet = isGuardrailSetReadonly(set);
              if (guardrailsSetFilter === "default" && !isDefaultSet) return false;
              if (guardrailsSetFilter === "custom" && isDefaultSet) return false;
              if (!normalizedQuery) return true;
              const promptText = (Array.isArray(set?.prompts) ? set.prompts : [])
                .map((prompt) => [prompt?.title, prompt?.prompt].filter(Boolean).join(" "))
                .join(" ");
              const haystack = [
                set?.name,
                set?.description,
                promptText,
              ].filter(Boolean).join(" ").toLowerCase();
              return haystack.includes(normalizedQuery);
            })
	            .sort((left, right) => {
	              let comparison = 0;
	              if (guardrailsSort === "name") {
	                comparison = String(left?.name || "").localeCompare(String(right?.name || ""));
	              } else if (guardrailsSort === "creator") {
	                comparison = getGuardrailCreatorLabel(left).localeCompare(getGuardrailCreatorLabel(right));
	              } else if (guardrailsSort === "type") {
	                const leftType = isGuardrailSetReadonly(left) ? "Default" : "Custom";
	                const rightType = isGuardrailSetReadonly(right) ? "Default" : "Custom";
	                comparison = leftType.localeCompare(rightType) || String(left?.name || "").localeCompare(String(right?.name || ""));
	              } else {
	                const rightTime = new Date(right?.updatedAt || right?.createdAt || 0).getTime() || 0;
	                const leftTime = new Date(left?.updatedAt || left?.createdAt || 0).getTime() || 0;
	                comparison = leftTime - rightTime;
	              }
	              return guardrailsSortDirection === "desc" ? -comparison : comparison;
	            });
          const selectedGuardrailSet = safeGuardrailSets.find((set) => set?.id === selectedGuardrailSetId)
            || safeGuardrailSets[0]
            || null;
          const selectedGuardrailSetReadonly = isGuardrailSetReadonly(selectedGuardrailSet);
          const selectedGuardrailPrompts = Array.isArray(selectedGuardrailSet?.prompts)
            ? selectedGuardrailSet.prompts
            : [];

          async function createGuardrailSet() {
            const creator = {
              id: String(sessionState.userId || accountEmail || accountName || "").trim(),
              userId: String(sessionState.userId || "").trim(),
              name: String(accountName || accountEmail || "Me").trim(),
              email: String(accountEmail || "").trim(),
              avatarUrl: String(accountAvatarUrl || "").trim(),
            };
            const draftSet = createPlaygroundGuardrailSetDraft({
              name: "Guardrail Set " + (customGuardrailSets.length + 1),
              description: "",
              metadata: {
                creator,
                ...(creator.id ? { creatorId: creator.id, creator_id: creator.id } : {}),
                ...(creator.userId ? { creatorUserId: creator.userId, creator_user_id: creator.userId } : {}),
                ...(creator.name ? { creatorName: creator.name, creator_name: creator.name } : {}),
                ...(creator.email ? { creatorEmail: creator.email, creator_email: creator.email } : {}),
                ...(creator.avatarUrl ? { creatorAvatarUrl: creator.avatarUrl, creator_avatar_url: creator.avatarUrl } : {}),
              },
            });
            const nextSet = ensurePlaygroundGuardrailInitialVersion(draftSet);
            setGuardrailsBackendSyncState({ status: "loading", error: "" });
            try {
              const createdPayload = await requestGuardrailBackendJson(
                "/guardrails",
                {
                  method: "POST",
                  body: JSON.stringify(buildPlaygroundGuardrailBackendPayload(nextSet)),
                },
                "Failed to create guardrail set."
              );
              const createdSet = normalizePlaygroundGuardrailSet(createdPayload?.guardrail || createdPayload?.data || createdPayload);
              const detailedSet = await fetchBackendGuardrailSetDetails(createdSet);
              replaceGuardrailSetFromBackend(detailedSet, { select: true, rememberBaseline: true });
              setGuardrailsBackendSyncState({ status: "idle", error: "" });
              setGuardrailsSetFilter("custom");
              setGuardrailsPageMode("detail");
              setGuardrailsToolbarPopover("");
              setGuardrailSetActionMenuId("");
              setGuardrailDetailActionsMenuOpen(false);
              setGuardrailPublishMenuOpen(false);
              setGuardrailVersionsHeaderMenuOpen(false);
              setGuardrailVersionChangesState(null);
            } catch (error) {
              setGuardrailsBackendSyncState({ status: "error", error: error?.message || String(error) });
            }
          }

          function selectGuardrailSet(setId) {
            setSelectedGuardrailSetId(setId);
            setGuardrailsPageMode("detail");
            setGuardrailsToolbarPopover("");
            setGuardrailSetActionMenuId("");
            setGuardrailDetailActionsMenuOpen(false);
            setGuardrailVersionsSidebarOpen(false);
            setGuardrailPublishMenuOpen(false);
            setGuardrailVersionsHeaderMenuOpen(false);
            setGuardrailVersionChangesState(null);
            setOpenGuardrailVersionMenuId("");
            finishCloseGuardrailVersionModal();
            guardrailVersionDraftTouchedRef.current = false;
          }

          function returnToGuardrailsOverview() {
            setGuardrailsPageMode("overview");
            setGuardrailsToolbarPopover("");
            setGuardrailSetActionMenuId("");
            setGuardrailDetailActionsMenuOpen(false);
            setGuardrailVersionsSidebarOpen(false);
            setGuardrailPublishMenuOpen(false);
            setGuardrailVersionsHeaderMenuOpen(false);
            setGuardrailVersionChangesState(null);
            setOpenGuardrailVersionMenuId("");
            finishCloseGuardrailVersionModal();
            guardrailVersionDraftTouchedRef.current = false;
          }

          function updateGuardrailSet(setId, updater, options = {}) {
            const normalizedSetId = String(setId || "").trim();
            if (!normalizedSetId) return;
            const targetSet = safeGuardrailSets.find((set) => set?.id === normalizedSetId);
            if (isGuardrailSetReadonly(targetSet)) return;
            if (options.markVersionTouched !== false) {
              guardrailVersionDraftTouchedRef.current = true;
            }
            let nextSetForPersistence = null;
            setGuardrailSets((current) => (Array.isArray(current) ? current : []).map((set) => {
              if (set?.id !== normalizedSetId) return set;
              const updatedSet = typeof updater === "function" ? updater(set) : { ...set, ...updater };
              nextSetForPersistence = ensurePlaygroundGuardrailInitialVersion(normalizePlaygroundGuardrailSet({
                ...set,
                ...updatedSet,
                id: set.id,
                prompts: Array.isArray(updatedSet?.prompts) ? updatedSet.prompts : (Array.isArray(set.prompts) ? set.prompts : []),
                updatedAt: new Date().toISOString(),
              }));
              return nextSetForPersistence;
            }));
            if (nextSetForPersistence) {
              schedulePersistGuardrailSet(nextSetForPersistence, options);
            }
          }

`;

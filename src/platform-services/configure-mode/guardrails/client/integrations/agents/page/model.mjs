export const GUARDRAILS_AGENT_PAGE_MODEL_SCRIPT = `          const availableAgentGuardrailSets = (Array.isArray(guardrailSets) ? guardrailSets : [])
            .map((set) => normalizePlaygroundGuardrailSet(set))
            .filter((set) => set?.id);
          const agentGuardrailSetIds = normalizePlaygroundGuardrailSetIds(draftAgent.guardrailSetIds);
          const agentGuardrailSetIdLookup = new Set(agentGuardrailSetIds);
          const importedAgentGuardrailSets = agentGuardrailSetIds
            .map((setId) => availableAgentGuardrailSets.find((set) => set.id === setId) || null)
            .filter(Boolean);
          const importableAgentGuardrailSets = availableAgentGuardrailSets.filter((set) => !agentGuardrailSetIdLookup.has(set.id));
          function getAgentGuardrailSearchText(set) {
            const promptText = (Array.isArray(set.prompts) ? set.prompts : [])
              .map((prompt) => [prompt?.title, prompt?.prompt].filter(Boolean).join(" "))
              .join(" ");
            return [
              set.name,
              set.description,
              promptText,
            ].filter(Boolean).join(" ");
          }
          const filteredAgentGuardrailSets = importedAgentGuardrailSets.filter((set) => {
            const promptCount = Array.isArray(set.prompts) ? set.prompts.length : 0;
            if (agentGuardrailFilterMode === "with-prompts") {
              return promptCount > 0;
            }
            if (agentGuardrailFilterMode === "without-prompts") {
              return promptCount === 0;
            }
            return true;
          });
          function formatAgentGuardrailDate(value) {
            const date = new Date(value || "");
            if (Number.isNaN(date.getTime())) {
              return "—";
            }
            return date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }
          async function persistAgentGuardrailSelection(nextAgent) {
            const guardrailBundle = buildPlaygroundAgentGuardrailBundle(nextAgent, guardrailSets);
            const response = await fetch(
              backendUrl + "/agents/" + encodeURIComponent(nextAgent.id) + "/guardrails",
              {
                method: "PUT",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  guardrailSetIds: guardrailBundle.guardrailSetIds,
                  guardrail_set_ids: guardrailBundle.guardrailSetIds,
                  guardrails: guardrailBundle.guardrails,
                }),
              },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update agent guardrails.");
            }
            const responseAgent = getPlaygroundAgentResponseRecord(data);
            const nextMetadata = buildPlaygroundAgentPersistedMetadata(nextAgent) || {};
            const savedAgent = normalizePlaygroundAgentRecord({
              ...nextAgent,
              ...(responseAgent || {}),
              guardrailSetIds: guardrailBundle.guardrailSetIds,
              guardrails: guardrailBundle.guardrails,
              promptAdaptations: guardrailBundle.promptAdaptations,
              invisiblePromptAdaptations: guardrailBundle.promptAdaptations,
              metadata: {
                ...getAgentMetadataRecord(responseAgent),
                ...nextMetadata,
              },
            });
            setAgentDetailsById((current) => ({
              ...current,
              [savedAgent.id]: savedAgent,
            }));
            setDraftAgent(savedAgent);
            setSaveState({
              isSaving: false,
              error: "",
              message: "Saved",
            });
            if (onAgentMutated) {
              await onAgentMutated();
            }
            return savedAgent;
          }
          function toggleAgentGuardrailSet(setId) {
            const normalizedSetId = String(setId || "").trim();
            if (!normalizedSetId) {
              return;
            }
            const currentIds = normalizePlaygroundGuardrailSetIds(draftAgent.guardrailSetIds);
            const nextIds = currentIds.includes(normalizedSetId)
              ? currentIds.filter((id) => id !== normalizedSetId)
              : [...currentIds, normalizedSetId];
            const previousAgent = normalizePlaygroundAgentRecord(draftAgent);
            const nextAgent = normalizePlaygroundAgentRecord({
              ...previousAgent,
              guardrailSetIds: nextIds,
            });
            if (!nextAgent?.id || nextAgent.id === PLAYGROUND_AGENT_DRAFT_ID) {
              updateAgentField("guardrailSetIds", nextIds);
              return;
            }
            clearAgentAutosaveQueue();
            setDraftAgent(nextAgent);
            setAgentDetailsById((current) => ({
              ...current,
              [nextAgent.id]: nextAgent,
            }));
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            void persistAgentGuardrailSelection(nextAgent).catch((error) => {
              setAgentDetailsById((current) => ({
                ...current,
                [previousAgent.id]: previousAgent,
              }));
              setDraftAgent(previousAgent);
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to update agent guardrails.",
                message: "",
              });
            });
          }
`;

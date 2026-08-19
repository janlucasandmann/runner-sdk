export const GUARDRAILS_APP_BACKEND_SCRIPT = `        async function readGuardrailBackendJson(response, fallbackMessage = "Guardrail request failed.") {
          const text = await response.text();
          let data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { message: text };
          }
          if (!response.ok) {
            const message = String(data?.message || data?.error || fallbackMessage || "Guardrail request failed.").trim();
            throw new Error(message);
          }
          return data;
        }

        async function requestGuardrailBackendJson(path, init = {}, fallbackMessage = "Guardrail request failed.") {
          const normalizedBackendUrl = String(proxyBackendBase || "").replace(/\\/+$/, "");
          if (!normalizedBackendUrl) {
            throw new Error("Guardrail backend is unavailable.");
          }
          const headers = new Headers(requestHeaders || {});
          if (init.body !== undefined && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
          }
          const response = await fetch(normalizedBackendUrl + path, {
            credentials: "include",
            cache: "no-store",
            ...init,
            headers,
          });
          return await readGuardrailBackendJson(response, fallbackMessage);
        }

        async function fetchBackendGuardrailSetDetails(set, options = {}) {
          const normalizedSet = normalizePlaygroundGuardrailSet(set);
          if (!normalizedSet.id || isPlaygroundDefaultGuardrailSet(normalizedSet)) return normalizedSet;
          if (options.includeVersions === false) {
            return ensurePlaygroundGuardrailInitialVersion(normalizedSet);
          }
          const versionsPayload = await requestGuardrailBackendJson(
            "/guardrails/" + encodeURIComponent(normalizedSet.id) + "/versions",
            { method: "GET" },
            "Failed to load guardrail versions."
          ).catch(() => null);
          const versions = readPlaygroundGuardrailListFromPayload(versionsPayload || {}, ["versions", "guardrailVersions", "guardrail_versions"])
            .map((version, index) => normalizePlaygroundGuardrailVersion(version, index));
          return mergePlaygroundGuardrailSetWithBackendDetails(normalizedSet, versions);
        }

        function mergeGuardrailSetWithLocalPromptDrafts(nextSet) {
          const normalizedSet = normalizePlaygroundGuardrailSet(nextSet);
          const localDrafts = Array.isArray(guardrailLocalPromptDraftsRef.current.get(normalizedSet.id))
            ? guardrailLocalPromptDraftsRef.current.get(normalizedSet.id)
            : [];
          if (!localDrafts.length) return normalizedSet;
          const backendPrompts = Array.isArray(normalizedSet.prompts) ? normalizedSet.prompts : [];
          const backendPromptIds = new Set(backendPrompts.map((prompt) => String(prompt?.id || "").trim()).filter(Boolean));
          return normalizePlaygroundGuardrailSet({
            ...normalizedSet,
            prompts: [
              ...backendPrompts,
              ...localDrafts.filter((prompt) => !backendPromptIds.has(String(prompt?.id || "").trim())),
            ],
          });
        }

        function replaceGuardrailSetFromBackend(nextSet, options = {}) {
          const normalizedSet = ensurePlaygroundGuardrailInitialVersion(
            mergeGuardrailSetWithLocalPromptDrafts(nextSet)
          );
          if (!normalizedSet.id || isPlaygroundDefaultGuardrailSet(normalizedSet)) return normalizedSet;
          setGuardrailSets((current) => {
            const currentSets = Array.isArray(current) ? current : [];
            const replaced = currentSets.some((set) => set?.id === normalizedSet.id);
            const nextSets = replaced
              ? currentSets.map((set) => set?.id === normalizedSet.id ? normalizedSet : set)
              : [normalizedSet, ...currentSets];
            return nextSets
              .filter((set) => set?.id && !isPlaygroundDefaultGuardrailSet(set))
              .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0));
          });
          guardrailPersistSignaturesRef.current.set(normalizedSet.id, JSON.stringify(buildPlaygroundGuardrailBackendPayload(normalizedSet)));
          if (options.select !== false) {
            setSelectedGuardrailSetId(normalizedSet.id);
          }
          if (options.rememberBaseline !== false) {
            playgroundGuardrailVersionController.rememberBaseline(normalizedSet, guardrailVersionBaselineRef, { force: true });
            guardrailVersionDraftTouchedRef.current = false;
          }
          return normalizedSet;
        }

        async function reloadBackendGuardrailSet(setId, options = {}) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return null;
          const setPayload = await requestGuardrailBackendJson(
            "/guardrails/" + encodeURIComponent(normalizedSetId),
            { method: "GET" },
            "Failed to load guardrail set."
          );
          const backendSet = normalizePlaygroundGuardrailSet(setPayload?.guardrail || setPayload?.data || setPayload);
          const detailedSet = await fetchBackendGuardrailSetDetails(backendSet);
          if (detailedSet?.id) {
            guardrailDetailsLoadedRef.current.add(detailedSet.id);
            replaceGuardrailSetFromBackend(detailedSet, options);
          }
          return detailedSet;
        }

        async function migrateLocalGuardrailSetToBackend(localSet) {
          const normalizedLocalSet = ensurePlaygroundGuardrailInitialVersion(normalizePlaygroundGuardrailSet(localSet));
          if (!normalizedLocalSet.id) return null;
          const createdPayload = await requestGuardrailBackendJson(
            "/guardrails",
            {
              method: "POST",
              body: JSON.stringify(buildPlaygroundGuardrailBackendPayload(normalizedLocalSet)),
            },
            "Failed to migrate guardrail set."
          );
          const createdSet = normalizePlaygroundGuardrailSet(createdPayload?.guardrail || createdPayload?.data || createdPayload);
          if (!createdSet.id) return null;
          const localVersions = readPlaygroundGuardrailVersions(normalizedLocalSet)
            .slice()
            .sort((left, right) => Number(left.version || 0) - Number(right.version || 0));
          for (const localVersion of localVersions) {
            try {
              const versionPayload = await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(createdSet.id) + "/versions",
                {
                  method: "POST",
                  body: JSON.stringify({
                    label: localVersion.label,
                    name: localVersion.label,
                    description: localVersion.description,
                    snapshot: localVersion.snapshot || buildPlaygroundGuardrailVersionSnapshot(normalizedLocalSet),
                    metadata: buildPlaygroundGuardrailBackendMetadata(normalizedLocalSet),
                  }),
                },
                "Failed to migrate guardrail version."
              );
              const createdVersion = normalizePlaygroundGuardrailVersion(versionPayload?.version || versionPayload?.data || versionPayload);
              if (localVersion.status === "active" && createdVersion.id) {
                await requestGuardrailBackendJson(
                  "/guardrails/" + encodeURIComponent(createdSet.id) + "/versions/" + encodeURIComponent(createdVersion.id) + "/publish",
                  {
                    method: "POST",
                    body: JSON.stringify({ snapshot: localVersion.snapshot || buildPlaygroundGuardrailVersionSnapshot(normalizedLocalSet) }),
                  },
                  "Failed to publish migrated guardrail version."
                ).catch(() => null);
              }
            } catch {
              // Keep migrating the rest; failed local entries remain in browser storage for manual recovery.
            }
          }
          return await reloadBackendGuardrailSet(createdSet.id, { select: false });
        }

        async function loadBackendGuardrailSets(options = {}) {
          const normalizedBackendUrl = String(proxyBackendBase || "").replace(/\\/+$/, "");
          if (!normalizedBackendUrl) return [];
          const loadKey = normalizedBackendUrl + "|" + requestHeadersSignature;
          if (!options.force && guardrailsBackendLoadRef.current === loadKey) return guardrailSets;
          if (guardrailsBackendLoadRef.current !== loadKey) {
            guardrailDetailsLoadedRef.current = new Set();
          }
          guardrailsBackendLoadRef.current = loadKey;
          setGuardrailsBackendSyncState({ status: "loading", error: "" });
          try {
            const setsPayload = await requestGuardrailBackendJson(
              "/guardrails?type=custom&limit=500",
              { method: "GET" },
              "Failed to load guardrail sets."
            );
            const backendSets = readPlaygroundGuardrailListFromPayload(setsPayload || {}, ["guardrails", "guardrailSets", "guardrail_sets"])
              .map((set) => normalizePlaygroundGuardrailSet(set))
              .filter((set) => set.id && !isPlaygroundDefaultGuardrailSet(set));
            let detailedSets = await Promise.all(backendSets.map((set) => fetchBackendGuardrailSetDetails(set, { includeVersions: false })));
            if (!detailedSets.length && !guardrailsBackendMigratedLocalRef.current) {
              guardrailsBackendMigratedLocalRef.current = true;
              const localSets = readPlaygroundGuardrailSetsFromStorage()
                .map((set) => ensurePlaygroundGuardrailInitialVersion(normalizePlaygroundGuardrailSet(set)))
                .filter((set) => set.id && !isPlaygroundDefaultGuardrailSet(set));
              if (localSets.length) {
                const migratedSets = [];
                for (const localSet of localSets) {
                  try {
                    const migratedSet = await migrateLocalGuardrailSetToBackend(localSet);
                    if (migratedSet?.id) migratedSets.push(migratedSet);
                  } catch {
                    // Keep migrating the rest; failed local entries remain in browser storage for manual recovery.
                  }
                }
                detailedSets = migratedSets;
              }
            }
            detailedSets = detailedSets
              .map((set) => ensurePlaygroundGuardrailInitialVersion(mergeGuardrailSetWithLocalPromptDrafts(set)))
              .filter((set) => set.id && !isPlaygroundDefaultGuardrailSet(set))
              .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0));
            setGuardrailSets(detailedSets);
            guardrailPersistSignaturesRef.current = new Map(detailedSets.map((set) => [
              set.id,
              JSON.stringify(buildPlaygroundGuardrailBackendPayload(set)),
            ]));
            guardrailsBackendLoadedRef.current = true;
            setGuardrailsBackendSyncState({ status: "idle", error: "" });
            const availableSets = getPlaygroundAllGuardrailSets(detailedSets);
            const selectedStillExists = availableSets.some((set) => set.id === selectedGuardrailSetId);
            if (!selectedStillExists) {
              setSelectedGuardrailSetId(availableSets[0]?.id || "");
              if (!availableSets[0]?.id) {
                setGuardrailsPageMode("overview");
              }
            }
            return detailedSets;
          } catch (error) {
            guardrailsBackendLoadRef.current = "";
            setGuardrailsBackendSyncState({ status: "error", error: error?.message || String(error) });
            return guardrailSets;
          }
        }

        async function persistGuardrailSetToBackend(set) {
          const normalizedSet = ensurePlaygroundGuardrailInitialVersion(normalizePlaygroundGuardrailSet(set));
          if (!normalizedSet.id || isPlaygroundDefaultGuardrailSet(normalizedSet)) return null;
          if (hasPlaygroundGuardrailIncompletePrompts(normalizedSet)) {
            setGuardrailsBackendSyncState({ status: "idle", error: "" });
            return normalizedSet;
          }
          const payload = buildPlaygroundGuardrailBackendPayload(normalizedSet);
          const signature = JSON.stringify(payload);
          if (guardrailPersistSignaturesRef.current.get(normalizedSet.id) === signature) {
            return normalizedSet;
          }
          const data = await requestGuardrailBackendJson(
            "/guardrails/" + encodeURIComponent(normalizedSet.id),
            {
              method: "PATCH",
              body: JSON.stringify(payload),
            },
            "Failed to save guardrail set."
          );
          guardrailPersistSignaturesRef.current.set(normalizedSet.id, signature);
          return normalizePlaygroundGuardrailSet(data?.guardrail || data?.data || data || normalizedSet);
        }

        function schedulePersistGuardrailSet(set, options = {}) {
          const normalizedSet = ensurePlaygroundGuardrailInitialVersion(normalizePlaygroundGuardrailSet(set));
          if (!normalizedSet.id || isPlaygroundDefaultGuardrailSet(normalizedSet) || !String(proxyBackendBase || "").trim()) return;
          if (options.persist === false) return;
          const existingTimer = guardrailPersistTimersRef.current.get(normalizedSet.id);
          if (existingTimer) {
            if (typeof window !== "undefined") {
              window.clearTimeout(existingTimer);
            } else {
              clearTimeout(existingTimer);
            }
            guardrailPersistTimersRef.current.delete(normalizedSet.id);
          }
          if (hasPlaygroundGuardrailIncompletePrompts(normalizedSet)) {
            setGuardrailsBackendSyncState({ status: "idle", error: "" });
            return;
          }
          const delayMs = Math.max(0, Number(options.delayMs ?? 450) || 0);
          const runPersist = () => {
            guardrailPersistTimersRef.current.delete(normalizedSet.id);
            void persistGuardrailSetToBackend(normalizedSet).catch((error) => {
              setGuardrailsBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          };
          if (delayMs === 0) {
            runPersist();
            return;
          }
          const timer = typeof window !== "undefined"
            ? window.setTimeout(runPersist, delayMs)
            : setTimeout(runPersist, delayMs);
          guardrailPersistTimersRef.current.set(normalizedSet.id, timer);
        }

        function applyGuardrailVersionResult(result, options = {}) {
          if (!result?.resource) return null;
          const normalizedSet = ensurePlaygroundGuardrailInitialVersion(normalizePlaygroundGuardrailSet(result.resource));
          replaceGuardrailSetFromBackend(normalizedSet, options);
          setGuardrailVersionState({ status: "idle", message: "", error: "" });
          setGuardrailPublishMenuOpen(false);
          setGuardrailVersionsHeaderMenuOpen(false);
          setOpenGuardrailVersionMenuId("");
          return normalizedSet;
        }

`;

export const METRONOME_APP_RUN_ACTIONS_SCRIPT = `
        function getMetronomeRunEntryThreads(entry) {
          return mergeMetronomeRunEntryThreads(
            Array.isArray(entry?.threads) ? entry.threads : [],
            entry?.latestThread ? [entry.latestThread] : []
          );
        }

        function getMetronomeRunRepresentativeThread(entry) {
          const threads = getMetronomeRunEntryThreads(entry);
          if (entry?.latestThread?.id) {
            return normalizeThreadItem(entry.latestThread);
          }
          return threads[0] || null;
        }

        function getMetronomeRunThreadTimestamp(thread, mode = "updated") {
          const candidate = mode === "created"
            ? (thread?.createdAt || thread?.updatedAt || "")
            : (thread?.updatedAt || thread?.lastMessageAt || thread?.createdAt || "");
          const timestamp = Date.parse(String(candidate || ""));
          return Number.isFinite(timestamp) ? timestamp : 0;
        }

        async function handleMetronomeRunDelete(entry) {
          const groupKey = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
          const metronomeId = String(entry?.metronomeId || entry?.workflowId || "").trim();
          const runId = String(entry?.runId || entry?.workflowRunId || "").trim();
          if (!groupKey || !metronomeId || !runId) {
            return;
          }

          const localThreadIds = getMetronomeRunEntryThreads(entry)
            .map((thread) => String(thread?.id || "").trim())
            .filter(Boolean);

          setMetronomeRunActionMenuState(null);
          setThreadMutationState({
            threadId: groupKey,
            action: "delete-metronome-run",
          });

          try {
            const response = await fetch(proxyBackendBase + "/metronomes/" + encodeURIComponent(metronomeId) + "/runs/" + encodeURIComponent(runId), {
              method: "DELETE",
              headers: authRequestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete Metronome run.");
            }

            const deletedThreadIds = new Set(
              (Array.isArray(data?.deletedThreadIds) && data.deletedThreadIds.length > 0
                ? data.deletedThreadIds
                : localThreadIds
              ).map((threadId) => String(threadId || "").trim()).filter(Boolean)
            );

            setOptimisticMetronomeRunEntries((current) => {
              if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, groupKey)) {
                return current;
              }
              const next = { ...current };
              delete next[groupKey];
              return next;
            });
            setMetronomeRunStatusByKey((current) => {
              if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, groupKey)) {
                return current;
              }
              const next = { ...current };
              delete next[groupKey];
              return next;
            });
            setAbsorbedMetronomeTriggerThreadIds((current) => {
              if (!current || typeof current !== "object") {
                return current;
              }
              const next = { ...current };
              Object.entries(next).forEach(([threadId, absorbedGroupKey]) => {
                if (String(absorbedGroupKey || "").trim() === groupKey || deletedThreadIds.has(threadId)) {
                  delete next[threadId];
                }
              });
              return next;
            });
            setRealThreads((current) => current.filter((thread) => {
              const threadId = String(thread?.id || "").trim();
              if (deletedThreadIds.has(threadId)) {
                return false;
              }
              const meta = getThreadMetronomeMetadata(thread);
              return getSidebarMetronomeRunGroupKey(meta) !== groupKey;
            }));

            if (String(metronomeRunTraceSelection?.key || "").trim() === groupKey) {
              setMetronomeRunTraceSelection(null);
              setMetronomeRunTraceState({ key: "", status: "idle", run: null, error: "" });
              handleNewThread();
            }

            window.dispatchEvent(new CustomEvent("playground:metronome-run-deleted", {
              detail: { metronomeId, runId, deletedThreadIds: Array.from(deletedThreadIds) },
            }));
            void refreshThreads();
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Failed to delete Metronome run.");
          } finally {
            setThreadMutationState({
              threadId: "",
              action: "",
            });
          }
        }

`;

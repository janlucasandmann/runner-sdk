export const APP_HEADER_SEARCH_RESULT_ACTIONS_SCRIPT = `        const THREAD_SEARCH_RESULT_TARGET_QUERY_PARAM = "platformTarget";

        function getThreadSearchResultRecord(mode, resultId) {
          const normalizedMode = String(mode || "").trim();
          const normalizedResultId = String(resultId || "").trim();
          if (!normalizedResultId) return null;
          if (normalizedMode === "threads") {
            return filteredThreadSearchItems.find((item) => String(item?.id || "").trim() === normalizedResultId) || null;
          }
          if (normalizedMode === "files") {
            return filteredThreadSearchFileItems.find((item) => item.key === normalizedResultId) || null;
          }
          if (normalizedMode === "tickets") {
            return filteredThreadSearchTicketItems.find((item) => String(item?.id || "").trim() === normalizedResultId) || null;
          }
          if (normalizedMode === "agents") {
            return filteredThreadSearchAgentItems.find((item) => String(item?.id || "").trim() === normalizedResultId) || null;
          }
          return filteredThreadSearchWorkflowItems.find((item) => String(item?.id || "").trim() === normalizedResultId) || null;
        }

        function getThreadSearchResultActionAvailability(mode, record) {
          if (!record || !hasRealAccess) {
            return { canRename: false, canDelete: false };
          }
          const normalizedMode = String(mode || "").trim();
          if (normalizedMode === "agents") {
            return {
              canRename: !record.isSystem,
              canDelete: !record.isSystem && !record.isDefault,
            };
          }
          if (normalizedMode === "workflows") {
            const builtIn = isMetronomeWorkflowBuiltIn(record);
            const teamShared = isMetronomeWorkflowTeamShared(record);
            return {
              canRename: !builtIn && (!teamShared || canEditMetronomeTeamSharedWorkflow(record)),
              canDelete: !builtIn && !teamShared,
            };
          }
          return { canRename: true, canDelete: true };
        }

        function buildThreadSearchResultNavigationEntry(mode, record) {
          const normalizedMode = String(mode || "").trim();
          if (!record) return null;
          if (normalizedMode === "threads") {
            return {
              page: "thread",
              threadId: String(record.id || "").trim(),
              contentMode: "chat",
            };
          }
          if (normalizedMode === "files") {
            return {
              page: "files",
              environmentId: String(record.environmentId || "").trim(),
              path: normalizeHistoryPath(record.entry?.path || ""),
              isFolder: "false",
              contentMode: "files",
            };
          }
          if (normalizedMode === "tickets") {
            return {
              page: "tasks",
              mode: "project",
              view: "backlog",
              projectId: String(record.projectId || "").trim(),
              taskId: String(record.id || "").trim(),
            };
          }
          if (normalizedMode === "agents") {
            return {
              page: "resources",
              mode: "detail",
              resourceView: "agents",
              resourceId: String(record.id || "").trim(),
            };
          }
          return {
            page: "metronome",
            mode: "detail",
            projectId: String(record.projectId || record.project_id || "").trim(),
            workflowId: String(record.id || "").trim(),
            editorMode: "edit",
          };
        }

        function buildThreadSearchResultNewTabUrl(entry) {
          const normalizedEntry = normalizePlaygroundPlatformNavigationEntry(entry);
          if (!normalizedEntry) {
            throw new Error("This result cannot be opened in a new tab.");
          }
          const target = new URL(window.location.href);
          target.searchParams.delete("thread");
          target.searchParams.delete("threadId");
          target.searchParams.set(
            THREAD_SEARCH_RESULT_TARGET_QUERY_PARAM,
            JSON.stringify(normalizedEntry)
          );
          target.hash = "";
          return target.toString();
        }

        function consumeThreadSearchResultNavigationTarget() {
          try {
            const target = new URL(window.location.href);
            const rawTarget = target.searchParams.get(THREAD_SEARCH_RESULT_TARGET_QUERY_PARAM);
            if (!rawTarget) return null;
            target.searchParams.delete(THREAD_SEARCH_RESULT_TARGET_QUERY_PARAM);
            window.history.replaceState(
              window.history.state,
              "",
              target.pathname + target.search + target.hash
            );
            return normalizePlaygroundPlatformNavigationEntry(JSON.parse(rawTarget));
          } catch {
            return null;
          }
        }

        function openThreadSearchResultInNewTab(mode, resultId) {
          const record = getThreadSearchResultRecord(mode, resultId);
          const entry = buildThreadSearchResultNavigationEntry(mode, record);
          const targetUrl = buildThreadSearchResultNewTabUrl(entry);
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        }

        async function readThreadSearchMutationResponse(response, fallbackMessage) {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || fallbackMessage);
          }
          return data;
        }

        function updateThreadSearchResourceItems(mode, updater) {
          const normalizedMode = String(mode || "").trim();
          setThreadSearchResourceDataByMode((current) => {
            const currentModeState = current[normalizedMode] || {
              scopeKey: threadSearchResourceScopeKey,
              items: [],
            };
            const currentItems = Array.isArray(currentModeState.items)
              ? currentModeState.items
              : [];
            const nextItems = updater(currentItems);
            return {
              ...current,
              [normalizedMode]: {
                ...currentModeState,
                items: Array.isArray(nextItems) ? nextItems : currentItems,
              },
            };
          });
          threadSearchResourceLoadedAtByModeRef.current[normalizedMode] = Date.now();
        }

        function updateThreadSearchThreadCollections(updater) {
          setRealThreads((current) => updater(Array.isArray(current) ? current : []));
          setThreadSearchResourceDataByMode((current) => {
            const currentThreadState = current.threads || {
              scopeKey: threadSearchResourceScopeKey,
              query: "",
              items: [],
              total: 0,
            };
            const currentItems = Array.isArray(currentThreadState.items)
              ? currentThreadState.items
              : [];
            const nextItems = updater(currentItems);
            const removedCount = Math.max(0, currentItems.length - nextItems.length);
            return {
              ...current,
              threads: {
                ...currentThreadState,
                items: nextItems,
                total: Math.max(nextItems.length, Number(currentThreadState.total || 0) - removedCount),
              },
            };
          });
          const nextCache = new Map();
          threadSearchThreadResultsCacheRef.current.forEach((cachedResult, cacheKey) => {
            const currentItems = Array.isArray(cachedResult?.items) ? cachedResult.items : [];
            const nextItems = updater(currentItems);
            const removedCount = Math.max(0, currentItems.length - nextItems.length);
            nextCache.set(cacheKey, {
              ...cachedResult,
              items: nextItems,
              total: Math.max(nextItems.length, Number(cachedResult?.total || 0) - removedCount),
            });
          });
          threadSearchThreadResultsCacheRef.current = nextCache;
        }

        function updateThreadSearchFileInventory(environmentId, updater) {
          const normalizedEnvironmentId = String(environmentId || "").trim();
          if (!normalizedEnvironmentId) return;
          setThreadSearchFileInventoryByEnvironmentId((current) => {
            const currentInventory = Array.isArray(current[normalizedEnvironmentId])
              ? current[normalizedEnvironmentId]
              : [];
            const nextState = {
              ...current,
              [normalizedEnvironmentId]: updater(currentInventory),
            };
            threadSearchFileInventoryByEnvironmentIdRef.current = nextState;
            return nextState;
          });
        }

        function normalizeThreadSearchResultName(value, fallbackMessage) {
          const normalized = String(value || "").trim();
          if (!normalized) {
            throw new Error(fallbackMessage || "Name cannot be empty.");
          }
          return normalized;
        }

        async function renameThreadSearchResult(mode, resultId, requestedTitle) {
          const normalizedMode = String(mode || "").trim();
          const record = getThreadSearchResultRecord(normalizedMode, resultId);
          const availability = getThreadSearchResultActionAvailability(normalizedMode, record);
          if (!record || !availability.canRename) {
            throw new Error("This item cannot be renamed.");
          }

          if (normalizedMode === "threads") {
            const nextTitle = normalizeThreadSearchResultName(requestedTitle, "Thread title cannot be empty.")
              .replace(/\\s+/g, " ");
            const response = await fetch(
              proxyBackendBase + "/threads/" + encodeURIComponent(record.id),
              {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ title: nextTitle }),
              }
            );
            const data = await readThreadSearchMutationResponse(response, "Failed to rename thread.");
            const responseRecord = getPlaygroundThreadResponseRecord(data);
            const updatedThread = normalizeThreadItem({
              ...record,
              ...responseRecord,
              title: String(responseRecord?.title || nextTitle).trim() || nextTitle,
            });
            updateThreadSearchThreadCollections((items) => items.map((item) => (
              String(item?.id || "").trim() === String(record.id || "").trim()
                ? normalizeThreadItem({ ...item, ...updatedThread })
                : item
            )));
            emitThreadMutationSignal("rename", record.id, updatedThread);
            void refreshThreads();
            return updatedThread;
          }

          if (normalizedMode === "files") {
            const entry = record.entry || {};
            const sourcePath = normalizeHistoryPath(entry.path || "");
            const nextName = buildPlaygroundProtectedFilename(
              entry.name || sourcePath.split("/").filter(Boolean).pop() || "",
              requestedTitle,
              false
            );
            if (!sourcePath || !nextName) {
              throw new Error("File name cannot be empty.");
            }
            const parentPath = getPlaygroundEntryParentPath(sourcePath);
            const destPath = normalizeHistoryPath(
              [parentPath, nextName].filter(Boolean).join("/")
            );
            if (destPath === sourcePath) return entry;
            const response = await fetch(
              proxyBackendBase
                + "/environments/"
                + encodeURIComponent(record.environmentId)
                + "/files/move",
              {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ sourcePath, destPath }),
              }
            );
            await readThreadSearchMutationResponse(response, "Failed to rename file.");
            const updatedEntry = {
              ...entry,
              id: destPath,
              name: nextName,
              path: destPath,
              modifiedTime: new Date().toISOString(),
            };
            updateThreadSearchFileInventory(record.environmentId, (items) => items.map((item) => (
              normalizeHistoryPath(item?.path || "") === sourcePath ? updatedEntry : item
            )));
            return updatedEntry;
          }

          if (normalizedMode === "tickets") {
            const nextTitle = normalizeThreadSearchResultName(requestedTitle, "Ticket title cannot be empty.")
              .replace(/\\s+/g, " ");
            const response = await fetch(
              proxyBackendBase + "/tasks/" + encodeURIComponent(record.id),
              {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ title: nextTitle }),
              }
            );
            const data = await readThreadSearchMutationResponse(response, "Failed to rename ticket.");
            const responseRecord = getPlaygroundTaskResponseRecord(data);
            const updatedTask = normalizePlaygroundTaskRecord({
              ...record,
              ...(responseRecord || {}),
              title: String(responseRecord?.title || nextTitle).trim() || nextTitle,
            });
            updateThreadSearchResourceItems("tickets", (items) => items.map((item) => (
              String(item?.id || "").trim() === String(record.id || "").trim()
                ? updatedTask
                : item
            )));
            setWelcomeWidgetsState((current) => ({
              ...current,
              tasks: Array.isArray(current?.tasks)
                ? current.tasks.map((item) => (
                    String(item?.id || "").trim() === String(record.id || "").trim()
                      ? { ...item, ...updatedTask }
                      : item
                  ))
                : current?.tasks,
            }));
            return updatedTask;
          }

          if (normalizedMode === "agents") {
            const nextName = normalizeThreadSearchResultName(requestedTitle, "Agent name cannot be empty.")
              .replace(/\\s+/g, " ");
            const response = await fetch(
              proxyBackendBase + "/agents/" + encodeURIComponent(record.id),
              {
                method: "PATCH",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ name: nextName }),
              }
            );
            const data = await readThreadSearchMutationResponse(response, "Failed to rename agent.");
            const responseRecord = getPlaygroundAgentResponseRecord(data);
            const updatedAgent = normalizePlaygroundAgentRecord({
              ...record,
              ...(responseRecord || {}),
              name: String(responseRecord?.name || nextName).trim() || nextName,
            });
            updateThreadSearchResourceItems("agents", (items) => items.map((item) => (
              String(item?.id || "").trim() === String(record.id || "").trim()
                ? updatedAgent
                : item
            )));
            setRealAgents((current) => (Array.isArray(current) ? current : []).map((item) => (
              String(item?.id || "").trim() === String(record.id || "").trim()
                ? updatedAgent
                : item
            )));
            return updatedAgent;
          }

          const nextName = normalizeThreadSearchResultName(requestedTitle, "Workflow name cannot be empty.")
            .replace(/\\s+/g, " ");
          const response = await fetch(
            proxyBackendBase + "/metronomes/" + encodeURIComponent(record.id),
            {
              method: "PATCH",
              headers: {
                ...authRequestHeaders,
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ name: nextName }),
            }
          );
          const data = await readThreadSearchMutationResponse(response, "Failed to rename workflow.");
          const responseRecord = data?.data || data?.metronome || data?.workflow || data;
          const updatedWorkflow = normalizeMetronomeWorkflow({
            ...record,
            ...(responseRecord && typeof responseRecord === "object" ? responseRecord : {}),
            name: String(responseRecord?.name || nextName).trim() || nextName,
          });
          updateThreadSearchResourceItems("workflows", (items) => items.map((item) => (
            String(item?.id || "").trim() === String(record.id || "").trim()
              ? updatedWorkflow
              : item
          )));
          return updatedWorkflow;
        }

        async function deleteThreadSearchResult(mode, resultId) {
          const normalizedMode = String(mode || "").trim();
          const record = getThreadSearchResultRecord(normalizedMode, resultId);
          const availability = getThreadSearchResultActionAvailability(normalizedMode, record);
          if (!record || !availability.canDelete) {
            throw new Error("This item cannot be deleted.");
          }

          if (normalizedMode === "threads") {
            const response = await fetch(
              proxyBackendBase + "/threads/" + encodeURIComponent(record.id),
              {
                method: "DELETE",
                headers: authRequestHeaders,
                credentials: "include",
              }
            );
            await readThreadSearchMutationResponse(response, "Failed to delete thread.");
            updateThreadSearchThreadCollections((items) => items.filter((item) => (
              String(item?.id || "").trim() !== String(record.id || "").trim()
            )));
            emitThreadMutationSignal("delete", record.id, null);
            if (currentThreadId === record.id) {
              handleNewThread();
            }
            void refreshThreads();
            return true;
          }

          if (normalizedMode === "files") {
            const filePath = normalizeHistoryPath(record.entry?.path || "");
            const encodedPath = filePath
              .split("/")
              .filter(Boolean)
              .map((segment) => encodeURIComponent(segment))
              .join("/");
            const response = await fetch(
              proxyBackendBase
                + "/environments/"
                + encodeURIComponent(record.environmentId)
                + "/files/"
                + encodedPath,
              {
                method: "DELETE",
                headers: authRequestHeaders,
                credentials: "include",
              }
            );
            await readThreadSearchMutationResponse(response, "Failed to delete file.");
            updateThreadSearchFileInventory(record.environmentId, (items) => items.filter((item) => (
              normalizeHistoryPath(item?.path || "") !== filePath
            )));
            return true;
          }

          if (normalizedMode === "tickets") {
            const response = await fetch(
              proxyBackendBase + "/tasks/" + encodeURIComponent(record.id),
              {
                method: "DELETE",
                headers: authRequestHeaders,
                credentials: "include",
              }
            );
            await readThreadSearchMutationResponse(response, "Failed to delete ticket.");
            updateThreadSearchResourceItems("tickets", (items) => items.filter((item) => (
              String(item?.id || "").trim() !== String(record.id || "").trim()
            )));
            setWelcomeWidgetsState((current) => ({
              ...current,
              tasks: Array.isArray(current?.tasks)
                ? current.tasks.filter((item) => (
                    String(item?.id || "").trim() !== String(record.id || "").trim()
                  ))
                : current?.tasks,
            }));
            return true;
          }

          if (normalizedMode === "agents") {
            const response = await fetch(
              proxyBackendBase + "/agents/" + encodeURIComponent(record.id),
              {
                method: "DELETE",
                headers: authRequestHeaders,
                credentials: "include",
              }
            );
            await readThreadSearchMutationResponse(response, "Failed to delete agent.");
            updateThreadSearchResourceItems("agents", (items) => items.filter((item) => (
              String(item?.id || "").trim() !== String(record.id || "").trim()
            )));
            setRealAgents((current) => (Array.isArray(current) ? current : []).filter((item) => (
              String(item?.id || "").trim() !== String(record.id || "").trim()
            )));
            return true;
          }

          const response = await fetch(
            proxyBackendBase + "/metronomes/" + encodeURIComponent(record.id),
            {
              method: "DELETE",
              headers: authRequestHeaders,
              credentials: "include",
            }
          );
          await readThreadSearchMutationResponse(response, "Failed to delete workflow.");
          updateThreadSearchResourceItems("workflows", (items) => items.filter((item) => (
            String(item?.id || "").trim() !== String(record.id || "").trim()
          )));
          return true;
        }
`;

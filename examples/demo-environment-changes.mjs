export const ENVIRONMENT_CHANGES_CSS = String.raw`
      .playground-files-topbar-mode-switch {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }

      .playground-environment-changes-view {
        display: grid;
        grid-template-columns: minmax(360px, 0.92fr) minmax(0, 1.08fr);
        gap: 16px;
        min-height: 0;
        height: 100%;
      }

      .playground-environment-changes-column {
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-environment-changes-panel {
        min-height: 0;
        flex: 1 1 auto;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.03);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }

      .playground-environment-changes-panel.is-plain {
        background: transparent;
        box-shadow: none;
        border-radius: 0;
      }

      .playground-environment-changes-empty,
      .playground-environment-changes-loading {
        min-height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
        color: rgba(255, 255, 255, 0.52);
        font-size: 13px;
        line-height: 1.6;
      }

      .playground-environment-changes-loading {
        gap: 10px;
      }

      .playground-environment-changes-list {
        min-height: 0;
        height: 100%;
        overflow: auto;
        padding: 12px;
      }

      .playground-environment-changes-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-environment-changes-group + .playground-environment-changes-group {
        margin-top: 18px;
      }

      .playground-environment-changes-group-heading {
        position: sticky;
        top: 0;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        min-height: 26px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        -webkit-backdrop-filter: blur(24px);
        backdrop-filter: blur(24px);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.03em;
        color: rgba(255, 255, 255, 0.52);
        width: fit-content;
      }

      .playground-environment-change-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.025);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
      }

      .playground-environment-change-card.is-active {
        background: rgba(255, 255, 255, 0.05);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      }

      .playground-environment-change-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-environment-change-card-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-environment-change-card-title {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-environment-change-card-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-environment-change-card-time {
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.46);
      }

      .playground-environment-change-file-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-environment-change-file-row {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border: 0;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        color: inherit;
        cursor: pointer;
        text-align: left;
      }

      .playground-environment-change-file-row:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-environment-change-file-row.is-active {
        background: rgba(255, 255, 255, 0.09);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
      }

      .playground-environment-change-file-main {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-environment-change-file-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-environment-change-file-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        line-height: 1.45;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-environment-change-file-path {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-environment-change-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 22px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 11px;
        line-height: 1;
        font-weight: 600;
        letter-spacing: 0.02em;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.74);
        text-transform: capitalize;
      }

      .playground-environment-change-badge.is-created,
      .playground-environment-change-badge.is-uploaded {
        color: #8ec3ff;
      }

      .playground-environment-change-badge.is-modified {
        color: #d9d9ff;
      }

      .playground-environment-change-badge.is-deleted {
        color: #ff9ea2;
      }

      .playground-environment-change-file-stats {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        line-height: 1;
      }

      .playground-environment-change-file-stat.is-added {
        color: #87c3ff;
      }

      .playground-environment-change-file-stat.is-removed {
        color: #ff9ea2;
      }

      .playground-environment-changes-detail {
        min-height: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-environment-changes-detail-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px 18px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-environment-changes-detail-title-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-environment-changes-detail-title {
        margin: 0;
        font-size: 15px;
        line-height: 1.4;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-environment-changes-detail-subtitle {
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-environment-changes-detail-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .playground-environment-changes-detail-button {
        min-height: 32px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.88);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 500;
      }

      .playground-environment-changes-detail-button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .playground-environment-changes-detail-body {
        min-height: 0;
        flex: 1 1 auto;
        overflow: auto;
        padding: 18px;
      }

      .playground-environment-changes-detail-context {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-environment-changes-detail-context-chip {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-environment-changes-detail-message {
        margin-top: 10px;
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-environment-changes-detail-message.is-error {
        color: #ff9ea2;
      }
`;

export const ENVIRONMENT_CHANGES_SCRIPT = String.raw`
      function normalizeEnvironmentChangePath(value) {
        if (typeof value !== "string") {
          return "";
        }
        return value.replace(/^\/+|\/+$/g, "").trim();
      }

      function normalizeEnvironmentChangeKind(value) {
        const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
        if (normalized === "deleted") return "deleted";
        if (normalized === "modified") return "modified";
        return "created";
      }

      function normalizeEnvironmentChangeOperation(value) {
        const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
        if (normalized === "uploaded") return "uploaded";
        if (normalized === "modified") return "modified";
        if (normalized === "deleted") return "deleted";
        return "created";
      }

      function deriveEnvironmentChangeOperation(routeSource, changeKind) {
        const normalizedRouteSource = typeof routeSource === "string" ? routeSource.trim().toLowerCase() : "";
        if (normalizedRouteSource.includes("files.upload") && changeKind === "created") {
          return "uploaded";
        }
        if (changeKind === "deleted") return "deleted";
        if (changeKind === "modified") return "modified";
        return "created";
      }

      function readEnvironmentChangeFilesFromSnapshot(snapshot) {
        const metadata = snapshot?.metadata && typeof snapshot.metadata === "object" && !Array.isArray(snapshot.metadata)
          ? snapshot.metadata
          : {};
        const routeSource = typeof metadata.routeSource === "string" ? metadata.routeSource.trim() : "";
        const changeOperations = Array.isArray(metadata.changeOperations) ? metadata.changeOperations : [];
        const files = [];

        changeOperations.forEach((entry) => {
          if (!entry || typeof entry !== "object") {
            return;
          }
          const normalizedPath = normalizeEnvironmentChangePath(entry.path);
          if (!normalizedPath) {
            return;
          }
          files.push({
            path: normalizedPath,
            name: normalizedPath.split("/").pop() || normalizedPath,
            changeKind: normalizeEnvironmentChangeKind(entry.changeKind),
            operation: normalizeEnvironmentChangeOperation(entry.operation),
            entryType: entry.entryType === "directory" ? "directory" : "file",
            previousPath: normalizeEnvironmentChangePath(entry.previousPath) || "",
            additions: Number.isFinite(Number(entry.additions)) ? Number(entry.additions) : 0,
            deletions: Number.isFinite(Number(entry.deletions)) ? Number(entry.deletions) : 0,
          });
        });

        if (files.length > 0) {
          return files;
        }

        const filePaths = Array.isArray(metadata.filePaths) ? metadata.filePaths : [];
        const changeKinds = Array.isArray(metadata.changeKinds) ? metadata.changeKinds : [];
        const diffs = metadata.diffs && typeof metadata.diffs === "object" ? metadata.diffs : {};

        filePaths.forEach((candidatePath, index) => {
          const normalizedPath = normalizeEnvironmentChangePath(candidatePath);
          if (!normalizedPath) {
            return;
          }
          const changeKind = normalizeEnvironmentChangeKind(changeKinds[index]);
          const diffEntry = diffs[normalizedPath] && typeof diffs[normalizedPath] === "object" ? diffs[normalizedPath] : {};
          files.push({
            path: normalizedPath,
            name: normalizedPath.split("/").pop() || normalizedPath,
            changeKind,
            operation: deriveEnvironmentChangeOperation(routeSource, changeKind),
            entryType: "file",
            previousPath: "",
            additions: Number.isFinite(Number(diffEntry.additions)) ? Number(diffEntry.additions) : 0,
            deletions: Number.isFinite(Number(diffEntry.deletions)) ? Number(diffEntry.deletions) : 0,
          });
        });

        if (files.length > 0) {
          return files;
        }

        return (Array.isArray(snapshot?.changedPaths) ? snapshot.changedPaths : [])
          .map((candidatePath) => normalizeEnvironmentChangePath(candidatePath))
          .filter(Boolean)
          .map((normalizedPath) => ({
            path: normalizedPath,
            name: normalizedPath.split("/").pop() || normalizedPath,
            changeKind: "modified",
            operation: "modified",
            entryType: "file",
            previousPath: "",
            additions: 0,
            deletions: 0,
          }));
      }

      function buildEnvironmentChangeTitle(entry) {
        const normalizedTitle = typeof entry?.title === "string" ? entry.title.trim() : "";
        if (normalizedTitle) {
          return normalizedTitle;
        }
        const files = Array.isArray(entry?.files) ? entry.files : [];
        if (files.length === 1) {
          const file = files[0];
          return (file.operation[0].toUpperCase() + file.operation.slice(1)) + " " + (file.path || file.name || "file");
        }
        return files.length > 0 ? String(files.length) + " file changes" : "Environment change";
      }

      function buildEnvironmentChangeSummary(entry) {
        const parts = [];
        if (entry?.agentName) {
          parts.push(entry.agentName);
        } else if (entry?.sourceKind === "manual") {
          parts.push("Manual change");
        }
        if (entry?.projectName) {
          parts.push(entry.projectName);
        }
        if (entry?.threadTitle) {
          parts.push(entry.threadTitle);
        }
        return parts.join(" · ");
      }

      async function fetchEnvironmentChangesListViaApi({ backendUrl, environmentId, headers }) {
        const response = await fetch(
          backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/changes?limit=500",
          {
            method: "GET",
            headers,
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data?.message || data?.error || "Failed to load environment changes.");
          error.status = response.status;
          throw error;
        }
        const items = Array.isArray(data?.data) ? data.data : [];
        return items.map((entry) => ({
          id: String(entry?.id || entry?.snapshotId || ""),
          snapshotId: String(entry?.snapshotId || entry?.id || ""),
          environmentId: String(entry?.environmentId || environmentId),
          createdAt: String(entry?.createdAt || ""),
          title: buildEnvironmentChangeTitle(entry),
          routeSource: typeof entry?.routeSource === "string" ? entry.routeSource : "",
          sourceKind: entry?.sourceKind === "manual" ? "manual" : "thread",
          sourceThreadId: typeof entry?.sourceThreadId === "string" ? entry.sourceThreadId : "",
          sourceStepId: typeof entry?.sourceStepId === "string" ? entry.sourceStepId : "",
          threadTitle: typeof entry?.threadTitle === "string" ? entry.threadTitle : "",
          projectId: typeof entry?.projectId === "string" ? entry.projectId : "",
          projectName: typeof entry?.projectName === "string" ? entry.projectName : "",
          agentId: typeof entry?.agentId === "string" ? entry.agentId : "",
          agentName: typeof entry?.agentName === "string" ? entry.agentName : "",
          additions: Number.isFinite(Number(entry?.additions)) ? Number(entry.additions) : 0,
          deletions: Number.isFinite(Number(entry?.deletions)) ? Number(entry.deletions) : 0,
          files: Array.isArray(entry?.files) ? entry.files.map((file) => ({
            path: normalizeEnvironmentChangePath(file?.path),
            name: typeof file?.name === "string" && file.name.trim() ? file.name.trim() : (normalizeEnvironmentChangePath(file?.path).split("/").pop() || "File"),
            changeKind: normalizeEnvironmentChangeKind(file?.changeKind),
            operation: normalizeEnvironmentChangeOperation(file?.operation),
            entryType: file?.entryType === "directory" ? "directory" : "file",
            previousPath: normalizeEnvironmentChangePath(file?.previousPath),
            additions: Number.isFinite(Number(file?.additions)) ? Number(file.additions) : 0,
            deletions: Number.isFinite(Number(file?.deletions)) ? Number(file.deletions) : 0,
          })) : [],
        }));
      }

      async function fetchEnvironmentChangesListFromSnapshots({ backendUrl, environmentId, headers, projects }) {
        const [snapshotsResponse, threadsResponse, agentsResponse] = await Promise.all([
          fetch(backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/snapshots?limit=500", {
            method: "GET",
            headers,
          }),
          fetch(backendUrl + "/threads?limit=500", {
            method: "GET",
            headers,
          }),
          fetch(backendUrl + "/agents", {
            method: "GET",
            headers,
          }),
        ]);

        const [snapshotsData, threadsData, agentsData] = await Promise.all([
          snapshotsResponse.json().catch(() => ({})),
          threadsResponse.json().catch(() => ({})),
          agentsResponse.json().catch(() => ({})),
        ]);

        if (!snapshotsResponse.ok) {
          throw new Error(snapshotsData?.message || snapshotsData?.error || "Failed to load environment snapshots.");
        }

        const snapshots = Array.isArray(snapshotsData?.data) ? snapshotsData.data : [];
        const threads = normalizeThreadList(Array.isArray(threadsData?.data) ? threadsData.data : Array.isArray(threadsData?.threads) ? threadsData.threads : []);
        const agents = parsePlaygroundAgentListResponse(agentsData);
        const threadsById = new Map(threads.map((thread) => [thread.id, thread]));
        const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
        const projectsById = new Map((Array.isArray(projects) ? projects : []).map((project) => [String(project?.id || ""), project]));

        return snapshots
          .filter((snapshot) => {
            const metadata = snapshot?.metadata && typeof snapshot.metadata === "object" && !Array.isArray(snapshot.metadata)
              ? snapshot.metadata
              : null;
            return metadata?.baseline !== true;
          })
          .map((snapshot) => {
            const safeThread = snapshot?.sourceThreadId ? threadsById.get(String(snapshot.sourceThreadId || "")) || null : null;
            const projectId = safeThread?.projectId || "";
            const agentId = safeThread?.agentId || "";
            const safeProject = projectId ? projectsById.get(projectId) || null : null;
            const safeAgent = agentId ? agentsById.get(agentId) || null : null;
            const files = readEnvironmentChangeFilesFromSnapshot(snapshot);
            return {
              id: String(snapshot?.id || ""),
              snapshotId: String(snapshot?.id || ""),
              environmentId: String(snapshot?.environmentId || environmentId),
              createdAt: String(snapshot?.createdAt || ""),
              title: buildEnvironmentChangeTitle({
                files,
                title: safeThread?.title || "",
              }),
              routeSource: typeof snapshot?.metadata?.routeSource === "string" ? snapshot.metadata.routeSource : "",
              sourceKind: snapshot?.sourceThreadId ? "thread" : "manual",
              sourceThreadId: typeof snapshot?.sourceThreadId === "string" ? snapshot.sourceThreadId : "",
              sourceStepId: typeof snapshot?.sourceStepId === "string" ? snapshot.sourceStepId : "",
              threadTitle: safeThread?.title || "",
              projectId,
              projectName: safeProject?.name || "",
              agentId,
              agentName: safeAgent?.name || "",
              additions: Number.isFinite(Number(snapshot?.additions)) ? Number(snapshot.additions) : 0,
              deletions: Number.isFinite(Number(snapshot?.deletions)) ? Number(snapshot.deletions) : 0,
              files,
            };
          });
      }

      async function fetchEnvironmentChangesList(params) {
        try {
          return await fetchEnvironmentChangesListViaApi(params);
        } catch (error) {
          if (Number(error?.status || 0) !== 404) {
            return await fetchEnvironmentChangesListFromSnapshots(params);
          }
          return await fetchEnvironmentChangesListFromSnapshots(params);
        }
      }

      async function fetchEnvironmentChangeDiff({ backendUrl, environmentId, changeId, path, headers }) {
        const encodedPath = encodeURIComponent(normalizeEnvironmentChangePath(path));
        const primaryPath = backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/changes/" + encodeURIComponent(changeId) + "/diff?path=" + encodedPath;
        const fallbackPath = backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/snapshots/" + encodeURIComponent(changeId) + "/diff?path=" + encodedPath;
        for (const targetUrl of [primaryPath, fallbackPath]) {
          const response = await fetch(targetUrl, { method: "GET", headers });
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            return data;
          }
          if (response.status !== 404) {
            throw new Error(data?.message || data?.error || "Failed to load change diff.");
          }
        }
        return { diff: "", additions: 0, deletions: 0, changedPaths: [] };
      }

      async function fetchEnvironmentChangeFile({ backendUrl, environmentId, changeId, path, headers }) {
        const encodedPath = encodeURIComponent(normalizeEnvironmentChangePath(path));
        const primaryPath = backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/changes/" + encodeURIComponent(changeId) + "/file?path=" + encodedPath;
        const fallbackPath = backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/snapshots/" + encodeURIComponent(changeId) + "/file?path=" + encodedPath;
        for (const targetUrl of [primaryPath, fallbackPath]) {
          const response = await fetch(targetUrl, { method: "GET", headers });
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            return typeof data?.content === "string" ? data.content : "";
          }
          if (response.status !== 404) {
            throw new Error(data?.message || data?.error || "Failed to load change file.");
          }
        }
        return "";
      }

      function EnvironmentChangesPage({
        backendUrl,
        requestHeaders,
        environmentId,
        environmentName,
        availableProjects,
        projectFilterScope,
        operationFilter,
        actorFilter,
        onAvailableActorsChange,
        onShowInFiles,
      }) {
        const [changes, setChanges] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [selectedChangeId, setSelectedChangeId] = useState("");
        const [selectedFilePath, setSelectedFilePath] = useState("");
        const [detailDiff, setDetailDiff] = useState(null);
        const [detailFileContent, setDetailFileContent] = useState("");
        const [detailLoading, setDetailLoading] = useState(false);
        const [detailError, setDetailError] = useState("");
        const [forkState, setForkState] = useState({ status: "", message: "" });

        useEffect(() => {
          let cancelled = false;
          setLoading(true);
          setError("");
          setChanges([]);
          setSelectedChangeId("");
          setSelectedFilePath("");
          setDetailDiff(null);
          setDetailFileContent("");
          setDetailError("");
          setForkState({ status: "", message: "" });

          if (!environmentId) {
            setLoading(false);
            return () => {
              cancelled = true;
            };
          }

          void fetchEnvironmentChangesList({
            backendUrl,
            environmentId,
            headers: requestHeaders,
            projects: availableProjects,
          }).then((items) => {
            if (cancelled) {
              return;
            }
            const nextItems = (Array.isArray(items) ? items : []).slice().sort((left, right) => {
              const leftTime = Date.parse(left?.createdAt || "") || 0;
              const rightTime = Date.parse(right?.createdAt || "") || 0;
              return rightTime - leftTime;
            });
            setChanges(nextItems);
            setError("");
          }).catch((nextError) => {
            if (cancelled) {
              return;
            }
            setChanges([]);
            setError(nextError instanceof Error ? nextError.message : "Failed to load environment changes.");
          }).finally(() => {
            if (!cancelled) {
              setLoading(false);
            }
          });

          return () => {
            cancelled = true;
          };
        }, [availableProjects, backendUrl, environmentId, requestHeaders]);

        const scopedChanges = useMemo(() => {
          return changes.filter((change) => {
            if (projectFilterScope) {
              if (projectFilterScope === "__all__") {
                if (!change.projectId) {
                  return false;
                }
              } else if (change.projectId !== projectFilterScope) {
                return false;
              }
            }
            if (operationFilter && operationFilter !== "all") {
              if (!Array.isArray(change.files) || !change.files.some((file) => file.operation === operationFilter)) {
                return false;
              }
            }
            return true;
          });
        }, [changes, operationFilter, projectFilterScope]);

        const actorOptions = useMemo(() => {
          const options = [];
          const seenIds = new Set();
          const hasManual = scopedChanges.some((change) => change.sourceKind === "manual");
          scopedChanges.forEach((change) => {
            const normalizedAgentId = String(change?.agentId || "").trim();
            if (!normalizedAgentId || seenIds.has(normalizedAgentId)) {
              return;
            }
            seenIds.add(normalizedAgentId);
            options.push({
              id: normalizedAgentId,
              label: change.agentName || "Agent",
            });
          });
          options.sort((left, right) => left.label.localeCompare(right.label));
          if (hasManual) {
            options.push({ id: "__manual__", label: "Manual changes" });
          }
          return options;
        }, [scopedChanges]);

        useEffect(() => {
          onAvailableActorsChange?.(actorOptions);
        }, [actorOptions, onAvailableActorsChange]);

        const filteredChanges = useMemo(() => {
          if (!actorFilter || actorFilter === "__all__") {
            return scopedChanges;
          }
          return scopedChanges.filter((change) => {
            if (actorFilter === "__manual__") {
              return change.sourceKind === "manual";
            }
            return change.agentId === actorFilter;
          });
        }, [actorFilter, scopedChanges]);

        const groupedChanges = useMemo(() => {
          const groups = [];
          let currentGroup = null;
          filteredChanges.forEach((change) => {
            const groupKey = getHistoryDateGroupKey(change.createdAt);
            if (!currentGroup || currentGroup.key !== groupKey) {
              currentGroup = {
                key: groupKey,
                label: formatHistoryDateHeading(change.createdAt),
                items: [],
              };
              groups.push(currentGroup);
            }
            currentGroup.items.push(change);
          });
          return groups;
        }, [filteredChanges]);

        const selectedChange = useMemo(
          () => filteredChanges.find((change) => change.id === selectedChangeId) || null,
          [filteredChanges, selectedChangeId]
        );
        const selectedFile = useMemo(
          () => (selectedChange?.files || []).find((file) => normalizeHistoryPath(file.path) === normalizeHistoryPath(selectedFilePath)) || null,
          [selectedChange, selectedFilePath]
        );

        useEffect(() => {
          if (filteredChanges.length === 0) {
            setSelectedChangeId("");
            setSelectedFilePath("");
            return;
          }
          if (selectedChangeId && filteredChanges.some((change) => change.id === selectedChangeId)) {
            return;
          }
          const firstChange = filteredChanges[0];
          setSelectedChangeId(firstChange.id);
          setSelectedFilePath(firstChange.files[0]?.path || "");
        }, [filteredChanges, selectedChangeId]);

        useEffect(() => {
          if (!selectedChange) {
            setSelectedFilePath("");
            return;
          }
          if (selectedFile && selectedChange.files.some((file) => normalizeHistoryPath(file.path) === normalizeHistoryPath(selectedFile.path))) {
            return;
          }
          setSelectedFilePath(selectedChange.files[0]?.path || "");
        }, [selectedChange, selectedFile]);

        useEffect(() => {
          let cancelled = false;
          setDetailLoading(true);
          setDetailDiff(null);
          setDetailFileContent("");
          setDetailError("");
          setForkState({ status: "", message: "" });

          if (!selectedChange || !selectedFile || !environmentId) {
            setDetailLoading(false);
            return () => {
              cancelled = true;
            };
          }

          void (async () => {
            try {
              const nextDiff = await fetchEnvironmentChangeDiff({
                backendUrl,
                environmentId,
                changeId: selectedChange.id,
                path: selectedFile.path,
                headers: requestHeaders,
              });
              const nextFileContent = selectedFile.changeKind === "deleted"
                ? ""
                : await fetchEnvironmentChangeFile({
                    backendUrl,
                    environmentId,
                    changeId: selectedChange.id,
                    path: selectedFile.path,
                    headers: requestHeaders,
                  });
              if (cancelled) {
                return;
              }
              setDetailDiff(nextDiff);
              setDetailFileContent(nextFileContent);
              setDetailError("");
            } catch (nextError) {
              if (cancelled) {
                return;
              }
              setDetailDiff(null);
              setDetailFileContent("");
              setDetailError(nextError instanceof Error ? nextError.message : "Failed to load change detail.");
            } finally {
              if (!cancelled) {
                setDetailLoading(false);
              }
            }
          })();

          return () => {
            cancelled = true;
          };
        }, [backendUrl, environmentId, requestHeaders, selectedChange, selectedFile]);

        async function handleForkFromChange() {
          if (!selectedChange || !environmentId || forkState.status === "loading") {
            return;
          }
          setForkState({ status: "loading", message: "" });
          try {
            const response = await fetch(
              backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/changes/" + encodeURIComponent(selectedChange.id) + "/fork",
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: (environmentName || "Environment") + " Fork",
                }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to fork environment.");
            }
            setForkState({
              status: "success",
              message: data?.environment?.name
                ? "Fork created: " + data.environment.name
                : "Environment fork created.",
            });
          } catch (error) {
            setForkState({
              status: "error",
              message: error instanceof Error ? error.message : "Failed to fork environment.",
            });
          }
        }

        const detailDiffText = typeof detailDiff?.diff === "string" && detailDiff.diff.trim()
          ? detailDiff.diff
          : buildSyntheticHistoryDiff({
              filePath: selectedFile?.path,
              fileContent: detailFileContent,
              changeKind: selectedFile?.changeKind,
            });
        const diffStats = detailDiffText ? summarizeUnifiedDiffStats(detailDiffText) : { additions: 0, deletions: 0 };
        const additions = Number.isFinite(Number(detailDiff?.additions)) && Number(detailDiff?.additions) > 0
          ? Number(detailDiff.additions)
          : Number.isFinite(Number(selectedFile?.additions)) && Number(selectedFile?.additions) > 0
            ? Number(selectedFile.additions)
            : diffStats.additions;
        const deletions = Number.isFinite(Number(detailDiff?.deletions)) && Number(detailDiff?.deletions) > 0
          ? Number(detailDiff.deletions)
          : Number.isFinite(Number(selectedFile?.deletions)) && Number(selectedFile?.deletions) > 0
            ? Number(selectedFile.deletions)
            : diffStats.deletions;

        return React.createElement("div", { className: "playground-environment-changes-view" },
          React.createElement("div", { className: "playground-environment-changes-column" },
            React.createElement("section", { className: "playground-environment-changes-panel" },
              loading
                ? React.createElement("div", { className: "playground-environment-changes-loading" },
                    React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                    React.createElement("span", null, "Loading environment changes...")
                  )
                : error
                  ? React.createElement("div", { className: "playground-environment-changes-empty" }, error)
                  : filteredChanges.length === 0
                    ? React.createElement("div", { className: "playground-environment-changes-empty" }, "No file changes have been recorded for this environment yet.")
                    : React.createElement("div", { className: "playground-environment-changes-list" },
                        groupedChanges.map((group) =>
                          React.createElement("section", { key: group.key, className: "playground-environment-changes-group" },
                            React.createElement("div", { className: "playground-environment-changes-group-heading" }, group.label),
                            group.items.map((change) =>
                              React.createElement("article", {
                                  key: change.id,
                                  className: "playground-environment-change-card" + (selectedChange?.id === change.id ? " is-active" : ""),
                                },
                                  React.createElement("div", { className: "playground-environment-change-card-header" },
                                    React.createElement("div", { className: "playground-environment-change-card-copy" },
                                      React.createElement("h3", { className: "playground-environment-change-card-title" }, buildEnvironmentChangeTitle(change)),
                                      buildEnvironmentChangeSummary(change)
                                        ? React.createElement("div", { className: "playground-environment-change-card-meta" }, buildEnvironmentChangeSummary(change))
                                        : null
                                    ),
                                    React.createElement("div", { className: "playground-environment-change-card-time" }, formatHistoryTimestamp(change.createdAt))
                                  ),
                                  React.createElement("div", { className: "playground-environment-change-file-list" },
                                    (Array.isArray(change.files) ? change.files : []).map((file) =>
                                      React.createElement("button", {
                                          key: change.id + ":" + file.path,
                                          type: "button",
                                          className: "playground-environment-change-file-row" + (selectedChange?.id === change.id && selectedFile && historyPathsMatch(selectedFile.path, file.path) ? " is-active" : ""),
                                          onClick: () => {
                                            setSelectedChangeId(change.id);
                                            setSelectedFilePath(file.path);
                                          },
                                        },
                                          React.createElement("div", { className: "playground-environment-change-file-main" },
                                            React.createElement(PlaygroundFileIcon, {
                                              entry: {
                                                path: file.path,
                                                name: file.name,
                                                isFolder: file.entryType === "directory",
                                              },
                                            }),
                                            React.createElement("div", { className: "playground-environment-change-file-copy" },
                                              React.createElement("div", { className: "playground-environment-change-file-title" }, file.name || file.path),
                                              React.createElement("div", { className: "playground-environment-change-file-path" }, "/" + file.path)
                                            )
                                          ),
                                          React.createElement("span", { className: "playground-environment-change-badge is-" + file.operation }, file.operation),
                                          React.createElement("span", { className: "playground-environment-change-file-stats" },
                                            typeof file.additions === "number" && file.additions > 0
                                              ? React.createElement("span", { className: "playground-environment-change-file-stat is-added" }, "+" + file.additions)
                                              : null,
                                            typeof file.deletions === "number" && file.deletions > 0
                                              ? React.createElement("span", { className: "playground-environment-change-file-stat is-removed" }, "-" + file.deletions)
                                              : null
                                          )
                                        )
                                    )
                                  )
                                )
                            )
                          )
                        )
                      )
            )
          ),
          React.createElement("div", { className: "playground-environment-changes-column" },
            React.createElement("section", { className: "playground-environment-changes-panel playground-environment-changes-detail" },
              !selectedChange || !selectedFile
                ? React.createElement("div", { className: "playground-environment-changes-empty" }, "Select a change to inspect its diff and file state.")
                : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-environment-changes-detail-header" },
                      React.createElement("div", { className: "playground-environment-changes-detail-title-row" },
                        React.createElement("div", null,
                          React.createElement("h3", { className: "playground-environment-changes-detail-title" }, selectedFile.name || selectedFile.path),
                          React.createElement("div", { className: "playground-environment-changes-detail-subtitle" }, "/" + selectedFile.path)
                        ),
                        React.createElement("div", { className: "playground-environment-changes-detail-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environment-changes-detail-button",
                            onClick: () => onShowInFiles?.({
                              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                              environmentId,
                              projectId: selectedChange.projectId || "",
                              path: selectedFile.path,
                              isFolder: selectedFile.entryType === "directory",
                            }),
                          },
                            React.createElement(FolderOpen, { width: 14, height: 14, strokeWidth: 1.75 }),
                            React.createElement("span", null, "Show in Files")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environment-changes-detail-button",
                            onClick: () => void handleForkFromChange(),
                            disabled: forkState.status === "loading",
                          },
                            React.createElement(GitFork, { width: 14, height: 14, strokeWidth: 1.75 }),
                            React.createElement("span", null, forkState.status === "loading" ? "Forking..." : "Fork from Here")
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-environment-changes-detail-context" },
                        React.createElement("span", { className: "playground-environment-changes-detail-context-chip" }, formatHistoryTimestamp(selectedChange.createdAt)),
                        selectedChange.projectName
                          ? React.createElement("span", { className: "playground-environment-changes-detail-context-chip" }, selectedChange.projectName)
                          : null,
                        selectedChange.agentName
                          ? React.createElement("span", { className: "playground-environment-changes-detail-context-chip" }, selectedChange.agentName)
                          : selectedChange.sourceKind === "manual"
                            ? React.createElement("span", { className: "playground-environment-changes-detail-context-chip" }, "Manual change")
                            : null,
                        React.createElement("span", { className: "playground-environment-changes-detail-context-chip" }, selectedFile.operation)
                      ),
                      forkState.message
                        ? React.createElement("div", {
                            className: "playground-environment-changes-detail-message" + (forkState.status === "error" ? " is-error" : ""),
                          }, forkState.message)
                        : null
                    ),
                    React.createElement("div", { className: "playground-environment-changes-detail-body" },
                      detailLoading
                        ? React.createElement("div", { className: "playground-environment-changes-loading" },
                            React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                            React.createElement("span", null, "Loading file diff...")
                          )
                        : detailError
                          ? React.createElement("div", { className: "playground-environment-changes-empty" }, detailError)
                          : selectedFile.changeKind === "deleted"
                            ? React.createElement("div", { className: "playground-environment-changes-empty" }, "This file was deleted at the selected change.")
                            : React.createElement(RunnerFileDiffSurface, {
                                diffContent: detailDiffText,
                                fileContent: detailFileContent,
                                filePath: selectedFile.path,
                                emptyMessage: "No stored diff is available for this change.",
                                additions,
                                deletions,
                              })
                    )
                  )
            )
          )
        );
      }
`;

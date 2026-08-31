          function PlaygroundPromptsPage({
            requestHeaders = {},
            backendUrl = "",
            activeOrganizationId = "",
            currentUserId = "",
            currentUserName = "You",
            currentUserEmail = "",
            currentUserAvatarUrl = "",
            workspaceTeams = [],
            workspaceTeamsLoading = false,
            workspaceTeamsRequiresPlan = false,
            onWorkspaceTeamsRequest,
            topNavActionsPortalId = "",
            versionsDrawerPortalId = "",
            onVersionsSidebarOpenChange,
            onToolsPromptsHeaderChange,
            onStartThread,
            backRequestToken = 0,
            openPromptRequest = null,
            onNavigationGuardChange,
            onNavigationRequest,
          }) {
            const PROMPT_DRAFT_ID = "__prompt_draft__";
            const EMPTY_DRAFT = { name: "", description: "", markdown: "" };
            const [promptRows, setPromptRows] = useState([]);
            const [promptsLoading, setPromptsLoading] = useState(true);
            const [promptsError, setPromptsError] = useState("");
            const [promptOverviewScope, setPromptOverviewScope] = useState("all");
            const [selectedPromptId, setSelectedPromptId] = useState("");
            const [selectedPrompt, setSelectedPrompt] = useState(null);
            const [draft, setDraft] = useState(EMPTY_DRAFT);
            const [baseline, setBaseline] = useState(EMPTY_DRAFT);
            const [saveState, setSaveState] = useState({ isSaving: false, error: "" });
            const [promptVersionSaveDialog, setPromptVersionSaveDialog] = useState(null);
            const [promptPublishMenuOpen, setPromptPublishMenuOpen] = useState(false);
            const [promptVersionsOpen, setPromptVersionsOpen] = useState(false);
            const [promptVersionSelectedId, setPromptVersionSelectedId] = useState("");
            const [promptVersionChangesState, setPromptVersionChangesState] = useState(null);
            const [promptDetailTab, setPromptDetailTab] = useState("general");
            const [promptActionsOpen, setPromptActionsOpen] = useState(false);
            const [promptAccessPrincipalId, setPromptAccessPrincipalId] = useState("");
            const [promptAccessRoleId, setPromptAccessRoleId] = useState("member");
            const [promptAccessTeamMenuOpen, setPromptAccessTeamMenuOpen] = useState(false);
            const [promptAccessSelectedTeamIds, setPromptAccessSelectedTeamIds] = useState(() => new Set());
            const [promptShareModalOpen, setPromptShareModalOpen] = useState(false);
            const [promptShareTeamIds, setPromptShareTeamIds] = useState([]);
            const [promptShareError, setPromptShareError] = useState("");
            const [promptShareSaving, setPromptShareSaving] = useState(false);
            const [promptAccessState, setPromptAccessState] = useState({ isSaving: false, error: "" });
            const [promptOwnerSelectorOpen, setPromptOwnerSelectorOpen] = useState(false);
            const [promptOwnerCandidateState, setPromptOwnerCandidateState] = useState({
              promptId: "",
              status: "idle",
              candidates: [],
            });
            const [promptVersionsDrawerContainer, setPromptVersionsDrawerContainer] = useState(null);
            const [topNavActionsContainer, setTopNavActionsContainer] = useState(null);
            const handledOpenRequestRef = useRef("");
            const handledBackRequestRef = useRef(backRequestToken);
            const promptNameInputRef = useRef(null);
            const requestRef = useRef(null);
            const detailRequestRef = useRef(null);
            const promptTeamsRequestRef = useRef(false);
            const promptOwnerCandidatesRequestRef = useRef(false);

            const isDetail = Boolean(selectedPromptId);
            const isDraft = selectedPromptId === PROMPT_DRAFT_ID;
            const isDirty = isDetail && JSON.stringify(draft) !== JSON.stringify(baseline);

            function normalizePromptRecord(value) {
              const source = value && typeof value === "object" ? value : {};
              const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
                ? source.metadata
                : {};
              const creator = metadata.creator && typeof metadata.creator === "object" && !Array.isArray(metadata.creator)
                ? metadata.creator
                : {};
              const owner = metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
                ? metadata.owner
                : {};
              const identityName = (primary, fallback = "", email = "") => {
                const normalizedPrimary = String(primary || "").trim();
                const normalizedFallback = String(fallback || "").trim();
                const normalizedEmail = String(email || "").trim().toLowerCase();
                const isUsableName = (value) => {
                  const normalized = String(value || "").trim();
                  return !["", "unknown", "unknown user", "you", "me", "current user"]
                    .includes(normalized.toLowerCase())
                    && !normalized.includes("@")
                    && (!normalizedEmail || normalized.toLowerCase() !== normalizedEmail);
                };
                if (isUsableName(normalizedPrimary)) return normalizedPrimary;
                if (isUsableName(normalizedFallback)) return normalizedFallback;
                return "";
              };
              const versions = Array.isArray(source.versions)
                ? source.versions.map((version, index) => {
                    const rawNumber = Number(
                      version?.number ?? version?.versionNumber ?? version?.version ?? index + 1,
                    );
                    const number = Number.isFinite(rawNumber) && rawNumber > 0
                      ? Math.floor(rawNumber)
                      : index + 1;
                    return {
                      ...(version && typeof version === "object" ? version : {}),
                      number,
                      versionNumber: number,
                      markdown: String(version?.markdown ?? ""),
                    };
                  })
                : [];
              const currentVersion = versions.find((version) => (
                String(version?.id || "") === String(source.currentVersionId || "")
              )) || versions[versions.length - 1] || null;
              const creatorEmail = String(source.creatorEmail || creator.email || "").trim();
              const ownerEmail = String(source.ownerEmail || owner.email || "").trim();
              return {
                ...source,
                versions,
                id: String(source.id || "").trim(),
                name: String(source.name || currentVersion?.name || "new-prompt").trim() || "new-prompt",
                description: String(source.description ?? currentVersion?.description ?? ""),
                // Version content is authoritative. In particular, an empty
                // string is a valid saved prompt and must never fall through
                // to stale top-level content from an earlier version.
                markdown: String(currentVersion?.markdown ?? source.markdown ?? ""),
                creatorId: String(source.creatorId || source.creatorUserId || creator.id || creator.userId || "").trim(),
                creatorEmail,
                creatorName: identityName(source.creatorName, creator.name, creatorEmail),
                creatorAvatarUrl: String(source.creatorAvatarUrl || creator.avatarUrl || "").trim(),
                ownerId: String(source.ownerId || source.ownerUserId || owner.id || owner.userId || "").trim(),
                ownerEmail,
                ownerName: identityName(source.ownerName, owner.name, ownerEmail),
                ownerAvatarUrl: String(source.ownerAvatarUrl || owner.avatarUrl || "").trim(),
                currentVersion: currentVersion
                  ? { ...currentVersion, markdown: String(currentVersion.markdown ?? "") }
                  : null,
                currentVersionId: String(source.currentVersionId || currentVersion?.id || "").trim(),
                currentVersionNumber: Number(currentVersion?.number ?? source.currentVersionNumber ?? 1),
                publishedVersionId: String(source.publishedVersionId || "").trim(),
                metadata,
                permissionSet: source.permissionSet && typeof source.permissionSet === "object" && !Array.isArray(source.permissionSet)
                  ? source.permissionSet
                  : null,
              };
            }

            function formatUpdatedLabel(value) {
              const timestamp = Date.parse(String(value || ""));
              if (!Number.isFinite(timestamp)) return "Recently";
              const elapsed = Math.max(0, Date.now() - timestamp);
              const minute = 60 * 1000;
              const hour = 60 * minute;
              const day = 24 * hour;
              if (elapsed < minute) return "Just now";
              if (elapsed < hour) return Math.floor(elapsed / minute) + "m ago";
              if (elapsed < day) return Math.floor(elapsed / hour) + "h ago";
              if (elapsed < 7 * day) return Math.floor(elapsed / day) + "d ago";
              try {
                return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(timestamp);
              } catch {
                return "Recently";
              }
            }

            function getRequestHeaders(extra = {}) {
              return {
                Accept: "application/json",
                ...(requestHeaders && typeof requestHeaders === "object" ? requestHeaders : {}),
                ...extra,
              };
            }

            async function requestJson(pathname, options = {}) {
              const response = await fetch(pathname, {
                credentials: "same-origin",
                ...options,
                headers: getRequestHeaders({
                  ...(options.body ? { "Content-Type": "application/json" } : {}),
                  ...(options.headers || {}),
                }),
              });
              const payload = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(payload?.message || payload?.error || "Prompt request failed.");
              }
              return payload;
            }

            async function uploadPromptEditorFiles(files) {
              const selectedFiles = Array.from(files || []).filter((file) => (
                typeof globalThis.File === "function" && file instanceof globalThis.File
              ));
              return Promise.all(selectedFiles.map(async (file) => {
                const payload = await requestJson("/api/real/attachments/upload", {
                  method: "POST",
                  body: JSON.stringify({
                    filename: file.name || "attachment",
                    mimeType: file.type || "application/octet-stream",
                    data: await readFileAsBase64(file),
                  }),
                });
                const attachment = payload?.attachment && typeof payload.attachment === "object"
                  ? payload.attachment
                  : null;
                const attachmentId = String(attachment?.id || attachment?.attachmentId || "").trim();
                if (!attachment || !attachmentId) {
                  throw new Error("Attachment upload succeeded but the attachment data is missing.");
                }
                const mimeType = String(
                  attachment.mimeType || attachment.contentType || file.type || "application/octet-stream"
                ).trim() || "application/octet-stream";
                return {
                  src: "/api/real/attachments/" + encodeURIComponent(attachmentId),
                  name: String(attachment.filename || attachment.name || file.name || "Attachment").trim() || "Attachment",
                  size: Number(attachment.size || attachment.byteSize || file.size || 0),
                  mimeType,
                  attachmentId,
                  metadata: attachment,
                };
              }));
            }

            async function resolvePromptEditorFilePreviewSource(file, signal) {
              const source = String(file?.src || "").trim();
              if (!source) return null;
              const response = await fetch(source, {
                credentials: "same-origin",
                headers: getRequestHeaders(),
                signal,
              });
              if (!response.ok) {
                throw new Error("Failed to load the prompt attachment preview.");
              }
              return response.blob();
            }

            const loadPrompts = useCallback(async () => {
              if (requestRef.current) requestRef.current.abort();
              const controller = new AbortController();
              requestRef.current = controller;
              setPromptsLoading(true);
              setPromptsError("");
              try {
                const payload = await requestJson("/api/real/prompts", { signal: controller.signal });
                if (controller.signal.aborted) return;
                const records = Array.isArray(payload?.prompts)
                  ? payload.prompts
                  : Array.isArray(payload?.data) ? payload.data : [];
                setPromptRows(records.map((record) => normalizePromptRecord(record)));
              } catch (error) {
                if (controller.signal.aborted) return;
                setPromptsError(error instanceof Error ? error.message : "Failed to load prompts.");
              } finally {
                if (!controller.signal.aborted) setPromptsLoading(false);
              }
            }, [requestHeaders]);

            useEffect(() => {
              void loadPrompts();
              return () => requestRef.current?.abort();
            }, [loadPrompts]);

            useLayoutEffect(() => {
              if (!topNavActionsPortalId || typeof document === "undefined") {
                setTopNavActionsContainer(null);
                return undefined;
              }
              const resolveContainer = () => {
                setTopNavActionsContainer(document.getElementById(topNavActionsPortalId));
              };
              resolveContainer();
              const frame = window.requestAnimationFrame(resolveContainer);
              return () => window.cancelAnimationFrame(frame);
            }, [topNavActionsPortalId, isDetail]);

            useLayoutEffect(() => {
              if (!versionsDrawerPortalId || typeof document === "undefined") {
                setPromptVersionsDrawerContainer(null);
                return undefined;
              }
              const updateContainer = () => {
                setPromptVersionsDrawerContainer(document.getElementById(versionsDrawerPortalId));
              };
              updateContainer();
              const frame = window.requestAnimationFrame(updateContainer);
              return () => window.cancelAnimationFrame(frame);
            }, [versionsDrawerPortalId]);

            useEffect(() => {
              if (typeof onVersionsSidebarOpenChange !== "function") return undefined;
              onVersionsSidebarOpenChange(Boolean(promptVersionsOpen));
              return () => onVersionsSidebarOpenChange(false);
            }, [onVersionsSidebarOpenChange, promptVersionsOpen]);

            function getDraftFromPrompt(record) {
              const normalized = normalizePromptRecord(record);
              return {
                name: String(normalized.currentVersion?.name ?? normalized.name ?? "new-prompt"),
                description: String(normalized.currentVersion?.description ?? normalized.description ?? ""),
                markdown: String(normalized.currentVersion?.markdown ?? normalized.markdown ?? ""),
              };
            }

            function normalizePromptMutationRecord(payload, fallbackRecord = selectedPrompt) {
              const response = payload && typeof payload === "object" ? payload : {};
              const responsePrompt = response.prompt && typeof response.prompt === "object"
                ? response.prompt
                : response;
              const responseVersion = response.version && typeof response.version === "object"
                ? response.version
                : null;
              const fallback = fallbackRecord && typeof fallbackRecord === "object"
                ? fallbackRecord
                : {};
              const source = {
                ...fallback,
                ...responsePrompt,
              };
              if (responseVersion?.id) {
                const versions = Array.isArray(source.versions) ? [...source.versions] : [];
                const versionIndex = versions.findIndex((version) => (
                  String(version?.id || "") === String(responseVersion.id || "")
                ));
                if (versionIndex >= 0) versions[versionIndex] = responseVersion;
                else versions.push(responseVersion);
                source.versions = versions;
                source.currentVersionId = String(
                  responsePrompt.currentVersionId || responseVersion.id || source.currentVersionId || "",
                );
                source.currentVersionNumber = Number(
                  responseVersion.number
                    ?? responseVersion.versionNumber
                    ?? responsePrompt.currentVersionNumber
                    ?? source.currentVersionNumber
                    ?? versions.length,
                );
              }
              return normalizePromptRecord(source);
            }

            function getCurrentPromptVersion(record = selectedPrompt) {
              const normalized = normalizePromptRecord(record);
              return normalized.currentVersion || (
                Array.isArray(normalized.versions) ? normalized.versions.at(-1) : null
              );
            }

            function getPromptVersionById(versionId, record = selectedPrompt) {
              const normalizedVersionId = String(versionId || "").trim();
              if (!normalizedVersionId) return null;
              const versions = Array.isArray(record?.versions) ? record.versions : [];
              return versions.find((version) => String(version?.id || "") === normalizedVersionId) || null;
            }

            function getPromptEditorVersion(record = selectedPrompt) {
              return getPromptVersionById(promptVersionSelectedId, record)
                || getCurrentPromptVersion(record);
            }

            function getOrderedPromptVersions(record = selectedPrompt) {
              const versions = Array.isArray(record?.versions) ? record.versions : [];
              return versions
                .map((version, index) => ({
                  ...version,
                  number: normalizePlatformVersionNumber(
                    version?.number ?? version?.versionNumber ?? version?.version,
                    index + 1,
                  ),
                  __promptVersionOrder: index,
                }))
                .filter((version) => String(version?.id || "").trim())
                .sort((left, right) => (
                  Number(left.number || 0) - Number(right.number || 0)
                  || Number(left.__promptVersionOrder || 0) - Number(right.__promptVersionOrder || 0)
                ));
            }

            function buildPromptVersionSelectorOptions(versions) {
              const orderedVersions = Array.isArray(versions) ? versions : [];
              const latestVersionId = String(orderedVersions.at(-1)?.id || "");
              return [...orderedVersions].reverse().map((version) => {
                const versionId = String(version?.id || "");
                const versionLabel = formatPlatformVersionLabel(version?.number);
                return {
                  value: versionId,
                  label: versionId === latestVersionId ? versionLabel + " · Latest" : versionLabel,
                  description: String(version?.description || "").trim() || undefined,
                };
              });
            }

            function getPromptVersionDraft(version) {
              return {
                name: String(version?.name || selectedPrompt?.name || "new-prompt"),
                description: String(version?.description || ""),
                markdown: String(version?.markdown || ""),
              };
            }

            function checkoutPromptVersion(versionId) {
              const version = getPromptVersionById(versionId);
              if (!version || saveState.isSaving || isDirty) return false;
              const nextDraft = getPromptVersionDraft(version);
              setPromptVersionSelectedId(String(version.id || versionId || ""));
              setDraft(nextDraft);
              setBaseline(nextDraft);
              setPromptVersionChangesState(null);
              setSaveState({ isSaving: false, error: "" });
              return true;
            }

            function canPublishPromptVersion(version) {
              const versionId = String(version?.id || "").trim();
              return Boolean(
                versionId
                && versionId !== String(selectedPrompt?.publishedVersionId || "").trim()
                && String(version?.status || "").toLowerCase() !== "published",
              );
            }

            async function publishPromptVersion(versionId) {
              const normalizedVersionId = String(versionId || "").trim();
              const targetVersion = getPromptVersionById(normalizedVersionId);
              if (
                !selectedPrompt?.id
                || !targetVersion
                || !canPublishPromptVersion(targetVersion)
                || saveState.isSaving
              ) {
                return false;
              }
              if (isDirty) {
                setSaveState({
                  isSaving: false,
                  error: "Save or revert the current changes before publishing another version.",
                });
                return false;
              }
              setSaveState({ isSaving: true, error: "" });
              try {
                const response = await requestJson(
                  "/api/real/prompts/"
                    + encodeURIComponent(selectedPrompt.id)
                    + "/versions/"
                    + encodeURIComponent(normalizedVersionId)
                    + "/publish",
                  { method: "POST" },
                );
                const record = normalizePromptMutationRecord(response);
                setSelectedPrompt(record);
                setPromptVersionSelectedId(normalizedVersionId);
                setSaveState({ isSaving: false, error: "" });
                await loadPrompts();
                return true;
              } catch (error) {
                setSaveState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to publish prompt version.",
                });
                return false;
              }
            }

            function buildPromptVersionDiffFilesFromVersions(baseVersion, targetVersion) {
              const createDiffFile = typeof createPlaygroundVersionDiffFile === "function"
                ? createPlaygroundVersionDiffFile
                : null;
              if (!createDiffFile || !baseVersion || !targetVersion) return [];
              return [
                createDiffFile({
                  id: "prompt-metadata",
                  path: "prompt.json",
                  label: "prompt.json",
                  before: {
                    name: String(baseVersion.name || ""),
                    description: String(baseVersion.description || ""),
                  },
                  after: {
                    name: String(targetVersion.name || ""),
                    description: String(targetVersion.description || ""),
                  },
                }),
                createDiffFile({
                  id: "prompt-markdown",
                  path: "PROMPT.md",
                  label: "PROMPT.md",
                  before: String(baseVersion.markdown || ""),
                  after: String(targetVersion.markdown || ""),
                }),
              ].filter(Boolean);
            }

            function openPromptVersionChangesModal(versionId = "") {
              const versions = getOrderedPromptVersions();
              const requestedTarget = getPromptVersionById(versionId) || getPromptEditorVersion();
              const target = versions.find((version) => (
                String(version?.id || "") === String(requestedTarget?.id || "")
              )) || versions.at(-1) || null;
              if (!target || !versions.length) return false;
              const targetIndex = versions.findIndex((version) => String(version?.id || "") === String(target.id || ""));
              const baseVersion = targetIndex > 0
                ? versions[targetIndex - 1]
                : versions[targetIndex + 1] || target;
              setPromptVersionSelectedId(String(target.id || versionId || ""));
              setPromptVersionsOpen(false);
              setPromptVersionChangesState({
                leftVersionId: String(baseVersion?.id || target.id || ""),
                rightVersionId: String(target.id || versionId || ""),
              });
              return true;
            }

            function renderPromptVersionChangesModal() {
              if (!promptVersionChangesState || !selectedPrompt) return null;
              const versions = getOrderedPromptVersions();
              if (!versions.length) return null;
              const targetVersion = versions.find((version) => (
                String(version?.id || "") === String(promptVersionChangesState.rightVersionId || "")
              )) || versions.at(-1) || null;
              const targetIndex = versions.findIndex((version) => (
                String(version?.id || "") === String(targetVersion?.id || "")
              ));
              const baseVersion = versions.find((version) => (
                String(version?.id || "") === String(promptVersionChangesState.leftVersionId || "")
              )) || versions[Math.max(0, targetIndex - 1)] || targetVersion;
              if (!baseVersion || !targetVersion) return null;
              const selectorOptions = buildPromptVersionSelectorOptions(versions);
              const updateComparedVersion = (side, value) => {
                setPromptVersionChangesState((current) => current
                  ? {
                      ...current,
                      [side === "left" ? "leftVersionId" : "rightVersionId"]: String(value || ""),
                    }
                  : current
                );
              };
              const files = buildPromptVersionDiffFilesFromVersions(baseVersion, targetVersion);
              const changesModal = typeof renderPlaygroundVersionChangesModal === "function"
                ? renderPlaygroundVersionChangesModal({
                    title: "Changes",
                    subtitle: "Compare saved prompt versions and review the exact file changes.",
                    leftSelector: {
                      value: String(baseVersion.id || ""),
                      options: selectorOptions,
                      onValueChange: (value) => updateComparedVersion("left", value),
                      ariaLabel: "Select base prompt version",
                    },
                    rightSelector: {
                      value: String(targetVersion.id || ""),
                      options: selectorOptions,
                      onValueChange: (value) => updateComparedVersion("right", value),
                      ariaLabel: "Select target prompt version",
                    },
                    files,
                    closeButtonLabel: "Close prompt version changes",
                    onClose: () => setPromptVersionChangesState(null),
                    emptyMessage: "No differences between the selected versions.",
                    className: "playground-prompts-version-changes-modal__content",
                  })
                : null;
              return changesModal;
            }

            function buildPromptVersionDiffFiles() {
              const currentVersion = getPromptEditorVersion();
              const before = {
                name: String(currentVersion?.name || baseline.name || ""),
                description: String(currentVersion?.description || baseline.description || ""),
              };
              const after = {
                name: String(draft.name || ""),
                description: String(draft.description || ""),
              };
              const createDiffFile = typeof createPlaygroundVersionDiffFile === "function"
                ? createPlaygroundVersionDiffFile
                : null;
              if (!createDiffFile) return [];
              return [
                createDiffFile({
                  id: "prompt-metadata",
                  path: "prompt.json",
                  label: "prompt.json",
                  before,
                  after,
                }),
                createDiffFile({
                  id: "prompt-markdown",
                  path: "PROMPT.md",
                  label: "PROMPT.md",
                  before: currentVersion?.markdown || baseline.markdown || "",
                  after: draft.markdown || "",
                }),
              ].filter(Boolean);
            }

            function buildPromptVersionSaveDialogData() {
              const versions = Array.isArray(selectedPrompt?.versions)
                ? selectedPrompt.versions
                : [];
              const currentVersion = getPromptEditorVersion();
              const latestVersion = versions.reduce((highest, version) => {
                const number = Number(version?.number || version?.versionNumber || 0);
                return Number.isFinite(number) ? Math.max(highest, number) : highest;
              }, 0);
              return {
                currentVersion,
                canSaveCurrent: Boolean(!isDraft && currentVersion?.id),
                currentDescription: String(currentVersion?.description || "").trim(),
                nextVersion: latestVersion + 1 || 1,
                diffFiles: buildPromptVersionDiffFiles(),
              };
            }

            function openPromptVersionSaveDialog(options = {}) {
              if (
                !isDetail
                || !String(draft.name || "").trim()
                || saveState.isSaving
                || !isDirty
              ) {
                return false;
              }
              setSaveState((current) => ({ ...current, error: "" }));
              setPromptPublishMenuOpen(false);
              setPromptVersionSaveDialog({
                initialMode: options.mode === "current" ? "current" : "new",
                key: Date.now().toString(36) + Math.random().toString(36).slice(2),
              });
              return true;
            }

            function openNewPrompt() {
              detailRequestRef.current?.abort();
              setPromptVersionSaveDialog(null);
              setPromptPublishMenuOpen(false);
              setPromptVersionsOpen(false);
              setPromptVersionSelectedId("");
              setPromptVersionChangesState(null);
              setPromptActionsOpen(false);
              setPromptOwnerSelectorOpen(false);
              setPromptOwnerCandidateState({ promptId: PROMPT_DRAFT_ID, status: "idle", candidates: [] });
              promptOwnerCandidatesRequestRef.current = false;
              setPromptDetailTab("general");
              setPromptAccessPrincipalId("");
              setSelectedPromptId(PROMPT_DRAFT_ID);
              setSelectedPrompt(null);
              setDraft({ ...EMPTY_DRAFT });
              setBaseline({ ...EMPTY_DRAFT });
              setSaveState({ isSaving: false, error: "" });
              window.requestAnimationFrame(() => promptNameInputRef.current?.focus());
            }

            async function openPrompt(promptId) {
              const normalizedId = String(promptId || "").trim();
              if (!normalizedId) return;
              detailRequestRef.current?.abort();
              const controller = new AbortController();
              detailRequestRef.current = controller;
              setPromptVersionSaveDialog(null);
              setPromptPublishMenuOpen(false);
              setPromptVersionsOpen(false);
              setPromptVersionSelectedId("");
              setPromptVersionChangesState(null);
              setPromptActionsOpen(false);
              setPromptOwnerSelectorOpen(false);
              setPromptOwnerCandidateState({ promptId: normalizedId, status: "idle", candidates: [] });
              promptOwnerCandidatesRequestRef.current = false;
              setPromptDetailTab("general");
              setPromptAccessPrincipalId("");
              setSelectedPromptId(normalizedId);
              setSelectedPrompt(null);
              setDraft({ ...EMPTY_DRAFT });
              setBaseline({ ...EMPTY_DRAFT });
              setSaveState({ isSaving: false, error: "" });
              try {
                const payload = await requestJson(
                  "/api/real/prompts/" + encodeURIComponent(normalizedId),
                  { signal: controller.signal },
                );
                if (controller.signal.aborted) return;
                const record = normalizePromptRecord(payload?.prompt || payload);
                setSelectedPrompt(record);
                const nextDraft = getDraftFromPrompt(record);
                setDraft(nextDraft);
                setBaseline(nextDraft);
                setPromptVersionSelectedId(record.currentVersionId || "");
              } catch (error) {
                if (controller.signal.aborted) return;
                setSaveState({ isSaving: false, error: error instanceof Error ? error.message : "Failed to load prompt." });
              } finally {
                if (detailRequestRef.current === controller) detailRequestRef.current = null;
              }
            }

            function openPromptOverview() {
              detailRequestRef.current?.abort();
              setPromptVersionSaveDialog(null);
              setPromptPublishMenuOpen(false);
              setPromptVersionsOpen(false);
              setPromptVersionSelectedId("");
              setPromptVersionChangesState(null);
              setPromptActionsOpen(false);
              setPromptOwnerSelectorOpen(false);
              setPromptOwnerCandidateState({ promptId: "", status: "idle", candidates: [] });
              promptOwnerCandidatesRequestRef.current = false;
              setPromptDetailTab("general");
              setPromptAccessPrincipalId("");
              setSelectedPromptId("");
              setSelectedPrompt(null);
              setDraft({ ...EMPTY_DRAFT });
              setBaseline({ ...EMPTY_DRAFT });
              setSaveState({ isSaving: false, error: "" });
            }

            useEffect(() => {
              const requestToken = String(openPromptRequest?.token || "");
              if (!requestToken || handledOpenRequestRef.current === requestToken) return;
              handledOpenRequestRef.current = requestToken;
              if (openPromptRequest.action === "create") {
                openNewPrompt();
              } else if (openPromptRequest.promptId) {
                void openPrompt(openPromptRequest.promptId);
              }
            }, [openPromptRequest]);

            useEffect(() => {
              if (handledBackRequestRef.current === backRequestToken) return;
              handledBackRequestRef.current = backRequestToken;
              if (isDetail) openPromptOverview();
            }, [backRequestToken, isDetail]);

            useEffect(() => {
              if (typeof onToolsPromptsHeaderChange !== "function") return;
              const editorVersion = getPromptEditorVersion();
              const latestVersion = getCurrentPromptVersion(selectedPrompt);
              onToolsPromptsHeaderChange(isDetail
                ? {
                    mode: "detail",
                    title: draft.name.trim() || "Prompt",
                    promptId: selectedPromptId === PROMPT_DRAFT_ID ? "" : selectedPromptId,
                    versionNumber: isDraft ? 0 : Number(editorVersion?.number || selectedPrompt?.currentVersionNumber || 1),
                    latestVersionNumber: isDraft ? 0 : Number(latestVersion?.number || selectedPrompt?.currentVersionNumber || 1),
                    versionQualifier: isDraft
                      ? "Draft"
                      : String(editorVersion?.status || "").toLowerCase() === "published" ? "Published" : "Version",
                    hasUnsavedChanges: Boolean(isDirty),
                    activeTab: promptDetailTab === "settings" ? "settings" : "general",
                    onTabChange: (nextTab) => setPromptDetailTab(nextTab === "settings" ? "settings" : "general"),
                    actionsOpen: promptActionsOpen,
                    onActionsOpenChange: setPromptActionsOpen,
                    onOpenVersions: () => setPromptVersionsOpen(true),
                    onShare: () => {
                      setPromptActionsOpen(false);
                      setPromptShareError("");
                      setPromptShareTeamIds([]);
                      setPromptShareModalOpen(true);
                    },
                    onRename: () => {
                      setPromptActionsOpen(false);
                      window.requestAnimationFrame(() => {
                        promptNameInputRef.current?.focus();
                        promptNameInputRef.current?.select?.();
                      });
                    },
                    onCopyId: () => {
                      setPromptActionsOpen(false);
                      if (selectedPromptId && selectedPromptId !== PROMPT_DRAFT_ID) {
                        void navigator.clipboard?.writeText?.(selectedPromptId);
                      }
                    },
                    onDelete: () => {
                      setPromptActionsOpen(false);
                      void deletePrompts([{ id: selectedPromptId }]);
                    },
                    createdAt: selectedPrompt?.createdAt || "",
                    updatedAt: selectedPrompt?.updatedAt || "",
                  }
                : {
                    mode: "overview",
                    title: "Prompts",
                    promptId: "",
                    versionNumber: 0,
                    versionQualifier: "",
                    overviewScope: promptOverviewScope,
                    onOverviewScopeChange: (nextScope) => setPromptOverviewScope(
                      nextScope === "created" || nextScope === "shared" ? nextScope : "all",
                    ),
                  });
            }, [draft.name, isDetail, isDirty, isDraft, onToolsPromptsHeaderChange, promptActionsOpen, promptDetailTab, promptOverviewScope, promptVersionSelectedId, selectedPrompt, selectedPromptId]);

            function discardPromptChanges() {
              setPromptVersionSaveDialog(null);
              setDraft({ ...baseline });
            }

            usePlatformVersionNavigationGuard({
              dirty: isDirty,
              guardId: "prompt-details-unsaved-changes",
              resourceId: selectedPromptId,
              resourceName: draft.name.trim() || "this prompt",
              resourceType: "Prompt",
              onDiscard: discardPromptChanges,
              onNavigationGuardChange,
            });

            async function savePrompt(details = {}) {
              if (saveState.isSaving) return null;
              const name = String(draft.name || "").trim();
              if (!name) {
                setSaveState({ isSaving: false, error: "Add a name before saving this prompt." });
                return null;
              }
              setSaveState({ isSaving: true, error: "" });
              try {
                const payload = {
                  name,
                  description: Object.prototype.hasOwnProperty.call(details, "description")
                    ? String(details.description || "")
                    : draft.description,
                  markdown: draft.markdown,
                  ...(isDraft
                    ? {
                        metadata: (() => {
                          const identity = {
                            id: String(currentUserId || ""),
                            userId: String(currentUserId || ""),
                            name: String(currentUserName || "Unknown user"),
                            email: String(currentUserEmail || ""),
                            avatarUrl: String(currentUserAvatarUrl || ""),
                          };
                          return { creator: identity, owner: identity };
                        })(),
                      }
                    : {}),
                };
                const currentVersion = getPromptEditorVersion();
                const saveToCurrentVersion = Boolean(
                  !isDraft
                  && details.mode === "current"
                  && currentVersion?.id,
                );
                const response = isDraft
                  ? await requestJson("/api/real/prompts", {
                      method: "POST",
                      body: JSON.stringify(payload),
                    })
                  : saveToCurrentVersion
                  ? await requestJson(
                      "/api/real/prompts/"
                        + encodeURIComponent(selectedPromptId)
                        + "/versions/"
                        + encodeURIComponent(currentVersion.id),
                      {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                      },
                    )
                  : await requestJson(
                      "/api/real/prompts/" + encodeURIComponent(selectedPromptId) + "/versions",
                      {
                        method: "POST",
                        body: JSON.stringify(payload),
                      },
                    );
                const record = normalizePromptMutationRecord(response, isDraft ? null : selectedPrompt);
                const nextDraft = getDraftFromPrompt(record);
                setSelectedPromptId(record.id);
                setSelectedPrompt(record);
                setDraft(nextDraft);
                setBaseline(nextDraft);
                setPromptVersionSelectedId(record.currentVersionId || "");
                setPromptVersionsOpen(false);
                setPromptPublishMenuOpen(false);
                setSaveState({ isSaving: false, error: "" });
                await loadPrompts();
                return record;
              } catch (error) {
                setSaveState({ isSaving: false, error: error instanceof Error ? error.message : "Failed to save prompt." });
                return null;
              }
            }

            function getPromptResourceMetadata() {
              return selectedPrompt?.metadata && typeof selectedPrompt.metadata === "object"
                ? selectedPrompt.metadata
                : {};
            }

            function getSelectedPromptStorageRegion(metadata = selectedPrompt?.metadata) {
              const normalizedMetadata = metadata
                && typeof metadata === "object"
                && !Array.isArray(metadata)
                ? metadata
                : {};
              return String(
                normalizedMetadata.storageRegion
                || normalizedMetadata.deploymentRegion
                || normalizedMetadata.region
                || normalizedMetadata.location
                || "europe-west1"
              ).trim() || "europe-west1";
            }

            function normalizePromptIdentity(value, fallback = {}) {
              const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
              const nested = [source.user, source.profile, source.account, source.member, source.identity]
                .find((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate)) || {};
              const read = (...keys) => {
                for (const key of keys) {
                  const direct = String(source[key] || "").trim();
                  if (direct) return direct;
                  const nestedValue = String(nested[key] || "").trim();
                  if (nestedValue) return nestedValue;
                }
                return "";
              };
              const fallbackSource = fallback && typeof fallback === "object" ? fallback : {};
              const valueId = read("userId", "user_id", "uid", "id", "memberId", "member_id");
              const email = read("email", "emailAddress", "email_address", "mail").toLowerCase();
              const fallbackValue = String(
                fallbackSource.value
                  || fallbackSource.userId
                  || fallbackSource.id
                  || fallbackSource.email
                  || "",
              ).trim();
              const valueKey = valueId || email || fallbackValue || "prompt-owner";
              const fallbackName = String(
                fallbackSource.name || currentUserName || "Unknown user",
              ).trim() || "Unknown user";
              const explicitName = read("name", "displayName", "display_name", "fullName", "full_name", "username", "userName");
              const fallbackKeys = [fallbackSource.value, fallbackSource.id, fallbackSource.userId, fallbackSource.email]
                .map((entry) => String(entry || "").trim().toLowerCase())
                .filter(Boolean);
              const isFallbackIdentity = !valueId || fallbackKeys.includes(valueId.toLowerCase()) || fallbackKeys.includes(email);
              const trustedExplicitName = getTrustedDisplayName(explicitName, email);
              const trustedFallbackName = getTrustedDisplayName(
                fallbackName,
                String(fallbackSource.email || email || ""),
              );
              const name = trustedExplicitName
                || (isFallbackIdentity ? trustedFallbackName : "")
                || formatAccountDisplayName(explicitName, email, valueId || "Unknown user");
              const fallbackEmail = isFallbackIdentity
                ? String(fallbackSource.email || currentUserEmail || "").trim().toLowerCase()
                : "";
              const fallbackAvatarUrl = isFallbackIdentity
                ? String(fallbackSource.avatarUrl || currentUserAvatarUrl || "").trim()
                : "";
              return {
                value: valueKey,
                id: valueId || valueKey,
                userId: read("userId", "user_id", "uid") || valueId || valueKey,
                name,
                email: email || fallbackEmail,
                avatarUrl: read("avatarUrl", "avatar_url", "photoUrl", "photoURL", "picture", "imageUrl", "imageURL")
                  || fallbackAvatarUrl,
              };
            }

            function getPromptCreatorIdentity(record = selectedPrompt) {
              const metadata = record?.metadata && typeof record.metadata === "object" ? record.metadata : {};
              const creator = metadata.creator && typeof metadata.creator === "object" ? metadata.creator : {};
              return normalizePromptIdentity({
                ...creator,
                id: record?.creatorId || creator.id,
                userId: record?.creatorUserId || record?.creatorId || creator.userId,
                name: record?.creatorName || creator.name,
                email: record?.creatorEmail || creator.email,
                avatarUrl: record?.creatorAvatarUrl || creator.avatarUrl,
              }, {
                value: currentUserId || currentUserEmail,
                id: currentUserId,
                userId: currentUserId,
                name: currentUserName,
                email: currentUserEmail,
                avatarUrl: currentUserAvatarUrl,
              });
            }

            function getPromptOwnerIdentity(record = selectedPrompt) {
              const metadata = record?.metadata && typeof record.metadata === "object" ? record.metadata : {};
              const owner = metadata.owner && typeof metadata.owner === "object" ? metadata.owner : {};
              const creator = getPromptCreatorIdentity(record);
              return normalizePromptIdentity({
                ...owner,
                id: record?.ownerId || record?.ownerUserId || metadata.ownerId || owner.id,
                userId: record?.ownerUserId || metadata.ownerUserId || owner.userId,
                name: record?.ownerName || metadata.ownerName || owner.name,
                email: record?.ownerEmail || metadata.ownerEmail || owner.email,
                avatarUrl: record?.ownerAvatarUrl || metadata.ownerAvatarUrl || owner.avatarUrl,
              }, creator);
            }

            function normalizePromptOwnerCandidate(value) {
              const identity = normalizePromptIdentity(value, {
                value: currentUserId || currentUserEmail,
                id: currentUserId,
                userId: currentUserId,
                name: currentUserName,
                email: currentUserEmail,
                avatarUrl: currentUserAvatarUrl,
              });
              return {
                ...identity,
                source: value,
              };
            }

            function getPromptOwnerCandidateRecords(payload) {
              if (Array.isArray(payload)) return payload;
              if (Array.isArray(payload?.data)) return payload.data;
              if (Array.isArray(payload?.data?.members)) return payload.data.members;
              if (Array.isArray(payload?.members)) return payload.members;
              if (Array.isArray(payload?.organizationMembers)) return payload.organizationMembers;
              if (Array.isArray(payload?.organization_members)) return payload.organization_members;
              return [];
            }

            async function loadPromptOwnerCandidates() {
              if (!selectedPrompt?.id || isDraft || promptOwnerCandidatesRequestRef.current) return;
              promptOwnerCandidatesRequestRef.current = true;
              const promptId = String(selectedPrompt.id);
              setPromptOwnerCandidateState({
                promptId,
                status: "loading",
                candidates: promptOwnerCandidateState.promptId === promptId
                  ? promptOwnerCandidateState.candidates
                  : [],
              });
              try {
                const organizationId = String(activeOrganizationId || "").trim();
                const payload = organizationId
                  ? await requestJson(
                      "/api/real/organizations/" + encodeURIComponent(organizationId)
                        + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                    )
                  : [];
                const memberRecords = getPromptOwnerCandidateRecords(payload);
                let memberProfilesPayload = null;
                if (organizationId && memberRecords.length > 0) {
                  try {
                    memberProfilesPayload = await requestJson(
                      "/api/real/organizations/" + encodeURIComponent(organizationId)
                        + "/member-profiles/lookup",
                      {
                        method: "POST",
                        body: JSON.stringify({ members: memberRecords }),
                      },
                    );
                  } catch {
                    memberProfilesPayload = null;
                  }
                }
                const hydratedMemberRecords = typeof mergeTeamPageMemberProfiles === "function"
                  ? mergeTeamPageMemberProfiles(memberRecords, payload, memberProfilesPayload)
                  : memberRecords;
                const byKey = new Map();
                [getPromptCreatorIdentity(selectedPrompt), getPromptOwnerIdentity(selectedPrompt)]
                  .concat(hydratedMemberRecords.map(normalizePromptOwnerCandidate))
                  .forEach((candidate) => {
                    const key = String(candidate.value || candidate.email || candidate.id || "").toLowerCase();
                    if (key && !byKey.has(key)) byKey.set(key, candidate);
                  });
                setPromptOwnerCandidateState({
                  promptId,
                  status: "ready",
                  candidates: Array.from(byKey.values()),
                });
              } catch (error) {
                setPromptOwnerCandidateState({
                  promptId,
                  status: "ready",
                  candidates: [getPromptOwnerIdentity(selectedPrompt)],
                });
                setSaveState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to load organization members.",
                });
              } finally {
                promptOwnerCandidatesRequestRef.current = false;
              }
            }

            function handlePromptOwnerSelectorOpenChange(nextOpen) {
              if (nextOpen && (isDirty || saveState.isSaving || promptAccessState.isSaving)) return;
              setPromptOwnerSelectorOpen(Boolean(nextOpen));
              if (nextOpen) void loadPromptOwnerCandidates();
            }

            async function transferPromptOwner(nextValue, option) {
              if (!selectedPrompt?.id || isDraft || isDirty || saveState.isSaving) return;
              const nextOwner = option?.data?.identity || option;
              const normalizedOwner = normalizePromptIdentity({
                ...nextOwner,
                id: nextOwner?.id || nextValue,
                userId: nextOwner?.userId || nextValue,
                name: nextOwner?.name,
                email: nextOwner?.email,
                avatarUrl: nextOwner?.avatarUrl,
              }, getPromptOwnerIdentity(selectedPrompt));
              const nextMetadata = {
                ...getPromptResourceMetadata(),
                owner: {
                  id: normalizedOwner.id,
                  userId: normalizedOwner.userId,
                  name: normalizedOwner.name,
                  email: normalizedOwner.email,
                  avatarUrl: normalizedOwner.avatarUrl,
                },
                ownerId: normalizedOwner.id,
                ownerUserId: normalizedOwner.userId,
                ownerName: normalizedOwner.name,
                ownerEmail: normalizedOwner.email,
                ownerAvatarUrl: normalizedOwner.avatarUrl,
              };
              setPromptAccessState({ isSaving: true, error: "" });
              try {
                const response = await requestJson(
                  "/api/real/prompts/" + encodeURIComponent(selectedPrompt.id),
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      metadata: nextMetadata,
                      permissionSet: selectedPrompt.permissionSet || null,
                    }),
                  },
                );
                const record = normalizePromptRecord(response?.prompt || response);
                setSelectedPrompt(record);
                setPromptAccessState({ isSaving: false, error: "" });
                setPromptOwnerSelectorOpen(false);
                await loadPrompts();
              } catch (error) {
                const normalizedError = error instanceof Error
                  ? error
                  : new Error("Failed to change the prompt owner.");
                setPromptAccessState({ isSaving: false, error: normalizedError.message });
                throw normalizedError;
              }
            }

            const rawPromptWorkspaceTeams = Array.isArray(workspaceTeams)
              ? workspaceTeams
              : Array.isArray(workspaceTeams?.teams)
                ? workspaceTeams.teams
                : Array.isArray(workspaceTeams?.data)
                  ? workspaceTeams.data
                  : Array.isArray(workspaceTeams?.items)
                    ? workspaceTeams.items
                    : [];
            const normalizedPromptWorkspaceTeams = rawPromptWorkspaceTeams
              .map((team) => {
                const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
                const nestedTeam = source.team && typeof source.team === "object" ? source.team : {};
                const id = String(
                  source.id
                    || source.teamId
                    || source.team_id
                    || nestedTeam.id
                    || nestedTeam.teamId
                    || "",
                ).trim();
                if (!id) return null;
                const roleId = String(
                  source.roleId
                    || source.role
                    || source.membershipRole
                    || source.membership_role
                    || source.currentUserRole
                    || source.current_user_role
                    || "member",
                ).trim().toLowerCase() || "member";
                return {
                  ...source,
                  id,
                  name: String(
                    source.name
                      || source.title
                      || source.displayName
                      || source.teamName
                      || nestedTeam.name
                      || "Team",
                  ).trim() || "Team",
                  description: String(source.description || nestedTeam.description || ""),
                  kind: "team",
                  roleId,
                  roleLabel: String(
                    source.roleLabel
                      || source.role_label
                      || (roleId.charAt(0).toUpperCase() + roleId.slice(1))
                  ),
                  createdAt: String(source.createdAt || source.created_at || nestedTeam.createdAt || ""),
                  profileImageUrl: String(
                    source.profileImageUrl
                      || source.imageUrl
                      || source.avatarUrl
                      || nestedTeam.profileImageUrl
                      || nestedTeam.imageUrl
                      || nestedTeam.avatarUrl
                      || "",
                  ),
                };
              })
              .filter(Boolean);

            const promptSharedTeamIds = getPlatformSharedTeamIds(getPromptResourceMetadata());
            const promptSharedTeamIdSet = new Set(promptSharedTeamIds);

            useEffect(() => {
              if (!promptShareModalOpen) {
                promptTeamsRequestRef.current = false;
                return;
              }
              if (
                normalizedPromptWorkspaceTeams.length
                || promptTeamsRequestRef.current
                || typeof onWorkspaceTeamsRequest !== "function"
              ) {
                return;
              }
              promptTeamsRequestRef.current = true;
              onWorkspaceTeamsRequest();
            }, [normalizedPromptWorkspaceTeams.length, onWorkspaceTeamsRequest, promptShareModalOpen]);

            const promptWorkspaceTeamById = new Map(
              normalizedPromptWorkspaceTeams.map((team) => [String(team.id), team]),
            );
            const promptAccessTeams = promptSharedTeamIds.map((teamId) =>
              promptWorkspaceTeamById.get(String(teamId)) || {
                id: String(teamId),
                name: "Team",
                kind: "team",
                roleId: "member",
                roleLabel: "Member",
                createdAt: "",
                profileImageUrl: "",
              },
            );
            const promptAvailableAccessTeams = normalizedPromptWorkspaceTeams.filter(
              (team) => !promptSharedTeamIdSet.has(String(team.id)),
            );
            const selectedPromptSystemPrincipal = getPlatformSystemAccessPrincipal(promptAccessPrincipalId);
            const selectedPromptAccessTeam = promptAccessPrincipalId && !selectedPromptSystemPrincipal
              ? promptAccessTeams.find((team) => String(team.id) === String(promptAccessPrincipalId)) || null
              : null;

            async function updatePromptAccessMetadata(nextMetadata, nextPermissionSet = selectedPrompt?.permissionSet) {
              if (!selectedPrompt?.id || isDraft) return false;
              setPromptAccessState({ isSaving: true, error: "" });
              try {
                const response = await requestJson(
                  "/api/real/prompts/" + encodeURIComponent(selectedPrompt.id),
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      metadata: nextMetadata || {},
                      permissionSet: nextPermissionSet || null,
                    }),
                  },
                );
                const record = normalizePromptRecord(response?.prompt || response);
                setSelectedPrompt(record);
                setPromptAccessState({ isSaving: false, error: "" });
                await loadPrompts();
                return true;
              } catch (error) {
                setPromptAccessState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to save prompt access settings.",
                });
                return false;
              }
            }

            function buildPromptTeamSharePayload(team, metadata) {
              const promptSnapshot = {
                id: selectedPrompt?.id || "",
                name: draft.name || selectedPrompt?.name || "Prompt",
                description: draft.description || selectedPrompt?.description || "",
              };
              return {
                resourceType: "prompt",
                resourceId: promptSnapshot.id,
                resourceName: promptSnapshot.name,
                accessLevel: "use",
                title: promptSnapshot.name,
                description: promptSnapshot.description,
                metadata: {
                  resourceType: "prompt",
                  resourceKind: "prompt",
                  sharedTeamId: team.id,
                  sharedTeamName: team.name,
                  permissionSet: getPlatformTeamPermissionSet(metadata, team.id, "prompt_team_role"),
                  rolePermissionSets: getPlatformTeamRolePermissionSets(
                    metadata,
                    team.id,
                    "prompt_team_role",
                    PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id),
                  ),
                  prompt: promptSnapshot,
                },
              };
            }

            async function findPromptTeamResourceShare(teamId) {
              if (!backendUrl || !selectedPrompt?.id) return null;
              const { response, data } = await fetchJsonWithTimeout(
                backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
                { method: "GET", credentials: "include", cache: "no-store", headers: requestHeaders },
                8000,
              );
              if (!response.ok) throw new Error(data?.message || data?.error || "Failed to load prompt team access.");
              const shares = Array.isArray(data?.data) ? data.data : Array.isArray(data?.shares) ? data.shares : [];
              return shares.find((share) =>
                String(share?.resourceType || share?.resource_type || "") === "prompt"
                && String(share?.resourceId || share?.resource_id || "") === String(selectedPrompt.id),
              ) || null;
            }

            async function sharePromptWithTeams(teamIds) {
              if (!selectedPrompt?.id || isDraft) {
                setPromptShareError("Save this prompt before sharing it with a team.");
                return;
              }
              const requestedTeamIds = new Set(
                (Array.isArray(teamIds) ? teamIds : [])
                  .map((teamId) => String(teamId || "").trim())
                  .filter(Boolean),
              );
              const teamsToShare = normalizedPromptWorkspaceTeams.filter((team) => (
                requestedTeamIds.has(String(team.id))
                && !promptSharedTeamIdSet.has(String(team.id))
              ));
              if (!teamsToShare.length) {
                setPromptShareError("Choose at least one team first.");
                return;
              }
              let nextMetadata = getPromptResourceMetadata();
              teamsToShare.forEach((team) => {
                nextMetadata = buildPlatformTeamAccessMetadata(
                  nextMetadata,
                  team.id,
                  true,
                  "prompt_team_role",
                  PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id),
                );
              });
              setPromptShareSaving(true);
              setPromptShareError("");
              const createdShares = [];
              try {
                if (!backendUrl) throw new Error("Sharing is unavailable until the team service is connected.");
                for (const team of teamsToShare) {
                  const { response, data } = await fetchJsonWithTimeout(
                    backendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares",
                    {
                      method: "POST",
                      credentials: "include",
                      cache: "no-store",
                      headers: { ...requestHeaders, "Content-Type": "application/json" },
                      body: JSON.stringify(buildPromptTeamSharePayload(team, nextMetadata)),
                    },
                    8000,
                  );
                  if (!response.ok && Number(response.status || 0) !== 409) {
                    throw new Error(data?.message || data?.error || `Failed to share prompt with ${team.name}.`);
                  }
                  if (Number(response.status || 0) !== 409) {
                    createdShares.push({
                      teamId: team.id,
                      shareId: String(data?.id || data?.data?.id || data?.share?.id || "").trim(),
                    });
                  }
                }
                await updatePromptAccessMetadata(nextMetadata);
                setPromptShareSaving(false);
                setPromptShareModalOpen(false);
                setPromptShareTeamIds([]);
              } catch (error) {
                await Promise.all(createdShares.map(async ({ teamId, shareId }) => {
                  try {
                    const share = shareId ? { id: shareId } : await findPromptTeamResourceShare(teamId);
                    if (!share?.id) return;
                    await fetchJsonWithTimeout(
                      backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares/" + encodeURIComponent(share.id),
                      { method: "DELETE", credentials: "include", cache: "no-store", headers: requestHeaders },
                      8000,
                    );
                  } catch {
                    // Preserve the original sharing error; stale shares remain removable in access settings.
                  }
                }));
                setPromptShareSaving(false);
                setPromptShareError(error instanceof Error ? error.message : "Failed to share prompt with the selected teams.");
              }
            }

            async function sharePromptWithTeam(teamId) {
              return sharePromptWithTeams([teamId]);
            }

            async function removePromptTeams(teams) {
              const requestedTeams = (Array.isArray(teams) ? teams : [teams])
                .filter((team) => team?.id && !isPlatformSystemAccessPrincipalId(team.id));
              if (!requestedTeams.length || !selectedPrompt?.id) return;
              setPromptAccessState({ isSaving: true, error: "" });
              try {
                if (backendUrl) {
                  await Promise.all(requestedTeams.map(async (team) => {
                    const share = await findPromptTeamResourceShare(team.id);
                    if (!share?.id) return;
                    const { response, data } = await fetchJsonWithTimeout(
                      backendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares/" + encodeURIComponent(share.id),
                      { method: "DELETE", credentials: "include", cache: "no-store", headers: requestHeaders },
                      8000,
                    );
                    if (!response.ok) throw new Error(data?.message || data?.error || "Failed to remove prompt team access.");
                  }));
                }
                let nextMetadata = getPromptResourceMetadata();
                requestedTeams.forEach((team) => {
                  nextMetadata = buildPlatformTeamAccessMetadata(
                    nextMetadata,
                    team.id,
                    false,
                    "prompt_team_role",
                    PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id),
                  );
                });
                setPromptAccessPrincipalId("");
                setPromptAccessSelectedTeamIds(new Set());
                await updatePromptAccessMetadata(nextMetadata);
              } catch (error) {
                setPromptAccessState({ isSaving: false, error: error instanceof Error ? error.message : "Failed to remove prompt team access." });
              }
            }

            useEffect(() => {
              if (!isDetail) return undefined;
              const handleShortcut = (event) => {
                if ((event.metaKey || event.ctrlKey) && String(event.key || "").toLowerCase() === "s") {
                  event.preventDefault();
                  openPromptVersionSaveDialog({ mode: event.shiftKey ? "new" : undefined });
                }
              };
              window.addEventListener("keydown", handleShortcut, true);
              return () => window.removeEventListener("keydown", handleShortcut, true);
            }, [draft.name, isDetail, isDirty, saveState.isSaving]);

            async function deletePrompts(targetRows) {
              const targets = (Array.isArray(targetRows) ? targetRows : [targetRows])
                .filter((row) => row && row.id && row.id !== PROMPT_DRAFT_ID);
              if (!targets.length || !window.confirm("Delete the selected prompt?")) return;
              setSaveState({ isSaving: true, error: "" });
              try {
                await Promise.all(targets.map((row) => requestJson(
                  "/api/real/prompts/" + encodeURIComponent(row.id),
                  { method: "DELETE" },
                )));
                if (targets.some((row) => row.id === selectedPromptId)) openPromptOverview();
                await loadPrompts();
              } catch (error) {
                setSaveState({ isSaving: false, error: error instanceof Error ? error.message : "Failed to delete prompt." });
              } finally {
                setSaveState((current) => ({ ...current, isSaving: false }));
              }
            }

            function isPromptCreatedByCurrentUser(prompt) {
              const normalizeIdentityKey = (value) => String(value || "").trim().toLowerCase();
              const placeholderIdentityNames = new Set([
                "",
                "unknown",
                "unknown user",
                "you",
                "me",
                "current user",
              ]);
              const currentIdentityKeys = new Set([
                normalizeIdentityKey(currentUserId),
                normalizeIdentityKey(currentUserEmail),
              ].filter(Boolean));
              const creatorIdentityKeys = [
                normalizeIdentityKey(prompt?.creatorId),
                normalizeIdentityKey(prompt?.creatorEmail),
              ].filter(Boolean);
              if (creatorIdentityKeys.some((key) => currentIdentityKeys.has(key))) return true;
              if (creatorIdentityKeys.length) return false;

              const creatorName = normalizeIdentityKey(prompt?.creatorName);
              const currentName = normalizeIdentityKey(currentUserName);
              if (placeholderIdentityNames.has(creatorName)) return true;
              return Boolean(currentName && creatorName === currentName);
            }

            function resolvePromptCreatorName(prompt, isCreatedByCurrentUser) {
              const creatorName = String(prompt?.creatorName || "").trim();
              const creatorEmail = String(prompt?.creatorEmail || "").trim().toLowerCase();
              const isPlaceholder = [
                "",
                "unknown",
                "unknown user",
                "you",
                "me",
                "current user",
              ].includes(creatorName.toLowerCase())
                || creatorName.includes("@")
                || Boolean(creatorEmail && creatorName.toLowerCase() === creatorEmail);
              if (creatorName && !isPlaceholder) return creatorName;
              if (isCreatedByCurrentUser) {
                const currentName = String(currentUserName || "").trim();
                if (
                  currentName
                  && !currentName.includes("@")
                  && !["unknown", "unknown user", "you", "me", "current user"]
                    .includes(currentName.toLowerCase())
                ) return currentName;
              }
              const emailName = creatorEmail
                .split("@")[0]
                ?.split("+")[0]
                ?.replace(/[._-]+/g, " ")
                ?.split(/\s+/)
                ?.filter(Boolean)
                ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                ?.join(" ") || "";
              return emailName || String(prompt?.creatorId || "Unknown user").trim();
            }

            const normalizedPromptOverviewScope = promptOverviewScope === "created"
              ? "created"
              : promptOverviewScope === "shared"
                ? "shared"
                : "all";
            const rows = useMemo(() => promptRows.map((prompt) => {
              const isCreatedByCurrentUser = isPromptCreatedByCurrentUser(prompt);
              return {
                ...prompt,
                searchText: [prompt.name, prompt.description, prompt.id].join(" "),
                isActive: true,
                isCustom: true,
                isCreatedByCurrentUser,
                updatedAt: Date.parse(String(prompt.updatedAt || prompt.createdAt || "")) || 0,
                updatedLabel: formatUpdatedLabel(prompt.updatedAt || prompt.createdAt),
                creatorName: resolvePromptCreatorName(prompt, isCreatedByCurrentUser),
                creatorAvatarUrl: prompt.creatorAvatarUrl
                  || (isCreatedByCurrentUser ? currentUserAvatarUrl : "")
                  || "",
              };
            }), [currentUserAvatarUrl, currentUserEmail, currentUserId, currentUserName, promptRows]);
            const scopedRows = useMemo(() => normalizedPromptOverviewScope === "created"
              ? rows.filter((row) => row.isCreatedByCurrentUser)
              : normalizedPromptOverviewScope === "shared"
                ? rows.filter((row) => !row.isCreatedByCurrentUser)
                : rows, [normalizedPromptOverviewScope, rows]);

            const promptPermissionActionDefinitions = PLAYGROUND_PERMISSION_ACTION_DEFINITIONS.filter(
              (definition) => Array.isArray(definition?.subjectTypes)
                && definition.subjectTypes.some((subjectType) => subjectType === "prompt" || subjectType === "prompt_team_role"),
            );
            const promptAccessSettings = !isDraft && selectedPrompt
              ? React.createElement(PlatformResourceAccessSettings, {
                  teams: promptAccessTeams,
                  resourceLabel: "Prompt",
                  selectedPrincipalId: promptAccessPrincipalId,
                  onSelectedPrincipalIdChange: (principalId) => {
                    setPromptAccessRoleId("member");
                    setPromptAccessPrincipalId(String(principalId || ""));
                  },
                  subjectType: "prompt",
                  teamSubjectType: "prompt_team_role",
                  systemPermissionSet: getPlatformSystemPrincipalPermissionSet(
                    getPromptResourceMetadata(),
                    selectedPromptSystemPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
                    "prompt",
                    selectedPrompt.permissionSet,
                  ),
                  onSystemPermissionSetChange: (permissionSet) => void updatePromptAccessMetadata(
                    buildPlatformSystemPrincipalPermissionMetadata(
                      getPromptResourceMetadata(),
                      selectedPromptSystemPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
                      permissionSet,
                      "prompt",
                    ),
                    permissionSet,
                  ),
                  systemRolePermissionSet: getPlatformSystemPrincipalRolePermissionSet(
                    getPromptResourceMetadata(),
                    PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
                    promptAccessRoleId,
                    "prompt_team_role",
                  ),
                  onSystemRolePermissionSetChange: (roleId, permissionSet) => void updatePromptAccessMetadata(
                    buildPlatformSystemPrincipalRolePermissionMetadata(
                      getPromptResourceMetadata(),
                      PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
                      roleId,
                      permissionSet,
                      "prompt_team_role",
                    ),
                  ),
                  selectedRoleId: promptAccessRoleId,
                  onSelectedRoleIdChange: setPromptAccessRoleId,
                  teamPermissionSet: selectedPromptAccessTeam
                    ? getPlatformTeamRolePermissionSet(
                        getPromptResourceMetadata(),
                        selectedPromptAccessTeam.id,
                        promptAccessRoleId,
                        "prompt_team_role",
                      )
                    : null,
                  onTeamPermissionSetChange: selectedPromptAccessTeam
                    ? (roleId, permissionSet) => void updatePromptAccessMetadata(
                        buildPlatformTeamRolePermissionMetadata(
                          getPromptResourceMetadata(),
                          selectedPromptAccessTeam.id,
                          roleId,
                          permissionSet,
                          "prompt_team_role",
                        ),
                      )
                    : undefined,
                  actionDefinitions: promptPermissionActionDefinitions,
                  animationKey: selectedPrompt.id + ":" + promptAccessRoleId,
                  disabled: promptAccessState.isSaving,
                  backLabel: "Settings",
                  className: "prompt-detail-page__access-settings",
                  addTeams: {
                    teams: promptAvailableAccessTeams,
                    totalTeamCount: normalizedPromptWorkspaceTeams.length,
                    loading: workspaceTeamsLoading,
                    requiresPlan: workspaceTeamsRequiresPlan,
                    disabled: promptAccessState.isSaving,
                    popupAriaLabel: "Add teams with prompt access",
                    onRequestTeams: onWorkspaceTeamsRequest,
                    onAddTeam: (team) => sharePromptWithTeam(team.id),
                  },
                  tableProps: {
                    className: "prompt-detail-page__access-table",
                    title: "Manage Prompt Access",
                    titleTooltip: "Controls which agents, organization roles, and teams can view, use, edit, version, publish, or delete this prompt.",
                    selectedIds: promptAccessSelectedTeamIds,
                    onSelectedIdsChange: setPromptAccessSelectedTeamIds,
                    pagination: {},
                    busy: promptAccessState.isSaving || promptShareSaving,
                    onRemoveTeams: removePromptTeams,
                    getTeamProfileImageUrl: (team) => String(team.profileImageUrl || ""),
                    formatCreatedAt: (value) => value ? formatUpdatedLabel(value) : "—",
                    error: promptAccessState.error || null,
                  },
                })
              : React.createElement(PlatformEmptyState, {
                  icon: MessageSquareText,
                  title: "Save this prompt to manage access.",
                  iconSize: 18,
                });
            const promptStorageRegion = getSelectedPromptStorageRegion();
            const promptIdentity = React.createElement("section", {
                className: "prompt-detail-page__identity",
                "aria-label": "Prompt identity",
              },
              React.createElement("div", {
                className: "prompt-detail-page__icon",
                "aria-hidden": "true",
              }, React.createElement(MessageSquareText, {
                width: 24,
                height: 24,
                strokeWidth: 1.7,
              })),
              React.createElement("div", { className: "prompt-detail-page__identity-copy" },
                React.createElement("input", {
                  ref: promptNameInputRef,
                  className: "prompt-detail-page__name-input",
                  value: draft.name,
                  placeholder: "new-prompt",
                  "aria-label": "Prompt name",
                  onChange: (event) => setDraft((current) => ({ ...current, name: event.target.value })),
                }),
                React.createElement("input", {
                  className: "prompt-detail-page__description-input",
                  value: draft.description,
                  placeholder: "Add a short description",
                  "aria-label": "Prompt description",
                  onChange: (event) => setDraft((current) => ({ ...current, description: event.target.value })),
                })
              )
            );

            const promptCreatorIdentity = getPromptCreatorIdentity(selectedPrompt);
            const promptOwnerIdentity = getPromptOwnerIdentity(selectedPrompt);
            const promptOwnerCandidates = promptOwnerCandidateState.promptId === String(selectedPrompt?.id || "")
              ? promptOwnerCandidateState.candidates
              : [promptOwnerIdentity];
            const promptOwnerOptionsByValue = new Map();
            [promptOwnerIdentity, ...promptOwnerCandidates].forEach((candidate) => {
              const key = String(candidate?.value || candidate?.id || candidate?.email || "").trim().toLowerCase();
              if (!key || promptOwnerOptionsByValue.has(key)) return;
              promptOwnerOptionsByValue.set(key, {
                value: String(candidate.value || candidate.id || candidate.email || key),
                name: String(candidate.name || candidate.email || "Unknown user"),
                email: String(candidate.email || ""),
                avatarUrl: String(candidate.avatarUrl || ""),
                data: { identity: candidate },
              });
            });
            const promptOwnerOptions = Array.from(promptOwnerOptionsByValue.values());
            const promptSettingsDetails = {
              variant: "standard",
              customAttributes: isDraft ? [{
                id: "status",
                label: "Status",
                value: "Draft",
              }] : [],
              updatedAt: selectedPrompt?.updatedAt || selectedPrompt?.createdAt,
              creator: promptCreatorIdentity,
              owner: promptOwnerIdentity,
              ownerOptions: promptOwnerOptions,
              onOwnerTransfer: !isDraft && selectedPrompt ? transferPromptOwner : undefined,
              ownerSelectorProps: {
                open: promptOwnerSelectorOpen,
                onOpenChange: handlePromptOwnerSelectorOpenChange,
                ariaLabel: "Choose prompt owner",
                resourceLabel: "prompt",
                alignment: "end",
                popupAlignment: "right",
                fullWidth: true,
                disabled: isDraft || Boolean(saveState.isSaving) || isDirty || promptAccessState.isSaving,
                loading: promptOwnerCandidateState.status === "loading",
                loadingContent: "Loading organization members...",
                emptyContent: "No organization members are available.",
                popupWidth: 260,
                popupMaxHeight: "min(320px, calc(100vh - 180px))",
                title: isDirty ? "Save prompt changes before changing the owner." : undefined,
              },
              primaryActions: [{
                id: "new-thread",
                label: "New Thread",
                onSelect: !isDraft && selectedPrompt
                  ? () => onStartThread?.(selectedPrompt)
                  : undefined,
                disabled: isDraft || !selectedPrompt || !onStartThread,
              }],
              className: "prompt-detail-page__settings-sidebar",
              propertiesClassName: "prompt-detail-page__settings-sidebar-properties",
            };

            const promptSettings = {
              ariaLabel: "Prompt settings",
              className: "prompt-detail-page__settings-content",
              identity: {
                icon: React.createElement(MessageSquareText, {
                  width: 24,
                  height: 24,
                  strokeWidth: 1.7,
                }),
                title: draft.name,
                description: draft.description,
                titleRef: promptNameInputRef,
                titlePlaceholder: "new-prompt",
                descriptionPlaceholder: "Add a short description",
                titleAriaLabel: "Prompt name",
                descriptionAriaLabel: "Prompt description",
                onTitleChange: (value) => setDraft((current) => ({ ...current, name: value })),
                onDescriptionChange: (value) => setDraft((current) => ({ ...current, description: value })),
                className: "prompt-detail-page__settings-identity",
                iconClassName: "prompt-detail-page__icon",
              },
              details: promptSettingsDetails,
              location: React.createElement(PlatformDeploymentMap, {
                regionCode: promptStorageRegion,
                title: "Storage region",
                className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map prompt-detail-page__storage-map",
              }),
              access: promptAccessSettings,
              accessDetailOpen: Boolean(promptAccessPrincipalId),
              detailsSidebarAriaLabel: "Prompt properties",
              detailsSidebarClassName: "prompt-detail-page__settings-sidebar-frame playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar",
            };

            const promptEditor = React.createElement(PlatformCodeEditorWorkspace, {
              files: [{
                id: "prompt-markdown",
                label: "PROMPT.md",
                tabLabel: "PROMPT.md",
                editorMode: "markdown",
                openInTab: true,
              }],
              activeFileId: "prompt-markdown",
              sidebarHidden: true,
              variant: "full-screen",
              className: "prompt-detail-page__workspace",
              ariaLabel: "Prompt Markdown editor",
              emptyEditor: "Write your prompt in Markdown.",
              markdownEditor: {
                value: draft.markdown,
                onChange: (value) => setDraft((current) => ({ ...current, markdown: value })),
                placeholder: "Write your prompt in Markdown.",
                ariaLabel: "Prompt Markdown content",
                historyKey: selectedPromptId || PROMPT_DRAFT_ID,
                contentVariant: "file-enabled",
                fileUpload: {
                  upload: uploadPromptEditorFiles,
                  resolvePreviewSource: resolvePromptEditorFilePreviewSource,
                },
                autoFocus: true,
              },
            });

            const promptNotice = saveState.error
              ? React.createElement("div", { className: "playground-environments-error prompt-detail-page__notice", role: "alert" }, saveState.error)
              : null;

            const detailPage = React.createElement(PromptDetailPage, {
              metadata: promptIdentity,
              notice: promptNotice,
              code: promptEditor,
              activeTab: promptDetailTab === "settings" ? "settings" : "general",
              settings: promptSettings,
            });

            const promptVersionsSidebar = isDetail && !isDraft && selectedPrompt
              ? React.createElement(PlatformVersionHistorySidebar, {
                  open: promptVersionsOpen,
                  title: "Version history",
                  sectionTitle: "All Versions",
                  className: "prompt-detail-page__versions-sidebar",
                  width: "var(--playground-thread-task-detail-width, min(42vw, 520px))",
                  portal: Boolean(promptVersionsDrawerContainer),
                  portalTarget: promptVersionsDrawerContainer,
                  versions: Array.isArray(selectedPrompt.versions) ? selectedPrompt.versions : [],
                  activeVersionId: selectedPrompt.publishedVersionId || "",
                  selectedVersionId: promptVersionSelectedId || selectedPrompt.currentVersionId || "",
                  loading: false,
                  error: saveState.error || null,
                  emptyDescription: "Save a version to start this prompt's version history.",
                  busy: saveState.isSaving || isDirty,
                  onClose: () => {
                    setPromptVersionChangesState(null);
                    setPromptVersionsOpen(false);
                  },
                  onCreateVersion: () => openPromptVersionSaveDialog({ mode: "new" }),
                  onSelectVersion: (versionId) => checkoutPromptVersion(versionId),
                  onPublishVersion: (versionId) => publishPromptVersion(versionId),
                  onViewChanges: () => openPromptVersionChangesModal(
                    promptVersionSelectedId || selectedPrompt.currentVersionId,
                  ),
                  getVersionCreatedAt: (version) => formatUpdatedLabel(version?.createdAt || version?.updatedAt),
                  canPublishVersion: (version) => canPublishPromptVersion(version),
                })
              : null;

            const promptShareTeams = normalizedPromptWorkspaceTeams.map((team) => ({
              ...team,
              shared: promptSharedTeamIdSet.has(String(team.id)),
            }));

            const promptShareModal = React.createElement(PlatformResourceShareModal, {
              open: promptShareModalOpen,
              resourceLabel: "Prompt",
              resourceName: draft.name || selectedPrompt?.name || "Prompt",
              teams: promptShareTeams,
              selectionMode: "multiple",
              selectedTeamIds: promptShareTeamIds,
              onSelectedTeamIdsChange: setPromptShareTeamIds,
              onClose: () => {
                if (promptShareSaving) return;
                setPromptShareModalOpen(false);
                setPromptShareError("");
              },
              onShareTeams: (teamIds) => void sharePromptWithTeams(teamIds),
              busy: promptShareSaving,
              loading: workspaceTeamsLoading,
              error: promptShareError,
              emptyMessage: workspaceTeamsRequiresPlan
                ? "A team plan is required to share prompts."
                : "No teams are available yet.",
            });

            const promptVersionDialog = promptVersionSaveDialog
              ? (() => {
                  const versionData = buildPromptVersionSaveDialogData();
                  const isBusy = saveState.isSaving;
                  return React.createElement(PlatformVersionSaveDialog, {
                    open: true,
                    title: "Review changes",
                    currentVersion: versionData.currentVersion?.number || null,
                    nextVersion: versionData.nextVersion,
                    currentDescription: String(draft.description || versionData.currentDescription || ""),
                    newDescription: String(draft.description || ""),
                    initialMode: promptVersionSaveDialog.initialMode || "new",
                    canSaveCurrent: versionData.canSaveCurrent,
                    instanceKey: promptVersionSaveDialog.key,
                    pending: isBusy,
                    error: saveState.error || null,
                    changes: versionData.diffFiles.map((file) => ({
                      id: file.id,
                      label: file.label || file.filePath,
                      content: React.createElement(PlatformDiffViewer, {
                        filePath: file.filePath,
                        diffContent: file.diffContent || "",
                        fileContent: file.fileContent || "",
                        additions: file.additions,
                        deletions: file.deletions,
                        hideTopbar: true,
                        embedded: true,
                        defaultExpanded: true,
                        maxHeight: 330,
                      }),
                    })),
                    emptyChanges: "No changes were found between the editor and the selected version.",
                    onClose: () => {
                      if (!isBusy) setPromptVersionSaveDialog(null);
                    },
                    onSubmit: async (details) => {
                      const savedPrompt = await savePrompt(details);
                      if (!savedPrompt) {
                        throw new Error("The prompt could not be saved. Review the validation details and try again.");
                      }
                      setPromptVersionSaveDialog(null);
                    },
                  });
                })()
              : null;

            const promptVersionChangesModal = renderPromptVersionChangesModal();

            const actionPortal = topNavActionsContainer
              ? createPortal(
                  isDetail
                    ? React.createElement(PlatformVersionPublishControl, {
                        open: promptPublishMenuOpen,
                        onOpenChange: setPromptPublishMenuOpen,
                        onPublish: () => openPromptVersionSaveDialog(),
                        active: isDirty,
                        disabled: saveState.isSaving || !isDirty || !String(draft.name || "").trim(),
                        menuDisabled: saveState.isSaving || !isDirty,
                        actions: [{
                          id: "revert-changes",
                          label: "Revert all changes",
                          icon: Undo2,
                          disabled: !isDirty,
                          onClick: discardPromptChanges,
                        }],
                        label: saveState.isSaving ? "Saving..." : "Save Changes",
                        leading: React.createElement(Bookmark, { strokeWidth: 1.8, "aria-hidden": "true" }),
                        publishAriaLabel: "Save prompt changes",
                        menuAriaLabel: "Prompt save options",
                        className: "prompt-detail-publish-control",
                      })
                    : React.createElement(PlatformPrimaryButton, {
                        type: "button",
                        size: "small",
                        onClick: openNewPrompt,
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }), "New Prompt"),
                  topNavActionsContainer,
                )
              : null;

            return React.createElement(React.Fragment, null,
              actionPortal,
              promptVersionDialog,
              promptVersionsSidebar,
              promptShareModal,
              promptVersionChangesModal,
              isDetail
                ? detailPage
                : React.createElement(PromptsOverviewPage, {
                    rows: scopedRows,
                    loading: promptsLoading,
                    headerActions: null,
                    controlsPortalId: "playground-tools-overview-controls",
                    onOpen: (row) => void openPrompt(row.id),
                    onCreate: openNewPrompt,
                    onEdit: (row) => void openPrompt(row.id),
                    onRename: (row) => void openPrompt(row.id),
                    onDelete: deletePrompts,
                    emptyState: promptsError || "No prompts available.",
                  }),
            );
          }

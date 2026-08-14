export const IMAGINE_PAGE_CONTROLLER_SCRIPT = String.raw`        function PlaygroundImaginePage({
          backendUrl,
          apiKey,
          speechToTextUrl,
          requestHeaders,
          computerAgents,
          environments,
          agents,
          skills,
          skillDefaults,
          environmentId,
          agentId,
          fetchCustomSkills,
          onThreadStarted,
          onThreadTitleGenerated,
          onAgentChange,
          onEnvironmentChange,
          onOpenPlansBudget,
          onOpenPromptSearch,
          onOpenThreadSearch,
          onRequireAuth,
          canGenerateVideo = true,
          activeView,
          mediaMode,
          filterMode: externalFilterMode,
          sortMode: externalSortMode,
          focusedTemplateId = "",
          focusedTemplateSelectionToken = "",
          onActiveViewChange,
          onMediaModeChange,
          isAgentSelectionBlocked,
          onBlockedAgentSelect,
        }) {
          const [localActiveTab, setLocalActiveTab] = useState("explore");
          const [searchQuery, setSearchQuery] = useState("");
          const [selectedTemplateId, setSelectedTemplateId] = useState("");
          const [templateAssetIndexes, setTemplateAssetIndexes] = useState({});
          const [templateAssetDirections, setTemplateAssetDirections] = useState({});
          const lastAppliedFocusedTemplateSelectionTokenRef = useRef("");
          const customTemplateStorageKey = "runner_demo_imagine_custom_templates_v1";
          const favouriteTemplateStorageKey = "runner_demo_imagine_favourite_template_ids_v1";
          const [customTemplates, setCustomTemplates] = useState(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return [];
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(customTemplateStorageKey) || "[]");
              return Array.isArray(parsed)
                ? parsed.filter((template) => template && template.id && (template.imageUrl || template.videoUrl || (Array.isArray(template.assets) && template.assets.length)))
                : [];
            } catch (_error) {
              return [];
            }
          });
          const [sharedCustomTemplates, setSharedCustomTemplates] = useState([]);
          const [favouriteTemplateIds, setFavouriteTemplateIds] = useState(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return [];
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(favouriteTemplateStorageKey) || "[]");
              if (!Array.isArray(parsed)) {
                return [];
              }
              return Array.from(new Set(parsed.map((id) => String(id || "").trim()).filter(Boolean)));
            } catch (_error) {
              return [];
            }
          });
          const imagineModelStorageKey = "runner_demo_imagine_model_settings_v1";
          const imagineImageModelOptions = useMemo(() => [
            {
              id: "gpt-image-2",
              label: "GPT Image 2",
              provider: "OpenAI",
              description: "Highest-fidelity OpenAI image generation and editing.",
            },
            {
              id: "gemini-3.1-flash-image-preview",
              label: "Gemini 3.1 Flash Image",
              provider: "Google DeepMind",
              description: "Fast multimodal image generation and editing preview.",
            },
          ], []);
          const imagineVideoModelOptions = useMemo(() => [
            {
              id: "seedance-2.0-fast",
              label: "Seedance 2.0 Fast",
              provider: "ByteDance",
              description: "Fast default video drafts and short motion clips.",
            },
            {
              id: "seedance-2.0",
              label: "Seedance 2.0",
              provider: "ByteDance",
              description: "Higher-quality Seedance video generation.",
            },
            {
              id: "grok-imagine-video",
              label: "Grok Imagine Video",
              provider: "xAI",
              description: "Alternative video model for imaginative motion.",
            },
          ], []);
          const normalizeImagineModelId = (mode, modelId) => {
            const options = String(mode || "") === "video" ? imagineVideoModelOptions : imagineImageModelOptions;
            const normalizedModelId = String(modelId || "").trim();
            return (options.find((option) => option.id === normalizedModelId) || options[0]).id;
          };
          const readStoredImagineModelSettings = () => {
            if (typeof window === "undefined" || !window.localStorage) {
              return {};
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(imagineModelStorageKey) || "{}");
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch (_error) {
              return {};
            }
          };
          const storedImagineModelSettings = readStoredImagineModelSettings();
          const [selectedImagineImageModelId, setSelectedImagineImageModelId] = useState(() =>
            normalizeImagineModelId("image", storedImagineModelSettings.image || skillDefaults?.imageGeneration?.model || "gpt-image-2")
          );
          const [selectedImagineVideoModelId, setSelectedImagineVideoModelId] = useState(() =>
            normalizeImagineModelId("video", storedImagineModelSettings.video || skillDefaults?.videoGeneration?.model || "seedance-2.0-fast")
          );
          const [imagineModelSelectorOpen, setImagineModelSelectorOpen] = useState(false);
          const imagineModelSelectorRef = useRef(null);
          const imagineModelSelectorButtonRef = useRef(null);
          const imagineModelMenuRef = useRef(null);
          const imagineModelPopupSourceIdRef = useRef(createPlaygroundImagineComposerPopupSourceId("imagine-model"));
          const imagineModelSelectorAnimation = usePlaygroundImaginePopupAnimation(imagineModelSelectorOpen);
          const imagineModelMenuStyle = usePlaygroundImagineAnchoredPopupStyle({
            open: imagineModelSelectorAnimation.shouldRender,
            anchorRef: imagineModelSelectorButtonRef,
            popupRef: imagineModelMenuRef,
          });

          async function generateImagineThreadTitle(threadId, prompt) {
            const normalizedThreadId = String(threadId || "").trim();
            const normalizedPrompt = String(prompt || "").trim();
            const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
            if (!normalizedThreadId || !normalizedPrompt || !normalizedBackendUrl) {
              return "";
            }

            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            if (apiKey) {
              headers.set("X-API-Key", apiKey);
            }

            const response = await fetch(
              normalizedBackendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/generate-title",
              {
                method: "POST",
                headers,
                body: JSON.stringify({ message: normalizedPrompt }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to generate thread title.");
            }

            return (
              String(data?.thread?.title || "").trim()
              || String(data?.title || "").trim()
            );
          }
          const [favouritesSyncReady, setFavouritesSyncReady] = useState(false);
          const [templateDraft, setTemplateDraft] = useState({
            title: "",
            description: "",
            prompt: "",
            assets: [],
            imageUrl: "",
            videoUrl: "",
            aspectRatio: "4 / 3",
            defaultAspectRatio: "",
            defaultStyles: ["professional"],
          });
          const [editingTemplateId, setEditingTemplateId] = useState("");
          const [templateFormError, setTemplateFormError] = useState("");
          const [createAspectRatioSelectorOpen, setCreateAspectRatioSelectorOpen] = useState(false);
          const [createStylePickerOpen, setCreateStylePickerOpen] = useState(false);
          const [createReferenceFileBrowserRequest, setCreateReferenceFileBrowserRequest] = useState(null);
          const [createReferenceImportState, setCreateReferenceImportState] = useState({
            status: "idle",
            error: "",
          });
          const createAspectRatioSelectorRef = useRef(null);
          const createStylePickerRef = useRef(null);
          const templateDescriptionTextareaRef = useRef(null);
          const templatePromptTextareaRef = useRef(null);
          const createReferenceEnvironmentIdRef = useRef(String(environmentId || ""));
          const filterMode = ["all", "campaign", "product", "editorial", "concept"].includes(String(externalFilterMode || ""))
            ? String(externalFilterMode || "")
            : "all";
          const sortMode = ["featured", "name-asc", "name-desc"].includes(String(externalSortMode || ""))
            ? String(externalSortMode || "")
            : "featured";
          const canUseVideoGeneration = canGenerateVideo !== false;
          const rawActiveMediaMode = String(mediaMode || "").toLowerCase() === "video" ? "video" : "image";
          const activeMediaMode = rawActiveMediaMode === "video" && !canUseVideoGeneration ? "image" : rawActiveMediaMode;
          const activeImagineModelOptions = activeMediaMode === "video" ? imagineVideoModelOptions : imagineImageModelOptions;
          const selectedImagineModelId = activeMediaMode === "video" ? selectedImagineVideoModelId : selectedImagineImageModelId;
          const selectedImagineModel = activeImagineModelOptions.find((option) => option.id === selectedImagineModelId) || activeImagineModelOptions[0];
          const selectedImagineImageModel = imagineImageModelOptions.find((option) => option.id === selectedImagineImageModelId) || imagineImageModelOptions[0];
          const selectedImagineVideoModel = imagineVideoModelOptions.find((option) => option.id === selectedImagineVideoModelId) || imagineVideoModelOptions[0];
          const imagineSkillDefaults = useMemo(() => {
            const source = skillDefaults && typeof skillDefaults === "object" ? skillDefaults : {};
            const imageGeneration = source.imageGeneration && typeof source.imageGeneration === "object" ? source.imageGeneration : {};
            const videoGeneration = source.videoGeneration && typeof source.videoGeneration === "object" ? source.videoGeneration : {};
            return {
              ...source,
              imageGeneration: {
                ...imageGeneration,
                model: selectedImagineImageModel.id,
              },
              videoGeneration: {
                ...videoGeneration,
                model: selectedImagineVideoModel.id,
              },
            };
          }, [selectedImagineImageModel.id, selectedImagineVideoModel.id, skillDefaults]);
          const imagineRunnerSkills = useMemo(() => {
            const sourceSkills = Array.isArray(skills) ? skills : [];
            return sourceSkills.map((skill) => {
              const normalizedSkillId = String(skill?.id || skill?.name || "").trim().toLowerCase();
              if (
                normalizedSkillId === "video_generation"
                || normalizedSkillId === "video-generation"
                || normalizedSkillId === "videogeneration"
                || normalizedSkillId.includes("video-generation")
              ) {
                return { ...skill, enabled: canUseVideoGeneration };
              }
              return skill;
            });
          }, [skills, canUseVideoGeneration]);
          useEffect(() => {
            if (!canUseVideoGeneration && rawActiveMediaMode === "video" && typeof onMediaModeChange === "function") {
              onMediaModeChange("image");
            }
          }, [canUseVideoGeneration, rawActiveMediaMode, onMediaModeChange]);
          const setActiveMediaMode = useCallback((nextMode) => {
            const normalizedNextMode = String(nextMode || "").toLowerCase() === "video" ? "video" : "image";
            if (normalizedNextMode === "video" && !canUseVideoGeneration) {
              requestPlatformPlanGate({
                entitlement: "imagine.generate",
                requiredPlan: "builder",
                featureName: "video generation",
                source: "imagine",
              });
              return;
            }
            if (typeof onMediaModeChange === "function") {
              onMediaModeChange(normalizedNextMode);
            }
          }, [canUseVideoGeneration, onMediaModeChange]);
          const rawActiveView = String(activeView || "");
          const normalizedActiveView = rawActiveView === "history"
            ? "my-templates"
            : ["explore", "my-templates", "create-template", "favourites"].includes(rawActiveView)
              ? rawActiveView
            : "";
          const activeTab = normalizedActiveView || localActiveTab;
          const previousActiveTabRef = useRef(activeTab);
          useEffect(() => {
            createReferenceEnvironmentIdRef.current = String(environmentId || "");
          }, [environmentId]);
          useEffect(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return;
            }
            try {
              window.localStorage.setItem(imagineModelStorageKey, JSON.stringify({
                image: selectedImagineImageModel.id,
                video: selectedImagineVideoModel.id,
              }));
            } catch (_error) {}
          }, [selectedImagineImageModel.id, selectedImagineVideoModel.id]);
          useEffect(() => {
            if (!imagineModelSelectorOpen || typeof document === "undefined") {
              return;
            }
            const handlePointerDown = (event) => {
              const target = event.target;
              if (imagineModelSelectorRef.current && target && imagineModelSelectorRef.current.contains(target)) {
                return;
              }
              if (imagineModelMenuRef.current && target && imagineModelMenuRef.current.contains(target)) {
                return;
              }
              setImagineModelSelectorOpen(false);
            };
            const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                setImagineModelSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            document.addEventListener("touchstart", handlePointerDown);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
              document.removeEventListener("touchstart", handlePointerDown);
              document.removeEventListener("keydown", handleKeyDown);
            };
          }, [imagineModelSelectorOpen]);
          useEffect(() => {
            if (typeof window === "undefined") {
              return undefined;
            }
            const handleComposerPopupOpen = (event) => {
              const sourceId = getPlaygroundImagineComposerPopupEventSource(event);
              if (!sourceId || sourceId === imagineModelPopupSourceIdRef.current) {
                return;
              }
              setImagineModelSelectorOpen(false);
            };
            window.addEventListener("tb-runner-composer-popup-open", handleComposerPopupOpen);
            return () => window.removeEventListener("tb-runner-composer-popup-open", handleComposerPopupOpen);
          }, []);
          useEffect(() => {
            setImagineModelSelectorOpen(false);
          }, [activeMediaMode]);
          const setActiveImagineTab = useCallback((nextTab) => {
            const rawNextTab = String(nextTab || "");
            const normalizedNextTab = rawNextTab === "history"
              ? "my-templates"
              : ["explore", "my-templates", "create-template", "favourites"].includes(rawNextTab)
              ? String(nextTab)
              : "explore";
            if (normalizedNextTab !== "create-template") {
              setEditingTemplateId("");
              setTemplateDraft({
                title: "",
                description: "",
                prompt: "",
                imageUrl: "",
                aspectRatio: "4 / 3",
                defaultAspectRatio: "",
                defaultStyles: ["professional"],
              });
              setTemplateFormError("");
              setCreateAspectRatioSelectorOpen(false);
              setCreateStylePickerOpen(false);
            }
            if (typeof onActiveViewChange === "function") {
              onActiveViewChange(normalizedNextTab);
            } else {
              setLocalActiveTab(normalizedNextTab);
            }
          }, [onActiveViewChange]);

          useEffect(() => {
            if (previousActiveTabRef.current !== activeTab) {
              setSelectedTemplateId("");
            }
            previousActiveTabRef.current = activeTab;
          }, [activeTab]);

          useEffect(() => {
            if (!createAspectRatioSelectorOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (createAspectRatioSelectorRef.current && !createAspectRatioSelectorRef.current.contains(event.target)) {
                setCreateAspectRatioSelectorOpen(false);
              }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            return () => document.removeEventListener("pointerdown", handlePointerDown);
          }, [createAspectRatioSelectorOpen]);

          useEffect(() => {
            if (!createStylePickerOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (createStylePickerRef.current && !createStylePickerRef.current.contains(event.target)) {
                setCreateStylePickerOpen(false);
              }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            return () => document.removeEventListener("pointerdown", handlePointerDown);
          }, [createStylePickerOpen]);

          useEffect(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return;
            }
            try {
              window.localStorage.setItem(customTemplateStorageKey, JSON.stringify(customTemplates));
            } catch (_error) {
              // Local template images can be large; failing to persist should not block the UI.
            }
          }, [customTemplates]);

          useEffect(() => {
            let cancelled = false;
            const loadSharedCustomTemplates = async () => {
              const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
              if (!normalizedBackendUrl) {
                setSharedCustomTemplates([]);
                return;
              }
              const headers = new Headers(requestHeaders || {});
              if (apiKey) {
                headers.set("X-API-Key", apiKey);
              }
              const parseMetadata = (metadata) => {
                if (!metadata) {
                  return {};
                }
                if (typeof metadata === "string") {
                  try {
                    return JSON.parse(metadata);
                  } catch (_error) {
                    return {};
                  }
                }
                return metadata && typeof metadata === "object" ? metadata : {};
              };
              try {
                const teamsResponse = await fetch(normalizedBackendUrl + "/teams", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                });
                if (!teamsResponse.ok) {
                  if (!cancelled) {
                    setSharedCustomTemplates([]);
                  }
                  return;
                }
                const teamsData = await teamsResponse.json().catch(() => ({}));
                const teams = Array.isArray(teamsData?.data) ? teamsData.data : [];
                const shareResponses = await Promise.all(teams.map(async (team) => {
                  const teamId = String(team?.id || "").trim();
                  if (!teamId) {
                    return [];
                  }
                  try {
                    const response = await fetch(
                      normalizedBackendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
                      {
                        method: "GET",
                        headers,
                        credentials: "include",
                        cache: "no-store",
                      }
                    );
                    if (!response.ok) {
                      return [];
                    }
                    const data = await response.json().catch(() => ({}));
                    return Array.isArray(data?.data) ? data.data : [];
                  } catch (_error) {
                    return [];
                  }
                }));
                const nextTemplates = [];
                shareResponses.flat().forEach((share) => {
                  if (String(share?.resourceType || "") !== "imagine_template") {
                    return;
                  }
                  const metadata = parseMetadata(share?.metadata);
                  const template = metadata?.template || metadata?.imagineTemplate || null;
                  if (!template || !template.imageUrl) {
                    return;
                  }
                  const normalizedTemplate = {
                    ...(template || {}),
                    id: String(template.id || share.resourceId || "").trim(),
                    isShared: true,
                    sharedTeamId: String(share.teamId || ""),
                    sharedShareId: String(share.id || ""),
                    sharedAccessLevel: String(share.accessLevel || "use"),
                  };
                  delete normalizedTemplate["long" + "Description"];
                  if (normalizedTemplate.id) {
                    nextTemplates.push(normalizedTemplate);
                  }
                });
                if (!cancelled) {
                  const deduped = Array.from(new Map(nextTemplates.map((template) => [template.id, template])).values());
                  setSharedCustomTemplates(deduped);
                }
              } catch (_error) {
                if (!cancelled) {
                  setSharedCustomTemplates([]);
                }
              }
            };
            void loadSharedCustomTemplates();
            return () => {
              cancelled = true;
            };
          }, [apiKey, backendUrl, requestHeaders]);

          useEffect(() => {
            let cancelled = false;
            const loadFavouriteTemplateIds = async () => {
              try {
                const response = await fetch("/api/aios/user/imagine-preferences", {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                });
                if (!response.ok) {
                  return;
                }
                const data = await response.json().catch(() => ({}));
                const remoteIds = Array.isArray(data?.favouriteTemplateIds)
                  ? data.favouriteTemplateIds.map((id) => String(id || "").trim()).filter(Boolean)
                  : [];
                if (cancelled || !remoteIds.length) {
                  return;
                }
                setFavouriteTemplateIds((current) => {
                  const localIds = Array.isArray(current) ? current.map((id) => String(id || "").trim()).filter(Boolean) : [];
                  return Array.from(new Set(localIds.concat(remoteIds)));
                });
              } catch (_error) {
                // Favourites still work locally if account preference sync is unavailable.
              } finally {
                if (!cancelled) {
                  setFavouritesSyncReady(true);
                }
              }
            };
            void loadFavouriteTemplateIds();
            return () => {
              cancelled = true;
            };
          }, []);

          useEffect(() => {
            const normalizedFavouriteIds = Array.from(new Set(
              (Array.isArray(favouriteTemplateIds) ? favouriteTemplateIds : [])
                .map((id) => String(id || "").trim())
                .filter(Boolean)
            ));
            if (typeof window !== "undefined" && window.localStorage) {
              try {
                window.localStorage.setItem(favouriteTemplateStorageKey, JSON.stringify(normalizedFavouriteIds));
              } catch (_error) {
                // Local storage is a convenience cache; remote sync below remains best effort.
              }
            }
            if (!favouritesSyncReady || typeof window === "undefined") {
              return;
            }
            const timeoutId = window.setTimeout(() => {
              void fetch("/api/aios/user/imagine-preferences", {
                method: "PATCH",
                credentials: "include",
                cache: "no-store",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  favouriteTemplateIds: normalizedFavouriteIds,
                }),
              }).catch(() => {});
            }, 350);
            return () => {
              window.clearTimeout(timeoutId);
            };
          }, [favouriteTemplateIds, favouritesSyncReady]);

`;

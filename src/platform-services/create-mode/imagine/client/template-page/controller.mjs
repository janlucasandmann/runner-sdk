export const IMAGINE_TEMPLATE_PAGE_CONTROLLER_SCRIPT = String.raw`        function PlaygroundImagineTemplatePage({
          templates,
          initialTemplateId,
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
          mediaMode,
          fetchCustomSkills,
          onThreadStarted,
          onMediaModeChange,
          onAgentChange,
          onEnvironmentChange,
          onOpenPlansBudget,
          onOpenPromptSearch,
          onOpenThreadSearch,
          onEditTemplate,
          onDeleteTemplate,
          favouriteTemplateIds,
          onToggleFavouriteTemplate,
          canGenerateVideo = true,
          onBack,
        }) {
          const normalizedTemplates = useMemo(() => Array.isArray(templates) ? templates : [], [templates]);
          const [activeTemplateId, setActiveTemplateId] = useState(String(initialTemplateId || "").trim());
          const [templateWindowStart, setTemplateWindowStart] = useState(0);
          const [imageName, setImageName] = useState("");
          const [selectedConnectors, setSelectedConnectors] = useState([]);
          const [fileBrowserRequest, setFileBrowserRequest] = useState(null);
          const [attachedFiles, setAttachedFiles] = useState([]);
          const [isAttachmentDragging, setIsAttachmentDragging] = useState(false);
          const [selectedProjectId, setSelectedProjectId] = useState("");
          const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
          const [aspectRatioSelectorOpen, setAspectRatioSelectorOpen] = useState(false);
          const [previewTransition, setPreviewTransition] = useState({
            previousTemplate: null,
            direction: 1,
            token: 0,
          });
          const [aspectRatio, setAspectRatio] = useState("");
          const [selectedStyleIds, setSelectedStyleIds] = useState([]);
          const [activeActionPopup, setActiveActionPopup] = useState("");
          const [shareTeams, setShareTeams] = useState([]);
          const [shareTeamId, setShareTeamId] = useState("");
          const [shareLoading, setShareLoading] = useState(false);
          const [shareError, setShareError] = useState("");
          const [localLikedTemplateIds, setLocalLikedTemplateIds] = useState([]);
          const [activeTemplateAssetIndex, setActiveTemplateAssetIndex] = useState(0);
          const [activeTemplateAssetDirection, setActiveTemplateAssetDirection] = useState(1);
          const [activeTemplateAssetTransition, setActiveTemplateAssetTransition] = useState({
            previousIndex: null,
            direction: 1,
            token: 0,
          });
          const [selectedTemplateAssetKeys, setSelectedTemplateAssetKeys] = useState([]);
          const [settingsFlipped, setSettingsFlipped] = useState(false);
          const [stylePickerOpen, setStylePickerOpen] = useState(false);
          const fileInputRef = useRef(null);
          const projectSelectorRef = useRef(null);
          const aspectRatioSelectorRef = useRef(null);
          const stylePickerRef = useRef(null);
          const previewTransitionTimeoutRef = useRef(null);
          const assetTransitionTimeoutRef = useRef(null);
          const detailRef = useRef(null);
          const composerWrapRef = useRef(null);
          const [previewSize, setPreviewSize] = useState({ width: 0, height: 0, top: 24 });
          const imagineTemplateModelStorageKey = "runner_demo_imagine_model_settings_v1";
          const imagineTemplateImageModelOptions = useMemo(() => [
            {
              id: "gpt-image-2",
              label: "GPT Image 2",
              provider: "OpenAI",
              description: "Highest-fidelity OpenAI image generation and editing.",
            },
            {
              id: "gemini-3.1-flash-image-preview",
              label: "Gemini 3.1 Flash Image",
              provider: "Google",
              description: "Fast multimodal image generation and editing preview.",
            },
          ], []);
          const imagineTemplateVideoModelOptions = useMemo(() => [
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
          const normalizeImagineTemplateModelId = (mode, modelId) => {
            const options = String(mode || "") === "video" ? imagineTemplateVideoModelOptions : imagineTemplateImageModelOptions;
            const normalizedModelId = String(modelId || "").trim();
            return (options.find((option) => option.id === normalizedModelId) || options[0]).id;
          };
          const readStoredImagineTemplateModelSettings = () => {
            if (typeof window === "undefined" || !window.localStorage) {
              return {};
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(imagineTemplateModelStorageKey) || "{}");
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch (_error) {
              return {};
            }
          };
          const storedImagineTemplateModelSettings = readStoredImagineTemplateModelSettings();
          const [selectedImagineTemplateImageModelId, setSelectedImagineTemplateImageModelId] = useState(() =>
            normalizeImagineTemplateModelId("image", storedImagineTemplateModelSettings.image || skillDefaults?.imageGeneration?.model || "gpt-image-2")
          );
          const [selectedImagineTemplateVideoModelId, setSelectedImagineTemplateVideoModelId] = useState(() =>
            normalizeImagineTemplateModelId("video", storedImagineTemplateModelSettings.video || skillDefaults?.videoGeneration?.model || "seedance-2.0-fast")
          );
          const [imagineTemplateModelSelectorOpen, setImagineTemplateModelSelectorOpen] = useState(false);
          const imagineTemplateModelSelectorRef = useRef(null);
          const imagineTemplateModelSelectorButtonRef = useRef(null);
          const imagineTemplateModelMenuRef = useRef(null);
          const imagineTemplateModelPopupSourceIdRef = useRef(createPlaygroundImagineTemplateComposerPopupSourceId("imagine-template-model"));
          const imagineTemplateModelSelectorAnimation = usePlaygroundImagineTemplatePopupAnimation(imagineTemplateModelSelectorOpen);
          const imagineTemplateModelMenuStyle = usePlaygroundImagineTemplateAnchoredPopupStyle({
            open: imagineTemplateModelSelectorAnimation.shouldRender,
            anchorRef: imagineTemplateModelSelectorButtonRef,
            popupRef: imagineTemplateModelMenuRef,
          });

          useEffect(() => {
            const nextTemplateId = String(initialTemplateId || "").trim();
            if (nextTemplateId) {
              setActiveTemplateId(nextTemplateId);
            }
          }, [initialTemplateId]);

          const activeTemplate = useMemo(() => {
            return normalizedTemplates.find((template) => template.id === activeTemplateId) || normalizedTemplates[0] || null;
          }, [activeTemplateId, normalizedTemplates]);
          const canUseVideoGeneration = canGenerateVideo !== false;
          const rawActiveMediaMode = String(mediaMode || "").toLowerCase() === "video" ? "video" : "image";
          const activeMediaMode = rawActiveMediaMode === "video" && !canUseVideoGeneration ? "image" : rawActiveMediaMode;
          const activeImagineTemplateModelOptions = activeMediaMode === "video" ? imagineTemplateVideoModelOptions : imagineTemplateImageModelOptions;
          const selectedImagineTemplateImageModel = imagineTemplateImageModelOptions.find((option) => option.id === selectedImagineTemplateImageModelId) || imagineTemplateImageModelOptions[0];
          const selectedImagineTemplateVideoModel = imagineTemplateVideoModelOptions.find((option) => option.id === selectedImagineTemplateVideoModelId) || imagineTemplateVideoModelOptions[0];
          const selectedImagineTemplateModel = activeMediaMode === "video" ? selectedImagineTemplateVideoModel : selectedImagineTemplateImageModel;
          const imagineTemplateSkillDefaults = useMemo(() => {
            const source = skillDefaults && typeof skillDefaults === "object" ? skillDefaults : {};
            const imageGeneration = source.imageGeneration && typeof source.imageGeneration === "object" ? source.imageGeneration : {};
            const videoGeneration = source.videoGeneration && typeof source.videoGeneration === "object" ? source.videoGeneration : {};
            return {
              ...source,
              imageGeneration: {
                ...imageGeneration,
                model: selectedImagineTemplateImageModel.id,
              },
              videoGeneration: {
                ...videoGeneration,
                model: selectedImagineTemplateVideoModel.id,
              },
            };
          }, [selectedImagineTemplateImageModel.id, selectedImagineTemplateVideoModel.id, skillDefaults]);
          const imagineTemplateRunnerSkills = useMemo(() => {
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

          const normalizedFavouriteTemplateIds = useMemo(() => {
            if (!Array.isArray(favouriteTemplateIds)) {
              return [];
            }
            return Array.from(new Set(favouriteTemplateIds.map((id) => String(id || "").trim()).filter(Boolean)));
          }, [favouriteTemplateIds]);

          const likedTemplateIds = typeof onToggleFavouriteTemplate === "function"
            ? normalizedFavouriteTemplateIds
            : localLikedTemplateIds;

          useEffect(() => {
            if (activeActionPopup !== "share-template") {
              return undefined;
            }
            let cancelled = false;
            const loadShareTeams = async () => {
              const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
              if (!normalizedBackendUrl) {
                if (!cancelled) {
                  setShareTeams([]);
                  setShareError("Team sharing is unavailable in this session.");
                }
                return;
              }
              setShareLoading(true);
              setShareError("");
              try {
                const headers = new Headers(requestHeaders || {});
                if (apiKey) {
                  headers.set("X-API-Key", apiKey);
                }
                const response = await fetch(normalizedBackendUrl + "/teams", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load teams.");
                }
                const teams = Array.isArray(data?.data) ? data.data : [];
                if (!cancelled) {
                  setShareTeams(teams);
                  setShareTeamId((current) => {
                    if (current && teams.some((team) => String(team?.id || "") === current)) {
                      return current;
                    }
                    return teams[0]?.id ? String(teams[0].id) : "";
                  });
                }
              } catch (error) {
                if (!cancelled) {
                  setShareTeams([]);
                  setShareError(error instanceof Error ? error.message : "Failed to load teams.");
                }
              } finally {
                if (!cancelled) {
                  setShareLoading(false);
                }
              }
            };
            void loadShareTeams();
            return () => {
              cancelled = true;
            };
          }, [activeActionPopup, apiKey, backendUrl, requestHeaders]);

          useEffect(() => {
            return () => {
              if (previewTransitionTimeoutRef.current) {
                clearTimeout(previewTransitionTimeoutRef.current);
              }
              if (assetTransitionTimeoutRef.current) {
                clearTimeout(assetTransitionTimeoutRef.current);
              }
            };
          }, []);

          useEffect(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return;
            }
            try {
              const current = readStoredImagineTemplateModelSettings();
              window.localStorage.setItem(imagineTemplateModelStorageKey, JSON.stringify({
                ...current,
                image: selectedImagineTemplateImageModel.id,
                video: selectedImagineTemplateVideoModel.id,
              }));
            } catch (_error) {}
          }, [selectedImagineTemplateImageModel.id, selectedImagineTemplateVideoModel.id]);

          useEffect(() => {
            if (!imagineTemplateModelSelectorOpen || typeof document === "undefined") {
              return;
            }
            const handlePointerDown = (event) => {
              const target = event.target;
              if (imagineTemplateModelSelectorRef.current && target && imagineTemplateModelSelectorRef.current.contains(target)) {
                return;
              }
              if (imagineTemplateModelMenuRef.current && target && imagineTemplateModelMenuRef.current.contains(target)) {
                return;
              }
              setImagineTemplateModelSelectorOpen(false);
            };
            const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                setImagineTemplateModelSelectorOpen(false);
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
          }, [imagineTemplateModelSelectorOpen]);

          useEffect(() => {
            if (typeof window === "undefined") {
              return undefined;
            }
            const handleComposerPopupOpen = (event) => {
              const sourceId = getPlaygroundImagineTemplateComposerPopupEventSource(event);
              if (!sourceId || sourceId === imagineTemplateModelPopupSourceIdRef.current) {
                return;
              }
              setImagineTemplateModelSelectorOpen(false);
            };
            window.addEventListener("tb-runner-composer-popup-open", handleComposerPopupOpen);
            return () => window.removeEventListener("tb-runner-composer-popup-open", handleComposerPopupOpen);
          }, []);

          useEffect(() => {
            setImagineTemplateModelSelectorOpen(false);
          }, [activeMediaMode]);

          useEffect(() => {
            if (!activeTemplate) {
              return;
            }
            setImageName((current) => String(current || "").trim() ? current : activeTemplate.title);
          }, [activeTemplate]);

          useEffect(() => {
            if (!activeTemplate) {
              return;
            }
            const activeIndex = normalizedTemplates.findIndex((template) => template.id === activeTemplate.id);
            if (activeIndex < 0) {
              return;
            }
            setTemplateWindowStart((current) => {
              const maxStart = Math.max(0, normalizedTemplates.length - 4);
              if (activeIndex < current) {
                return Math.max(0, activeIndex);
              }
              if (activeIndex >= current + 4) {
                return Math.min(maxStart, Math.max(0, activeIndex - 3));
              }
              return Math.min(current, maxStart);
            });
          }, [activeTemplate, normalizedTemplates]);

`;

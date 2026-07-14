export const IMAGINE_TEMPLATE_PAGE_CONTEXT_SCRIPT = String.raw`          const visibleTemplates = useMemo(() => {
            return normalizedTemplates.slice(templateWindowStart, templateWindowStart + 4);
          }, [normalizedTemplates, templateWindowStart]);

          const connectors = useMemo(() => [
            {
              id: "google-drive",
              source: "google-drive",
              label: "Google Drive",
              Icon: Folder,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
            },
            {
              id: "onedrive",
              source: "one-drive",
              label: "OneDrive",
              Icon: Cloud,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg",
            },
            {
              id: "notion",
              source: "notion",
              label: "Notion",
              Icon: FileText,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
            },
            {
              id: "github",
              source: "github",
              label: "GitHub",
              Icon: GitFork,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
            },
          ], []);

          const availableProjects = useMemo(() => {
            const sourceProjects = Array.isArray(computerAgents?.projects?.items)
              ? computerAgents.projects.items
              : [];
            const merged = new Map();
            sourceProjects.forEach((project) => {
              const projectId = String(project?.id || project?.projectId || "").trim();
              if (!projectId) {
                return;
              }
              merged.set(projectId, {
                ...project,
                id: projectId,
                name: String(project?.name || project?.title || "Untitled Project").trim() || "Untitled Project",
              });
            });
            return Array.from(merged.values());
          }, [computerAgents]);

          useEffect(() => {
            if (!projectSelectorOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (projectSelectorRef.current && !projectSelectorRef.current.contains(event.target)) {
                setProjectSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
            };
          }, [projectSelectorOpen]);

          useEffect(() => {
            if (!aspectRatioSelectorOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (aspectRatioSelectorRef.current && !aspectRatioSelectorRef.current.contains(event.target)) {
                setAspectRatioSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
            };
          }, [aspectRatioSelectorOpen]);

          useEffect(() => {
            if (!stylePickerOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (stylePickerRef.current && !stylePickerRef.current.contains(event.target)) {
                setStylePickerOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
            };
          }, [stylePickerOpen]);

          const renderImagineConnectorIcon = (connector) => {
            if (typeof renderTaskConnectorServiceIcon === "function") {
              return renderTaskConnectorServiceIcon(connector.source || connector.id, "playground-tasks-connector-service-icon");
            }
            if (connector.logoUrl) {
              return React.createElement("img", {
                src: connector.logoUrl,
                alt: "",
                draggable: false,
                className: "playground-tasks-connector-service-icon" + (connector.id === "github" ? " is-github" : "") + (connector.id === "notion" ? " is-notion" : ""),
              });
            }
            const ConnectorIcon = connector.Icon || Link2;
            return React.createElement(ConnectorIcon, { className: "playground-tasks-connector-service-icon", strokeWidth: 1.8 });
          };

          const styleOptions = useMemo(() => [
            { id: "professional", label: "Professional", Icon: Award },
            { id: "editorial", label: "Editorial", Icon: Camera },
            { id: "premium", label: "Premium", Icon: Sparkles },
            { id: "minimal", label: "Minimal", Icon: Minus },
            { id: "cinematic", label: "Cinematic", Icon: Film },
            { id: "studio", label: "Studio", Icon: Crop },
            { id: "lifestyle", label: "Lifestyle", Icon: User },
            { id: "bold", label: "Bold", Icon: Flame },
            { id: "playful", label: "Playful", Icon: Wand2 },
            { id: "technical", label: "Technical", Icon: Code2 },
            { id: "data-driven", label: "Data-driven", Icon: ChartNoAxesColumnIncreasing },
            { id: "product", label: "Product", Icon: Package },
            { id: "social", label: "Social", Icon: MessageCircle },
            { id: "exploratory", label: "Exploratory", Icon: Telescope },
          ], []);
          const selectedStyleOptions = useMemo(() => {
            const selectedSet = new Set(selectedStyleIds);
            return styleOptions.filter((option) => selectedSet.has(option.id));
          }, [selectedStyleIds, styleOptions]);
          const aspectRatioOptions = useMemo(() => [
            { value: "", label: "No preference", description: "Let the agent choose the best format" },
            { value: "1:1", label: "1:1", description: "Square composition" },
            { value: "4:5", label: "4:5", description: "Portrait campaign image" },
            { value: "16:9", label: "16:9", description: "Wide landscape image" },
            { value: "9:16", label: "9:16", description: "Vertical story format" },
          ], []);
          const selectedAspectRatioOption = useMemo(() => {
            return aspectRatioOptions.find((option) => option.value === aspectRatio) || aspectRatioOptions[0];
          }, [aspectRatio, aspectRatioOptions]);
          const selectedProject = useMemo(() => {
            return availableProjects.find((project) => project.id === selectedProjectId) || null;
          }, [availableProjects, selectedProjectId]);

          useEffect(() => {
            if (!activeTemplate) {
              return;
            }
            const knownStyleIds = new Set(styleOptions.map((option) => option.id));
            const templateDefaults = Array.isArray(activeTemplate.defaultStyles)
              ? activeTemplate.defaultStyles
                  .map((styleId) => String(styleId || "").trim())
                  .filter((styleId) => knownStyleIds.has(styleId))
              : [];
            setSelectedStyleIds(templateDefaults.length ? templateDefaults : ["professional"]);
            const knownAspectRatios = new Set(aspectRatioOptions.map((option) => option.value));
            const templateDefaultAspectRatio = String(activeTemplate.defaultAspectRatio || "").trim();
            setAspectRatio(knownAspectRatios.has(templateDefaultAspectRatio) ? templateDefaultAspectRatio : "");
            setStylePickerOpen(false);
            setAspectRatioSelectorOpen(false);
          }, [activeTemplate?.id, aspectRatioOptions, styleOptions]);

          const activeTemplateAssets = useMemo(() => normalizePlaygroundImagineTemplatePageAssets(activeTemplate), [activeTemplate]);
          const normalizedActiveTemplateAssetIndex = activeTemplateAssets.length
            ? Math.max(0, Math.min(activeTemplateAssetIndex, activeTemplateAssets.length - 1))
            : 0;
          const activeTemplatePrimaryAsset = activeTemplateAssets[normalizedActiveTemplateAssetIndex] || activeTemplateAssets[0] || null;
          const getActiveTemplateAssetKey = useCallback((asset, assetIndex) => String(assetIndex) + ":" + String(asset?.url || ""), []);
          const selectedTemplateAssets = useMemo(() => {
            const selectedKeys = new Set(selectedTemplateAssetKeys);
            const selectedAssets = activeTemplateAssets.filter((asset, assetIndex) => selectedKeys.has(getActiveTemplateAssetKey(asset, assetIndex)));
            return selectedAssets.length ? selectedAssets : activeTemplateAssets;
          }, [activeTemplateAssets, getActiveTemplateAssetKey, selectedTemplateAssetKeys]);
          const setActiveTemplateAsset = useCallback((nextIndex, direction) => {
            if (activeTemplateAssets.length <= 1) {
              return;
            }
            const normalizedIndex = ((Number(nextIndex) || 0) + activeTemplateAssets.length) % activeTemplateAssets.length;
            if (normalizedIndex === normalizedActiveTemplateAssetIndex) {
              return;
            }
            const normalizedDirection = Number(direction || 0) < 0 ? -1 : (Number(direction || 0) > 0 ? 1 : (normalizedIndex >= normalizedActiveTemplateAssetIndex ? 1 : -1));
            if (assetTransitionTimeoutRef.current) {
              clearTimeout(assetTransitionTimeoutRef.current);
            }
            setActiveTemplateAssetDirection(normalizedDirection);
            setActiveTemplateAssetTransition({
              previousIndex: normalizedActiveTemplateAssetIndex,
              direction: normalizedDirection,
              token: Date.now(),
            });
            setActiveTemplateAssetIndex(normalizedIndex);
            assetTransitionTimeoutRef.current = setTimeout(() => {
              setActiveTemplateAssetTransition((current) => ({
                ...current,
                previousIndex: null,
              }));
            }, 300);
          }, [activeTemplateAssets.length, normalizedActiveTemplateAssetIndex]);
          const activeTemplateBackground = activeTemplatePrimaryAsset?.type === "image"
            ? "url('" + activeTemplatePrimaryAsset.url + "') center / cover no-repeat"
            : (activeTemplate?.tone || "linear-gradient(135deg, #141414, #333)");
          const activeTemplateAspectRatio = String(activeTemplatePrimaryAsset?.aspectRatio || activeTemplate?.aspectRatio || "4 / 3").replace(":", " / ");
          const activeTemplateAspectRatioNumber = useMemo(() => {
            const ratioText = String(activeTemplateAspectRatio || "4 / 3");
            const parts = ratioText.split("/").map((part) => Number(String(part || "").trim()));
            const width = parts[0];
            const height = parts[1];
            if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
              return width / height;
            }
            return 4 / 3;
          }, [activeTemplateAspectRatio]);

          useEffect(() => {
            setActiveTemplateAssetIndex(0);
            setActiveTemplateAssetDirection(1);
            setActiveTemplateAssetTransition({
              previousIndex: null,
              direction: 1,
              token: 0,
            });
          }, [activeTemplate?.id]);

          useEffect(() => {
            setSelectedTemplateAssetKeys(activeTemplateAssets.map((asset, assetIndex) => getActiveTemplateAssetKey(asset, assetIndex)));
          }, [activeTemplate?.id, activeTemplateAssets, getActiveTemplateAssetKey]);

          useLayoutEffect(() => {
            const detailNode = detailRef.current;
            const composerNode = composerWrapRef.current;
            if (!detailNode || !composerNode) {
              return undefined;
            }

            let frameId = 0;
            const updatePreviewSize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                const detailRect = detailNode.getBoundingClientRect();
                const composerRect = composerNode.getBoundingClientRect();
                if (!detailRect.width || !detailRect.height) {
                  return;
                }

                const topMargin = 24;
                const bottomGap = 24;
                const composerTop = Math.max(0, composerRect.top - detailRect.top);
                const availableHeight = Math.max(180, composerTop - topMargin - bottomGap);
                const composerWidth = composerRect.width || Math.min(896, Math.max(0, detailRect.width - 64));
                const availableWidth = Math.max(180, Math.min(composerWidth, detailRect.width - 132));
                const safeRatio = Number.isFinite(activeTemplateAspectRatioNumber) && activeTemplateAspectRatioNumber > 0
                  ? activeTemplateAspectRatioNumber
                  : 4 / 3;
                let nextWidth = Math.min(availableWidth, availableHeight * safeRatio);
                let nextHeight = nextWidth / safeRatio;
                if (nextHeight > availableHeight) {
                  nextHeight = availableHeight;
                  nextWidth = nextHeight * safeRatio;
                }

                nextWidth = Math.max(180, Math.floor(nextWidth));
                nextHeight = Math.max(180, Math.floor(nextHeight));
                const nextTop = Math.max(topMargin, Math.floor(topMargin + ((availableHeight - nextHeight) / 2)));
                setPreviewSize((current) => (
                  Math.abs(current.width - nextWidth) > 1 || Math.abs(current.height - nextHeight) > 1 || Math.abs(current.top - nextTop) > 1
                    ? { width: nextWidth, height: nextHeight, top: nextTop }
                    : current
                ));
              });
            };

            updatePreviewSize();
            window.addEventListener("resize", updatePreviewSize);
            let detailObserver = null;
            let composerObserver = null;
            if (typeof ResizeObserver !== "undefined") {
              detailObserver = new ResizeObserver(updatePreviewSize);
              composerObserver = new ResizeObserver(updatePreviewSize);
              detailObserver.observe(detailNode);
              composerObserver.observe(composerNode);
            }

            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              window.removeEventListener("resize", updatePreviewSize);
              if (detailObserver) {
                detailObserver.disconnect();
              }
              if (composerObserver) {
                composerObserver.disconnect();
              }
            };
          }, [activeTemplateAspectRatioNumber]);

`;

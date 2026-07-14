export const IMAGINE_TEMPLATE_PAGE_ACTIONS_SCRIPT = String.raw`          const handleProjectSelect = (nextProjectId) => {
            const normalizedProjectId = String(nextProjectId || "").trim();
            setSelectedProjectId(normalizedProjectId);
            setProjectSelectorOpen(false);
            setActiveActionPopup("");
            try {
              computerAgents?.projects?.onProjectChange?.(normalizedProjectId);
            } catch (error) {
              console.warn("[Imagine] Failed to update selected project", error);
            }
          };

          const handleAspectRatioSelect = (nextAspectRatio) => {
            setAspectRatio(String(nextAspectRatio || "").trim());
            setAspectRatioSelectorOpen(false);
            setActiveActionPopup("");
          };

          const handleGenerateWithoutInstructions = () => {
            const runnerRoot = document.querySelector(".playground-imagine-template-runner");
            const textarea = runnerRoot?.querySelector?.("textarea.sidebar-textarea");
            if (!textarea) {
              return;
            }
            const fallbackPrompt = activeMediaMode === "video" ? "Create this video." : "Create this image.";
            const prompt = String(activeTemplate?.placeholder || activeTemplate?.prompt || activeTemplate?.title || fallbackPrompt).trim() || fallbackPrompt;
            const descriptor = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
            if (descriptor?.set) {
              descriptor.set.call(textarea, prompt);
            } else {
              textarea.value = prompt;
            }
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.focus();
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => {
                const sendButton = runnerRoot?.querySelector?.('button[aria-label="Send message"]');
                if (sendButton && !sendButton.disabled) {
                  sendButton.click();
                }
              });
            });
          };

          const selectTemplateByOffset = (offset) => {
            if (!normalizedTemplates.length || normalizedTemplates.length <= 1) {
              return;
            }
            const currentIndex = Math.max(0, normalizedTemplates.findIndex((template) => template.id === activeTemplate?.id));
            const nextIndex = (currentIndex + offset + normalizedTemplates.length) % normalizedTemplates.length;
            const nextTemplate = normalizedTemplates[nextIndex] || null;
            if (!nextTemplate || nextTemplate.id === activeTemplate?.id) {
              return;
            }
            if (previewTransitionTimeoutRef.current) {
              clearTimeout(previewTransitionTimeoutRef.current);
            }
            const transitionToken = Date.now() + Math.random();
            setPreviewTransition({
              previousTemplate: activeTemplate || null,
              direction: offset >= 0 ? 1 : -1,
              token: transitionToken,
            });
            setActiveTemplateId(nextTemplate.id);
            setActiveTemplateMediaMode(String(nextTemplate.mediaType || "image") === "video" ? "video" : "image");
            setImageName(nextTemplate.title || "");
            setActiveActionPopup("");
            setSettingsFlipped(false);
            setStylePickerOpen(false);
            previewTransitionTimeoutRef.current = setTimeout(() => {
              setPreviewTransition((current) => (
                current.token === transitionToken
                  ? { ...current, previousTemplate: null }
                  : current
              ));
            }, 520);
          };

          const handleTemplatePrevious = () => {
            selectTemplateByOffset(-1);
          };

          const handleTemplateNext = () => {
            selectTemplateByOffset(1);
          };

          const addAttachedFiles = (files) => {
            const normalizedFiles = Array.from(files || []);
            if (!normalizedFiles.length) {
              return;
            }
            setAttachedFiles((current) => {
              const names = new Set(current);
              normalizedFiles.forEach((file) => {
                if (file?.name) {
                  names.add(file.name);
                }
              });
              return Array.from(names).slice(0, 8);
            });
          };

          const handleFilesSelected = (event) => {
            const files = Array.from(event?.target?.files || []);
            if (!files.length) {
              return;
            }
            addAttachedFiles(files);
            if (event?.target) {
              event.target.value = "";
            }
          };

          const handleAttachmentDrop = (event) => {
            event.preventDefault();
            setIsAttachmentDragging(false);
            addAttachedFiles(event?.dataTransfer?.files || []);
          };

          const toggleConnector = (connectorId) => {
            setSelectedConnectors((current) => (
              current.includes(connectorId)
                ? current.filter((id) => id !== connectorId)
                : [...current, connectorId]
            ));
          };

          const requestFileBrowser = (source) => {
            const normalizedSource = String(source || "").trim() || "workspace";
            setActiveActionPopup("");
            setFileBrowserRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              source: normalizedSource,
            });
          };

          const handleConnectorBrowse = (connector) => {
            const connectorId = String(connector?.id || "").trim();
            const connectorSource = String(connector?.source || connectorId).trim();
            if (connectorSource) {
              requestFileBrowser(connectorSource);
              return;
            }
            if (connectorId) {
              toggleConnector(connectorId);
            }
          };

          const toggleStyleOption = (styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setSelectedStyleIds((current) => (
              current.includes(normalizedStyleId)
                ? current.filter((id) => id !== normalizedStyleId)
                : [...current, normalizedStyleId]
            ));
          };

          const removeStyleOption = (styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setSelectedStyleIds((current) => current.filter((id) => id !== normalizedStyleId));
          };

          const toggleTemplateAssetSelection = (asset, assetIndex) => {
            const assetKey = getActiveTemplateAssetKey(asset, assetIndex);
            if (!assetKey) {
              return;
            }
            setSelectedTemplateAssetKeys((current) => {
              const currentSet = new Set(current);
              if (currentSet.has(assetKey)) {
                if (currentSet.size <= 1) {
                  return current;
                }
                currentSet.delete(assetKey);
                return Array.from(currentSet);
              }
              currentSet.add(assetKey);
              return Array.from(currentSet);
            });
          };

`;

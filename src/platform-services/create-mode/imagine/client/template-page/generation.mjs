export const IMAGINE_TEMPLATE_PAGE_GENERATION_SCRIPT = String.raw`          const selectedConnectorLabels = connectors
            .filter((connector) => selectedConnectors.includes(connector.id))
            .map((connector) => connector.label);

          const imagineTemplateReferenceAttachments = useMemo(() => {
            if (!activeTemplate || !selectedTemplateAssets.length) {
              return [];
            }
            const safeTitle = String(activeTemplate.title || "template")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") || "template";
            return selectedTemplateAssets.map((asset, assetIndex) => {
              const referenceUrl = String(asset?.url || "").trim();
              const isVideoReference = asset?.type === "video";
              const extensionMatch = referenceUrl.match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
              const rawExtension = String(extensionMatch?.[1] || (isVideoReference ? "mp4" : "webp")).toLowerCase();
              const normalizedExtension = rawExtension === "jpg" ? "jpeg" : rawExtension;
              const mimeType = isVideoReference
                ? (normalizedExtension === "webm" ? "video/webm" : "video/mp4")
                : (
                    normalizedExtension === "jpeg" || normalizedExtension === "png" || normalizedExtension === "webp" || normalizedExtension === "avif"
                      ? "image/" + normalizedExtension
                      : "image/webp"
                  );
              const fileExtension = normalizedExtension === "jpeg" ? "jpg" : normalizedExtension;
              const suffix = selectedTemplateAssets.length > 1 ? "-" + String(assetIndex + 1).padStart(2, "0") : "";
              return {
                url: referenceUrl,
                filename: "imagine-template-" + safeTitle + suffix + "." + fileExtension,
                mimeType,
                type: isVideoReference ? "video" : "image",
                runnerAttachmentRole: "imagine_template_reference",
              };
            });
          }, [activeTemplate, selectedTemplateAssets]);

          const imagineTemplateReferenceSummary = imagineTemplateReferenceAttachments.map((attachment) => attachment.filename).join(", ");
          const imagineTemplateReferenceLabel = imagineTemplateReferenceAttachments.length > 1
            ? String(imagineTemplateReferenceAttachments.length) + " selected template references"
            : "the selected template reference";
          const selectedAspectRatioLabel = aspectRatio || "No fixed aspect ratio";
          const preferredGenerationAspectRatio = aspectRatio || String(activeTemplate?.aspectRatio || "").trim() || "infer from the template media";
          const outputName = String(imageName || "").trim() || (activeTemplate?.title || "Generated image");
          const safeOutputSlug = outputName
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase() || "generated-image";
          const multiAssetTemplateOutputDirectory = "/workspace/imagine/" + safeOutputSlug;
          const selectedStyleLabels = selectedStyleOptions.map((option) => option.label).join(", ");

          const setActiveTemplateMediaMode = useCallback((nextMode) => {
            const normalizedNextMode = String(nextMode || "").toLowerCase() === "video" ? "video" : "image";
            if (normalizedNextMode === "video" && !canUseVideoGeneration) {
              requestPlatformPlanGate({
                entitlement: "imagine.generate",
                requiredPlan: "builder",
                featureName: "video generation",
                source: "imagine-template",
              });
              return;
            }
            if (typeof onMediaModeChange === "function") {
              onMediaModeChange(normalizedNextMode);
            }
          }, [canUseVideoGeneration, onMediaModeChange]);

          const selectImagineTemplateModel = (modelId) => {
            const normalizedModelId = normalizeImagineTemplateModelId(activeMediaMode, modelId);
            if (activeMediaMode === "video") {
              setSelectedImagineTemplateVideoModelId(normalizedModelId);
            } else {
              setSelectedImagineTemplateImageModelId(normalizedModelId);
            }
            setImagineTemplateModelSelectorOpen(false);
          };

          const toggleImagineTemplateModelSelector = () => {
            setImagineTemplateModelSelectorOpen((open) => {
              const nextOpen = !open;
              if (nextOpen) {
                emitPlaygroundImagineTemplateComposerPopupOpen(imagineTemplateModelPopupSourceIdRef.current);
              }
              return nextOpen;
            });
          };

          const renderImagineTemplateModelProviderIcon = (option, extraClassName = "") => {
            const providerIcon = getPlaygroundImagineTemplateModelProviderIcon(option);
            const shellClassName = [
              "playground-agents-model-provider-icon-shell",
              "playground-imagine-model-provider-icon-shell",
              extraClassName,
            ].filter(Boolean).join(" ");
            if (!providerIcon) {
              return React.createElement("span", { className: shellClassName, "aria-hidden": "true" });
            }
            return React.createElement("span", { className: shellClassName, "aria-hidden": "true" },
              React.createElement("img", {
                src: providerIcon.src,
                alt: "",
                draggable: "false",
                className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
              })
            );
          };

          const renderImagineTemplateMediaModeSwitch = () =>
            React.createElement("div", { className: "playground-imagine-media-switch", role: "group", "aria-label": "Generation type" },
              React.createElement("button", {
                type: "button",
                className: "playground-imagine-media-switch-button" + (activeMediaMode === "image" ? " is-active" : ""),
                onClick: () => setActiveTemplateMediaMode("image"),
              }, "Image"),
              React.createElement("button", {
                type: "button",
                className: "playground-imagine-media-switch-button" + (activeMediaMode === "video" ? " is-active" : ""),
                onClick: () => setActiveTemplateMediaMode("video"),
              }, "Video")
            );

          const renderImagineTemplateModelSelector = () =>
            React.createElement("div", { ref: imagineTemplateModelSelectorRef, className: "tb-selector-anchor playground-imagine-model-selector" },
              React.createElement("button", {
                ref: imagineTemplateModelSelectorButtonRef,
                type: "button",
                className: "tb-inline-selector tb-inline-selector-agent" + (imagineTemplateModelSelectorOpen ? " active" : ""),
                onClick: toggleImagineTemplateModelSelector,
                "aria-haspopup": "menu",
                "aria-expanded": imagineTemplateModelSelectorOpen ? "true" : "false",
              },
                renderImagineTemplateModelProviderIcon(selectedImagineTemplateModel, "playground-imagine-model-selector-icon"),
                React.createElement("span", { className: "playground-imagine-model-selector-label" }, selectedImagineTemplateModel.label),
                React.createElement(ChevronDown, { className: "tb-inline-selector-chevron", strokeWidth: 1.8 })
              ),
              imagineTemplateModelSelectorAnimation.shouldRender
                ? renderPlaygroundImagineTemplatePopupPortal(
                    React.createElement(PlatformPopupSurface, {
                      ref: imagineTemplateModelMenuRef,
                      className: "tb-popup-menu-inline tb-popup-menu-inline-agent playground-imagine-model-menu",
                      animation: imagineTemplateModelSelectorAnimation.animation,
                      onClick: (event) => event.stopPropagation(),
                    },
                    React.createElement("div", { className: "tb-popup-menu-inline-body playground-imagine-model-menu-body" },
                      activeImagineTemplateModelOptions.map((option) =>
                        React.createElement("button", {
                          key: option.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (option.id === selectedImagineTemplateModel.id ? " selected" : ""),
                          onClick: () => selectImagineTemplateModel(option.id),
                        },
                          renderImagineTemplateModelProviderIcon(option),
                          React.createElement("span", { className: "playground-imagine-model-option-copy" },
                            React.createElement("span", { className: "playground-imagine-model-option-title" }, option.label)
                          ),
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            option.id === selectedImagineTemplateModel.id
                              ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.8 })
                              : null
                          )
                        )
                      )
                    )
                  ),
                  imagineTemplateModelMenuStyle
                )
                : null
            );

          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine template mode. Treat this as a visual generation workflow, not a general chat.",
            imagineTemplateReferenceAttachments.length
              ? "The selected Imagine template reference asset" + (imagineTemplateReferenceAttachments.length > 1 ? "s are" : " is") + " attached to this turn as " + imagineTemplateReferenceSummary + ". " + (imagineTemplateReferenceAttachments.length > 1 ? "They are the primary visual references" : "It is the primary visual reference") + " and must appear above the user message as normal attachment" + (imagineTemplateReferenceAttachments.length > 1 ? "s." : ".")
              : "",
            imagineTemplateReferenceAttachments.length
              ? "Use the exact /workspace/uploads/... paths listed for " + imagineTemplateReferenceLabel + " in the attachment system prompt. Do not guess uploaded paths."
              : "",
            activeMediaMode === "video"
              ? "The user is creating a video. Use the Video Generation skill when possible and save generated videos into /workspace/generated_videos."
              : "The user is creating an image. Do not produce video unless the user switches this Imagine request to video or explicitly asks for video.",
            activeMediaMode === "video"
              ? "Selected video model: " + selectedImagineTemplateVideoModel.id + " (" + selectedImagineTemplateVideoModel.label + "). Include --model " + selectedImagineTemplateVideoModel.id + " when calling the video generation script unless the user explicitly asks for another model."
              : "Selected image model: " + selectedImagineTemplateImageModel.id + " (" + selectedImagineTemplateImageModel.label + "). Include --model " + selectedImagineTemplateImageModel.id + " when calling the image generation script unless the user explicitly asks for another model.",
            activeMediaMode === "video"
              ? "Generate exactly one final video for this Imagine request. Do not create variations, alternates, or run a second generate-video.py call after a video has been saved."
              : "",
            activeTemplate ? "Selected template: " + activeTemplate.title + "." : "",
            activeTemplate ? "Template direction: " + activeTemplate.prompt + "." : "",
            activeTemplate?.description ? "Template description: " + activeTemplate.description : "",
            selectedTemplateAssets.length > 1
              ? "Multi-asset output organization: create one dedicated directory inside the Imagine local workspace at " + multiAssetTemplateOutputDirectory + " and place every generated resource for this thread there. If a generation tool initially saves output elsewhere, copy or move the final deliverables into this directory before summarizing the result."
              : "",
            "Output name: " + outputName + ".",
            "Aspect ratio setting: " + selectedAspectRatioLabel + ". Generation aspect ratio: " + preferredGenerationAspectRatio + ".",
            selectedStyleOptions.length
              ? "Style direction: " + selectedStyleLabels + "."
              : "Style direction: no explicit style selected.",
            selectedConnectorLabels.length ? "User selected connector context: " + selectedConnectorLabels.join(", ") + "." : "",
            attachedFiles.length ? "User attached local context filenames: " + attachedFiles.join(", ") + "." : "",
            selectedProject ? "Project context: attach this Imagine generation thread to project " + selectedProject.name + " (" + selectedProject.id + ") and use that project's strategy, tasks, files, and history as relevant context." : "",
            activeMediaMode === "video"
              ? "Video workflow: create the final video with the video generation skill using the selected model. If a template image or video reference is attached and the model supports it, pass it as the visual reference. Keep the template subject, composition, motion mood, and selected styles consistent unless the user asks to change them. Do not answer with only a plan; generate the video and summarize the output file path."
              : "Image workflow: run exactly one image-understanding command for this Imagine request when a template image or additional user reference images are attached, then create the final image with the image generation skill using " + selectedImagineTemplateImageModel.label + " edit mode. If no explicit aspect ratio is selected, infer the closest supported aspect ratio from the template. Do not read image files as text. Do not answer with only a plan; generate the image and summarize the output file path.",
          ].filter(Boolean).join("\\n");
          const imagineTemplateThreadMetadata = {
            runnerPlayground: {
              source: "imagine",
              mediaMode: activeMediaMode,
              generationType: activeMediaMode,
              templateId: activeTemplate?.id || undefined,
              videoGenerationMaxOutputs: activeMediaMode === "video" ? 1 : undefined,
            },
          };

`;

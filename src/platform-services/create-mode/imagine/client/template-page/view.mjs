export const IMAGINE_TEMPLATE_PAGE_VIEW_SCRIPT = String.raw`          const activeTemplateLiked = activeTemplate?.id ? likedTemplateIds.includes(activeTemplate.id) : false;
          const canManageCustomTemplate = Boolean(activeTemplate?.isCustom);
          const renderGhostActionRail = () => React.createElement("div", {
            className: "playground-imagine-template-action-rail is-ghost",
            "aria-hidden": "true",
          },
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(canManageCustomTemplate ? SquarePen : Heart, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(Info, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(SlidersHorizontal, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            canManageCustomTemplate
              ? React.createElement("span", { className: "playground-imagine-template-action-button" },
                  React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })
                )
              : null
          );

          const templatePageElement = React.createElement("div", { className: "playground-imagine-template-page" },
            React.createElement("div", { className: "playground-imagine-template-shell" },
              React.createElement("main", { className: "playground-imagine-template-detail", ref: detailRef },
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-back is-icon-only",
                  onClick: () => {
                    if (typeof onBack === "function") {
                      onBack();
                    }
                  },
                  "aria-label": "Back to Imagine",
                },
                  React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Back")
                ),
                normalizedTemplates.length > 1
                  ? React.createElement("div", { className: "playground-imagine-template-top-nav" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-template-preview-nav is-previous",
                        onClick: handleTemplatePrevious,
                        "aria-label": "Previous template",
                      }, React.createElement(ChevronLeft, { width: 18, height: 18, strokeWidth: 1.9 })),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-template-preview-nav is-next",
                        onClick: handleTemplateNext,
                        "aria-label": "Next template",
                      }, React.createElement(ChevronRight, { width: 18, height: 18, strokeWidth: 1.9 }))
                    )
                  : null,
                React.createElement("input", {
                  ref: fileInputRef,
                  className: "playground-imagine-template-file-input",
                  type: "file",
                  multiple: true,
                  onChange: handleFilesSelected,
                }),
                React.createElement("div", {
                  className: "playground-imagine-template-main",
                  style: {
                    "--imagine-template-detail-aspect-ratio": activeTemplateAspectRatio,
                    "--imagine-template-main-width": previewSize.width ? previewSize.width + "px" : undefined,
                    "--imagine-template-main-height": previewSize.height ? previewSize.height + "px" : undefined,
                    "--imagine-template-main-top": previewSize.top ? previewSize.top + "px" : undefined,
                  },
                },
                  previewTransition.previousTemplate
                    ? React.createElement("div", {
                        key: "previous:" + previewTransition.token,
                        className: "playground-imagine-template-slide-shell is-previous",
                        style: {
                          "--imagine-template-transition-direction": previewTransition.direction,
                          "--imagine-template-detail-aspect-ratio": String(previewTransition.previousTemplate?.aspectRatio || activeTemplateAspectRatio || "4 / 3").replace(":", " / "),
                        },
                      },
                        React.createElement("div", { className: "playground-imagine-template-preview-frame" },
                          React.createElement("div", {
                            className: "playground-imagine-template-preview-stage",
                            style: {
                              "--imagine-template-preview-bg": previewTransition.previousTemplate?.tone || activeTemplateBackground,
                              "--imagine-template-transition-direction": previewTransition.direction,
                            },
                          },
                            React.createElement("div", { className: "playground-imagine-template-preview-media" },
                              renderPreviewLayer(previewTransition.previousTemplate, "is-current", "previous-image:" + previewTransition.token)
                            )
                          )
                        ),
                        renderGhostActionRail()
                      )
                    : null,
                  React.createElement("div", {
                    key: "current:" + (activeTemplate?.id || "") + ":" + previewTransition.token,
                    className: "playground-imagine-template-slide-shell " + (previewTransition.token ? "is-current" : "is-static"),
                    style: {
                      "--imagine-template-transition-direction": previewTransition.direction,
                      "--imagine-template-detail-aspect-ratio": activeTemplateAspectRatio,
                    },
                  },
                    React.createElement("div", { className: "playground-imagine-template-preview-frame" },
                      React.createElement("div", { className: "playground-imagine-template-flip-card" + (settingsFlipped ? " is-flipped" : "") },
                        React.createElement("div", { className: "playground-imagine-template-flip-inner" },
                          React.createElement("div", { className: "playground-imagine-template-flip-face is-front" },
                            React.createElement("div", {
                              className: "playground-imagine-template-preview-stage",
                              style: {
                                "--imagine-template-preview-bg": activeTemplateBackground,
                                "--imagine-template-transition-direction": activeTemplateAssetTransition.previousIndex !== null ? activeTemplateAssetTransition.direction : previewTransition.direction,
                              },
                            },
                              React.createElement("div", {
                                className: "playground-imagine-template-preview-media" + (activeTemplateAssetTransition.previousIndex !== null ? " is-asset-transitioning" : ""),
                                style: { "--imagine-template-asset-direction": activeTemplateAssetTransition.previousIndex !== null ? activeTemplateAssetTransition.direction : 1 },
                              },
                                activeTemplateAssetTransition.previousIndex !== null
                                  ? renderPreviewLayer(activeTemplate, "is-previous", "asset-previous:" + activeTemplateAssetTransition.token, activeTemplateAssetTransition.previousIndex)
                                  : null,
                                renderPreviewLayer(activeTemplate, "is-current", "asset-current:" + (activeTemplate?.id || "") + ":" + normalizedActiveTemplateAssetIndex + ":" + activeTemplateAssetTransition.token, normalizedActiveTemplateAssetIndex)
                              ),
                              activeTemplateAssets.length > 1
                                ? React.createElement("span", {
                                    className: "playground-imagine-template-media-controls",
                                    onClick: (event) => event.stopPropagation(),
                                  },
                                    React.createElement("span", { className: "playground-imagine-template-media-dots" },
                                      activeTemplateAssets.map((asset, assetIndex) =>
                                        React.createElement("button", {
                                          key: "detail-asset-dot:" + String(activeTemplate?.id || "template") + ":" + assetIndex,
                                          type: "button",
                                          className: "playground-imagine-template-media-dot" + (assetIndex === normalizedActiveTemplateAssetIndex ? " is-active" : ""),
                                          "aria-label": "Show template asset " + (assetIndex + 1),
                                          onClick: (event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setActiveTemplateAsset(assetIndex, assetIndex >= normalizedActiveTemplateAssetIndex ? 1 : -1);
                                          },
                                        })
                                      )
                                    ),
                                    React.createElement("span", { className: "playground-imagine-template-media-arrows" },
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-imagine-template-media-arrow",
                                        "aria-label": "Previous template asset",
                                        onClick: (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          setActiveTemplateAsset(normalizedActiveTemplateAssetIndex - 1, -1);
                                        },
                                      }, React.createElement(ChevronLeft, { width: 14, height: 14, strokeWidth: 1.9 })),
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-imagine-template-media-arrow",
                                        "aria-label": "Next template asset",
                                        onClick: (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          setActiveTemplateAsset(normalizedActiveTemplateAssetIndex + 1, 1);
                                        },
                                      }, React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.9 }))
                                    )
                                  )
                                : null
                            )
                          ),
                          React.createElement("div", { className: "playground-imagine-template-flip-face is-back" },
                            renderSettingsBackside()
                          )
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-imagine-template-action-rail" },
                      canManageCustomTemplate
                        ? renderActionButton({
                            id: "edit-template",
                            label: "Edit template",
                            Icon: SquarePen,
                            onClick: () => {
                              setActiveActionPopup("");
                              setSettingsFlipped(false);
                              if (typeof onEditTemplate === "function") {
                                onEditTemplate(activeTemplate);
                              }
                            },
                          })
                        : renderActionButton({
                            id: "like",
                            label: "Like",
                            Icon: Heart,
                            className: activeTemplateLiked ? "is-liked" : "",
                            onClick: () => {
                              const normalizedTemplateId = String(activeTemplate?.id || "").trim();
                              if (!normalizedTemplateId) {
                                return;
                              }
                              if (typeof onToggleFavouriteTemplate === "function") {
                                onToggleFavouriteTemplate(normalizedTemplateId);
                                return;
                              }
                              setLocalLikedTemplateIds((current) => {
                                const currentIds = Array.isArray(current)
                                  ? current.map((id) => String(id || "").trim()).filter(Boolean)
                                  : [];
                                return currentIds.includes(normalizedTemplateId)
                                  ? currentIds.filter((id) => id !== normalizedTemplateId)
                                  : currentIds.concat(normalizedTemplateId);
                              });
                            },
                          }),
                      renderActionButton({ id: "info", label: "Template info", Icon: Info }),
                      React.createElement("div", { className: "playground-imagine-template-action-spacer" }),
                      renderActionButton({
                        id: "edit",
                        label: settingsFlipped ? "Show image" : "Edit image settings",
                        Icon: SlidersHorizontal,
                        className: settingsFlipped ? "is-editing" : "",
                        onClick: () => {
                          setActiveActionPopup("");
                          setSettingsFlipped((current) => !current);
                        },
                      }),
                      canManageCustomTemplate
                        ? renderActionButton({
                            id: "template-actions",
                            label: "Template actions",
                            Icon: Ellipsis,
                            onClick: () => {
                              setActiveActionPopup((current) => current === "template-actions" ? "" : "template-actions");
                            },
                          })
                        : null,
                      renderActionPopup()
                    )
                  )
                ),
                React.createElement("div", { className: "playground-imagine-template-composer-wrap", ref: composerWrapRef },
                  React.createElement("div", { className: "playground-imagine-template-composer-shell" },
                    React.createElement(RunnerChat, {
                      key: "imagine-template-runner:" + activeMediaMode + ":" + (activeTemplate?.id || "__none__"),
                      className: "playground-imagine-template-runner",
                      backendUrl,
                      apiKey,
                      fetchCustomSkills,
                      speechToTextUrl: speechToTextUrl || undefined,
                      requestHeaders,
                      appId: "runner-web-sdk-demo",
                      inputMode: "computer-agents",
                      computerAgents: computerAgents || undefined,
                      environments: Array.isArray(environments) ? environments : [],
                      agents: Array.isArray(agents) ? agents : [],
                      skills: imagineTemplateRunnerSkills,
                      skillDefaults: imagineTemplateSkillDefaults,
                      environmentId: environmentId || undefined,
                      agentId: agentId || undefined,
                      projectId: selectedProjectId || undefined,
                      autoFocusComposer: true,
                      keepFocusOnSubmit: true,
                      showUsageInStatus: false,
                      placeholder: activeMediaMode === "video"
                        ? "Describe a video"
                        : activeTemplate?.placeholder || activeTemplate?.title || "Describe an image",
                      composerLeadingControl: renderImagineTemplateMediaModeSwitch(),
                      composerBeforeAgentControl: renderImagineTemplateModelSelector(),
                      onOpenPromptSearch,
                      onOpenKnowledgeSearch,
                      onOpenThreadSearch,
                      hiddenSystemPrompt,
                      threadMetadata: imagineTemplateThreadMetadata,
                      implicitAttachments: imagineTemplateReferenceAttachments,
                      externalFileBrowserRequest: fileBrowserRequest,
                      onThreadIdChange: () => {},
                      onExternalRunRequestCreate: (request) => {
                        const normalizedThreadId = String(request?.threadId || "").trim();
                        if (!normalizedThreadId || typeof onThreadStarted !== "function") {
                          return false;
                        }
                        const nextRunRequest = {
                          ...request,
                          projectId: String(request?.projectId || selectedProjectId || "").trim() || null,
                        };
                        onThreadStarted(normalizedThreadId, {
                          taskRunRequest: nextRunRequest,
                        });
                        return true;
                      },
                      onRunFinish: (_result, threadId) => {
                        const normalizedThreadId = String(threadId || "").trim();
                        if (normalizedThreadId && typeof onThreadStarted === "function") {
                          onThreadStarted(normalizedThreadId);
                        }
                      },
                      onAgentChange,
                      onEnvironmentChange,
                      onOpenPlansBudget,
                      onDocumentPreviewOpenChange: () => {},
                      onDeepResearchDetailOpenChange: () => {},
                    })
                  )
                )
              )
            )
          );
          return templatePageElement;
        }
`;

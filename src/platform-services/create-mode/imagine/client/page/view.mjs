export const IMAGINE_PAGE_VIEW_SCRIPT = String.raw`          return React.createElement(React.Fragment, null,
              React.createElement(PlaygroundImagineTemplatePage, {
              templates: detailTemplates,
              initialTemplateId: selectedTemplate.id,
              backendUrl,
              apiKey,
              speechToTextUrl,
              requestHeaders,
              computerAgents,
              environments,
              agents,
              skills: imagineRunnerSkills,
              skillDefaults,
              canGenerateVideo: canUseVideoGeneration,
              environmentId,
              agentId,
              mediaMode: activeMediaMode,
              fetchCustomSkills,
              onThreadStarted,
              onMediaModeChange: setActiveMediaMode,
              onAgentChange,
              onEnvironmentChange,
              onOpenPlansBudget,
              onOpenPromptSearch,
              onOpenThreadSearch,
              onEditTemplate: handleEditCustomTemplate,
              onDeleteTemplate: handleDeleteCustomTemplate,
              favouriteTemplateIds,
              onToggleFavouriteTemplate: handleToggleFavouriteTemplate,
              onBack: () => setSelectedTemplateId(""),
              })
            );
          }

          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-imagine-page" },
            React.createElement("div", { className: "playground-imagine-shell" },
              React.createElement("div", { className: "playground-imagine-grid-scroll" },
                activeTab === "my-templates" && !normalizedCustomTemplates.length
                  ? React.createElement("div", { className: "playground-imagine-empty" },
                      React.createElement("img", {
                        className: "playground-imagine-empty-visual",
                        src: "/img/empty-state/no-agent-usage.avif",
                        alt: "",
                        draggable: false,
                      }),
                      React.createElement("h2", { className: "playground-imagine-empty-title" }, "Create your first image template"),
                      React.createElement("p", { className: "playground-imagine-empty-copy" }, "Upload reference images or videos, describe the reusable style, and use it whenever you want agents to generate new assets in that direction."),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "button",
                        className: "playground-imagine-primary-button",
                        onClick: handleStartCustomTemplate,
                      },
                        React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Create first template")
                      )
                    )
                  : activeTab === "favourites" && !filteredTemplates.length
                    ? React.createElement("div", { className: "playground-imagine-empty" },
                        React.createElement("img", {
                          className: "playground-imagine-empty-visual",
                          src: "/img/empty-state/no-users-yet.avif",
                          alt: "",
                          draggable: false,
                        }),
                        React.createElement("h2", { className: "playground-imagine-empty-title" }, "No favourites yet"),
                        React.createElement("p", { className: "playground-imagine-empty-copy" }, "Save templates you like and come back to them here."),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-imagine-primary-button",
                          onClick: () => setActiveImagineTab("explore"),
                        },
                          React.createElement(Sparkles, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Explore templates")
                        )
                      )
                  : filteredTemplates.length
                    ? React.createElement("div", { className: "playground-imagine-grid" },
                        filteredTemplates.map((template) => {
                          const templateAssets = normalizePlaygroundImagineTemplateAssets(template);
                          const activeAssetIndex = getTemplateAssetIndex(template);
                          const activeAsset = templateAssets[activeAssetIndex] || templateAssets[0] || null;
                          const templateMediaType = String(activeAsset?.type || template.mediaType || "image") === "video" ? "video" : "image";
                          const hasMultipleAssets = templateAssets.length > 1;
                          const handleOpenTemplate = () => {
                            if (templateMediaType === "video" && !canUseVideoGeneration) {
                              setActiveMediaMode("video");
                              return;
                            }
                            setActiveMediaMode(templateMediaType);
                            setSelectedTemplateId(template.id);
                          };
                          return React.createElement("div", {
                            key: template.id,
                            role: "button",
                            tabIndex: 0,
                            className: [
                              "playground-imagine-template",
                              template.size === "large" ? "is-large" : "",
                              template.size === "wide" ? "is-wide" : "",
                              selectedTemplateId === template.id ? "is-selected" : "",
                              templateMediaType === "video" ? "is-video" : "",
                              hasMultipleAssets ? "is-multi-asset" : "",
                            ].filter(Boolean).join(" "),
                            style: {
                              "--imagine-template-bg": template.tone,
                              "--imagine-template-aspect-ratio": activeAsset?.aspectRatio || template.aspectRatio || "4 / 3",
                            },
                            onClick: handleOpenTemplate,
                            onKeyDown: (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleOpenTemplate();
                              }
                            },
                          },
                            React.createElement(PlaygroundImagineTemplatePreviewMedia, {
                              template: {
                                ...template,
                                activeAssetIndex,
                                assetDirection: templateAssetDirections[String(template.id || "").trim()] || 1,
                              },
                            }),
                            hasMultipleAssets
                              ? React.createElement("span", {
                                  className: "playground-imagine-template-media-controls",
                                  onClick: (event) => event.stopPropagation(),
                                },
                                  React.createElement("span", { className: "playground-imagine-template-media-dots" },
                                    templateAssets.map((asset, assetIndex) =>
                                      React.createElement("button", {
                                        key: "asset-dot:" + template.id + ":" + assetIndex,
                                        type: "button",
                                        className: "playground-imagine-template-media-dot" + (assetIndex === activeAssetIndex ? " is-active" : ""),
                                        "aria-label": "Show template asset " + (assetIndex + 1),
                                        onClick: (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          setTemplateAssetIndex(template, assetIndex, assetIndex >= activeAssetIndex ? 1 : -1);
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
                                        setTemplateAssetIndex(template, activeAssetIndex - 1, -1);
                                      },
                                    }, React.createElement(ChevronLeft, { width: 14, height: 14, strokeWidth: 1.9 })),
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-imagine-template-media-arrow",
                                      "aria-label": "Next template asset",
                                      onClick: (event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setTemplateAssetIndex(template, activeAssetIndex + 1, 1);
                                      },
                                    }, React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.9 }))
                                  )
                                )
                              : null,
                            React.createElement("span", { className: "playground-imagine-template-copy" },
                              React.createElement("span", { className: "playground-imagine-template-title" }, template.title),
                              React.createElement("span", { className: "playground-imagine-template-description" }, template.description)
                            )
                          );
                        })
                      )
                    : React.createElement("div", { className: "playground-imagine-empty" }, "No image templates found.")
              )
            ),
            activeTab === "explore"
              ? React.createElement("div", { className: "playground-imagine-composer-wrap" },
                  selectedTemplate
                    ? React.createElement("div", { className: "playground-imagine-selected-preset" },
                        React.createElement(activeMediaMode === "video" ? Film : Sparkles, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Template: ", React.createElement("strong", null, selectedTemplate.title)),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-imagine-selected-preset-clear",
                          onClick: () => setSelectedTemplateId(""),
                          "aria-label": "Clear selected template",
                        }, React.createElement(X, { strokeWidth: 2 }))
                      )
                    : null,
                  React.createElement("div", { className: "playground-imagine-composer-shell" },
                    React.createElement(RunnerChat, {
                      key: "imagine-runner:" + activeMediaMode + ":" + (selectedTemplateId || "__none__"),
                      className: "playground-imagine-runner",
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
                      isAgentSelectionBlocked,
                      onBlockedAgentSelect,
                      skills: imagineRunnerSkills,
                      skillDefaults: imagineSkillDefaults,
                      environmentId: environmentId || undefined,
                      agentId: agentId || undefined,
                      autoFocusComposer: true,
                      keepFocusOnSubmit: true,
                      showUsageInStatus: false,
                      placeholder: activeMediaMode === "video"
                        ? "Describe a video"
                        : selectedTemplate ? (selectedTemplate.placeholder || selectedTemplate.title) : "Describe an image",
                      composerLeadingControl: renderImagineMediaModeSwitch(),
                      composerBeforeAgentControl: renderImagineModelSelector(),
                      onOpenPromptSearch,
                      onOpenThreadSearch,
                      hiddenSystemPrompt,
                      threadMetadata: imagineThreadMetadata,
                      onThreadIdChange: () => {},
                      onExternalRunRequestCreate: (request) => {
                        const normalizedThreadId = String(request?.threadId || "").trim();
                        if (!normalizedThreadId || typeof onThreadStarted !== "function") {
                          return false;
                        }
                        onThreadStarted(normalizedThreadId, {
                          taskRunRequest: request,
                        });
                        const titlePrompt = String(request?.displayPrompt || request?.prompt || "").trim();
                        if (titlePrompt) {
                          void generateImagineThreadTitle(normalizedThreadId, titlePrompt)
                            .then((generatedTitle) => {
                              if (generatedTitle && typeof onThreadTitleGenerated === "function") {
                                onThreadTitleGenerated(normalizedThreadId, generatedTitle);
                              }
                            })
                            .catch((error) => {
                              console.warn("[PlaygroundImaginePage] Failed to generate thread title", error);
                            });
                        }
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
              : null
            )
          );
        }
`;

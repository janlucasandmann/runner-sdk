export const IMAGINE_PAGE_GENERATION_SCRIPT = String.raw`          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine mode.",
            activeMediaMode === "video"
              ? "The user is asking for video generation. Use the Video Generation skill when possible and save generated videos into /workspace/generated_videos."
              : "The user is asking for image generation only. Do not produce video unless the user explicitly asks to leave Imagine mode.",
            activeMediaMode === "video"
              ? "Create concise, production-ready video prompts. Selected video model: " + selectedImagineVideoModel.id + " (" + selectedImagineVideoModel.label + "). Include --model " + selectedImagineVideoModel.id + " when calling the video generation script unless the user explicitly asks for another model."
              : "Use the available image generation skill when possible. Selected image model: " + selectedImagineImageModel.id + " (" + selectedImagineImageModel.label + "). Include --model " + selectedImagineImageModel.id + " when calling the image generation script unless the user explicitly asks for another model.",
            activeMediaMode === "video"
              ? "Generate exactly one final video for this Imagine request. Do not create variations, alternates, or run a second generate-video.py call after a video has been saved."
              : "",
            selectedTemplate ? "The user selected this " + (activeMediaMode === "video" ? "video" : "image") + " template: " + selectedTemplate.title + ". Suggested direction: " + selectedTemplate.prompt : "",
          ].filter(Boolean).join("\\n");
          const imagineThreadMetadata = {
            runnerPlayground: {
              source: "imagine",
              mediaMode: activeMediaMode,
              generationType: activeMediaMode,
              videoGenerationMaxOutputs: activeMediaMode === "video" ? 1 : undefined,
            },
          };

          if (activeTab === "create-template") {
            return React.createElement("div", { className: "playground-imagine-page" },
              React.createElement("div", { className: "playground-imagine-shell" },
                React.createElement("div", { className: "playground-imagine-grid-scroll is-create-template" },
                  React.createElement("div", { className: "playground-imagine-create-page" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-imagine-create-back playground-imagine-template-back is-icon-only",
                      "aria-label": editingTemplateId ? "Back to template" : "Back to My Templates",
                      onClick: () => {
                        if (editingTemplateId) {
                          setSelectedTemplateId(editingTemplateId);
                          setActiveImagineTab("my-templates");
                        } else {
                          setActiveImagineTab("my-templates");
                        }
                      },
                    },
                      React.createElement(ArrowLeft, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, editingTemplateId ? "Back to template" : "Back to My Templates")
                    ),
                    React.createElement("form", {
                      className: "playground-imagine-template-form",
                      onSubmit: handleCreateTemplateSubmit,
                    },
                      React.createElement("div", { className: "playground-imagine-form-grid" },
                        React.createElement("div", { className: "playground-imagine-create-title-section" },
                          React.createElement("label", { className: "playground-imagine-template-section-title", htmlFor: "imagine-template-name" }, "Template name"),
                          React.createElement("input", {
                            id: "imagine-template-name",
                            className: "playground-imagine-create-title-input",
                            value: templateDraft.title,
                            onChange: (event) => updateTemplateDraft("title", event.target.value),
                            placeholder: "Brand launch visuals",
                          })
                        ),
                        renderCreateMarkdownSection({
                          title: "Description",
                          field: "description",
                          textareaRef: templateDescriptionTextareaRef,
                          placeholder: "A concise note about what this template is best for.",
                        }),
                        renderCreateAspectRatioSelector(),
                        renderCreateStylePicker(),
                        React.createElement("section", { className: "playground-imagine-template-section is-attachments playground-imagine-create-reference-section" },
                          React.createElement("div", { className: "playground-imagine-template-attachments-toolbar" },
                            React.createElement("div", { className: "playground-imagine-template-section-title" }, "Reference assets"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-imagine-template-from-computer",
                              disabled: createReferenceImportState.status === "loading",
                              onClick: openCreateReferenceFileBrowser,
                            }, createReferenceImportState.status === "loading" ? "Importing..." : "Upload from Computer")
                          ),
                          React.createElement("div", { className: "playground-tasks-attachments playground-imagine-create-upload-surface" },
                            React.createElement("input", {
                              id: "imagine-template-reference-assets-input",
                              type: "file",
                              multiple: true,
                              accept: "image/*,video/*",
                              hidden: true,
                              onChange: (event) => {
                                void handleTemplateAssetFiles(event.target.files);
                                event.target.value = "";
                              },
                            }),
                            React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                              React.createElement("div", {
                              className: "tb-popup-dropzone playground-tasks-attachments-dropzone playground-imagine-create-upload-dropzone" + ((Array.isArray(templateDraft.assets) && templateDraft.assets.length) ? " is-filled" : ""),
                              onDragOver: (event) => event.preventDefault(),
                              onDrop: (event) => {
                                event.preventDefault();
                                void handleTemplateAssetFiles(event.dataTransfer?.files);
                              },
                            },
                                Array.isArray(templateDraft.assets) && templateDraft.assets.length
                                  ? React.createElement(React.Fragment, null,
                                      React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                        React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                        React.createElement("span", null, "Drop files to add, or"),
                                        React.createElement("button", {
                                          type: "button",
                                          className: "playground-tasks-attachments-browse",
                                          onClick: () => document.getElementById("imagine-template-reference-assets-input")?.click(),
                                        }, "browse.")
                                      ),
                                      React.createElement("div", { className: "runner-attachments" },
                                        templateDraft.assets.map((asset, index) => renderCreateTemplateAssetChip(asset, index))
                                      )
                                    )
                                  : React.createElement("button", {
                                      type: "button",
                                      className: "playground-tasks-attachments-empty-button",
                                      onClick: () => document.getElementById("imagine-template-reference-assets-input")?.click(),
                                    },
                                      React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                      React.createElement("span", { className: "tb-popup-dropzone-title" }, "Drag & drop files here"),
                                      React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                                    )
                              )
                            )
                          )
                        ),
                        renderCreateMarkdownSection({
                          title: "Default instruction",
                          field: "prompt",
                          textareaRef: templatePromptTextareaRef,
                          placeholder: "Create a polished image in this style with the user's requested changes.",
                        })
                      ),
                      React.createElement("div", { className: "playground-imagine-form-actions" },
                        templateFormError
                          ? React.createElement("span", { className: "playground-imagine-form-error" }, templateFormError)
                          : null,
                        React.createElement(PlatformSecondaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-imagine-secondary-button",
                          onClick: resetTemplateDraft,
                        }, React.createElement("span", null, "Reset")),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "submit",
                          className: "playground-imagine-primary-button",
                        },
                          React.createElement(editingTemplateId ? Check : Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, editingTemplateId ? "Save Template" : "Create Template")
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-imagine-create-file-browser-runner" },
                      React.createElement(RunnerChat, {
                        key: "imagine-create-reference-browser:" + String(createReferenceFileBrowserRequest?.token || "initial"),
                        className: "playground-imagine-create-file-browser-chat",
                        backendUrl,
                        apiKey,
                        fetchCustomSkills,
                        speechToTextUrl: speechToTextUrl || undefined,
                        requestHeaders,
                        appId: "runner-web-sdk-demo-imagine-create-reference",
                        inputMode: "computer-agents",
                        computerAgents: {
                          ...(computerAgents || {}),
                          workspace: {
                            ...((computerAgents && computerAgents.workspace) || {}),
                            onAttach: handleCreateReferenceWorkspaceAttach,
                          },
                        },
                        environments: Array.isArray(environments) ? environments : [],
                        agents: Array.isArray(agents) ? agents : [],
                        isAgentSelectionBlocked,
                        onBlockedAgentSelect,
                        skills: imagineRunnerSkills,
                        skillDefaults,
                        environmentId: environmentId || undefined,
                        agentId: agentId || undefined,
                        maxAttachments: 20,
                        showUsageInStatus: false,
                        placeholder: "Select reference assets",
                        externalFileBrowserRequest: createReferenceFileBrowserRequest,
                        onThreadIdChange: () => {},
                        onEnvironmentChange: handleCreateReferenceEnvironmentChange,
                        onAgentChange,
                        onOpenPlansBudget,
                        onDocumentPreviewOpenChange: () => {},
                        onDeepResearchDetailOpenChange: () => {},
                      })
                    )
                  )
                )
              )
            );
          }

          if (selectedTemplate) {
            const detailTemplates = activeTab === "favourites"
              ? (filteredTemplates.some((template) => template.id === selectedTemplate.id)
                  ? filteredTemplates
                  : [selectedTemplate].concat(filteredTemplates))
              : selectedTemplate.isCustom
                ? normalizedCustomTemplates
                : templates;
  `;

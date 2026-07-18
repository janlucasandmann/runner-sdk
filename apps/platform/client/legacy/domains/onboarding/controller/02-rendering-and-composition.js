                }
                uploadedAttachments.push(normalizePlaygroundTaskAttachmentRecord({
                  id: "onboarding-workspace-file:" + normalizedEnvironmentId + ":" + optimisticAttachment.workspacePath + ":" + String(file.lastModified || Date.now()),
                  clientUploadId: optimisticAttachment.clientUploadId,
                  filename: file.name,
                  mimeType: file.type || "application/octet-stream",
                  type: file.type && file.type.startsWith("image/") ? "image" : "document",
                  size: file.size,
                  uploadedAt: new Date().toISOString(),
                  environmentId: normalizedEnvironmentId,
                  sourcePath: optimisticAttachment.workspacePath,
                  workspacePath: optimisticAttachment.workspacePath,
                  isUploading: false,
                  uploadPending: false,
                }));
              }
              upsertOnboardingComputerAttachments(uploadedAttachments);
            } catch (error) {
              const optimisticIds = new Set(optimisticAttachments.map((attachment) => attachment.id));
              setOnboardingComputerUploadedAttachments((current) =>
                current.filter((attachment) => !optimisticIds.has(attachment.id))
              );
              setOnboardingComputerUploadState({
                isUploading: false,
                error: error instanceof Error ? error.message : "Failed to upload starter files.",
              });
            } finally {
              onboardingComputerActiveUploadsRef.current = Math.max(0, onboardingComputerActiveUploadsRef.current - 1);
              if (onboardingComputerActiveUploadsRef.current === 0) {
                setOnboardingComputerUploadState((current) => ({
                  isUploading: false,
                  error: current.error || "",
                }));
              }
            }
          }
  
          function handleOnboardingComputerUploadInputChange(event) {
            const files = Array.from(event?.target?.files || []);
            if (event?.target) {
              event.target.value = "";
            }
            void uploadOnboardingComputerFiles(files);
          }
  
          function handleOnboardingComputerUploadDrop(event) {
            event.preventDefault();
            setOnboardingComputerUploadDragging(false);
            void uploadOnboardingComputerFiles(Array.from(event?.dataTransfer?.files || []));
          }
  
          function renderOnboardingComputerAttachmentChip(attachment) {
            const resolvedAttachment = attachment || {};
            const normalizedAttachmentMimeType = String(resolvedAttachment?.mimeType || "").toLowerCase();
            const isFolderAttachment = Boolean(
              resolvedAttachment?.isFolder
              || resolvedAttachment?.type === "directory"
              || String(resolvedAttachment?.previewKindOverride || "").toLowerCase() === "directory"
              || normalizedAttachmentMimeType === "inode/directory"
            );
            const isUploadingAttachment = Boolean(resolvedAttachment?.isUploading);
            return React.createElement("div", {
              key: resolvedAttachment.id,
              className: "runner-attachment runner-attachment-file" + (isUploadingAttachment ? " runner-attachment-uploading" : ""),
            },
              React.createElement("button", {
                type: "button",
                className: "runner-attachment-file-button",
                tabIndex: -1,
                "aria-label": "Uploaded " + resolvedAttachment.filename,
              },
                React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                  React.createElement("img", {
                    src: isFolderAttachment ? PLAYGROUND_FOLDER_ICON_URL : PLAYGROUND_TEXT_FILE_ICON_URL,
                    alt: "",
                    draggable: false,
                    className: "runner-attachment-file-icon",
                  })
                ),
                isUploadingAttachment
                  ? React.createElement(Loader2, { className: "runner-attachment-file-upload-indicator tb-context-action-notice-icon-spinner", strokeWidth: 1.9 })
                  : null,
                React.createElement("div", { className: "runner-attachment-file-name", title: resolvedAttachment.filename }, resolvedAttachment.filename)
              )
            );
          }
  
          function renderOnboardingComputerUploadZone() {
            const isUploading = onboardingComputerUploadState.isUploading;
            const hasUploadedAttachments = onboardingComputerUploadedAttachments.length > 0;
            return React.createElement("div", {
              className: "playground-onboarding-computer-upload-zone"
                + (isOnboardingComputerUploadDragging ? " is-dragging" : "")
                + (isUploading ? " is-busy" : "")
                + (hasUploadedAttachments ? " is-filled" : ""),
              onDragOver: (event) => {
                event.preventDefault();
                setOnboardingComputerUploadDragging(true);
              },
              onDragLeave: (event) => {
                if (event.currentTarget.contains(event.relatedTarget)) {
                  return;
                }
                setOnboardingComputerUploadDragging(false);
              },
              onDrop: handleOnboardingComputerUploadDrop,
            },
              React.createElement("input", {
                ref: onboardingComputerUploadInputRef,
                type: "file",
                multiple: true,
                hidden: true,
                onChange: handleOnboardingComputerUploadInputChange,
              }),
              hasUploadedAttachments
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-tasks-attachments-topline" },
                      React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                      React.createElement("span", null, isUploading
                        ? "Uploading files..."
                        : isOnboardingComputerUploadDragging
                          ? "Drop files here"
                          : "Drop files to upload, or"
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-attachments-browse",
                        onClick: openOnboardingComputerUploadPicker,
                      }, "browse.")
                    ),
                    React.createElement("div", { className: "tb-runner-chat playground-onboarding-computer-upload-attachments-scope" },
                      React.createElement("div", { className: "runner-attachments" },
                        onboardingComputerUploadedAttachments.map((attachment) =>
                          renderOnboardingComputerAttachmentChip(attachment)
                        )
                      )
                    ),
                    onboardingComputerUploadState.error
                      ? React.createElement("div", { className: "playground-onboarding-computer-upload-error" }, onboardingComputerUploadState.error)
                      : null
                  )
                : React.createElement("button", {
                    type: "button",
                    className: "playground-onboarding-computer-upload-button",
                    onClick: openOnboardingComputerUploadPicker,
                  },
                    React.createElement(ArrowUpFromLine, { className: "playground-onboarding-computer-upload-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "playground-onboarding-computer-upload-title" },
                      isUploading
                        ? "Uploading files..."
                        : isOnboardingComputerUploadDragging
                          ? "Drop files here"
                          : "Drag & drop files here"
                    ),
                    React.createElement("span", { className: "playground-onboarding-computer-upload-copy" }, "or click to browse"),
                    onboardingComputerUploadState.error
                      ? React.createElement("div", { className: "playground-onboarding-computer-upload-error" }, onboardingComputerUploadState.error)
                      : null
                  )
            );
          }
  
          function renderComputerConfig() {
            return React.createElement("div", { className: "playground-onboarding-computer-card" },
              React.createElement("div", { className: "playground-onboarding-computer-section-title" }, "Default Computer"),
              renderOnboardingComputerUploadZone(),
              React.createElement("div", { className: "playground-onboarding-computer-facts" },
                renderOnboardingComputerFact("ID",
                  React.createElement("span", { title: currentComputerName }, currentComputerName)
                ),
                renderOnboardingComputerFact("Created", React.createElement("span", null, "Now")),
                renderOnboardingComputerFact("Storage", React.createElement("span", null, "4GB")),
                renderOnboardingComputerFact("Internet",
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-toggle" + (computerInternetEnabled ? " is-active" : ""),
                    onClick: () => setComputerInternetEnabled((current) => !current),
                    "aria-pressed": computerInternetEnabled ? "true" : "false",
                    title: computerInternetEnabled ? "Internet access enabled" : "Internet access disabled",
                  }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                )
              )
            );
          }
  
          function renderAgentsConfig() {
            return React.createElement("section", { className: "playground-onboarding-section" },
              renderSplitRows([
                {
                  icon: MessageSquare,
                  title: "Spark",
                  copy: "Fast everyday execution for digital work.",
                  profileUrl: PLAYGROUND_SPARK_AGENT_PROFILE_URL,
                  modelId: "deepseek-v4-flash",
                },
                {
                  icon: Code2,
                  title: "Forge",
                  copy: "Implementation-heavy execution and technical work.",
                  profileUrl: PLAYGROUND_FORGE_AGENT_PROFILE_URL,
                  modelId: "minimax-m3",
                },
                {
                  icon: Shield,
                  title: "Foundry",
                  copy: "High-rigor synthesis, reasoning, and review.",
                  profileUrl: PLAYGROUND_FOUNDRY_AGENT_PROFILE_URL,
                  modelId: "claude-opus-4-8",
                },
              ])
            );
          }
  
          function renderOnboardingConnectorLogo(row) {
            if (row.logoUrl) {
              return React.createElement("img", {
                className: "playground-onboarding-connector-logo" + (row.id === "github" ? " is-github" : ""),
                src: row.logoUrl,
                alt: "",
                "aria-hidden": "true",
              });
            }
            const Icon = row.icon || Cable;
            return React.createElement("div", { className: "playground-onboarding-connector-logo-fallback", "aria-hidden": "true" },
              React.createElement(Icon, { width: 17, height: 17, strokeWidth: 1.85 })
            );
          }
  
          function renderConnectorsConfig() {
            const rows = [
              {
                id: "googleDrive",
                title: "Google Drive",
                copy: "Attach docs, sheets, folders, and shared drive files.",
                logoUrl: PLAYGROUND_GOOGLE_DRIVE_LOGO_URL,
                connected: Boolean(connectorStatuses.googleDrive?.connected),
                onConnect: connectorActions.googleDrive,
              },
              {
                id: "github",
                title: "GitHub",
                copy: "Connect repositories, branches, issues, and pull requests.",
                logoUrl: PLAYGROUND_GITHUB_LOGO_URL,
                connected: Boolean(connectorStatuses.github?.connected),
                onConnect: connectorActions.github,
              },
              {
                id: "oneDrive",
                title: "OneDrive",
                copy: "Use Microsoft-hosted documents and folders as context.",
                logoUrl: PLAYGROUND_ONEDRIVE_LOGO_URL,
                connected: Boolean(connectorStatuses.oneDrive?.connected),
                onConnect: connectorActions.oneDrive,
              },
              {
                id: "gmail",
                title: "Gmail",
                copy: "Read inbox context and send follow-up emails from ACP.",
                logoUrl: PLAYGROUND_GMAIL_LOGO_URL,
                connected: Boolean(connectorStatuses.gmail?.connected),
                onConnect: connectorActions.gmail,
              },
              {
                id: "notion",
                title: "Notion",
                copy: "Bring docs, wikis, and databases into planning and execution.",
                logoUrl: PLAYGROUND_NOTION_LOGO_URL,
                connected: Boolean(connectorStatuses.notion?.connected),
                onConnect: connectorActions.notion,
              },
            ];
            return React.createElement("section", { className: "playground-onboarding-section" },
              React.createElement("div", { className: "playground-onboarding-connector-list" },
                rows.map((row) =>
                  React.createElement("div", { key: row.id, className: "playground-onboarding-connector-row" },
                    React.createElement("div", { className: "playground-onboarding-row-main" },
                      renderOnboardingConnectorLogo(row),
                      React.createElement("div", null,
                        React.createElement("div", { className: "playground-onboarding-row-title" }, row.title),
                        React.createElement("div", { className: "playground-onboarding-row-copy" }, row.copy)
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-onboarding-connector-action" + (row.connected ? " is-connected" : ""),
                      disabled: row.connected || typeof row.onConnect !== "function",
                      onClick: () => {
                        if (typeof row.onConnect === "function") {
                          writePlaygroundOnboardingState(buildSnapshot(stepIndex));
                          void row.onConnect({
                            onboarding: true,
                            onboardingStepIndex: stepIndex,
                            redirectTo: buildOnboardingReturnUrl(stepIndex),
                          });
                        }
                      },
                    }, row.connected ? "Connected" : "Connect")
                  )
                )
              )
            );
          }
  
          function renderResourcesConfig() {
            return React.createElement("section", { className: "playground-onboarding-section" },
              React.createElement("div", { className: "playground-onboarding-section-title" }, "Resource types"),
              React.createElement("div", { className: "playground-onboarding-resource-list" },
                [
                  { icon: Globe, title: "Web apps", copy: "Publish runnable frontends." },
                  { icon: Database, title: "Databases", copy: "Persist product and workflow data." },
                  { icon: Webhook, title: "APIs", copy: "Expose services and automation endpoints." },
                  { icon: Folder, title: "Files & storage", copy: "Keep project artifacts in one place." },
                ].map((row) => {
                  const Icon = row.icon;
                  return React.createElement("div", {
                    key: row.title,
                    className: "playground-onboarding-resource-row",
                  },
                    React.createElement("div", { className: "playground-onboarding-row-main" },
                      React.createElement("div", { className: "playground-onboarding-row-icon" },
                        React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.9 })
                      ),
                      React.createElement("div", null,
                        React.createElement("div", { className: "playground-onboarding-row-title" }, row.title),
                        React.createElement("div", { className: "playground-onboarding-row-copy" }, row.copy)
                      )
                    )
                  );
                })
              )
            );
          }
  
          function handleSplitCreateProject() {
            clearPlaygroundOnboardingState();
            if (typeof onClose === "function") {
              onClose();
            }
            if (typeof onCreateProject === "function") {
              onCreateProject({
                name: onboardingProjectName.trim(),
                goal: onboardingProjectGoal.trim(),
              });
            }
          }
  
          function renderProjectConfig() {
            return React.createElement(React.Fragment, null,
              React.createElement("section", { className: "playground-onboarding-section" },
                React.createElement("div", { className: "playground-onboarding-section-title" }, "First project"),
                React.createElement("div", { className: "playground-onboarding-form-grid is-single" },
                  renderSplitField("Project name",
                    React.createElement("input", {
                      type: "text",
                      value: onboardingProjectName,
                      onChange: (event) => setOnboardingProjectName(event.target.value),
                      placeholder: "Website redesign, sales pipeline, data product...",
                    })
                  ),
                  renderSplitField("Goal",
                    React.createElement("textarea", {
                      value: onboardingProjectGoal,
                      onChange: (event) => setOnboardingProjectGoal(event.target.value),
                      placeholder: "Describe what agents should help you plan and execute.",
                      rows: 5,
                    })
                  )
                )
              ),
              React.createElement(PlatformPrimaryButton, {
                size: "large",
                type: "button",
                className: "playground-onboarding-button is-primary",
                onClick: handleSplitCreateProject,
              },
                React.createElement(Rocket, { width: 15, height: 15, strokeWidth: 1.9 }),
                "Create First Project"
              )
            );
          }
  
          function renderPlanConfig() {
            return React.createElement(React.Fragment, null,
                React.createElement("section", { className: "playground-onboarding-section" },
                React.createElement("div", { className: "playground-onboarding-plan-card" },
  	                React.createElement("div", { className: "playground-onboarding-sdk-title" }, individualPlan.name + " Plan"),
  	                React.createElement("div", { className: "playground-onboarding-plan-price" },
  	                  "$" + individualPlan.monthlyPrice
  	                ),
  	                React.createElement("div", { className: "playground-onboarding-plan-price-copy" }, "per month"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "large",
                    type: "button",
                    className: "playground-onboarding-button is-primary playground-onboarding-plan-title-cta",
                    disabled: onboardingTransitionActive || onboardingCheckoutLoading,
                    onClick: isOnPaidPlan
                      ? handleClose
                      : () => void launchOnboardingIndividualCheckout("plan-card"),
                  }, renderOnboardingButtonContent(
                    isOnPaidPlan ? "Enter Platform" : "Start with Builder",
                    onboardingCheckoutLoadingButton === "plan-card"
                  )),
                  React.createElement("ul", { className: "playground-onboarding-plan-features playground-onboarding-plan-features-inline" },
                    individualPlanFeatures.map((feature) => {
                      const FeatureIcon = feature.icon || Check;
                      return (
                      React.createElement("li", {
                        key: feature.text,
                        className: "playground-onboarding-plan-feature",
                      },
                        React.createElement(FeatureIcon, { className: "playground-onboarding-plan-feature-icon", strokeWidth: 2 }),
                        React.createElement("span", null, feature.text)
                      )
                      );
                    })
                  )
                )
              )
            );
          }
  
          function renderSplitConfig(page) {
            if (page.key === "welcome") {
              return renderWelcomeIntro();
            }
            if (page.key === "computer") {
              return renderComputerConfig();
            }
            if (page.key === "agents") {
              return renderAgentsConfig();
            }
            if (page.key === "connectors") {
              return renderConnectorsConfig();
            }
            return renderPlanConfig();
          }
  
          function renderSplitFooter() {
            const isFinalStep = stepIndex === totalSteps - 1;
            const handleFooterContinue = () => {
              if (stepIndex === 0) {
                beginOnboardingCreationTransition({
                  fromStep: 0,
                  toStep: 1,
                  label: "Creating your first computer",
                });
                return;
              }
              if (stepIndex === 1) {
                beginOnboardingCreationTransition({
                  fromStep: 1,
                  toStep: 2,
                  label: "Creating your first agents",
                });
                return;
              }
              if (stepIndex === 2) {
                beginOnboardingPaneTransition({
                  fromStep: 2,
                  toStep: 3,
                });
                return;
              }
              if (stepIndex === 3) {
                beginOnboardingPaneTransition({
                  fromStep: 3,
                  toStep: 4,
                });
                return;
              }
              if (isFinalStep) {
                if (isOnPaidPlan) {
                  handleClose();
                  return;
                }
                beginOnboardingFreeExit();
                return;
              }
              setStepIndex((current) => Math.min(totalSteps - 1, current + 1));
            };
            return React.createElement("div", { className: "playground-onboarding-pane-bottom" },
              React.createElement("div", { className: "playground-onboarding-progress-group" },
                React.createElement("div", { className: "playground-onboarding-dots" },
                  stepLabels.map((label, index) =>
                    React.createElement("button", {
                      key: label,
                      type: "button",
                      className: "playground-onboarding-dot" + (index === stepIndex ? " is-active" : ""),
                      disabled: onboardingTransitionActive,
                      onClick: () => setStepIndex(index),
                      "aria-label": "Go to " + label,
                    })
                  )
                ),
                React.createElement("div", { className: "playground-onboarding-step-count" },
                  "Step " + (stepIndex + 1) + " of " + totalSteps
                )
              ),
              React.createElement("div", { className: "playground-onboarding-footer-actions" },
                React.createElement(PlatformPrimaryButton, {
                  size: "large",
                  type: "button",
                  className: "playground-onboarding-button is-primary",
                  onClick: handleFooterContinue,
                  disabled: onboardingTransitionActive || onboardingCheckoutLoading,
                }, renderOnboardingButtonContent(
                  "Continue",
                  false
                ))
              )
            );
          }
  
          function renderSplitExplanation(page) {
            if (page.key === "welcome") {
              return null;
            }
            return React.createElement("div", { className: "playground-onboarding-explain-inner" },
              page.explainImage
                ? React.createElement("img", {
                    className: "playground-onboarding-explain-visual",
                    src: page.explainImage,
                    alt: "",
                    "aria-hidden": "true",
                  })
                : null,
              page.key === "computer" || page.key === "agents" || page.key === "connectors" || page.key === "plan"
                ? null
                : React.createElement("div", { className: "playground-onboarding-kicker" }, page.kicker),
              React.createElement("h1", { className: "playground-onboarding-explain-title" }, page.explainTitle),
              page.explainCopy
                ? React.createElement("p", { className: "playground-onboarding-explain-copy" }, page.explainCopy)
                : null,
              React.createElement("div", { className: "playground-onboarding-explain-list" },
                page.bullets.map((item) => {
                  const Icon = item.icon || Check;
                  return React.createElement("div", {
                    key: item.title,
                    className: "playground-onboarding-explain-bullet",
                  },
                    React.createElement("div", { className: "playground-onboarding-explain-bullet-icon" },
                      React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.8 })
                    ),
                    React.createElement("div", null,
                      React.createElement("div", { className: "playground-onboarding-explain-bullet-title" }, item.title),
                      React.createElement("div", { className: "playground-onboarding-explain-bullet-copy" }, item.copy)
                    )
                  );
                })
              )
            );
          }
  
          const onboardingModalClassName = [
            "playground-onboarding-modal",
            "is-" + activeOnboardingPage.key,
            activeOnboardingPage.key === "welcome" && onboardingVideoStarted ? "is-welcome-video-started" : "",
            onboardingCreationTransitionPhase === "loading" || onboardingCreationTransitionPhase === "hiding-label" ? "is-onboarding-transition-leaving" : "",
            onboardingCreationTransitionPhase ? "is-onboarding-transition-" + onboardingCreationTransitionPhase : "",
            onboardingCreationTransition?.fromStep != null ? "is-onboarding-transition-from-" + onboardingCreationTransition.fromStep : "",
            onboardingCreationTransition?.toStep != null ? "is-onboarding-transition-to-" + onboardingCreationTransition.toStep : "",
            onboardingPaneTransitionPhase ? "is-onboarding-pane-transition-" + onboardingPaneTransitionPhase : "",
            onboardingPaneTransition?.fromStep != null ? "is-onboarding-pane-transition-from-" + onboardingPaneTransition.fromStep : "",
            onboardingPaneTransition?.toStep != null ? "is-onboarding-pane-transition-to-" + onboardingPaneTransition.toStep : "",
            onboardingFreeExitPhase ? "is-onboarding-free-exit-active" : "",
            onboardingFreeExitPhase ? "is-onboarding-free-exit-" + onboardingFreeExitPhase : "",
          ].filter(Boolean).join(" ");
  
          return React.createElement(PlatformModalBackdrop, { className: "playground-onboarding-scrim" },
            React.createElement(PlatformModalSurface, { className: onboardingModalClassName },
              React.createElement(PlaygroundOnboardingVideoBackground, {
                onStarted: handleOnboardingVideoStarted,
              }),
              onboardingCreationTransitionPhase && onboardingCreationTransitionPhase !== "entering"
                ? React.createElement("div", { className: "playground-onboarding-transition-loader", "aria-live": "polite" },
                    React.createElement("div", { className: "playground-onboarding-transition-label" },
                      React.createElement("span", null, onboardingCreationTransitionLabel),
                      React.createElement("span", { className: "playground-onboarding-transition-dot-loader", "aria-hidden": "true" },
                        Array.from({ length: 6 }, (_, index) =>
                          React.createElement("span", {
                            key: "onboarding-transition-dot:" + index,
                            className: "playground-onboarding-transition-dot",
                            style: { animationDelay: String(index * 0.08) + "s" },
                          })
                        )
                      )
                    )
                  )
                : null,
              React.createElement("section", {
                className: "playground-onboarding-pane is-config is-" + activeOnboardingPage.key,
              },
                activeOnboardingPage.key === "welcome"
                  ? null
                  : React.createElement("div", { className: "playground-onboarding-pane-top" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-onboarding-back-button",
                        disabled: onboardingTransitionActive,
                        onClick: () => setStepIndex((current) => Math.max(0, current - 1)),
                      },
                        React.createElement(ArrowLeft, { width: 15, height: 15, strokeWidth: 1.9 }),
                        "Back"
                      )
                    ),
                React.createElement("div", { className: "playground-onboarding-config-scroll" },
                  React.createElement("div", { className: "playground-onboarding-config-stack" },
                    activeOnboardingPage.key === "welcome"
                      || !activeOnboardingPage.configTitle
                      ? null
                      : renderSplitHeading(activeOnboardingPage),
                    renderSplitConfig(activeOnboardingPage)
                  )
                ),
                renderSplitFooter()
              ),
              React.createElement("section", {
                className: "playground-onboarding-pane is-explain is-" + activeOnboardingPage.key,
              },
                activeOnboardingPage.key === "welcome"
                  ? renderWelcomePromptMock()
                  : React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-onboarding-pane-top" },
                        React.createElement("div", { className: "playground-onboarding-step-count" }, activeOnboardingPage.label),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-onboarding-close",
                          onClick: handleClose,
                          "aria-label": "Close onboarding",
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.9 }))
                      ),
                      renderSplitExplanation(activeOnboardingPage)
                    )
              )
            )
          );
  
          const conceptPages = [
            {
              key: "agents",
              previewImage: "/img/001-docs/screen-agents.png",
              previewAlt: "Agents screen preview",
              visual: React.createElement("div", { className: "playground-onboarding-concept-visual" },
                React.createElement("img", {
                  className: "playground-onboarding-concept-image",
                  src: PLAYGROUND_FORGE_AGENT_PROFILE_URL,
                  alt: "Agents",
                })
              ),
              title: "Meet your agents",
              copy: "Agents are the operators of Agentic Compute Platform. Each one has its own model, instructions, and execution style, so you can keep specialists for research, coding, design, or any repeatable workflow.",
              actionLabel: "Continue",
              details: [
                {
                  title: existingAgentCount > 0 ? "Already active" : "Start with one",
                  copy: existingAgentCount > 0
                    ? "You already have " + existingAgentCount + " agent" + (existingAgentCount === 1 ? "" : "s") + " available in the platform."
                    : "Create or refine agents for distinct jobs instead of forcing one assistant to do everything.",
                },
                {
                  title: "Model + instructions",
                  copy: "Each agent combines a model choice with operating instructions, which makes role-specific behavior much more reliable.",
                },
                {
                  title: "Reusable across threads",
                  copy: "Agents stay available across conversations, projects, and scheduled work so your setup compounds over time.",
                },
              ],
            },
            {
              key: "environments",
              previewImage: "/img/001-docs/screen-environments.png",
              previewAlt: "Environments screen preview",
              visual: React.createElement("div", { className: "playground-onboarding-concept-visual is-surface" },
                React.createElement("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  },
                },
                  React.createElement("img", {
                    className: "playground-onboarding-concept-image",
                    src: PLAYGROUND_ENVIRONMENTS_APP_ICON_URL,
                    alt: "Environments",
                    style: { width: "38px", height: "38px", borderRadius: "12px" },
                  }),
                  React.createElement("img", {
                    className: "playground-onboarding-concept-image",
                    src: PLAYGROUND_FILES_APP_ICON_URL,
                    alt: "Files",
                    style: { width: "38px", height: "38px", borderRadius: "12px" },
                  })
                )
              ),
              title: "Environments keep the work grounded",
              copy: "Environments define the runtime and file base an agent works against. Files live with environments, so each thread can operate on a clear, durable workspace instead of isolated message attachments.",
              actionLabel: "Continue",
              details: [
                {
                  title: environmentCount > 0 ? "Available now" : "Workspace layer",
                  copy: environmentCount > 0
                    ? "You currently have " + environmentCount + " environment" + (environmentCount === 1 ? "" : "s") + ", with " + defaultEnvironmentName + " selected as the default workspace."
                    : "Each environment packages runtimes, dependencies, secrets, and files into a reproducible workspace.",
                },
                {
                  title: "Files belong here",
                  copy: "Source docs, generated assets, datasets, and working files stay attached to environments so threads can revisit them later.",
                },
                {
                  title: "Clean separation",
                  copy: "Switching environments lets you move between products, clients, or experiments without mixing context or file state.",
                },
              ],
            },
            {
              key: "skills",
              previewImage: "/img/001-docs/screen-skills.png",
              previewAlt: "Skills screen preview",
              visual: React.createElement("div", { className: "playground-onboarding-concept-visual" },
                React.createElement("img", {
                  className: "playground-onboarding-concept-image",
                  src: PLAYGROUND_SKILLS_APP_ICON_URL,
                  alt: "Skills",
                })
              ),
              title: "Skills shape what an agent can do",
              copy: "Skills are capability modules that sharpen how agents work. They let you enable the right tools and behaviors per thread or per workflow instead of relying on one generic operating mode.",
              actionLabel: "Continue",
              details: [
                {
                  title: skillCount > 0 ? skillCount + " built-in skills" : "Built-in capabilities",
                  copy: "Use focused skills like web search, image generation, research, or task management only where they actually help.",
                },
                {
                  title: "Custom skills",
                  copy: "Add your own reusable instructions and code so specialist workflows stay consistent across agents and projects.",
                },
                {
                  title: "Per-thread control",
                  copy: "Skills can be staged right in the runner input flow, which keeps the active toolset explicit for every run.",
                },
              ],
            },
            {
              key: "projects",
              previewImage: "/img/001-docs/screen-projects.png",
              previewAlt: "Projects screen preview",
              visual: React.createElement("div", { className: "playground-onboarding-concept-visual is-surface" },
                React.createElement(Rocket, { className: "playground-onboarding-concept-icon", strokeWidth: 1.75 })
              ),
              title: "Projects connect planning to execution",
              copy: "Projects are where structured work lives. They give you backlog views, schedules, task ownership, dependencies, and thread links, so the platform can move from one-off chats into repeatable execution.",
              actionLabel: "Continue",
              details: [
                {
                  title: "Backlog + schedule",
                  copy: "Capture work as tasks, organize it into milestones or schedules, and launch threads directly from those plans.",
                },
                {
                  title: "Threads stay linked",
                  copy: "A project task can start and track its own runner thread, which keeps planning state and execution history connected.",
                },
                {
                  title: "Built for ongoing ops",
                  copy: "This is the part that turns the platform into the main Agentic Compute Platform product, not just a demo chat surface.",
                },
              ],
            },
            {
  	            key: "builder",
              previewImage: "/img/001-docs/screen-agents.png",
              previewAlt: "Plan screen preview",
              visual: React.createElement("div", { className: "playground-onboarding-concept-visual is-surface" },
                React.createElement(Sparkles, { className: "playground-onboarding-concept-icon", strokeWidth: 1.75 })
              ),
  	            title: isOnPaidPlan ? "You already have a paid plan" : "Unlock the platform with Builder",
              copy: isOnPaidPlan
                ? "Your account already has the upgraded plan, so you’re ready to use the full platform without changing anything."
                : "",
              actionLabel: isOnPaidPlan ? "Enter ACP" : "Upgrade to Builder",
              details: [],
            },
          ];
          const currentPage = conceptPages[stepIndex];
  
          return React.createElement(PlatformModalBackdrop, {
              className: "playground-onboarding-scrim",
              onClick: handleClose,
            },
              React.createElement(PlatformModalSurface, {
                className: "playground-onboarding-modal",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "playground-onboarding-header" },
                  React.createElement("div", { className: "playground-onboarding-header-top" },
                    React.createElement("div", { className: "playground-onboarding-header-copy" },
                      React.createElement("div", { className: "playground-onboarding-title-wrap" },
                        React.createElement("div", { className: "playground-onboarding-kicker" }, "Agentic Compute Platform"),
                        React.createElement("h2", { className: "playground-onboarding-title" }, currentPage.title)
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-onboarding-close",
                      onClick: handleClose,
                      "aria-label": "Close onboarding",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.9 }))
                  ),
                  React.createElement("div", { className: "playground-onboarding-step-meta" },
                    React.createElement("div", { className: "playground-onboarding-progress" },
                      React.createElement("div", { className: "playground-onboarding-progress-track" },
                        React.createElement("div", {
                          className: "playground-onboarding-progress-fill",
                          style: { width: (((stepIndex + 1) / totalSteps) * 100) + "%" },
                        })
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-onboarding-body" },
                  React.createElement("div", { className: "playground-onboarding-concept-step" },
                      React.createElement("div", { className: "playground-onboarding-concept-hero" },
                        React.createElement("div", { className: "playground-onboarding-concept-copy-column" },
                        currentPage.copy
                          ? React.createElement("p", { className: "playground-onboarding-concept-copy" }, currentPage.copy)
                          : null,
                        stepIndex === totalSteps - 1
                          ? React.createElement("ul", {
                              className: "playground-onboarding-plan-features playground-onboarding-plan-features-inline",
                            },
                              individualPlanFeatures.map((feature) => {
                                const FeatureIcon = feature.icon || Check;
                                return (
                                React.createElement("li", {
                                  key: feature.text,
                                  className: "playground-onboarding-plan-feature",
                                },
                                  React.createElement(FeatureIcon, { className: "playground-onboarding-plan-feature-icon", strokeWidth: 2 }),
                                  React.createElement("span", null, feature.text)
                                )
                                );
                              })
                            )
                          : null
                      ),
                      stepIndex === totalSteps - 1
                        ? React.createElement("div", { className: "playground-onboarding-sdk-card" },
  	                          React.createElement("div", { className: "playground-onboarding-sdk-title" }, individualPlan.name + " Plan"),
  	                          React.createElement("div", { className: "playground-onboarding-plan-price" },
  	                            "$" + individualPlan.monthlyPrice
  	                          ),
  	                          React.createElement("div", { className: "playground-onboarding-plan-price-copy" }, "per month"),
                            React.createElement("p", { className: "playground-onboarding-sdk-note" },
                              isOnPaidPlan
                                ? (individualPlan.description || "Personal access with more compute and room to scale.")
                                : "Choose Builder to unlock the full product surface for your organization."
                            ),
                            !isOnPaidPlan
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-onboarding-button playground-onboarding-plan-cta",
                                  onClick: () => {
                                    if (typeof onUpgradeToIndividual === "function") {
                                      void Promise.resolve(onUpgradeToIndividual());
                                    }
                                  },
                                }, "Upgrade to Builder")
                              : null
                          )
                        : React.createElement("div", { className: "playground-onboarding-concept-preview-panel" },
                            React.createElement("div", { className: "playground-onboarding-concept-preview-image" },
                              React.createElement("img", {
                                className: "playground-onboarding-concept-preview-asset",
                                src: currentPage.previewImage || "/img/001-docs/screen-agents.png",
                                alt: currentPage.previewAlt || "Preview",
                              })
                            )
                        )
                      
                    ),
                    stepIndex === totalSteps - 1
                      ? null
                      : React.createElement("div", { className: "playground-onboarding-detail-grid" },
                          currentPage.details.map((detail) =>
                            React.createElement("div", {
                              key: detail.title,
                              className: "playground-onboarding-detail-card",
                            },
                              React.createElement("div", { className: "playground-onboarding-detail-card-title" }, detail.title),
                              React.createElement("p", { className: "playground-onboarding-detail-card-copy" }, detail.copy)
                            )
                          )
                        ),
                    renderFooter(
                      stepIndex === totalSteps - 1
                        ? {
                            primaryLabel: isOnPaidPlan ? "Enter ACP" : "Upgrade to Builder",
                            onPrimary: isOnPaidPlan
                              ? handleClose
                              : () => {
                                  if (typeof onUpgradeToIndividual === "function") {
                                    void Promise.resolve(onUpgradeToIndividual());
                                  }
                                },
                            secondaryLabel: isOnPaidPlan ? "" : "Skip for now",
                            onSecondary: isOnPaidPlan ? null : handleClose,
                          }
                        : {
                            primaryLabel: currentPage.actionLabel,
                            onPrimary: () => setStepIndex((current) => Math.min(totalSteps - 1, current + 1)),
                          }
                    )
                  )
                )
              )
            );
        }
  

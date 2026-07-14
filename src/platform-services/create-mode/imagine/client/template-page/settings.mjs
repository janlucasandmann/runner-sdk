export const IMAGINE_TEMPLATE_PAGE_SETTINGS_SCRIPT = String.raw`          const renderTemplatePreview = (template) => {
            const previewBackground = template?.imageUrl
              ? "url('" + template.imageUrl + "') center / cover no-repeat"
              : (template?.tone || "linear-gradient(135deg, #141414, #333)");
            return React.createElement("button", {
              key: template.id,
              type: "button",
              className: "playground-imagine-template-thumb" + (template.id === activeTemplate?.id ? " is-active" : ""),
              style: { "--imagine-template-thumb-bg": previewBackground },
              onClick: () => {
                setActiveTemplateId(template.id);
                setActiveTemplateMediaMode(String(template.mediaType || "image") === "video" ? "video" : "image");
              },
            },
              React.createElement("span", { className: "playground-imagine-template-thumb-title" }, template.title)
            );
          };

          const renderProjectSelector = () => React.createElement("section", { className: "playground-imagine-template-project-row" },
            React.createElement("div", { className: "playground-imagine-template-row-title" }, "Project"),
            React.createElement("div", {
              ref: projectSelectorRef,
              className: "playground-imagine-template-project-select playground-tasks-toolbar-popup-shell",
            },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-imagine-template-project-button" + (selectedProject ? "" : " is-empty"),
                onClick: () => setProjectSelectorOpen((current) => !current),
              },
                React.createElement("span", null, selectedProject ? selectedProject.name : "None"),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              projectSelectorOpen
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-imagine-template-project-menu" },
                    React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (!selectedProjectId ? " selected" : ""),
                      onClick: () => handleProjectSelect(""),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        !selectedProjectId
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "None"),
                        React.createElement("span", null, "Create this image without project context")
                      )
                    ),
                    availableProjects.length
                      ? availableProjects.map((project) => React.createElement("button", {
                          key: project.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (selectedProjectId === project.id ? " selected" : ""),
                          onClick: () => handleProjectSelect(project.id),
                        },
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            selectedProjectId === project.id
                              ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                              : null
                          ),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, project.name),
                            React.createElement("span", null, "Use project strategy, files, tasks, and history")
                          )
                        ))
                      : React.createElement("div", { className: "tb-popup-row tb-popup-row-muted" },
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "No projects available")
                          )
                        )
                  )
                : null
            )
          );

          const renderAspectRatioSelector = () => React.createElement("section", { className: "playground-imagine-template-aspect-row" },
            React.createElement("div", { className: "playground-imagine-template-row-title" }, "Aspect ratio"),
            React.createElement("div", {
              ref: aspectRatioSelectorRef,
              className: "playground-imagine-template-aspect-select playground-tasks-toolbar-popup-shell",
            },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-imagine-template-aspect-button" + (aspectRatio ? "" : " is-empty"),
                onClick: () => setAspectRatioSelectorOpen((current) => !current),
              },
                React.createElement("span", null, selectedAspectRatioOption.label),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              aspectRatioSelectorOpen
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-imagine-template-aspect-menu" },
                    aspectRatioOptions.map((option) => React.createElement("button", {
                      key: "aspect:" + (option.value || "none"),
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (aspectRatio === option.value ? " selected" : ""),
                      onClick: () => handleAspectRatioSelect(option.value),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        aspectRatio === option.value
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, option.label),
                        React.createElement("span", null, option.description)
                      )
                    ))
                  )
                : null
            )
          );

          const renderSettingsBackside = () => React.createElement("div", { className: "playground-imagine-template-settings-back" },
            React.createElement("h3", { className: "playground-imagine-template-settings-back-title" }, "Personalization Settings"),
            renderProjectSelector(),
            renderAspectRatioSelector(),
            React.createElement("section", { ref: stylePickerRef, className: "playground-imagine-template-style-picker" },
              React.createElement("div", { className: "playground-imagine-template-style-picker-header" },
                React.createElement("div", { className: "playground-imagine-template-section-title" }, "Style"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-style-manage-button" + (stylePickerOpen ? " is-active" : ""),
                  onClick: () => setStylePickerOpen((current) => !current),
                }, "Manage Styles")
              ),
              React.createElement("div", { className: "playground-imagine-template-style-pill-list" },
                selectedStyleOptions.length
                  ? selectedStyleOptions.map((style) => {
                      const StyleIcon = style.Icon || Paintbrush;
                      return React.createElement("span", { key: "selected-style:" + style.id, className: "playground-imagine-template-style-pill is-selected" },
                        React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                        React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-imagine-template-style-pill-remove",
                          "aria-label": "Remove " + style.label,
                          onClick: (event) => {
                            event.stopPropagation();
                            removeStyleOption(style.id);
                          },
                        }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.8 }))
                      );
                    })
                  : React.createElement("span", { className: "playground-imagine-template-style-pill is-empty" },
                      React.createElement(Paintbrush, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, "No style selected")
                    )
              ),
              stylePickerOpen
                ? React.createElement("div", { className: "playground-imagine-template-style-picker-options" },
                    styleOptions.map((style) => {
                      const StyleIcon = style.Icon || Paintbrush;
                      const isSelected = selectedStyleIds.includes(style.id);
                      return React.createElement("button", {
                        key: style.id,
                        type: "button",
                        className: "playground-imagine-template-style-pill" + (isSelected ? " is-selected" : ""),
                        onClick: () => toggleStyleOption(style.id),
                      },
                        React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                        React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                        React.createElement("span", { className: "tb-popup-check-slot" },
                          isSelected
                            ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                            : null
                        )
                      );
                    })
                  )
                : null
            ),
            activeTemplateAssets.length > 1
              ? React.createElement("section", { className: "playground-imagine-template-asset-picker" },
                  React.createElement("div", { className: "playground-imagine-template-section-title" }, "Template assets"),
                  React.createElement("div", { className: "playground-imagine-template-asset-picker-grid" },
                    activeTemplateAssets.map((asset, assetIndex) => {
                      const assetKey = getActiveTemplateAssetKey(asset, assetIndex);
                      const isSelected = selectedTemplateAssetKeys.includes(assetKey);
                      const isVideoAsset = asset?.type === "video";
                      return React.createElement("button", {
                        key: assetKey,
                        type: "button",
                        className: "playground-imagine-template-asset-option" + (isSelected ? " is-selected" : ""),
                        "aria-label": (isSelected ? "Deselect " : "Select ") + (asset?.title || "template asset " + (assetIndex + 1)),
                        "aria-pressed": isSelected ? "true" : "false",
                        onClick: () => toggleTemplateAssetSelection(asset, assetIndex),
                      },
                        isVideoAsset
                          ? React.createElement("video", {
                              src: asset.url,
                              muted: true,
                              loop: true,
                              playsInline: true,
                              preload: "metadata",
                            })
                          : React.createElement("img", {
                              src: asset.url,
                              alt: "",
                              draggable: false,
                              loading: "lazy",
                            }),
                        React.createElement("span", { className: "playground-imagine-template-asset-option-check" },
                          React.createElement(Check, { width: 12, height: 12, strokeWidth: 2 })
                        )
                      );
                    })
                  )
                )
              : null,
            React.createElement("section", { className: "playground-imagine-template-section is-attachments" },
              React.createElement("div", { className: "playground-imagine-template-attachments-toolbar" },
                React.createElement("div", { className: "playground-imagine-template-section-title" }, "Attachments"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-from-computer",
                  onClick: () => requestFileBrowser("workspace"),
                }, "Upload from Computer")
              ),
              React.createElement("div", { className: "playground-imagine-template-attachments-surface" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-dropzone" + (isAttachmentDragging ? " is-dragging" : ""),
                  onClick: () => fileInputRef.current?.click(),
                  onDragOver: (event) => {
                    event.preventDefault();
                    setIsAttachmentDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) {
                      return;
                    }
                    setIsAttachmentDragging(false);
                  },
                  onDrop: handleAttachmentDrop,
                },
                  React.createElement(ArrowUpFromLine, { width: 19, height: 19, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "playground-imagine-template-dropzone-title" }, isAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                  React.createElement("span", { className: "playground-imagine-template-dropzone-copy" }, "or click to browse")
                )
              ),
              attachedFiles.length
                ? React.createElement("div", { className: "playground-imagine-template-attachments" },
                    attachedFiles.map((fileName) => React.createElement("span", { key: fileName, className: "playground-imagine-template-attachment" },
                      React.createElement(FileText, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, fileName)
                    ))
                  )
                : null
            ),
            React.createElement("section", { className: "playground-imagine-template-connectors" },
              React.createElement("div", { className: "playground-imagine-template-connectors-list" },
                connectors.map((connector) => {
                  const isSelected = selectedConnectors.includes(connector.id);
                  return React.createElement("button", {
                    key: connector.id,
                    type: "button",
                    className: "playground-imagine-template-connector-row" + (isSelected ? " is-selected" : ""),
                    onClick: () => handleConnectorBrowse(connector),
                  },
                    React.createElement("span", { className: "playground-imagine-template-connector-service" },
                      renderImagineConnectorIcon(connector),
                      React.createElement("span", null, connector.label)
                    ),
                    React.createElement("span", { className: "playground-imagine-template-connector-value" }, "Browse")
                  );
                })
              )
            )
          );

          const renderPreviewLayer = (template, className, key, assetIndex = 0) => {
            if (!template) {
              return null;
            }
            const previewAssets = normalizePlaygroundImagineTemplatePageAssets(template);
            const safeAssetIndex = previewAssets.length
              ? Math.max(0, Math.min(Number(assetIndex) || 0, previewAssets.length - 1))
              : 0;
            const previewAsset = previewAssets[safeAssetIndex] || previewAssets[0] || null;
            if (previewAsset?.type === "video") {
              return React.createElement("video", {
                key,
                className: "playground-imagine-template-preview-video " + className,
                src: previewAsset.url,
                title: template.title || "Video template",
                controls: className.includes("is-current"),
                muted: false,
                loop: true,
                playsInline: true,
                preload: "metadata",
              });
            }
            if (previewAsset?.type === "image") {
              return React.createElement("img", {
                key,
                className: "playground-imagine-template-preview-image " + className,
                src: previewAsset.url,
                alt: template.title || "Image template",
              });
            }
            return React.createElement("div", {
              key,
              className: "playground-imagine-template-preview-fallback " + className,
              style: { "--imagine-template-preview-bg": template.tone || "linear-gradient(135deg, #171717, #333)" },
              "aria-label": template.title || "Image template",
            });
          };

`;

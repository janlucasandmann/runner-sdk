export const IMAGINE_PAGE_COMPOSER_SCRIPT = String.raw`          const renderImagineMediaModeSwitch = () =>
            React.createElement("div", { className: "playground-imagine-media-switch", role: "tablist", "aria-label": "Imagine media mode" },
              [
                { id: "image", label: "Image" },
                { id: "video", label: "Video" },
              ].map((option) =>
                React.createElement("button", {
                  key: option.id,
                  type: "button",
                  role: "tab",
                  className: "playground-imagine-media-switch-button" + (activeMediaMode === option.id ? " is-active" : ""),
                  "aria-selected": activeMediaMode === option.id ? "true" : "false",
                  onClick: () => setActiveMediaMode(option.id),
                }, option.label)
              )
            );

          const selectImagineModel = (modelId) => {
            const normalizedModelId = normalizeImagineModelId(activeMediaMode, modelId);
            if (activeMediaMode === "video") {
              setSelectedImagineVideoModelId(normalizedModelId);
            } else {
              setSelectedImagineImageModelId(normalizedModelId);
            }
            setImagineModelSelectorOpen(false);
          };

          const toggleImagineModelSelector = () => {
            setImagineModelSelectorOpen((open) => {
              const nextOpen = !open;
              if (nextOpen) {
                emitPlaygroundImagineComposerPopupOpen(imagineModelPopupSourceIdRef.current);
              }
              return nextOpen;
            });
          };

          const renderImagineModelProviderIcon = (option, extraClassName = "") => {
            const providerIcon = getPlaygroundImagineModelProviderIcon(option);
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

          const renderImagineModelSelector = () =>
            React.createElement("div", { ref: imagineModelSelectorRef, className: "tb-selector-anchor playground-imagine-model-selector" },
              React.createElement("button", {
                ref: imagineModelSelectorButtonRef,
                type: "button",
                className: "tb-inline-selector tb-inline-selector-agent" + (imagineModelSelectorOpen ? " active" : ""),
                onClick: toggleImagineModelSelector,
                "aria-haspopup": "menu",
                "aria-expanded": imagineModelSelectorOpen ? "true" : "false",
              },
                renderImagineModelProviderIcon(selectedImagineModel, "playground-imagine-model-selector-icon"),
                React.createElement("span", { className: "playground-imagine-model-selector-label" }, selectedImagineModel.label),
                React.createElement(ChevronDown, { className: "tb-inline-selector-chevron", strokeWidth: 1.8 })
              ),
              imagineModelSelectorAnimation.shouldRender
                ? renderPlaygroundImaginePopupPortal(
                    React.createElement(PlatformPopupSurface, {
                      ref: imagineModelMenuRef,
                      className: "tb-popup-menu-inline tb-popup-menu-inline-agent playground-imagine-model-menu",
                      animation: imagineModelSelectorAnimation.animation,
                      onClick: (event) => event.stopPropagation(),
                    },
                    React.createElement("div", { className: "tb-popup-menu-inline-body playground-imagine-model-menu-body" },
                      activeImagineModelOptions.map((option) =>
                        React.createElement("button", {
                          key: option.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (option.id === selectedImagineModel.id ? " selected" : ""),
                          onClick: () => selectImagineModel(option.id),
                        },
                          renderImagineModelProviderIcon(option),
                          React.createElement("span", { className: "playground-imagine-model-option-copy" },
                            React.createElement("span", { className: "playground-imagine-model-option-title" }, option.label)
                          ),
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            option.id === selectedImagineModel.id
                              ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.8 })
                              : null
                          )
                        )
                      )
                    )
                  ),
                  imagineModelMenuStyle
                )
                : null
            );

`;

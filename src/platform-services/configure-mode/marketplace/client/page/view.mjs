export const MARKETPLACE_PAGE_VIEW_SCRIPT = String.raw`        return React.createElement("div", { className: "playground-resource-templates-page" },
          React.createElement("div", { className: "playground-resource-templates-page-inner playground-plugins-page" },
            React.createElement("h2", { className: "playground-resource-templates-hero-heading playground-tools-overview-heading" }, "Start from reusable project resources"),
            React.createElement("section", { className: "playground-plugins-hero-slider playground-metronome-hero-slider playground-resource-templates-hero-slider" },
              React.createElement("div", { className: "playground-plugins-hero-slide" },
                React.createElement("div", { className: "playground-resource-templates-hero-slide-content" },
                  React.createElement("div", { className: "playground-resource-templates-hero-pills" },
                    outgoingHeroTemplate
                      ? renderHeroTemplatePill(outgoingHeroTemplate, "playground-resource-templates-hero-pill is-outgoing")
                      : null,
                    renderHeroTemplatePill(activeHeroTemplate, "playground-resource-templates-hero-pill is-incoming")
                  ),
                  activeHeroTemplate
                    ? React.createElement("p", { className: "playground-resource-templates-hero-copy" },
                        activeHeroTemplate.summary || activeHeroTemplate.description || ""
                      )
                    : null
                ),
                activeHeroTemplate
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-resource-templates-hero-cta",
                      onClick: () => previewTemplate(activeHeroTemplate),
                    },
                      React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }),
                      React.createElement("span", null, "Open preview")
                    )
                  : null,
                heroTemplates.length > 1
                  ? React.createElement("div", { className: "playground-plugins-hero-dots" },
                      heroTemplates.map((template, index) => React.createElement("button", {
                        key: String(template.id || index),
                        type: "button",
                        className: "playground-resource-templates-hero-dot" + (index === activeHeroIndex ? " is-active" : ""),
                        "aria-label": "Show " + String(template.title || "template"),
                        onClick: () => updateTemplateSlideIndex(index),
                      }))
                    )
                  : null
              )
            ),
            React.createElement("section", { className: "playground-plugins-section" },
              React.createElement("div", { className: "playground-plugins-section-header playground-resource-templates-section-header" },
                React.createElement("div", { className: "playground-plugins-section-copy" },
                  React.createElement("h3", { className: "playground-plugins-section-title" }, "Resources"),
                  React.createElement("p", { className: "playground-plugins-section-subtitle" },
                    "Reusable templates for metronomes, files, web apps, functions, databases, and Imagine resources."
                  ),
                  notice
                    ? React.createElement("div", { className: "playground-resource-templates-notice" }, notice)
                    : null
                )
              ),
              renderTemplatesTable()
            )
          ),
          renderTemplateModal(selectedTemplate),
          renderPublishModal(publishTemplate)
        );
      }
`;

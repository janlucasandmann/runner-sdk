export const IMAGINE_PAGE_CSS = String.raw`
      .playground-content-body.is-imagine-page {
        padding: 0;
        overflow: hidden;
      }

      .playground-imagine-page {
        position: relative;
        isolation: isolate;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #000;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-page::after {
        display: none;
      }

      .playground-imagine-shell {
        position: relative;
        z-index: 1;
        width: min(100%, var(--playground-centered-page-max-width, 87.5rem));
        max-width: var(--playground-centered-page-max-width, 87.5rem);
        height: 100%;
        margin: 0 auto;
        padding: 48px 48px 10px;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .playground-imagine-header {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        padding-bottom: 0;
      }

      .playground-imagine-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-imagine-title-group {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-imagine-title {
        margin: 0;
        font-size: 18px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: -0.03em;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-beta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.9);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-tabs {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .playground-imagine-tab {
        height: 36px;
        border: 0;
        border-bottom: 1px solid transparent;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.46);
        padding: 0 12px;
        font-size: 13px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-tab.is-active {
        color: rgba(255, 255, 255, 0.96);
        border-bottom-color: rgba(255, 255, 255, 0.92);
      }

      .playground-imagine-toolbar.playground-auth-users-toolbar {
        flex: 0 0 auto;
        margin: 16px 0 0;
        padding-bottom: 12px;
        border-bottom: 0;
      }

      .playground-imagine-toolbar .playground-auth-users-search {
        max-width: none;
      }

      .playground-imagine-toolbar .playground-auth-users-search-input {
        height: 30px;
        font-size: 12px;
      }

      .playground-imagine-toolbar .playground-files-control-button {
        min-height: 30px;
        height: 30px;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-imagine-toolbar .playground-files-control-button svg {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-imagine-toolbar .playground-tasks-toolbar-popup-shell {
        position: relative;
      }

      .playground-imagine-toolbar .playground-tasks-toolbar-popup-menu {
        left: auto;
        right: 0;
        top: calc(100% + 8px);
        min-width: 210px;
      }

      .playground-imagine-grid-scroll {
        min-height: 0;
        flex: 1 1 auto;
        overflow: auto;
        padding-top: 16px;
        padding-bottom: 10px;
        scrollbar-width: none;
      }

      .playground-imagine-grid-scroll::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        grid-auto-flow: dense;
        gap: 8px;
      }

      .playground-imagine-template {
        position: relative;
        isolation: isolate;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow: hidden;
        border: 0;
        border-radius: 7px;
        background: var(--imagine-template-bg, rgba(255, 255, 255, 0.06));
        color: rgba(255, 255, 255, 0.94);
        text-align: left;
        cursor: pointer;
        padding: 16px;
        transform: translateZ(0);
      }

      .playground-imagine-template::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -2;
        background:
          radial-gradient(circle at 34% 24%, rgba(255, 255, 255, 0.26), transparent 18%),
          linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent 42%);
        opacity: 0.9;
      }

      .playground-imagine-template::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.58));
      }

      .playground-imagine-template:hover {
        transform: translateY(-1px);
      }

      .playground-imagine-template.is-selected {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.72);
      }

      .playground-imagine-template.is-large {
        grid-row: span 2;
        min-height: 368px;
      }

      .playground-imagine-template.is-wide {
        grid-column: span 2;
      }

      .playground-imagine-template-copy {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 88%;
      }

      .playground-imagine-template-title {
        font-size: 15px;
        line-height: 1.16;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-template-description {
        font-size: 12px;
        line-height: 1.45;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-imagine-template-prompt {
        display: none;
      }

      .playground-imagine-empty {
        min-height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.48);
        font-size: 13px;
      }

      .playground-imagine-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 10px;
        z-index: 5;
        width: min(56rem, calc(100% - 64px));
        transform: translateX(-50%);
      }

      .playground-imagine-selected-preset {
        width: fit-content;
        max-width: 100%;
        margin: 0 auto 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.42);
        -webkit-backdrop-filter: blur(28px);
        backdrop-filter: blur(28px);
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
        line-height: 1;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-selected-preset strong {
        color: rgba(255, 255, 255, 0.96);
        font-weight: 400;
      }

      .playground-imagine-selected-preset-clear {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
      }

      .playground-imagine-selected-preset-clear svg {
        width: 12px;
        height: 12px;
      }

      .playground-imagine-composer-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-input-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-input-width,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .embedded-runner-input,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-composer-textarea-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .task-input-controls {
        background: transparent !important;
      }

      .tb-runner-chat.playground-imagine-runner {
        width: 100%;
        min-width: 0;
        display: block;
        flex: 0 0 auto;
        height: auto;
        min-height: 0;
        overflow: visible;
      }

      .tb-runner-chat.playground-imagine-runner .workinglogsbox {
        display: none !important;
      }

      .tb-runner-chat.playground-imagine-runner .tb-input-shell {
        position: static;
        right: auto;
        bottom: auto;
        padding: 0;
        background: none;
        pointer-events: auto;
      }

      .tb-runner-chat.playground-imagine-runner .tb-input-width {
        width: 100%;
        max-width: none;
      }

      .tb-runner-chat.playground-imagine-runner .embedded-runner-input {
        width: 100%;
      }

      .tb-runner-chat.playground-imagine-runner .task-input-box {
        --tb-runner-input-bg: rgba(0, 0, 0, 0.35);
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.35);
        background: rgba(0, 0, 0, 0.35) !important;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .tb-runner-chat.playground-imagine-runner .tb-context-indicator-anchor {
        display: none;
      }

      @media (max-width: 1080px) {
        .playground-imagine-shell {
          padding-left: 28px;
          padding-right: 28px;
        }

        .playground-imagine-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 760px) {
        .playground-imagine-shell {
          padding: 28px 16px 10px;
        }

        .playground-imagine-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-imagine-template.is-wide {
          grid-column: span 1;
        }

        .playground-imagine-template.is-large {
          min-height: 300px;
        }

        .playground-imagine-composer-wrap {
          width: calc(100% - 24px);
          bottom: 10px;
        }
      }
`;

export const IMAGINE_PAGE_SCRIPT = String.raw`
        function PlaygroundImaginePage({
          backendUrl,
          apiKey,
          speechToTextUrl,
          requestHeaders,
          computerAgents,
          environments,
          agents,
          skills,
          skillDefaults,
          environmentId,
          agentId,
          fetchCustomSkills,
          onThreadStarted,
          onAgentChange,
          onEnvironmentChange,
          onOpenPlansBudget,
          onRequireAuth,
        }) {
          const [activeTab, setActiveTab] = useState("explore");
          const [searchQuery, setSearchQuery] = useState("");
          const [selectedTemplateId, setSelectedTemplateId] = useState("");
          const [toolbarPopover, setToolbarPopover] = useState("");
          const [filterMode, setFilterMode] = useState("all");
          const [sortMode, setSortMode] = useState("featured");

          const templates = useMemo(() => [
            {
              id: "product-ads",
              title: "Product ads",
              description: "Launch-ready product scenes, social variants, and campaign visuals.",
              longDescription: "Create polished product visuals for launches, paid ads, store pages, and social placements. Use this template when you need a clean commercial image that makes the product feel premium and immediately usable.",
              prompt: "Create a premium product ad with a clean studio setup, soft light, and conversion-focused composition.",
              placeholder: "Create a product ad",
              Icon: Sparkles,
              tone: "linear-gradient(135deg, #2c1f4f 0%, #6a5cff 44%, #121318 100%)",
              size: "large",
            },
            {
              id: "brand-campaigns",
              title: "Brand campaigns",
              description: "Consistent campaign art directions for launches and seasonal moments.",
              longDescription: "Build a campaign-ready visual direction with consistent mood, colors, and composition. This is best for product launches, seasonal campaigns, brand refreshes, and multi-channel creative concepts.",
              prompt: "Design a cohesive brand campaign image with a strong visual system and editorial lighting.",
              placeholder: "Design a brand campaign",
              Icon: Paintbrush,
              tone: "linear-gradient(135deg, #44211a 0%, #c98748 42%, #16110f 100%)",
              size: "wide",
            },
            {
              id: "infographics",
              title: "Infographics",
              description: "Clean explainers, diagrams, and visual summaries.",
              longDescription: "Turn a message, process, dataset, or product explanation into a clear visual. This template is useful for reports, landing pages, sales collateral, and educational content that needs structure.",
              prompt: "Create a polished infographic that explains the main idea with clear hierarchy and simple visual metaphors.",
              placeholder: "Make an infographic",
              Icon: LayoutGrid,
              tone: "linear-gradient(135deg, #082b2e 0%, #36d1c4 42%, #071415 100%)",
            },
            {
              id: "app-screens",
              title: "App screens",
              description: "Mockups, dashboard concepts, and product UI visuals.",
              longDescription: "Generate product interface concepts, dashboard previews, and realistic app visuals. Use it to explore UI directions, explain product ideas, or create polished screenshots before the final interface exists.",
              prompt: "Create a high-end SaaS dashboard concept with dense but readable product UI and realistic data.",
              placeholder: "Mock up an app screen",
              Icon: Monitor,
              tone: "linear-gradient(135deg, #101827 0%, #66a6ff 45%, #07080b 100%)",
            },
            {
              id: "editorial",
              title: "Editorial images",
              description: "Magazine-style visuals for stories, blogs, and landing pages.",
              longDescription: "Create refined editorial imagery for articles, hero sections, essays, and product stories. This template leans into cinematic lighting, thoughtful composition, and a more premium publication feel.",
              prompt: "Create an editorial hero image with cinematic lighting, a premium magazine composition, and natural texture.",
              placeholder: "Create an editorial image",
              Icon: Camera,
              tone: "linear-gradient(135deg, #141414 0%, #595959 45%, #040404 100%)",
            },
            {
              id: "social-posts",
              title: "Social posts",
              description: "Square, vertical, and carousel-ready content directions.",
              longDescription: "Produce high-impact visuals for launch posts, announcements, carousels, and short-form campaigns. Use this when the image needs to read quickly, feel modern, and work in social feeds.",
              prompt: "Create a social media campaign visual that feels bold, modern, and ready for a launch post.",
              placeholder: "Create a social post",
              Icon: ImageIcon,
              tone: "linear-gradient(135deg, #2d1024 0%, #ff6f9b 48%, #120610 100%)",
            },
            {
              id: "storyboards",
              title: "Storyboards",
              description: "Sequence images for ads, demos, and product narratives.",
              longDescription: "Draft visual frames for a product video, ad sequence, explainer, or demo narrative. This template helps define scene direction, motion intent, and the look of a future production.",
              prompt: "Create a storyboard frame for a product launch video with clear motion direction and strong composition.",
              placeholder: "Storyboard a launch",
              Icon: Film,
              tone: "linear-gradient(135deg, #1b2635 0%, #93b7ff 44%, #090c12 100%)",
              size: "wide",
            },
            {
              id: "data-visuals",
              title: "Data visuals",
              description: "Charts, report covers, and visualized insights.",
              longDescription: "Create visual assets around metrics, reports, trends, and analytical stories. This is useful for investor updates, market reports, dashboards, and presentations that need data to feel visual.",
              prompt: "Create a sophisticated data visualization artwork for a business report, with charts integrated naturally.",
              placeholder: "Visualize this data",
              Icon: ChartNoAxesColumnIncreasing,
              tone: "linear-gradient(135deg, #18200e 0%, #96e072 42%, #070b05 100%)",
            },
            {
              id: "fashion-campaigns",
              title: "Fashion campaigns",
              description: "Editorial looks, lookbook visuals, and polished campaign assets.",
              longDescription: "Generate polished fashion visuals for lookbooks, campaign concepts, editorial spreads, and premium product storytelling. Use this template for refined styling, expressive posture, and brand-forward composition.",
              prompt: "Create a high-end fashion campaign image with editorial styling, premium lighting, and a strong brand-forward composition.",
              placeholder: "Create a fashion campaign",
              Icon: Wand2,
              imageUrl: "/img/imagine/fashion.webp",
              tone: "url('/img/imagine/fashion.webp') center / cover no-repeat",
              size: "large",
            },
            {
              id: "concept-art",
              title: "Concept art",
              description: "Worldbuilding, environments, and visual exploration.",
              longDescription: "Explore environments, worlds, scenes, and visual directions before production. This template is best for early-stage creative exploration where atmosphere and detail matter more than a finished ad.",
              prompt: "Create concept art for a futuristic workspace with cinematic depth and production-ready detail.",
              placeholder: "Create concept art",
              Icon: Telescope,
              tone: "linear-gradient(135deg, #0f1830 0%, #9b7cff 40%, #05060b 100%)",
            },
          ], []);

          const selectedTemplate = useMemo(
            () => templates.find((template) => template.id === selectedTemplateId) || null,
            [selectedTemplateId, templates]
          );

          const filterGroups = useMemo(() => ({
            campaign: ["product-ads", "brand-campaigns", "social-posts"],
            product: ["app-screens", "data-visuals"],
            editorial: ["editorial", "fashion-campaigns"],
            concept: ["infographics", "storyboards", "concept-art"],
          }), []);

          const filterOptions = useMemo(() => [
            { id: "all", label: "All templates", description: "Show every image template" },
            { id: "campaign", label: "Campaigns", description: "Ads, launches, and social visuals" },
            { id: "product", label: "Product", description: "Apps, dashboards, and data visuals" },
            { id: "editorial", label: "Editorial", description: "Stories, blogs, and fashion campaigns" },
            { id: "concept", label: "Concepts", description: "Explainers, storyboards, and worlds" },
          ], []);

          const sortOptions = useMemo(() => [
            { id: "featured", label: "Featured" },
            { id: "name-asc", label: "Name" },
            { id: "name-desc", label: "Name descending" },
          ], []);

          const filteredTemplates = useMemo(() => {
            const query = String(searchQuery || "").trim().toLowerCase();
            let nextTemplates = templates;
            if (query) {
              nextTemplates = nextTemplates.filter((template) => (
                template.title.toLowerCase().includes(query)
                || template.description.toLowerCase().includes(query)
                || template.prompt.toLowerCase().includes(query)
              ));
            }
            if (filterMode !== "all") {
              const group = filterGroups[filterMode] || [];
              nextTemplates = nextTemplates.filter((template) => group.includes(template.id));
            }
            if (sortMode === "name-asc") {
              nextTemplates = [...nextTemplates].sort((a, b) => a.title.localeCompare(b.title));
            } else if (sortMode === "name-desc") {
              nextTemplates = [...nextTemplates].sort((a, b) => b.title.localeCompare(a.title));
            }
            return nextTemplates;
          }, [filterGroups, filterMode, searchQuery, sortMode, templates]);

          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine mode.",
            "The user is asking for image generation only. Do not produce video unless the user explicitly asks to leave Imagine mode.",
            "Use the available image generation skill when possible. Produce polished image prompts, create the image, and summarize the image outputs concisely.",
            selectedTemplate ? "The user selected this image template: " + selectedTemplate.title + ". Suggested direction: " + selectedTemplate.prompt : "",
          ].filter(Boolean).join("\\n");

          if (selectedTemplate) {
            return React.createElement(PlaygroundImagineTemplatePage, {
              templates,
              initialTemplateId: selectedTemplate.id,
              backendUrl,
              apiKey,
              speechToTextUrl,
              requestHeaders,
              computerAgents,
              environments,
              agents,
              skills,
              skillDefaults,
              environmentId,
              agentId,
              fetchCustomSkills,
              onThreadStarted,
              onAgentChange,
              onEnvironmentChange,
              onOpenPlansBudget,
              onBack: () => setSelectedTemplateId(""),
            });
          }

          return React.createElement("div", { className: "playground-imagine-page" },
            React.createElement("div", { className: "playground-imagine-shell" },
              React.createElement("div", { className: "playground-imagine-header" },
                React.createElement("div", { className: "playground-imagine-title-row" },
                  React.createElement("div", { className: "playground-imagine-title-group" },
                    React.createElement("h1", { className: "playground-imagine-title" }, "Imagine"),
                    React.createElement("span", { className: "playground-imagine-beta" }, "Beta")
                  )
                ),
                React.createElement("div", { className: "playground-imagine-tabs", role: "tablist", "aria-label": "Imagine views" },
                  ["explore", "history"].map((tab) => React.createElement("button", {
                    key: tab,
                    type: "button",
                    role: "tab",
                    className: "playground-imagine-tab" + (activeTab === tab ? " is-active" : ""),
                    "aria-selected": activeTab === tab ? "true" : "false",
                    onClick: () => {
                      setActiveTab(tab);
                      setToolbarPopover("");
                    },
                  }, tab === "explore" ? "Explore" : "History"))
                )
              ),
              React.createElement("div", { className: "playground-imagine-toolbar playground-auth-users-toolbar" },
                React.createElement("label", { className: "playground-auth-users-search" },
                  React.createElement(Search, { className: "playground-auth-users-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    className: "playground-auth-users-search-input",
                    type: "search",
                    value: searchQuery,
                    onChange: (event) => setSearchQuery(event.target.value),
                    placeholder: "Search image templates",
                  })
                ),
                React.createElement("div", { className: "playground-auth-users-toolbar-actions" },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-imagine-sort-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-sort" + (toolbarPopover === "sort" || sortMode !== "featured" ? " is-active" : ""),
                      onClick: () => setToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    },
                      React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Sort")
                    ),
                    toolbarPopover === "sort"
                      ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          sortOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (sortMode === option.id ? " selected" : ""),
                                onClick: () => {
                                  setSortMode(option.id);
                                  setToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                sortMode === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-imagine-filter-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-filter" + (toolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                      onClick: () => setToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    },
                      React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Filter")
                    ),
                    toolbarPopover === "filter"
                      ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          filterOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (filterMode === option.id ? " selected" : ""),
                                onClick: () => {
                                  setFilterMode(option.id);
                                  setToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                filterMode === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label),
                                React.createElement("span", null, option.description)
                              )
                            )
                          )
                        )
                      : null
                  )
                )
              ),
              React.createElement("div", { className: "playground-imagine-grid-scroll" },
                activeTab === "history"
                  ? React.createElement("div", { className: "playground-imagine-empty" }, "Generated images will appear here.")
                  : filteredTemplates.length
                    ? React.createElement("div", { className: "playground-imagine-grid" },
                        filteredTemplates.map((template) => {
                          return React.createElement("button", {
                            key: template.id,
                            type: "button",
                            className: [
                              "playground-imagine-template",
                              template.size === "large" ? "is-large" : "",
                              template.size === "wide" ? "is-wide" : "",
                              selectedTemplateId === template.id ? "is-selected" : "",
                            ].filter(Boolean).join(" "),
                            style: { "--imagine-template-bg": template.tone },
                            onClick: () => setSelectedTemplateId(template.id),
                          },
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
            React.createElement("div", { className: "playground-imagine-composer-wrap" },
              selectedTemplate
                ? React.createElement("div", { className: "playground-imagine-selected-preset" },
                    React.createElement(Sparkles, { width: 14, height: 14, strokeWidth: 1.8 }),
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
                  key: "imagine-runner:" + (selectedTemplateId || "__none__"),
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
                  skills: Array.isArray(skills) ? skills : [],
                  skillDefaults,
                  environmentId: environmentId || undefined,
                  agentId: agentId || undefined,
                  autoFocusComposer: true,
                  keepFocusOnSubmit: true,
                  showUsageInStatus: false,
                  placeholder: selectedTemplate ? (selectedTemplate.placeholder || selectedTemplate.title) : "Describe an image",
                  hiddenSystemPrompt,
                  onThreadIdChange: () => {},
                  onExternalRunRequestCreate: (request) => {
                    const normalizedThreadId = String(request?.threadId || "").trim();
                    if (!normalizedThreadId || typeof onThreadStarted !== "function") {
                      return false;
                    }
                    onThreadStarted(normalizedThreadId, {
                      taskRunRequest: request,
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
          );
        }
`;

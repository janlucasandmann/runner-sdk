export const MARKETPLACE_PAGE_SETUP_SCRIPT = String.raw`
      function getPlaygroundResourceTemplateIcon(type) {
        const normalizedType = String(type || "").trim();
        if (normalizedType === "metronome") return typeof Metronome !== "undefined" ? Metronome : Layers;
        if (normalizedType === "file") return typeof FolderOpen !== "undefined" ? FolderOpen : Layers;
        if (normalizedType === "web_app") return typeof Monitor !== "undefined" ? Monitor : Layers;
        if (normalizedType === "function") return typeof FunctionSquare !== "undefined" ? FunctionSquare : Layers;
        if (normalizedType === "database") return typeof Database !== "undefined" ? Database : Layers;
        if (normalizedType === "imagine") return typeof Clapperboard !== "undefined" ? Clapperboard : Layers;
        return typeof Layers !== "undefined" ? Layers : null;
      }

      function renderPlaygroundResourceTemplatesPage({
        templates,
        types,
        projectOptions,
        activeType,
        setActiveType,
        searchQuery,
        setSearchQuery,
        selectedTemplateId,
        setSelectedTemplateId,
        publishTemplateId,
        setPublishTemplateId,
        notice,
        setNotice,
        onPublishTemplate,
        onPreviewTemplate,
        templateSlideIndex,
        setTemplateSlideIndex,
        templateToolbarPopover,
        setTemplateToolbarPopover,
      }) {
        const templateList = Array.isArray(templates) ? templates : [];
        const typeList = Array.isArray(types) && types.length
          ? types
          : [{ id: "all", label: "All templates" }];
        const projects = Array.isArray(projectOptions) ? projectOptions : [];
        const normalizedActiveType = String(activeType || "all").trim() || "all";
        const normalizedSearch = String(searchQuery || "").trim().toLowerCase();
        const selectedTemplate = templateList.find((template) => String(template.id || "") === String(selectedTemplateId || ""));
        const publishTemplate = templateList.find((template) => String(template.id || "") === String(publishTemplateId || ""));
        const normalizedTemplateSlideIndex = Math.max(0, Number(templateSlideIndex || 0) || 0);
        const normalizedTemplateToolbarPopover = String(templateToolbarPopover || "");
        const updateTemplateSlideIndex = typeof setTemplateSlideIndex === "function" ? setTemplateSlideIndex : () => {};
        const updateTemplateToolbarPopover = typeof setTemplateToolbarPopover === "function" ? setTemplateToolbarPopover : () => {};
        const filteredTemplates = templateList.filter((template) => {
          const typeMatches = normalizedActiveType === "all" || String(template.type || "") === normalizedActiveType;
          if (!typeMatches) return false;
          if (!normalizedSearch) return true;
          const haystack = [
            template.title,
            template.summary,
            template.description,
            template.typeLabel,
            ...(Array.isArray(template.capabilities) ? template.capabilities : []),
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearch);
        });
        const featuredTemplates = templateList.filter((template) => template.featured).slice(0, 6);
        const heroTemplates = (featuredTemplates.length ? featuredTemplates : templateList).slice(0, 6);
        const activeHeroIndex = heroTemplates.length ? normalizedTemplateSlideIndex % heroTemplates.length : 0;
        const activeHeroTemplate = heroTemplates[activeHeroIndex] || null;
        const outgoingHeroTemplate = heroTemplates.length > 1 ? heroTemplates[(activeHeroIndex + heroTemplates.length - 1) % heroTemplates.length] : null;
        const activeTypeOption = typeList.find((type) => String(type.id || "") === normalizedActiveType) || typeList[0] || { id: "all", label: "All templates" };
        const templateCountByType = templateList.reduce((counts, template) => {
          const type = String(template.type || "").trim();
          counts.all = (counts.all || 0) + 1;
          if (type) counts[type] = (counts[type] || 0) + 1;
          return counts;
        }, { all: 0 });

        function closeModal() {
          if (typeof setSelectedTemplateId === "function") setSelectedTemplateId("");
          if (typeof setPublishTemplateId === "function") setPublishTemplateId("");
        }

        function renderTemplateIcon(type, size) {
          const Icon = getPlaygroundResourceTemplateIcon(type);
          return Icon
            ? React.createElement(Icon, { width: size || 16, height: size || 16, strokeWidth: 1.8 })
            : null;
        }

        function previewTemplate(template) {
          if (!template) return;
          updateTemplateToolbarPopover("");
          const previewableTemplateTypes = new Set(["metronome", "web_app", "function", "database"]);
          if (previewableTemplateTypes.has(String(template.type || "").trim()) && typeof onPreviewTemplate === "function") {
            onPreviewTemplate(template);
            return;
          }
          if (typeof setSelectedTemplateId === "function") {
            setSelectedTemplateId(String(template.id || ""));
          }
        }

        function renderHeroTemplatePill(template, className) {
          if (!template) return null;
          return React.createElement("div", { className },
            React.createElement("span", { className: "playground-resource-templates-hero-pill-icon" }, renderTemplateIcon(template.type, 13)),
            React.createElement("span", null, template.title || "Template")
          );
        }

`;

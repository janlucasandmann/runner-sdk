export const MARKETPLACE_PAGE_SETUP_SCRIPT = String.raw`
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
      }) {
        const templateList = Array.isArray(templates) ? templates : [];
        const typeList = Array.isArray(types) && types.length
          ? types
          : [{ id: "all", label: "All templates" }];
        const projects = Array.isArray(projectOptions) ? projectOptions : [];
        const normalizedActiveType = String(activeType || "all").trim() || "all";
        const selectedTemplate = templateList.find((template) => (
          String(template.id || "") === String(selectedTemplateId || "")
        ));
        const publishTemplate = templateList.find((template) => (
          String(template.id || "") === String(publishTemplateId || "")
        ));

        function closeModal() {
          if (typeof setSelectedTemplateId === "function") setSelectedTemplateId("");
          if (typeof setPublishTemplateId === "function") setPublishTemplateId("");
        }

        function previewTemplate(template) {
          if (!template) return;
          const previewableTemplateTypes = new Set(["metronome", "web_app", "function", "database"]);
          if (
            previewableTemplateTypes.has(String(template.type || "").trim())
            && typeof onPreviewTemplate === "function"
          ) {
            onPreviewTemplate(template);
            return;
          }
          if (typeof setSelectedTemplateId === "function") {
            setSelectedTemplateId(String(template.id || ""));
          }
        }

`;

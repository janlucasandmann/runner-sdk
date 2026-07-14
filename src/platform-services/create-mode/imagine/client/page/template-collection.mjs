export const IMAGINE_PAGE_TEMPLATE_COLLECTION_SCRIPT = String.raw`          const normalizedCustomTemplates = useMemo(() => {
            const normalizeCustomTemplate = (template, extras = {}) => {
              const normalizedTemplate = { ...(template || {}) };
              delete normalizedTemplate["long" + "Description"];
              return {
                ...normalizedTemplate,
                ...extras,
                isCustom: true,
                Icon: ImageIcon,
                tone: normalizedTemplate.tone || (normalizedTemplate.imageUrl
                  ? "url('" + normalizedTemplate.imageUrl + "') center / cover no-repeat"
                  : "linear-gradient(135deg, rgba(20, 20, 22, 0.96), rgba(42, 42, 48, 0.72))"),
                defaultStyles: Array.isArray(normalizedTemplate.defaultStyles) ? normalizedTemplate.defaultStyles : ["professional"],
                defaultAspectRatio: String(normalizedTemplate.defaultAspectRatio || "").trim(),
              };
            };
            const templatesById = new Map();
            sharedCustomTemplates.forEach((template) => {
              const normalizedId = String(template?.id || "").trim();
              if (normalizedId) {
                templatesById.set(normalizedId, normalizeCustomTemplate(template, { isShared: true }));
              }
            });
            customTemplates.forEach((template) => {
              const normalizedId = String(template?.id || "").trim();
              if (normalizedId) {
                templatesById.set(normalizedId, normalizeCustomTemplate(template));
              }
            });
            return Array.from(templatesById.values());
          }, [customTemplates, sharedCustomTemplates]);

          const allTemplates = useMemo(() => {
            return normalizedCustomTemplates.concat(templates);
          }, [normalizedCustomTemplates, templates]);

          const selectedTemplate = useMemo(
            () => allTemplates.find((template) => template.id === selectedTemplateId) || null,
            [allTemplates, selectedTemplateId]
          );

          useEffect(() => {
            const normalizedToken = String(focusedTemplateSelectionToken || "").trim();
            const normalizedTemplateId = String(focusedTemplateId || "").trim();
            if (!normalizedToken || !normalizedTemplateId) {
              return;
            }
            if (lastAppliedFocusedTemplateSelectionTokenRef.current === normalizedToken) {
              return;
            }
            const focusedTemplate = allTemplates.find((template) => String(template?.id || "").trim() === normalizedTemplateId) || null;
            if (!focusedTemplate) {
              return;
            }
            lastAppliedFocusedTemplateSelectionTokenRef.current = normalizedToken;
            setActiveImagineTab(focusedTemplate.isCustom || focusedTemplate.isShared ? "my-templates" : "explore");
            window.setTimeout(() => {
              setSelectedTemplateId(normalizedTemplateId);
            }, 0);
          }, [allTemplates, focusedTemplateId, focusedTemplateSelectionToken, setActiveImagineTab]);

          const getTemplateAssetIndex = useCallback((template) => {
            const templateId = String(template?.id || "").trim();
            const assets = normalizePlaygroundImagineTemplateAssets(template);
            const rawIndex = Number(templateAssetIndexes[templateId] || 0) || 0;
            if (!assets.length) {
              return 0;
            }
            return Math.max(0, Math.min(rawIndex, assets.length - 1));
          }, [templateAssetIndexes]);
          const setTemplateAssetIndex = useCallback((template, nextIndex, direction) => {
            const templateId = String(template?.id || "").trim();
            const assets = normalizePlaygroundImagineTemplateAssets(template);
            if (!templateId || assets.length <= 1) {
              return;
            }
            const currentIndex = Math.max(0, Math.min(Number(templateAssetIndexes[templateId] || 0) || 0, assets.length - 1));
            const normalizedIndex = ((Number(nextIndex) || 0) + assets.length) % assets.length;
            const normalizedDirection = Number(direction || 0) < 0 ? -1 : (Number(direction || 0) > 0 ? 1 : (normalizedIndex >= currentIndex ? 1 : -1));
            setTemplateAssetDirections((current) => ({
              ...current,
              [templateId]: normalizedDirection,
            }));
            setTemplateAssetIndexes((current) => ({
              ...current,
              [templateId]: normalizedIndex,
            }));
          }, [templateAssetIndexes]);

          const filterGroups = useMemo(() => ({
            campaign: ["product-ads", "astra-ads", "multi-asset-campaign-set", "modern-pitch-deck", "luxury-watch-ads", "video-product-launch", "akita-space-video", "youtube-intro-video", "fragrance-ads", "coffee-ads", "beauty-ads", "metal-typography-ads", "text-led-ads", "payment-ads", "logo-branding", "furniture-campaigns", "sneaker-campaigns", "brand-campaigns", "social-posts", "restaurant-ads", "comparison-ads"],
            product: ["product-ads", "astra-ads", "multi-asset-campaign-set", "modern-pitch-deck", "luxury-watch-ads", "video-product-launch", "fragrance-ads", "coffee-ads", "beauty-ads", "metal-typography-ads", "text-led-ads", "payment-ads", "furniture-campaigns", "sneaker-campaigns", "technical-drawings", "app-screens", "data-visuals"],
            editorial: ["editorial", "logo-branding", "fashion-campaigns", "portrait-studio"],
            concept: ["akita-space-video", "cell-division-video", "youtube-intro-video", "video-cinematic-scene", "infographics", "technical-drawings", "concept-art", "animated-characters", "cinematic-wildlife"],
          }), []);

          const filterOptions = useMemo(() => [
            { id: "all", label: "All templates", description: "Show every template" },
            { id: "campaign", label: "Campaigns", description: "Ads, launches, and social visuals" },
            { id: "product", label: "Product", description: "Product ads, apps, dashboards, and data visuals" },
            { id: "editorial", label: "Editorial", description: "Stories, blogs, and fashion campaigns" },
            { id: "concept", label: "Concepts", description: "Explainers, concept art, and worlds" },
          ], []);

          const sortOptions = useMemo(() => [
            { id: "featured", label: "Featured" },
            { id: "name-asc", label: "Name" },
            { id: "name-desc", label: "Name descending" },
          ], []);

          const filteredTemplates = useMemo(() => {
            const query = String(searchQuery || "").trim().toLowerCase();
            let nextTemplates = activeTab === "my-templates"
              ? normalizedCustomTemplates
              : activeTab === "favourites"
                ? allTemplates.filter((template) => favouriteTemplateIds.includes(template.id))
                : templates;
            if (query) {
              nextTemplates = nextTemplates.filter((template) => (
                template.title.toLowerCase().includes(query)
                || template.description.toLowerCase().includes(query)
                || template.prompt.toLowerCase().includes(query)
              ));
            }
            if (filterMode !== "all" && activeTab === "explore") {
              const group = filterGroups[filterMode] || [];
              nextTemplates = nextTemplates.filter((template) => group.includes(template.id));
            }
            if (sortMode === "name-asc") {
              nextTemplates = [...nextTemplates].sort((a, b) => a.title.localeCompare(b.title));
            } else if (sortMode === "name-desc") {
              nextTemplates = [...nextTemplates].sort((a, b) => b.title.localeCompare(a.title));
            }
            return nextTemplates;
          }, [activeTab, allTemplates, favouriteTemplateIds, filterGroups, filterMode, normalizedCustomTemplates, searchQuery, sortMode, templates]);

`;

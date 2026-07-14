export const MARKETPLACE_APP_LIFECYCLE_SCRIPT = `        const resourceTemplateHeroCount = (() => {
          const templates = Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_DATA) ? PLAYGROUND_RESOURCE_TEMPLATE_DATA : [];
          const featuredTemplates = templates.filter((template) => template.featured);
          return Math.min((featuredTemplates.length ? featuredTemplates : templates).length, 6);
        })();
        useEffect(() => {
          if (activePage !== "resource-templates" || resourceTemplateHeroCount <= 1) return undefined;
          const timer = window.setInterval(() => {
            setResourceTemplateSlideIndex((current) => (current + 1) % resourceTemplateHeroCount);
          }, 4200);
          return () => window.clearInterval(timer);
        }, [activePage, resourceTemplateHeroCount]);
        useEffect(() => {
          if (activePage === "resource-templates") return undefined;
          setResourceTemplateToolbarPopover("");
          return undefined;
        }, [activePage]);
`;

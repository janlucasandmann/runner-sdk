export const MODELS_APP_CATALOG_LIFECYCLE_SCRIPT = `        const loadModelsPageAgentModelCatalog = useCallback(async () => {
          await loadPlaygroundManagedAgentModelCatalog(proxyBackendBase, requestHeaders, setModelsPageAgentModelOptions);
        }, [proxyBackendBase, requestHeaders]);
        useEffect(() => {
          if (activePage !== "models" || !hasShellAccess) {
            return;
          }
          void loadModelsPageAgentModelCatalog();
        }, [activePage, hasShellAccess, loadModelsPageAgentModelCatalog]);
`;

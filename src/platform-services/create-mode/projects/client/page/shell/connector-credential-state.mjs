export const PROJECTS_CONNECTOR_CREDENTIAL_STATE_FRAGMENT = String.raw`
        const projectOverviewConnectorCredentialProviderDefinitions = useMemo(() => {
          const entries = typeof listPlatformConnectorCatalogEntries === "function"
            ? listPlatformConnectorCatalogEntries()
            : [];
          const definitions = (Array.isArray(entries) ? entries : []).map((entry) => {
            const rawProviderId = String(entry?.id || "").trim().toLowerCase();
            const providerId = rawProviderId === "atlassian" ? "jira" : rawProviderId;
            if (!providerId) return null;
            return Object.freeze({
              id: providerId,
              providerId,
              label: String(entry?.label || providerId).trim(),
              description: String(
                entry?.functionsLabel || entry?.category || "Connected account"
              ).trim(),
              iconUrl: String(entry?.logoUrl || "").trim(),
            });
          }).filter(Boolean);
          return Object.freeze(definitions);
        }, []);
        const projectOverviewConnectorCredentialOrganizationId = (() => {
          try {
            return String(
              new Headers(requestHeaders || {}).get("x-computer-agents-organization") || ""
            ).trim();
          } catch {
            return "";
          }
        })();
        const projectOverviewConnectorCredentialCatalogRequestRef = useRef("");
        const [
          projectOverviewConnectorCredentialCatalogState,
          setProjectOverviewConnectorCredentialCatalogState,
        ] = useState({
          organizationId: "",
          status: "idle",
          error: "",
          providers: {},
        });

        useEffect(() => {
          const organizationId = String(projectOverviewConnectorCredentialOrganizationId || "").trim();
          const projectId = String(selectedProjectId || "").trim();
          if (taskView !== "overview" || !projectId || !organizationId) {
            projectOverviewConnectorCredentialCatalogRequestRef.current = "";
            if (!organizationId) {
              setProjectOverviewConnectorCredentialCatalogState((current) => (
                current.status === "idle" && !current.organizationId
                  ? current
                  : {
                      organizationId: "",
                      status: "idle",
                      error: "",
                      providers: {},
                    }
              ));
            }
            return undefined;
          }
          const requestKey = organizationId + ":" + projectId;
          if (projectOverviewConnectorCredentialCatalogRequestRef.current === requestKey) {
            return undefined;
          }

          projectOverviewConnectorCredentialCatalogRequestRef.current = requestKey;
          const controller = new AbortController();
          setProjectOverviewConnectorCredentialCatalogState({
            organizationId,
            status: "loading",
            error: "",
            providers: {},
          });

          void (async () => {
            const headers = new Headers(requestHeaders || {});
            headers.set("Accept", "application/json");
            const response = await fetch(
              "/api/aios/organizations/"
                + encodeURIComponent(organizationId)
                + "/connector-credentials",
              {
                method: "GET",
                headers,
                signal: controller.signal,
              }
            );
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(
                payload?.message
                || payload?.error
                || "Unable to load connector credentials."
              );
            }
            const providerResults = (Array.isArray(payload?.providers)
              ? payload.providers
              : []
            ).map((providerCatalog) => {
              const rawProviderId = String(providerCatalog?.provider || "").trim().toLowerCase();
              const providerId = rawProviderId === "atlassian" ? "jira" : rawProviderId;
              if (!providerId) return null;
              const seenCredentialIds = new Set();
              const credentials = (
                Array.isArray(providerCatalog?.credentials)
                  ? providerCatalog.credentials
                  : []
              )
                .map((credential) => {
                  const credentialId = String(
                    credential?.credentialId || credential?.id || ""
                  ).trim();
                  if (!credentialId || seenCredentialIds.has(credentialId)) {
                    return null;
                  }
                  seenCredentialIds.add(credentialId);
                  return {
                    id: credentialId,
                    credentialId,
                    provider: String(credential?.provider || providerId).trim(),
                    name: String(credential?.name || "").trim(),
                    identity: String(credential?.identity || "").trim(),
                    status: credential?.status === "invalid" ? "invalid" : "valid",
                    isDefault: credential?.isDefault === true,
                  };
                })
                .filter(Boolean);
              return credentials.length
                ? {
                    id: providerId,
                    status: "ready",
                    error: "",
                    credentials,
                  }
                : null;
            }).filter(Boolean);
            return providerResults;
          })()
            .then((providerResults) => {
              if (controller.signal.aborted) return;
              const providers = providerResults.reduce((result, provider) => {
                result[provider.id] = provider;
                return result;
              }, {});
              setProjectOverviewConnectorCredentialCatalogState({
                organizationId,
                status: "ready",
                error: "",
                providers,
              });
            })
            .catch((error) => {
              if (controller.signal.aborted) return;
              setProjectOverviewConnectorCredentialCatalogState({
                organizationId,
                status: "error",
                error: error instanceof Error
                  ? error.message
                  : "Unable to load connector credentials.",
                providers: {},
              });
            });

          return () => controller.abort();
        }, [
          projectOverviewConnectorCredentialOrganizationId,
          selectedProjectId,
          taskView,
        ]);
`;

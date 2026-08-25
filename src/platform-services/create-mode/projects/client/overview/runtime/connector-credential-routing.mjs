export const PROJECT_OVERVIEW_CONNECTOR_CREDENTIAL_ROUTING_FRAGMENT = String.raw`
        function normalizeProjectConnectorCredentialProviderId(value) {
          const normalized = String(value || "").trim().toLowerCase();
          return normalized === "atlassian" ? "jira" : normalized;
        }

        function buildProjectConnectorCredentialProviderDefinition(providerId) {
          const normalizedProviderId = normalizeProjectConnectorCredentialProviderId(providerId);
          const configuredDefinition = (
            Array.isArray(projectOverviewConnectorCredentialProviderDefinitions)
              ? projectOverviewConnectorCredentialProviderDefinitions
              : []
          ).find((definition) => (
            normalizeProjectConnectorCredentialProviderId(definition?.providerId || definition?.id)
            === normalizedProviderId
          ));
          if (configuredDefinition) return configuredDefinition;
          const label = normalizedProviderId
            .split("-")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
          return {
            id: normalizedProviderId,
            providerId: normalizedProviderId,
            label: label || "Connector",
            description: "Connected organization account",
            iconUrl: "",
          };
        }

        function getProjectConnectorCredentialBindings(projectRecord) {
          const metadata = projectRecord?.metadata
            && typeof projectRecord.metadata === "object"
            && !Array.isArray(projectRecord.metadata)
              ? projectRecord.metadata
              : {};
          const bindings = metadata.connectorCredentialBindings;
          return bindings && typeof bindings === "object" && !Array.isArray(bindings)
            ? bindings
            : {};
        }

        function getProjectConnectorCredentialBinding(projectRecord, providerId) {
          const bindings = getProjectConnectorCredentialBindings(projectRecord);
          const normalizedProviderId = normalizeProjectConnectorCredentialProviderId(providerId);
          const aliases = [
            normalizedProviderId,
            normalizedProviderId.replaceAll("-", "_"),
            normalizedProviderId === "jira" ? "atlassian" : "",
          ].filter(Boolean);
          for (const alias of aliases) {
            const rawBinding = bindings[alias];
            if (rawBinding && typeof rawBinding === "object" && !Array.isArray(rawBinding)) {
              return {
                credentialId: String(
                  rawBinding.credentialId || rawBinding.credential_id || rawBinding.id || ""
                ).trim(),
                credentialName: String(
                  rawBinding.credentialName || rawBinding.name || ""
                ).trim(),
                identity: String(rawBinding.identity || "").trim(),
              };
            }
            if (typeof rawBinding === "string" && rawBinding.trim()) {
              return {
                credentialId: rawBinding.trim(),
                credentialName: "",
                identity: "",
              };
            }
          }
          return {
            credentialId: "",
            credentialName: "",
            identity: "",
          };
        }

        function normalizeProjectConnectorCredentialCandidates(credentials) {
          return (Array.isArray(credentials) ? credentials : []).map((credential) => ({
            credentialId: String(
              credential?.credentialId || credential?.id || ""
            ).trim(),
            name: String(
              credential?.name || credential?.identity || "Connected account"
            ).trim(),
            identity: String(
              credential?.identity || credential?.name || "Connected account"
            ).trim(),
            status: String(credential?.status || "valid").trim().toLowerCase(),
            isDefault: credential?.isDefault === true,
          })).filter((credential) => credential.credentialId);
        }

        function updateProjectConnectorCredentialBinding(
          projectRecord,
          definition,
          credentialId,
          fallbackCredentials = []
        ) {
          const providerId = normalizeProjectConnectorCredentialProviderId(
            definition?.providerId || definition?.id
          );
          if (!providerId) return;
          const catalogCredentials = Array.isArray(
            projectOverviewConnectorCredentialCatalogState?.providers?.[definition.id]?.credentials
          )
            ? projectOverviewConnectorCredentialCatalogState.providers[definition.id].credentials
            : [];
          const credentials = normalizeProjectConnectorCredentialCandidates(
            catalogCredentials.length > 0 ? catalogCredentials : fallbackCredentials
          );
          const normalizedCredentialId = String(credentialId || "").trim();
          const selectedCredential = credentials.find(
            (credential) => credential.credentialId === normalizedCredentialId
          ) || null;
          const nextBindings = {
            ...getProjectConnectorCredentialBindings(projectRecord),
          };
          delete nextBindings[providerId.replaceAll("-", "_")];
          if (providerId === "jira") delete nextBindings.atlassian;

          if (!normalizedCredentialId || normalizedCredentialId === "__organization_default__") {
            delete nextBindings[providerId];
          } else if (selectedCredential) {
            nextBindings[providerId] = {
              credentialId: selectedCredential.credentialId,
              credentialName: selectedCredential.name,
              identity: selectedCredential.identity,
              enabled: true,
            };
          } else {
            return;
          }

          void persistProjectOverviewSidebarProjectUpdate({}, {
            connectorCredentialBindings: nextBindings,
          });
        }

        function renderProjectConnectorCredentialIcon(definition, className = "") {
          return React.createElement("span", {
              className: ("playground-project-connector-credential-icon " + className).trim(),
              "aria-hidden": "true",
            },
            definition.iconUrl
              ? React.createElement("img", {
                  src: definition.iconUrl,
                  alt: "",
                  loading: "lazy",
                })
              : React.createElement(KeyRound, { size: 15, strokeWidth: 1.8 })
          );
        }

        function renderProjectConnectorCredentialSelector(
          projectRecord,
          providerDefinition,
          options = {}
        ) {
          const definition = providerDefinition
            && typeof providerDefinition === "object"
            && !Array.isArray(providerDefinition)
              ? providerDefinition
              : buildProjectConnectorCredentialProviderDefinition(providerDefinition);
          const providerId = normalizeProjectConnectorCredentialProviderId(
            definition?.providerId || definition?.id
          );
          if (!providerId) return null;

          const catalogStatus = String(
            projectOverviewConnectorCredentialCatalogState?.status || "idle"
          );
          const providerCatalogs = (
            projectOverviewConnectorCredentialCatalogState?.providers
            && typeof projectOverviewConnectorCredentialCatalogState.providers === "object"
          )
            ? projectOverviewConnectorCredentialCatalogState.providers
            : {};
          const providerCatalog = providerCatalogs[definition.id]
            || providerCatalogs[providerId]
            || null;
          const credentials = Array.isArray(providerCatalog?.credentials)
            ? providerCatalog.credentials
            : [];
          const binding = getProjectConnectorCredentialBinding(projectRecord, providerId);
          const selectedCredential = credentials.find(
            (credential) => credential.credentialId === binding.credentialId
          ) || null;
          const organizationDefault = credentials.find(
            (credential) => credential.isDefault
          ) || credentials[0] || null;
          const isLoading = catalogStatus === "loading" || catalogStatus === "idle";
          if (
            options.hideWhenUnavailable === true
            && !isLoading
            && credentials.length === 0
            && !binding.credentialId
          ) {
            return null;
          }

          const selectorOptions = [
            {
              value: "__organization_default__",
              label: "Organization default",
              description: organizationDefault
                ? (
                    organizationDefault.name
                    || organizationDefault.identity
                    || "Current default credential"
                  )
                : "No organization credential is connected yet.",
            },
            ...credentials.map((credential) => ({
              value: credential.credentialId,
              label:
                credential.name
                || credential.identity
                || "Connected account",
              description: [
                credential.identity,
                credential.isDefault ? "Organization default" : "",
                credential.status === "invalid" ? "Needs reconnection" : "",
              ].filter(Boolean).join(" · "),
              disabled: credential.status === "invalid",
            })),
          ];
          if (binding.credentialId && !selectedCredential) {
            selectorOptions.push({
              value: binding.credentialId,
              label: binding.credentialName || "Unavailable credential",
              description: "This project credential no longer exists or is unavailable.",
              disabled: true,
            });
          }

          return React.createElement(PlatformSelector, {
            value: binding.credentialId
              ? binding.credentialId
              : "__organization_default__",
            options: selectorOptions,
            onValueChange: (nextValue) => {
              updateProjectConnectorCredentialBinding(
                projectRecord,
                definition,
                nextValue
              );
            },
            ariaLabel: "Select " + definition.label + " credentials for this project",
            label: binding.credentialId
              ? (
                  selectedCredential?.name
                  || selectedCredential?.identity
                  || binding.credentialName
                  || "Unavailable credential"
                )
              : "Organization default",
            placeholder: "Organization default",
            disabled: options.disabled === true,
            loading: isLoading,
            loadingContent: "Loading credentials...",
            emptyContent: "No credentials available.",
            alignment: "end",
            popupAlignment: "right",
            popupWidth: "min(340px, calc(100vw - 48px))",
            popupMaxHeight: "min(360px, calc(100vh - 120px))",
            className: String(options.className || "").trim() || undefined,
            triggerClassName: String(options.triggerClassName || "").trim() || undefined,
            popupClassName: String(options.popupClassName || "").trim() || undefined,
          });
        }

        function renderProjectConnectorCredentialRouting(projectRecord, options = {}) {
          const catalogStatus = String(
            projectOverviewConnectorCredentialCatalogState?.status || "idle"
          );
          const catalogError = String(
            projectOverviewConnectorCredentialCatalogState?.error || ""
          ).trim();
          const providerCatalogs = (
            projectOverviewConnectorCredentialCatalogState?.providers
            && typeof projectOverviewConnectorCredentialCatalogState.providers === "object"
          )
            ? projectOverviewConnectorCredentialCatalogState.providers
            : {};
          const bindingProviderIds = Object.keys(
            getProjectConnectorCredentialBindings(projectRecord)
          ).map(normalizeProjectConnectorCredentialProviderId).filter(Boolean);
          const providerIds = [...new Set([
            ...Object.keys(providerCatalogs)
              .filter((providerId) => (
                Array.isArray(providerCatalogs[providerId]?.credentials)
                && providerCatalogs[providerId].credentials.length > 0
              ))
              .map(normalizeProjectConnectorCredentialProviderId),
            ...bindingProviderIds,
          ])].sort((left, right) => left.localeCompare(right));
          const definitions = providerIds.map(
            buildProjectConnectorCredentialProviderDefinition
          );
          if (
            !definitions.length
            && catalogStatus !== "loading"
            && catalogStatus !== "idle"
            && !catalogError
          ) {
            return null;
          }

          return React.createElement("section", {
              className: "playground-project-connector-credentials",
              "aria-label": "Project connector credentials",
            },
            React.createElement("div", {
                className: "playground-project-connector-credentials-header",
              },
              React.createElement("div", null,
                React.createElement("h4", null, "Credential routing"),
                React.createElement("p", null,
                  "Choose which organization credentials threads in this project inherit. Other threads continue to use each connector's organization default."
                )
              )
            ),
            catalogError
              ? React.createElement("p", {
                  className: "playground-project-connector-credentials-error",
                  role: "status",
                }, catalogError)
              : null,
            !definitions.length && (catalogStatus === "loading" || catalogStatus === "idle")
              ? React.createElement("p", {
                  className: "playground-project-connector-credentials-loading",
                  role: "status",
                }, "Loading connector credentials...")
              : null,
            React.createElement("div", {
                className: "playground-project-connector-credentials-list",
              },
              definitions.map((definition) => {
                const providerCatalog =
                  providerCatalogs[definition.id];
                const credentials = Array.isArray(providerCatalog?.credentials)
                  ? providerCatalog.credentials
                  : [];
                const binding = getProjectConnectorCredentialBinding(
                  projectRecord,
                  definition.providerId
                );
                const selectedCredential = credentials.find(
                  (credential) => credential.credentialId === binding.credentialId
                ) || null;
                const organizationDefault = credentials.find(
                  (credential) => credential.isDefault
                ) || credentials[0] || null;
                const selectedValue = binding.credentialId
                  ? binding.credentialId
                  : "__organization_default__";
                const selectorOptions = [
                  {
                    value: "__organization_default__",
                    label: "Organization default",
                    description: organizationDefault
                      ? (
                          organizationDefault.name
                          || organizationDefault.identity
                          || "Current default credential"
                        )
                      : "No organization credential is connected yet.",
                  },
                  ...credentials.map((credential) => ({
                    value: credential.credentialId,
                    label:
                      credential.name
                      || credential.identity
                      || "Connected account",
                    description: [
                      credential.identity,
                      credential.isDefault ? "Organization default" : "",
                      credential.status === "invalid" ? "Needs reconnection" : "",
                    ].filter(Boolean).join(" · "),
                    disabled: credential.status === "invalid",
                  })),
                ];
                if (binding.credentialId && !selectedCredential) {
                  selectorOptions.push({
                    value: binding.credentialId,
                    label: binding.credentialName || "Unavailable credential",
                    description: "This project credential no longer exists or is unavailable.",
                    disabled: true,
                  });
                }
                const selectedLabel = binding.credentialId
                  ? (
                      selectedCredential?.name
                      || selectedCredential?.identity
                      || binding.credentialName
                      || "Unavailable credential"
                    )
                  : "Organization default";

                return React.createElement("div", {
                    key: definition.id,
                    className: "playground-project-connector-credential-row",
                  },
                  React.createElement("div", {
                      className: "playground-project-connector-credential-service",
                    },
                    renderProjectConnectorCredentialIcon(definition),
                    React.createElement("span", null,
                      React.createElement("strong", null, definition.label),
                      React.createElement("small", null, definition.description)
                    )
                  ),
                  React.createElement(PlatformSelector, {
                    value: selectedValue,
                    options: selectorOptions,
                    onValueChange: (nextValue) => {
                      updateProjectConnectorCredentialBinding(
                        projectRecord,
                        definition,
                        nextValue
                      );
                    },
                    ariaLabel: "Select " + definition.label + " credentials for this project",
                    label: selectedLabel,
                    placeholder: "Organization default",
                    disabled: options.disabled === true,
                    loading: catalogStatus === "loading" || catalogStatus === "idle",
                    loadingContent: "Loading credentials...",
                    emptyContent: "No credentials available.",
                    alignment: "end",
                    popupAlignment: "right",
                    popupWidth: "min(340px, calc(100vw - 48px))",
                    popupMaxHeight: "min(360px, calc(100vh - 120px))",
                    className: "playground-project-connector-credential-selector",
                    triggerClassName: "playground-project-connector-credential-selector-trigger",
                    popupClassName: "is-minimal-ui playground-project-connector-credential-selector-popup",
                  })
                );
              })
            )
          );
        }
`;

export const RESOURCE_CREATION_HOST_SCRIPT = `          function renderPlatformResourceCreationHost() {
            const creationRequest = platformResourceCreationRequest;
            if (!creationRequest || !hasRealAccess) {
              return null;
            }

            if (creationRequest.resourceType === "agent") {
              return React.createElement(PlaygroundAgentsPage, {
                key: "platform-resource-creation:agent:" + creationRequest.token,
                backendUrl: proxyBackendBase,
                requestHeaders,
                agents: realAgents,
                environments: runtimeEnvironments,
                projects: runnerWorkspaceProjects,
                skills: demoSkills,
                currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
                currentUserName: hasSessionAuth ? accountName : "Agentic Compute Platform",
                currentUserEmail: hasSessionAuth ? accountEmail : "",
                currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                guardrailSets: allGuardrailSets,
                evaluationSets,
                setEvaluationSets,
                createAgentRequestToken: creationRequest.token,
                createAgentModelId: creationRequest.modelId || "",
                subscriptionTierId: accountTierId || "",
                onAgentMutated: async () => {
                  await refreshAgents();
                },
                onGenerateInstructions: (initialPrompt) => {
                  closePlatformResourceCreationModal();
                  handleNewThread({
                    initialPrompt: normalizePlaygroundInitialPrompt(initialPrompt) || "/agent",
                  });
                },
                creationOnly: true,
                onCreationRequestClose: closePlatformResourceCreationModal,
              });
            }

            if (creationRequest.resourceType === "computer") {
              return React.createElement(PlaygroundEnvironmentsPage, {
                key: "platform-resource-creation:computer:" + creationRequest.token,
                backendUrl: proxyBackendBase,
                requestHeaders,
                environments: realEnvironments,
                agents: runtimeAgents,
                skills: demoSkills,
                currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
                currentUserName: hasSessionAuth ? accountName : "Me",
                currentUserEmail: hasSessionAuth ? accountEmail : "",
                currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                creationRequestToken: creationRequest.token,
                creationOnly: true,
                onCreationRequestClose: closePlatformResourceCreationModal,
                onEnvironmentMutated: async () => {
                  await refreshEnvironments();
                },
              });
            }

            return null;
          }
`;

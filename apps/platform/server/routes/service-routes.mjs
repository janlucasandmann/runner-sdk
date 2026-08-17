/** Ordered service compatibility routes. */
export function createServiceRoutes(bindings) {
    const { agentRuntimeService, apiKeysService, calendarService, configureHomeService, connectorCredentialCatalogService, connectorMcpService, evidenceAgentsService, externalAgentService, filesService, guardrailsService, imagineService, inferenceService, knowledgeService, marketplaceService, metronomeService, organizationsService, platformDocumentAssets, projectsService, promptsService, securityService, systemSkillSourceService, teamsService, } = bindings;
    return function handleServiceRoutes(req, res, url) {
        if (externalAgentService?.handleRequest?.(req, res, url)) {
            return true;
        }
        if (platformDocumentAssets.handleRequest(req, res, url)) {
            return true;
        }
        if (systemSkillSourceService.handleRequest(req, res, url)) {
            return true;
        }
        if (connectorMcpService?.handleRequest?.(req, res, url)) {
            return true;
        }
        if (connectorCredentialCatalogService?.handleRequest?.(req, res, url)) {
            return true;
        }
        if (agentRuntimeService.handleRequest(req, res, url)) {
            return true;
        }
        if (filesService.handleRequest(req, res, url)) {
            return true;
        }
        if (imagineService.handleRequest(req, res, url)) {
            return true;
        }
        if (guardrailsService.handleRequest(req, res, url)) {
            return true;
        }
        if (marketplaceService.handleRequest(req, res, url)) {
            return true;
        }
        if (inferenceService.handleRequest(req, res, url)) {
            return true;
        }
        if (teamsService.handleRequest(req, res, url)) {
            return true;
        }
        if (organizationsService.handleRequest(req, res, url)) {
            return true;
        }
        if (configureHomeService.handleRequest(req, res, url)) {
            return true;
        }
        if (apiKeysService.handleRequest(req, res, url)) {
            return true;
        }
        if (calendarService.handleRequest(req, res, url)) {
            return true;
        }
        if (projectsService.handleRequest(req, res, url)) {
            return true;
        }
        if (promptsService?.handleRequest?.(req, res, url)) {
            return true;
        }
        if (knowledgeService?.handleRequest?.(req, res, url)) {
            return true;
        }
        if (metronomeService.handleRequest(req, res, url)) {
            return true;
        }
        if (securityService.handleRequest(req, res, url)) {
            return true;
        }
        if (evidenceAgentsService.handleRequest(req, res, url)) {
            return true;
        }
        return false;
    };
}

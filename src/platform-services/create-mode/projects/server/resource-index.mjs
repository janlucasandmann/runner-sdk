function unwrapDataRecord(data, keys = []) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }
  for (const key of keys) {
    const value = data[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    return data.data;
  }
  return data;
}

export function getProjectResourceIndexArray(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }
  if (!data || typeof data !== "object") {
    return [];
  }
  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export function getProjectResourceIndexProject(data) {
  return unwrapDataRecord(data, ["project"]);
}

export function getProjectResourceIndexMetadata(record) {
  if (!record || typeof record !== "object") {
    return {};
  }
  return record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
    ? record.metadata
    : {};
}

export function readProjectResourceProjectId(record) {
  if (!record || typeof record !== "object") {
    return "";
  }
  const metadata = getProjectResourceIndexMetadata(record);
  const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object"
    ? metadata.runnerPlayground
    : {};
  const project = record.project && typeof record.project === "object" && !Array.isArray(record.project)
    ? record.project
    : {};
  return String(
    record.projectId
    || record.project_id
    || (typeof record.project === "string" ? record.project : "")
    || project.id
    || project.projectId
    || project.project_id
    || metadata.projectId
    || metadata.project_id
    || runnerPlayground.projectId
    || runnerPlayground.project_id
    || ""
  ).trim();
}

function normalizeProjectResourceProjectIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((projectId) => String(projectId || "").trim()).filter(Boolean);
}

export function readProjectResourceProjectIds(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return [];
  }
  const metadata = getProjectResourceIndexMetadata(record);
  const rootScope = record.projectScope && typeof record.projectScope === "object" && !Array.isArray(record.projectScope)
    ? record.projectScope
    : {};
  const metadataScope = metadata.projectScope && typeof metadata.projectScope === "object" && !Array.isArray(metadata.projectScope)
    ? metadata.projectScope
    : metadata.project_scope && typeof metadata.project_scope === "object" && !Array.isArray(metadata.project_scope)
      ? metadata.project_scope
      : {};
  const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
    ? metadata.runnerPlayground
    : {};
  const runnerScope = runnerPlayground.projectScope && typeof runnerPlayground.projectScope === "object" && !Array.isArray(runnerPlayground.projectScope)
    ? runnerPlayground.projectScope
    : {};
  return [...new Set([
    ...normalizeProjectResourceProjectIds(record.projectIds || record.project_ids),
    ...normalizeProjectResourceProjectIds(rootScope.projectIds || rootScope.project_ids),
    ...normalizeProjectResourceProjectIds(metadata.projectIds || metadata.project_ids),
    ...normalizeProjectResourceProjectIds(metadataScope.projectIds || metadataScope.project_ids),
    ...normalizeProjectResourceProjectIds(runnerPlayground.projectIds || runnerPlayground.project_ids),
    ...normalizeProjectResourceProjectIds(runnerScope.projectIds || runnerScope.project_ids),
    readProjectResourceProjectId(record),
  ].filter(Boolean))];
}

export function readProjectResourceIndexResponseProjectId(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "";
  }
  const metadata = getProjectResourceIndexMetadata(data);
  const scope = data.scope && typeof data.scope === "object" && !Array.isArray(data.scope)
    ? data.scope
    : {};
  const filters = data.filters && typeof data.filters === "object" && !Array.isArray(data.filters)
    ? data.filters
    : {};
  const nestedData = data.data && typeof data.data === "object" && !Array.isArray(data.data)
    ? data.data
    : {};
  return String(
    data.projectId
    || data.project_id
    || metadata.projectId
    || metadata.project_id
    || scope.projectId
    || scope.project_id
    || filters.projectId
    || filters.project_id
    || nestedData.projectId
    || nestedData.project_id
    || ""
  ).trim();
}

export function filterProjectResourceIndexRecordsByProjectId(records, projectId, options = {}) {
  const normalizedProjectId = String(projectId || "").trim();
  const normalizedRecords = Array.isArray(records) ? records : [];
  if (!normalizedProjectId) {
    return normalizedRecords;
  }
  const responseProjectId = String(options.responseProjectId || "").trim();
  const responseProvesProjectScope = responseProjectId === normalizedProjectId;
  return normalizedRecords.filter((record) => {
    const recordProjectIds = readProjectResourceProjectIds(record);
    if (recordProjectIds.length) {
      return recordProjectIds.includes(normalizedProjectId);
    }
    return responseProvesProjectScope;
  });
}

export function normalizeProjectResourceIndexKnowledgeLibrary(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }
  const id = String(record.id || record.libraryId || record.library_id || "").trim();
  if (!id) return null;
  const metadata = getProjectResourceIndexMetadata(record);
  const title = String(record.name || record.title || "Project Knowledge").trim() || "Project Knowledge";
  const purpose = String(metadata.purpose || record.purpose || "").trim().toLowerCase();
  const isStrategyKnowledge = [
    "project_knowledge",
    "project_strategy_and_documentation",
  ].includes(purpose)
    || metadata.isStrategyKnowledge === true
    || (
      String(metadata.schemaVersion || metadata.schema_version || "").trim()
        === "computer_agents_project_knowledge_v1"
      && String(metadata.managedBy || metadata.managed_by || "").trim().toLowerCase()
        === "mission_control"
    );
  return {
    ...record,
    id,
    resourceId: id,
    libraryId: id,
    type: "knowledge",
    resourceType: "knowledge",
    name: title,
    title,
    description: String(record.description || "").trim(),
    status: isStrategyKnowledge ? "Strategy" : "Shared",
    isStrategyKnowledge,
    scopeManaged: true,
    metadata,
  };
}

export function getProjectResourceIndexConnectors(project) {
  const projectRecord = project && typeof project === "object" ? project : {};
  const metadata = getProjectResourceIndexMetadata(projectRecord);
  const connectors = projectRecord.connectors || metadata.connectors || {};
  if (Array.isArray(connectors)) {
    return connectors;
  }
  if (!connectors || typeof connectors !== "object") {
    return [];
  }
  return Object.entries(connectors)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({
      key,
      source: key,
      ...((value && typeof value === "object" && !Array.isArray(value)) ? value : { value }),
    }));
}

export function getProjectResourceIndexAttachments(project) {
  const projectRecord = project && typeof project === "object" ? project : {};
  const metadata = getProjectResourceIndexMetadata(projectRecord);
  if (Array.isArray(projectRecord.attachments)) return projectRecord.attachments;
  if (Array.isArray(projectRecord.files)) return projectRecord.files;
  if (Array.isArray(metadata.attachments)) return metadata.attachments;
  if (Array.isArray(metadata.files)) return metadata.files;
  return [];
}

export function filterProjectResourceIndexImagineResources(records, projectId) {
  const normalizedProjectId = String(projectId || "").trim();
  return (Array.isArray(records) ? records : []).filter((record) => {
    const metadata = getProjectResourceIndexMetadata(record);
    const source = String(
      record?.source
      || record?.type
      || record?.category
      || metadata.source
      || metadata.type
      || metadata.category
      || ""
    ).toLowerCase();
    if (!source.includes("imagine")) {
      return false;
    }
    const recordProjectIds = readProjectResourceProjectIds(record);
    return !normalizedProjectId || !recordProjectIds.length || recordProjectIds.includes(normalizedProjectId);
  });
}

export function createProjectResourceIndexHandler({
  fetchUpstreamJsonForProxyExactPath,
  sendJson,
}) {
  if (typeof fetchUpstreamJsonForProxyExactPath !== "function" || typeof sendJson !== "function") {
    throw new TypeError("Projects resource index requires upstream fetch and JSON response adapters.");
  }

  return async function handleProjectResourceIndex(req, res, projectId) {
    const normalizedProjectId = String(projectId || "").trim();
    if (!normalizedProjectId) {
      return sendJson(res, 400, {
        error: "Project id is required",
        message: "A project id is required to load the project resource index.",
      });
    }

    const encodedProjectId = encodeURIComponent(normalizedProjectId);
    try {
      const [projectResponse, serversResponse, metronomesResponse, knowledgeResponse] = await Promise.all([
        fetchUpstreamJsonForProxyExactPath(req, `/projects/${encodedProjectId}?view=metadata`, "GET"),
        fetchUpstreamJsonForProxyExactPath(req, `/servers?projectId=${encodedProjectId}`, "GET").catch((error) => ({
          status: 502,
          data: { error: "Failed to load server resources", message: error instanceof Error ? error.message : String(error) },
        })),
        fetchUpstreamJsonForProxyExactPath(req, `/metronomes?projectId=${encodedProjectId}`, "GET").catch((error) => ({
          status: 502,
          data: { error: "Failed to load metronomes", message: error instanceof Error ? error.message : String(error) },
        })),
        fetchUpstreamJsonForProxyExactPath(req, "/knowledge", "GET").catch((error) => ({
          status: 502,
          data: { error: "Failed to load Knowledge libraries", message: error instanceof Error ? error.message : String(error) },
        })),
      ]);
      if (projectResponse.status >= 400) {
        return sendJson(res, projectResponse.status, projectResponse.data);
      }

      const project = getProjectResourceIndexProject(projectResponse.data);
      const projectMetadata = getProjectResourceIndexMetadata(project);
      const attachments = getProjectResourceIndexAttachments(project);
      const connectors = getProjectResourceIndexConnectors(project);
      const errors = [];

      let serverResources = [];
      if (serversResponse.status < 400) {
        serverResources = filterProjectResourceIndexRecordsByProjectId(
          getProjectResourceIndexArray(serversResponse.data, ["servers", "resources"]),
          normalizedProjectId,
          {
            responseProjectId: readProjectResourceIndexResponseProjectId(serversResponse.data),
          },
        );
      } else {
        errors.push({
          resource: "serverResources",
          status: serversResponse.status,
          message: serversResponse.data?.message || serversResponse.data?.error || "Server resources are unavailable.",
        });
      }

      let metronomes = [];
      if (metronomesResponse.status < 400) {
        metronomes = filterProjectResourceIndexRecordsByProjectId(
          getProjectResourceIndexArray(metronomesResponse.data, ["metronomes", "workflows"]),
          normalizedProjectId,
          {
            responseProjectId: readProjectResourceIndexResponseProjectId(metronomesResponse.data),
          },
        );
      } else {
        errors.push({
          resource: "metronomes",
          status: metronomesResponse.status,
          message: metronomesResponse.data?.message || metronomesResponse.data?.error || "Metronomes are unavailable.",
        });
      }

      let scopedKnowledgeLibraries = [];
      if (knowledgeResponse.status < 400) {
        scopedKnowledgeLibraries = filterProjectResourceIndexRecordsByProjectId(
          getProjectResourceIndexArray(knowledgeResponse.data, ["libraries", "knowledgeLibraries"]),
          normalizedProjectId,
        )
          .map(normalizeProjectResourceIndexKnowledgeLibrary)
          .filter(Boolean);
      } else {
        errors.push({
          resource: "knowledgeLibraries",
          status: knowledgeResponse.status,
          message: knowledgeResponse.data?.message || knowledgeResponse.data?.error || "Knowledge libraries are unavailable.",
        });
      }

      const imagineResources = filterProjectResourceIndexImagineResources(attachments, normalizedProjectId);
      const defaultEnvironmentId = String(
        project.defaultEnvironmentId
        || project.default_environment_id
        || project.environmentId
        || project.environment_id
        || projectMetadata.defaultEnvironmentId
        || projectMetadata.default_environment_id
        || ""
      ).trim();
      const projectName = String(project.name || project.title || projectMetadata.name || "").trim();

      return sendJson(res, 200, {
        object: "project_resource_index",
        id: normalizedProjectId,
        projectId: normalizedProjectId,
        project: {
          id: normalizedProjectId,
          name: projectName,
          title: String(project.title || projectName || "").trim(),
          description: String(project.description || projectMetadata.description || "").trim(),
          defaultEnvironmentId,
          connectors,
        },
        files: attachments,
        attachments,
        connectors,
        serverResources,
        servers: serverResources,
        metronomes,
        linkedResources: scopedKnowledgeLibraries,
        scopedResources: scopedKnowledgeLibraries,
        knowledgeLibraries: scopedKnowledgeLibraries,
        imagineResources,
        counts: {
          files: attachments.length,
          attachments: attachments.length,
          connectors: connectors.length,
          serverResources: serverResources.length,
          servers: serverResources.length,
          metronomes: metronomes.length,
          linkedResources: scopedKnowledgeLibraries.length,
          knowledgeLibraries: scopedKnowledgeLibraries.length,
          imagineResources: imagineResources.length,
        },
        routes: {
          project: `/api/real/projects/${encodedProjectId}`,
          resourceIndex: `/api/real/projects/${encodedProjectId}/resource-index`,
          files: `/api/real/projects/${encodedProjectId}`,
          serverResources: `/api/real/servers?projectId=${encodedProjectId}`,
          metronomes: `/api/real/metronomes?projectId=${encodedProjectId}`,
          knowledgeLibraries: "/api/real/knowledge",
        },
        errors,
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to load project resource index",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

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
  return String(
    record.projectId
    || record.project_id
    || record.project
    || metadata.projectId
    || metadata.project_id
    || runnerPlayground.projectId
    || runnerPlayground.project_id
    || ""
  ).trim();
}

export function filterProjectResourceIndexRecordsByProjectId(records, projectId) {
  const normalizedProjectId = String(projectId || "").trim();
  const normalizedRecords = Array.isArray(records) ? records : [];
  if (!normalizedProjectId) {
    return normalizedRecords;
  }
  const recordsWithProjectIds = normalizedRecords.filter((record) => readProjectResourceProjectId(record));
  if (!recordsWithProjectIds.length) {
    return normalizedRecords;
  }
  return normalizedRecords.filter((record) => readProjectResourceProjectId(record) === normalizedProjectId);
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
    const recordProjectId = readProjectResourceProjectId(record);
    return !normalizedProjectId || !recordProjectId || recordProjectId === normalizedProjectId;
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
      const projectResponse = await fetchUpstreamJsonForProxyExactPath(req, `/projects/${encodedProjectId}`, "GET");
      if (projectResponse.status >= 400) {
        return sendJson(res, projectResponse.status, projectResponse.data);
      }

      const project = getProjectResourceIndexProject(projectResponse.data);
      const projectMetadata = getProjectResourceIndexMetadata(project);
      const attachments = getProjectResourceIndexAttachments(project);
      const connectors = getProjectResourceIndexConnectors(project);
      const errors = [];

      const [serversResponse, metronomesResponse] = await Promise.all([
        fetchUpstreamJsonForProxyExactPath(req, `/servers?projectId=${encodedProjectId}`, "GET").catch((error) => ({
          status: 502,
          data: { error: "Failed to load server resources", message: error instanceof Error ? error.message : String(error) },
        })),
        fetchUpstreamJsonForProxyExactPath(req, `/metronomes?projectId=${encodedProjectId}`, "GET").catch((error) => ({
          status: 502,
          data: { error: "Failed to load metronomes", message: error instanceof Error ? error.message : String(error) },
        })),
      ]);

      let serverResources = [];
      if (serversResponse.status < 400) {
        serverResources = filterProjectResourceIndexRecordsByProjectId(
          getProjectResourceIndexArray(serversResponse.data, ["servers", "resources"]),
          normalizedProjectId,
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
        );
      } else {
        errors.push({
          resource: "metronomes",
          status: metronomesResponse.status,
          message: metronomesResponse.data?.message || metronomesResponse.data?.error || "Metronomes are unavailable.",
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
        imagineResources,
        counts: {
          files: attachments.length,
          attachments: attachments.length,
          connectors: connectors.length,
          serverResources: serverResources.length,
          servers: serverResources.length,
          metronomes: metronomes.length,
          imagineResources: imagineResources.length,
        },
        routes: {
          project: `/api/real/projects/${encodedProjectId}`,
          resourceIndex: `/api/real/projects/${encodedProjectId}/resource-index`,
          files: `/api/real/projects/${encodedProjectId}`,
          serverResources: `/api/real/servers?projectId=${encodedProjectId}`,
          metronomes: `/api/real/metronomes?projectId=${encodedProjectId}`,
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

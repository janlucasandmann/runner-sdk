function requireAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Guardrails service requires a ${name} adapter.`);
  }
  return adapters[name];
}

export function normalizeProxyGuardrailSetIds(value) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string" && value.includes(",")
      ? value.split(",")
      : value !== undefined && value !== null
        ? [value]
        : [];
  const seen = new Set();
  const result = [];
  source.forEach((item) => {
    const id = item && typeof item === "object" && !Array.isArray(item)
      ? String(item.id || item.guardrailSetId || item.guardrail_set_id || item.setId || item.set_id || "").trim()
      : String(item || "").trim();
    if (!id || seen.has(id)) {
      return;
    }
    seen.add(id);
    result.push(id);
  });
  return result;
}

export function normalizeProxyGuardrailPrompts(value) {
  return (Array.isArray(value) ? value : [])
    .filter((prompt) => prompt && typeof prompt === "object" && !Array.isArray(prompt))
    .map((prompt, index) => ({
      id: String(prompt.id || prompt.promptId || prompt.prompt_id || `prompt_${index + 1}`).trim(),
      title: String(prompt.title || prompt.name || "Guardrail").trim(),
      prompt: String(prompt.prompt || prompt.content || prompt.text || ""),
      createdAt: typeof prompt.createdAt === "string" ? prompt.createdAt : undefined,
      updatedAt: typeof prompt.updatedAt === "string" ? prompt.updatedAt : undefined,
    }))
    .filter((prompt) => prompt.prompt.trim());
}

export function normalizeProxyGuardrailSets(value) {
  return (Array.isArray(value) ? value : [])
    .filter((set) => set && typeof set === "object" && !Array.isArray(set))
    .map((set, index) => ({
      id: String(set.id || set.guardrailSetId || set.guardrail_set_id || `guardrail_${index + 1}`).trim(),
      name: String(set.name || set.title || "Guardrail Set").trim(),
      description: String(set.description || ""),
      source: String(set.source || (set.isDefault || set.readOnly ? "default" : "custom")).trim(),
      isDefault: Boolean(set.isDefault || set.readOnly || set.readonly || String(set.source || "").toLowerCase() === "default"),
      readOnly: Boolean(set.readOnly || set.readonly || set.isDefault || String(set.source || "").toLowerCase() === "default"),
      createdAt: typeof set.createdAt === "string" ? set.createdAt : undefined,
      updatedAt: typeof set.updatedAt === "string" ? set.updatedAt : undefined,
      prompts: normalizeProxyGuardrailPrompts(set.prompts),
    }))
    .filter((set) => set.id && set.prompts.length > 0);
}

export function normalizeProxyPromptAdaptations(value) {
  return (Array.isArray(value) ? value : [])
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => {
      const content = String(item.content || item.prompt || item.text || "").trim();
      return {
        id: String(item.id || item.promptId || item.prompt_id || `guardrail_prompt_${index + 1}`).trim(),
        title: String(item.title || item.name || "Guardrail").trim(),
        content,
        prompt: content,
        guardrailSetId: String(item.guardrailSetId || item.guardrail_set_id || item.setId || item.set_id || "").trim(),
        guardrailSetName: String(item.guardrailSetName || item.guardrail_set_name || item.setName || item.set_name || "").trim(),
        source: String(item.source || "guardrail").trim() || "guardrail",
      };
    })
    .filter((item) => item.id && item.content);
}

export function buildProxyPromptAdaptationsFromGuardrails(guardrails) {
  const seen = new Set();
  const adaptations = [];
  (Array.isArray(guardrails) ? guardrails : []).forEach((set) => {
    (Array.isArray(set.prompts) ? set.prompts : []).forEach((prompt, index) => {
      const content = String(prompt.prompt || "").trim();
      if (!content) {
        return;
      }
      const promptId = String(prompt.id || `prompt_${index + 1}`).trim();
      const id = `${set.id}:${promptId}`;
      if (seen.has(id)) {
        return;
      }
      seen.add(id);
      adaptations.push({
        id,
        title: String(prompt.title || set.name || "Guardrail").trim(),
        content,
        prompt: content,
        guardrailSetId: set.id,
        guardrailSetName: set.name,
        source: "guardrail",
      });
    });
  });
  return adaptations;
}

export function extractProxyAgentGuardrailPayload(agent) {
  const source = agent && typeof agent === "object" && !Array.isArray(agent) ? agent : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
    ? source.metadata
    : {};
  const runnerGuardrails = metadata.runnerGuardrails && typeof metadata.runnerGuardrails === "object" && !Array.isArray(metadata.runnerGuardrails)
    ? metadata.runnerGuardrails
    : {};
  const guardrails = normalizeProxyGuardrailSets(source.guardrails).length > 0
    ? normalizeProxyGuardrailSets(source.guardrails)
    : normalizeProxyGuardrailSets(metadata.guardrails).length > 0
      ? normalizeProxyGuardrailSets(metadata.guardrails)
      : normalizeProxyGuardrailSets(runnerGuardrails.guardrails);
  const promptAdaptations = normalizeProxyPromptAdaptations(source.promptAdaptations || source.invisiblePromptAdaptations).length > 0
    ? normalizeProxyPromptAdaptations(source.promptAdaptations || source.invisiblePromptAdaptations)
    : normalizeProxyPromptAdaptations(
        metadata.promptAdaptations
        || metadata.prompt_adaptations
        || metadata.invisiblePromptAdaptations
        || metadata.invisible_prompt_adaptations
        || metadata.invisiblePromptAdaptions
        || metadata.invisible_prompt_adaptions
        || runnerGuardrails.promptAdaptations
      );
  const guardrailSetIds = normalizeProxyGuardrailSetIds(
    source.guardrailSetIds
    || source.guardrail_set_ids
    || metadata.guardrailSetIds
    || metadata.guardrail_set_ids
    || runnerGuardrails.guardrailSetIds
    || guardrails
  );
  return {
    guardrailSetIds,
    guardrails,
    promptAdaptations: promptAdaptations.length > 0
      ? promptAdaptations
      : buildProxyPromptAdaptationsFromGuardrails(guardrails),
  };
}

function getProxyAgentRecordFromResponse(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  return data.agent || data.data || data.item || data;
}

/** Builds the enforcement adapter that attaches an agent's guardrails to thread payloads. */
export function createGuardrailsThreadEnricher(adapters) {
  const fetchImpl = requireAdapter(adapters, "fetchImpl");
  const fetchAiosApi = requireAdapter(adapters, "fetchAiosApi");
  const fetchAiosCloud = requireAdapter(adapters, "fetchAiosCloud");
  const hasAiosSession = requireAdapter(adapters, "hasAiosSession");
  const withProxyOrganizationHeader = requireAdapter(adapters, "withProxyOrganizationHeader");
  const warn = typeof adapters.warn === "function" ? adapters.warn : console.warn;

  async function fetchAgent(req, upstreamUrl, apiKey, agentId) {
    const normalizedAgentId = String(agentId || "").trim();
    if (!normalizedAgentId) {
      return null;
    }
    const encodedAgentId = encodeURIComponent(normalizedAgentId);
    let response = null;
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}/agents/${encodedAgentId}`, {
        method: "GET",
        headers: withProxyOrganizationHeader(req, {}, {
          "X-API-Key": apiKey,
        }),
      });
    } else if (hasAiosSession(req)) {
      response = await fetchAiosCloud(req, `/agents/${encodedAgentId}`, { method: "GET" });
      if (response.status === 404) {
        response = await fetchAiosApi(req, `/api/agents/${encodedAgentId}`, { method: "GET" });
      }
    }
    if (!response || !response.ok) {
      return null;
    }
    const text = await response.text().catch(() => "");
    if (!text.trim()) {
      return null;
    }
    try {
      return getProxyAgentRecordFromResponse(JSON.parse(text));
    } catch {
      return null;
    }
  }

  return async function enrichThreadPayload(req, upstreamUrl, apiKey, payload) {
    const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    const agentId = String(source.agentId || source.agent_id || "").trim();
    if (!agentId) {
      return payload;
    }
    try {
      const agent = await fetchAgent(req, upstreamUrl, apiKey, agentId);
      const guardrailPayload = extractProxyAgentGuardrailPayload(agent);
      if (guardrailPayload.guardrailSetIds.length === 0 && guardrailPayload.promptAdaptations.length === 0) {
        return payload;
      }
      const currentMetadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
        ? { ...source.metadata }
        : {};
      const metadataGuardrailBundle = {
        version: 1,
        guardrailSetIds: guardrailPayload.guardrailSetIds,
        guardrails: guardrailPayload.guardrails,
        promptAdaptations: guardrailPayload.promptAdaptations,
      };
      return {
        ...source,
        guardrailSetIds: Array.isArray(source.guardrailSetIds) ? source.guardrailSetIds : guardrailPayload.guardrailSetIds,
        guardrail_set_ids: Array.isArray(source.guardrail_set_ids) ? source.guardrail_set_ids : guardrailPayload.guardrailSetIds,
        guardrails: Array.isArray(source.guardrails) ? source.guardrails : guardrailPayload.guardrails,
        promptAdaptations: Array.isArray(source.promptAdaptations) ? source.promptAdaptations : guardrailPayload.promptAdaptations,
        prompt_adaptations: Array.isArray(source.prompt_adaptations) ? source.prompt_adaptations : guardrailPayload.promptAdaptations,
        invisiblePromptAdaptations: Array.isArray(source.invisiblePromptAdaptations) ? source.invisiblePromptAdaptations : guardrailPayload.promptAdaptations,
        invisible_prompt_adaptations: Array.isArray(source.invisible_prompt_adaptations) ? source.invisible_prompt_adaptations : guardrailPayload.promptAdaptations,
        invisiblePromptAdaptions: Array.isArray(source.invisiblePromptAdaptions) ? source.invisiblePromptAdaptions : guardrailPayload.promptAdaptations,
        invisible_prompt_adaptions: Array.isArray(source.invisible_prompt_adaptions) ? source.invisible_prompt_adaptions : guardrailPayload.promptAdaptations,
        metadata: {
          ...currentMetadata,
          guardrailSetIds: Array.isArray(currentMetadata.guardrailSetIds) ? currentMetadata.guardrailSetIds : guardrailPayload.guardrailSetIds,
          guardrail_set_ids: Array.isArray(currentMetadata.guardrail_set_ids) ? currentMetadata.guardrail_set_ids : guardrailPayload.guardrailSetIds,
          guardrails: Array.isArray(currentMetadata.guardrails) ? currentMetadata.guardrails : guardrailPayload.guardrails,
          promptAdaptations: Array.isArray(currentMetadata.promptAdaptations) ? currentMetadata.promptAdaptations : guardrailPayload.promptAdaptations,
          prompt_adaptations: Array.isArray(currentMetadata.prompt_adaptations) ? currentMetadata.prompt_adaptations : guardrailPayload.promptAdaptations,
          invisiblePromptAdaptations: Array.isArray(currentMetadata.invisiblePromptAdaptations) ? currentMetadata.invisiblePromptAdaptations : guardrailPayload.promptAdaptations,
          invisible_prompt_adaptations: Array.isArray(currentMetadata.invisible_prompt_adaptations) ? currentMetadata.invisible_prompt_adaptations : guardrailPayload.promptAdaptations,
          invisiblePromptAdaptions: Array.isArray(currentMetadata.invisiblePromptAdaptions) ? currentMetadata.invisiblePromptAdaptions : guardrailPayload.promptAdaptations,
          invisible_prompt_adaptions: Array.isArray(currentMetadata.invisible_prompt_adaptions) ? currentMetadata.invisible_prompt_adaptions : guardrailPayload.promptAdaptations,
          runnerGuardrails: currentMetadata.runnerGuardrails && typeof currentMetadata.runnerGuardrails === "object"
            ? currentMetadata.runnerGuardrails
            : metadataGuardrailBundle,
        },
      };
    } catch (error) {
      warn("[platform-gateway] Failed to enrich thread payload with agent guardrails", error);
      return payload;
    }
  };
}

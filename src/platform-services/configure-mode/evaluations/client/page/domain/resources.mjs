export const EVALUATIONS_PAGE_RESOURCES_SCRIPT = String.raw`      function getPlaygroundEvaluationEntityLabel(records, id, fallback = "") {
        const normalizedId = String(id || "").trim();
        if (!normalizedId) return fallback;
        const record = (Array.isArray(records) ? records : []).find((item) => String(item?.id || "").trim() === normalizedId) || null;
        return String(record?.name || record?.label || record?.title || normalizedId).trim() || fallback || normalizedId;
      }

      function getPlaygroundEvaluationDefaultId(records, preferredId = "") {
        const normalizedPreferredId = String(preferredId || "").trim();
        const source = (Array.isArray(records) ? records : []).filter((item) => String(item?.id || "").trim());
        if (normalizedPreferredId && source.some((item) => String(item?.id || "").trim() === normalizedPreferredId)) {
          return normalizedPreferredId;
        }
        const defaultRecord = source.find((item) => item?.isDefault || item?.default || item?.is_default) || source[0] || null;
        return String(defaultRecord?.id || "").trim();
      }

      function getPlaygroundEvaluationAgentPhotoUrl(agent) {
        return String(agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL || agent?.imageUrl || agent?.imageURL || agent?.avatar || "").trim();
      }

      function getPlaygroundEvaluationAgentActiveVersion(agent) {
        const versions = typeof readPlaygroundAgentVersions === "function"
          ? readPlaygroundAgentVersions(agent)
          : [];
        const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
          ? agent.metadata
          : {};
        const activeVersionId = String(
          agent?.activeAgentVersionId
          || agent?.active_agent_version_id
          || metadata.activeAgentVersionId
          || metadata.active_agent_version_id
          || ""
        ).trim();
        return (activeVersionId ? versions.find((version) => version.id === activeVersionId) : null)
          || versions.find((version) => String(version.status || "").trim().toLowerCase() === "active")
          || versions[0]
          || null;
      }

      function getPlaygroundEvaluationInitials(label) {
        const parts = String(label || "").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "A";
        return parts.slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "A";
      }

      function getPlaygroundEvaluationAgentRecord(records, id) {
        const normalizedId = String(id || "").trim();
        return (Array.isArray(records) ? records : []).find((item) => String(item?.id || "").trim() === normalizedId) || null;
      }

      function buildPlaygroundEvaluationEnvironmentChoices(environments = [], projects = []) {
        const computerChoices = (Array.isArray(environments) ? environments : [])
          .filter((environment) => String(environment?.id || "").trim())
          .map((environment) => ({
            key: "computer:" + String(environment.id || "").trim(),
            type: "computer",
            id: String(environment.id || "").trim(),
            environmentId: String(environment.id || "").trim(),
            environmentName: String(environment.name || environment.label || environment.id || "").trim(),
            projectId: "",
            projectName: "",
            disabled: false,
          }));
        const projectChoices = (Array.isArray(projects) ? projects : [])
          .filter((project) => String(project?.id || "").trim())
          .map((project) => {
            const projectId = String(project.id || "").trim();
            const environmentId = String(project.defaultEnvironmentId || project.default_environment_id || project.environmentId || project.environment_id || "").trim();
            return {
              key: "project:" + projectId,
              type: "project",
              id: projectId,
              environmentId,
              environmentName: "",
              projectId,
              projectName: String(project.name || project.label || project.title || project.id || "").trim(),
              disabled: !environmentId,
            };
          });
        return computerChoices.concat(projectChoices);
      }

      function getPlaygroundEvaluationEnvironmentChoice(choices, source = {}, fallbackEnvironmentId = "") {
        const environmentType = String(source.environmentType || source.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer";
        const projectId = String(source.projectId || source.project_id || "").trim();
        const environmentId = String(source.environmentId || source.environment_id || fallbackEnvironmentId || "").trim();
        const byProject = environmentType === "project" && projectId
          ? choices.find((choice) => choice.type === "project" && choice.projectId === projectId && !choice.disabled)
          : null;
        if (byProject) return byProject;
        const byEnvironment = environmentId
          ? choices.find((choice) => choice.environmentId === environmentId && (environmentType !== "computer" || choice.type === "computer") && !choice.disabled)
          : null;
        if (byEnvironment) return byEnvironment;
        return choices.find((choice) => !choice.disabled) || null;
      }

      function getPlaygroundEvaluationEnvironmentChoiceByKey(choices, key) {
        const normalizedKey = String(key || "").trim();
        return (Array.isArray(choices) ? choices : []).find((choice) => choice.key === normalizedKey && !choice.disabled) || null;
      }

      function extractPlaygroundEvaluationThreadRecord(payload) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        const candidates = [
          source.thread,
          source.data?.thread,
          source.data,
          source.item,
          source.record,
          source,
        ];
        for (const candidate of candidates) {
          if (candidate && typeof candidate === "object" && !Array.isArray(candidate) && String(candidate.id || candidate.threadId || candidate.thread_id || "").trim()) {
            return {
              ...candidate,
              id: String(candidate.id || candidate.threadId || candidate.thread_id || "").trim(),
            };
          }
        }
        return null;
      }

      async function readPlaygroundEvaluationJsonResponse(response, fallbackMessage) {
        const text = await response.text().catch(() => "");
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { message: text };
        }
        if (!response.ok) {
          const message = String(data?.message || data?.error || fallbackMessage || "Request failed").trim();
          throw new Error(message);
        }
        return data;
      }

      function extractPlaygroundEvaluationStreamSummary(text) {
        let latestText = "";
        String(text || "").split(/\n\n+/).forEach((block) => {
          const data = block
            .split(/\r?\n/)
            .map((line) => line.startsWith("data:") ? line.slice(5).trimStart() : "")
            .filter(Boolean)
            .join("\n")
            .trim();
          if (!data || data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const response = parsed?.response && typeof parsed.response === "object" ? parsed.response : {};
            const outputText = String(
              parsed?.summary
              || parsed?.output_text
              || parsed?.outputText
              || response?.output_text
              || response?.outputText
              || ""
            ).trim();
            if (outputText) {
              latestText = outputText;
            }
          } catch {}
        });
        return latestText;
      }

`;


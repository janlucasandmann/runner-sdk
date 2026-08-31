export const FINE_TUNING_PAGE_FOUNDATION_SCRIPT = String.raw`
      const PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR = 100;

      function createPlaygroundFineTuningId(prefix = "fine_tune_job") {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
      }

      function normalizePlaygroundFineTuningString(value) {
        return String(value || "").trim();
      }

      function readPlaygroundFineTuningPlainObject(value) {
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
      }

      function isPlaygroundFineTuningPlainObject(value) {
        return value && typeof value === "object" && !Array.isArray(value);
      }

      function hasPlaygroundFineTuningObjectContent(value) {
        return isPlaygroundFineTuningPlainObject(value) && Object.keys(value).length > 0;
      }

      function readFirstPlaygroundFineTuningObject(...values) {
        for (const value of values) {
          if (hasPlaygroundFineTuningObjectContent(value)) return value;
        }
        return {};
      }

      function readFirstPlaygroundFineTuningArray(...values) {
        for (const value of values) {
          if (Array.isArray(value) && value.length) return value;
        }
        return [];
      }

      function truncatePlaygroundFineTuningReferenceText(value, maxLength = 12000) {
        const text = String(value || "");
        if (!maxLength || text.length <= maxLength) return text;
        return text.slice(0, maxLength).trimEnd() + "\n\n...";
      }

      function compactPlaygroundFineTuningReferenceMetadata(metadata) {
        const source = readPlaygroundFineTuningPlainObject(metadata);
        const blockedKeys = new Set([
          "beforeAgentSnapshot",
          "before_agent_snapshot",
          "afterAgentSnapshot",
          "after_agent_snapshot",
          "beforeSnapshot",
          "before_snapshot",
          "afterSnapshot",
          "after_snapshot",
          "baseAgentSnapshot",
          "base_agent_snapshot",
          "snapshot",
          "diffFiles",
          "diff_files",
          "diffs",
          "files",
        ]);
        return Object.fromEntries(
          Object.entries(source).filter(([key]) => !blockedKeys.has(key))
        );
      }

      function normalizePlaygroundFineTuningPersonIdentity(rawValue = {}) {
        if (typeof rawValue === "string") {
          const value = normalizePlaygroundFineTuningString(rawValue);
          return {
            id: value,
            userId: "",
            name: value.includes("@") ? "" : value,
            email: value.includes("@") ? value : "",
            avatarUrl: "",
          };
        }
        const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
        return {
          id: normalizePlaygroundFineTuningString(source.id || source.userId || source.user_id || source.uid || source.email),
          userId: normalizePlaygroundFineTuningString(source.userId || source.user_id || source.uid),
          name: normalizePlaygroundFineTuningString(source.name || source.displayName || source.display_name || source.label || source.title),
          email: normalizePlaygroundFineTuningString(source.email || source.mail),
          avatarUrl: normalizePlaygroundFineTuningString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
        };
      }

      function getPlaygroundFineTuningInitials(value) {
        const words = normalizePlaygroundFineTuningString(value)
          .split(/\s+/)
          .filter(Boolean);
        if (!words.length) return "CA";
        return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
      }

      function getPlaygroundFineTuningPersonLabel(person) {
        const identity = normalizePlaygroundFineTuningPersonIdentity(person);
        return normalizePlaygroundFineTuningString(identity.name || identity.email || identity.id || identity.userId);
      }

      function getPlaygroundFineTuningConductorIdentity(source = {}) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const nested = record.conductedBy || record.conducted_by || record.startedBy || record.started_by || record.createdBy || record.created_by || metadata.conductedBy || metadata.conducted_by || metadata.startedBy || metadata.started_by || metadata.createdBy || metadata.created_by || null;
        const direct = normalizePlaygroundFineTuningPersonIdentity({
          id: record.conductedById || record.conducted_by_id || record.startedById || record.started_by_id || record.createdById || record.created_by_id || metadata.conductedById || metadata.conducted_by_id || metadata.startedById || metadata.started_by_id || metadata.createdById || metadata.created_by_id || record.userId || record.user_id,
          userId: record.conductedByUserId || record.conducted_by_user_id || record.startedByUserId || record.started_by_user_id || record.createdByUserId || record.created_by_user_id || metadata.conductedByUserId || metadata.conducted_by_user_id || metadata.startedByUserId || metadata.started_by_user_id || metadata.createdByUserId || metadata.created_by_user_id || record.userId || record.user_id,
          name: record.conductedByName || record.conducted_by_name || record.startedByName || record.started_by_name || record.createdByName || record.created_by_name || metadata.conductedByName || metadata.conducted_by_name || metadata.startedByName || metadata.started_by_name || metadata.createdByName || metadata.created_by_name,
          email: record.conductedByEmail || record.conducted_by_email || record.startedByEmail || record.started_by_email || record.createdByEmail || record.created_by_email || metadata.conductedByEmail || metadata.conducted_by_email || metadata.startedByEmail || metadata.started_by_email || metadata.createdByEmail || metadata.created_by_email,
          avatarUrl: record.conductedByAvatarUrl || record.conducted_by_avatar_url || record.startedByAvatarUrl || record.started_by_avatar_url || record.createdByAvatarUrl || record.created_by_avatar_url || metadata.conductedByAvatarUrl || metadata.conducted_by_avatar_url || metadata.startedByAvatarUrl || metadata.started_by_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url,
        });
        const nestedIdentity = normalizePlaygroundFineTuningPersonIdentity(nested || {});
        return {
          id: nestedIdentity.id || direct.id,
          userId: nestedIdentity.userId || direct.userId,
          name: nestedIdentity.name || direct.name,
          email: nestedIdentity.email || direct.email,
          avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
        };
      }

      function resolvePlaygroundFineTuningPersonIdentity(rawIdentity = {}, knownIdentities = []) {
        const identity = normalizePlaygroundFineTuningPersonIdentity(rawIdentity);
        const identityKeys = new Set([
          identity.userId,
          identity.email,
          identity.id,
        ].map((value) => normalizePlaygroundFineTuningString(value).toLowerCase()).filter(Boolean));
        const candidates = (Array.isArray(knownIdentities) ? knownIdentities : [knownIdentities])
          .map((candidate) => normalizePlaygroundFineTuningPersonIdentity(candidate))
          .filter((candidate) => candidate.id || candidate.userId || candidate.email || candidate.name);
        const matchingIdentity = candidates.find((candidate) => {
          const candidateKeys = [candidate.userId, candidate.email, candidate.id]
            .map((value) => normalizePlaygroundFineTuningString(value).toLowerCase())
            .filter(Boolean);
          if (candidateKeys.some((key) => identityKeys.has(key))) return true;
          const identityName = normalizePlaygroundFineTuningString(identity.name).toLowerCase();
          const candidateName = normalizePlaygroundFineTuningString(candidate.name).toLowerCase();
          return Boolean(!identityKeys.size && identityName && candidateName && identityName === candidateName);
        });
        if (!matchingIdentity) return identity;
        const identityName = normalizePlaygroundFineTuningString(identity.name);
        const identityNameIsIdentifier = identityKeys.has(identityName.toLowerCase());
        return {
          id: identity.id || matchingIdentity.id,
          userId: identity.userId || matchingIdentity.userId,
          name: matchingIdentity.name || (identityNameIsIdentifier ? "" : identityName),
          email: matchingIdentity.email || identity.email,
          avatarUrl: matchingIdentity.avatarUrl || identity.avatarUrl,
        };
      }

      function resolvePlaygroundFineTuningConductorIdentity(source = {}, knownIdentities = []) {
        return resolvePlaygroundFineTuningPersonIdentity(
          getPlaygroundFineTuningConductorIdentity(source),
          knownIdentities
        );
      }

      function isPlaygroundFineTuningAgentVersionReady(status) {
        const normalizedStatus = normalizePlaygroundFineTuningString(status).toLowerCase();
        return normalizedStatus === "saved" || normalizedStatus === "published";
      }

      function decodePlaygroundFineTuningEscapedText(value) {
        let text = String(value || "");
        if ((text.match(/\\n/g) || []).length >= 2) {
          text = text
            .replace(/\\r\\n/g, "\n")
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, "\"");
        }
        return text;
      }

      function sanitizePlaygroundFineTuningAnalysisSummary(value) {
        let text = decodePlaygroundFineTuningEscapedText(value)
          .replace(/\r\n/g, "\n")
          .trim();
        if (!text) return "";
        const rawPayloadIndex = text.search(/(?:^|\s)(?:data|event):\s*\{/);
        if (rawPayloadIndex > 0) {
          text = text.slice(0, rawPayloadIndex).trim();
        }
        text = text
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            if (!trimmed) return true;
            if (/^(event|id|retry):\s*/i.test(trimmed)) return false;
            if (/^data:\s*(?:\{|\[|\"type\")/i.test(trimmed)) return false;
            if (/^\{\"type\":/.test(trimmed)) return false;
            return true;
          })
          .join("\n")
          .replace(/\n{4,}/g, "\n\n\n")
          .trim();
        const analysisStart = text.search(/(?:Fine[- ]?Tuning Analysis|###\s+Diagnosis|##\s+Diagnosis|Diagnosis:)/i);
        if (analysisStart > 0) {
          text = text.slice(analysisStart).trim();
        }
        return text.length > 2400 ? text.slice(0, 2400).trimEnd() + "\n\n..." : text;
      }

      function normalizePlaygroundFineTuningScore(value, fallback = 0) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return fallback;
        return Math.max(0, Math.min(1, numeric));
      }

      function normalizePlaygroundFineTuningTokenCount(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
      }

      function normalizePlaygroundFineTuningUsdCost(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
      }

      function readPlaygroundFineTuningUsdCost(source, keys = []) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const usage = record.usage && typeof record.usage === "object" && !Array.isArray(record.usage) ? record.usage : {};
        const candidates = keys.length
          ? keys.flatMap((key) => [record[key], metadata[key], usage[key]])
          : [
              record.costUsd,
              record.costUSD,
              record.cost_usd,
              record.usdCost,
              record.usd_cost,
              record.totalUsd,
              record.totalUSD,
              record.total_usd,
              record.totalCostUsd,
              record.totalCostUSD,
              record.total_cost_usd,
              usage.costUsd,
              usage.costUSD,
              usage.cost_usd,
              usage.usdCost,
              usage.usd_cost,
              usage.totalCostUsd,
              usage.totalCostUSD,
              usage.total_cost_usd,
              usage.totalUsd,
              usage.totalUSD,
              usage.total_usd,
              metadata.costUsd,
              metadata.costUSD,
              metadata.cost_usd,
              metadata.usdCost,
              metadata.usd_cost,
              metadata.totalCostUsd,
              metadata.totalCostUSD,
              metadata.total_cost_usd,
              metadata.totalUsd,
              metadata.totalUSD,
              metadata.total_usd,
            ];
        for (const candidate of candidates) {
          const numeric = Number(candidate);
          if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
          }
        }
        return 0;
      }

      function readPlaygroundFineTuningUsdCostWithLegacyCt(source, keys = []) {
        const usdCost = readPlaygroundFineTuningUsdCost(source, keys);
        if (usdCost > 0) return usdCost;
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const tokenCost = normalizePlaygroundFineTuningTokenCount(
          record.costTokens
          ?? record.cost_tokens
          ?? record.costCt
          ?? record.costCT
          ?? record.cost_ct
          ?? record.computeTokens
          ?? record.compute_tokens
          ?? record.totalCT
          ?? record.totalCt
          ?? record.total_ct
          ?? record.ct
        );
        return tokenCost > 0 ? tokenCost / PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR : 0;
      }

      function formatPlaygroundFineTuningUsdCost(value) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(normalizePlaygroundFineTuningUsdCost(value));
      }

      function isPlaygroundFineTuningActiveStatus(status) {
        return new Set([
          "active",
          "analysis",
          "analyzing",
          "assessing",
          "baseline_queued",
          "baseline_running",
          "candidate_ready",
          "creating_agent_version",
          "creating-version",
          "creating_version",
          "evaluating",
          "fine-tuning",
          "fine_tuning",
          "in-progress",
          "in_progress",
          "optimizing",
          "pending",
          "processing",
          "publishing",
          "publishing_version",
          "queued",
          "running",
          "running_case",
          "running_evaluator",
          "scoring",
          "started",
          "snapshotting",
          "verification",
          "verification_queued",
          "verifying",
          "verifying_evaluation",
          "waiting_for_case_summary",
        ]).has(
          normalizePlaygroundFineTuningString(status).toLowerCase()
        );
      }

      function isPlaygroundFineTuningTerminalStatus(status) {
        return new Set([
          "awaiting_review",
          "completed",
          "complete",
          "completed_best_effort",
          "completed_target_met",
          "saved",
          "published",
          "stopped_budget",
          "stopped_plateau",
          "stopped_timeout",
          "error",
          "failed",
          "cancelled",
          "canceled",
        ]).has(
          normalizePlaygroundFineTuningString(status).toLowerCase()
        );
      }

      function hasPlaygroundFineTuningAfterResult(job) {
        const source = job && typeof job === "object" && !Array.isArray(job) ? job : {};
        const status = normalizePlaygroundFineTuningString(source.status).toLowerCase();
        const references = Array.isArray(source.evaluationRuns)
          ? source.evaluationRuns
          : Array.isArray(source.evaluation_runs)
            ? source.evaluation_runs
            : [];
        if (references.some((reference) => {
          const referenceStatus = normalizePlaygroundFineTuningString(reference?.status).toLowerCase();
          if (!normalizePlaygroundFineTuningString(reference?.afterRunId || reference?.after_run_id)) return false;
          if (referenceStatus === "not_run" || referenceStatus === "pending") return false;
          return !isPlaygroundFineTuningActiveStatus(referenceStatus);
        })) {
          return true;
        }
        if (!references.length && isPlaygroundFineTuningTerminalStatus(status)) {
          return Object.prototype.hasOwnProperty.call(source, "afterScore") || Object.prototype.hasOwnProperty.call(source, "after_score");
        }
        return false;
      }

      function canStopPlaygroundFineTuningJob(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const status = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
        if (new Set(["error", "failed", "cancelled", "canceled"]).has(status)) return false;
        const hasActiveReference = normalizedJob.evaluationRuns.some((reference) => {
          const referenceStatus = normalizePlaygroundFineTuningString(reference?.status).toLowerCase();
          return referenceStatus === "pending" || isPlaygroundFineTuningActiveStatus(referenceStatus);
        });
        if (hasActiveReference) return true;
        if (isPlaygroundFineTuningTerminalStatus(status)) return false;
        return isPlaygroundFineTuningActiveStatus(status);
      }

      function formatPlaygroundFineTuningDate(value) {
        const date = new Date(value || "");
        if (!Number.isFinite(date.getTime())) return "-";
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }

      function formatPlaygroundFineTuningDateTime(value) {
        const date = new Date(value || "");
        if (!Number.isFinite(date.getTime())) return "-";
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " + date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      }

      function formatPlaygroundFineTuningPercent(value) {
        return Math.round(normalizePlaygroundFineTuningScore(value) * 100) + "%";
      }

      function formatPlaygroundFineTuningCost(value) {
        return formatPlaygroundFineTuningUsdCost(normalizePlaygroundFineTuningTokenCount(value) / PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
      }

      function formatPlaygroundFineTuningDefaultJobName(date = new Date()) {
        const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
        return "Optimization " + safeDate.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

`;

export const INFERENCE_DOMAIN_RUNTIME_SCRIPT = `      function normalizeSettingsLocalRunnerListPayload(data, key) {
        if (Array.isArray(data?.data)) {
          return data.data;
        }
        if (Array.isArray(data?.[key])) {
          return data[key];
        }
        return Array.isArray(data) ? data : [];
      }

      function normalizeSettingsRuntimeTarget(target) {
        const source = target && typeof target === "object" && !Array.isArray(target) ? target : {};
        const kind = ["cloud", "local_runner", "fully_local"].includes(source.kind) ? source.kind : "";
        if (!kind) {
          return null;
        }
        const status = ["available", "disabled", "planned", "unavailable"].includes(source.status)
          ? source.status
          : "unavailable";
        return {
          kind,
          label: normalizeSettingsLocalRunnerText(source.label, kind === "cloud" ? "Cloud Runtime" : kind === "local_runner" ? "Local Runner" : "Fully Local"),
          status,
          default: Boolean(source.default),
          description: normalizeSettingsLocalRunnerText(source.description),
          deviceCount: Number.isFinite(Number(source.deviceCount)) ? Number(source.deviceCount) : 0,
          onlineDeviceCount: Number.isFinite(Number(source.onlineDeviceCount)) ? Number(source.onlineDeviceCount) : 0,
          bindingCount: Number.isFinite(Number(source.bindingCount)) ? Number(source.bindingCount) : 0,
          bridgeLocalBindingCount: Number.isFinite(Number(source.bridgeLocalBindingCount)) ? Number(source.bridgeLocalBindingCount) : 0,
        };
      }

      function normalizeSettingsRuntimeTargetsPayload(data) {
        return normalizeSettingsLocalRunnerListPayload(data, "runtimeTargets")
          .map(normalizeSettingsRuntimeTarget)
          .filter(Boolean);
      }

      function normalizeSettingsLocalRunnerText(value, fallback = "") {
        return typeof value === "string" && value.trim() ? value.trim() : fallback;
      }

      function normalizeSettingsLocalRunnerDevice(device) {
        const source = device && typeof device === "object" && !Array.isArray(device) ? device : {};
        const id = normalizeSettingsLocalRunnerText(source.id || source.deviceId);
        if (!id) {
          return null;
        }

        const capabilities = source.capabilities && typeof source.capabilities === "object" && !Array.isArray(source.capabilities)
          ? source.capabilities
          : {};
        return {
          id,
          name: normalizeSettingsLocalRunnerText(source.name, normalizeSettingsLocalRunnerText(source.hostname, "Local runner")),
          platform: normalizeSettingsLocalRunnerText(source.platform, "Unknown platform"),
          hostname: normalizeSettingsLocalRunnerText(source.hostname),
          appVersion: normalizeSettingsLocalRunnerText(source.appVersion),
          daemonVersion: normalizeSettingsLocalRunnerText(source.daemonVersion),
          status: source.status === "online" ? "online" : "offline",
          lastSeenAt: normalizeSettingsLocalRunnerText(source.lastSeenAt),
          capabilities,
        };
      }

      function normalizeSettingsWorkspaceBinding(binding) {
        const source = binding && typeof binding === "object" && !Array.isArray(binding) ? binding : {};
        const id = normalizeSettingsLocalRunnerText(source.id || source.workspaceBindingId);
        const deviceId = normalizeSettingsLocalRunnerText(source.deviceId);
        if (!id || !deviceId) {
          return null;
        }
        return {
          id,
          deviceId,
          environmentId: normalizeSettingsLocalRunnerText(source.environmentId),
          projectId: normalizeSettingsLocalRunnerText(source.projectId),
          name: normalizeSettingsLocalRunnerText(source.name),
          localPath: normalizeSettingsLocalRunnerText(source.localPath),
          syncRoot: normalizeSettingsLocalRunnerText(source.syncRoot),
          syncMode: normalizeSettingsLocalRunnerText(source.syncMode, "manual"),
          executionMode: normalizeSettingsLocalRunnerText(source.executionMode, "legacy_remote"),
        };
      }

      function getSettingsLocalRuntimeCapabilities(device) {
        const capabilities = device?.capabilities && typeof device.capabilities === "object" && !Array.isArray(device.capabilities)
          ? device.capabilities
          : {};
        return capabilities.localRuntime && typeof capabilities.localRuntime === "object" && !Array.isArray(capabilities.localRuntime)
          ? capabilities.localRuntime
          : {};
      }

      function formatSettingsLocalRunnerRuntimeStatus(value) {
        switch (String(value || "").trim()) {
          case "available":
            return "Available";
          case "planned":
            return "Planned";
          case "disabled":
            return "Disabled";
          case "unavailable":
            return "Unavailable";
          default:
            return "Unknown";
        }
      }

      function formatSettingsLocalRunnerNumber(value, suffix = "") {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return "Unknown";
        }
        const rounded = Math.round(numericValue * 10) / 10;
        return String(rounded).replace(/\.0$/, "") + suffix;
      }

      function formatSettingsLocalRunnerDateTime(value) {
        const normalizedValue = normalizeSettingsLocalRunnerText(value);
        if (!normalizedValue) {
          return "Never";
        }
        const date = new Date(normalizedValue);
        if (Number.isNaN(date.getTime())) {
          return "Never";
        }
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }

      function formatSettingsLocalRunnerToolchain(toolchain) {
        const source = toolchain && typeof toolchain === "object" && !Array.isArray(toolchain) ? toolchain : {};
        const activeTools = [
          source.docker ? "Docker" : "",
          source.podman ? "Podman" : "",
          source.ollama ? "Ollama" : "",
          source.git ? "Git" : "",
        ].filter(Boolean);
        return activeTools.length > 0 ? activeTools.join(", ") : "No local tools detected";
      }
`;


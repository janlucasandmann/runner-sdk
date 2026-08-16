export const METRONOME_INSPECTOR_PROMPTS_RUNTIME_SCRIPT = String.raw`
        function getMetronomePromptVersion(prompt) {
          const source = prompt && typeof prompt === "object" ? prompt : {};
          const versions = Array.isArray(source.versions) ? source.versions : [];
          const currentVersionId = String(source.currentVersionId || source.current_version_id || "").trim();
          const publishedVersionId = String(source.publishedVersionId || source.published_version_id || "").trim();
          return versions.find((version) => String(version?.id || "").trim() === currentVersionId)
            || versions.find((version) => String(version?.id || "").trim() === publishedVersionId)
            || (source.currentVersion && typeof source.currentVersion === "object" ? source.currentVersion : null)
            || versions[versions.length - 1]
            || null;
        }

        function normalizeMetronomePromptOption(value) {
          const source = value && typeof value === "object" ? value : {};
          const version = getMetronomePromptVersion(source);
          const hasVersionMarkdown = Boolean(version)
            && Object.prototype.hasOwnProperty.call(version, "markdown");
          const hasSourceMarkdown = Object.prototype.hasOwnProperty.call(source, "markdown");
          const hasSourceContent = Object.prototype.hasOwnProperty.call(source, "content");
          const markdown = hasVersionMarkdown
            ? String(version.markdown ?? "")
            : hasSourceMarkdown
              ? String(source.markdown ?? "")
              : hasSourceContent
                ? String(source.content ?? "")
                : "";
          return {
            ...source,
            id: String(source.id || source.promptId || source.prompt_id || "").trim(),
            name: String(source.name || source.title || version?.name || "Untitled prompt").trim() || "Untitled prompt",
            description: String(source.description || version?.description || "").trim(),
            markdown,
            hasInlineMarkdown: hasVersionMarkdown || hasSourceMarkdown || hasSourceContent,
            updatedAt: String(source.updatedAt || source.updated_at || version?.updatedAt || version?.updated_at || "").trim(),
          };
        }

        async function readMetronomePromptResponse(response, fallbackMessage) {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(payload?.message || payload?.error || fallbackMessage);
          }
          return payload;
        }

        async function fetchMetronomePromptsApi(options = {}) {
          const response = await fetch(getMetronomeApiBaseUrl(options) + "/prompts", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: buildMetronomeApiHeaders(options),
            signal: options.signal,
          });
          const payload = await readMetronomePromptResponse(response, "Failed to load prompts.");
          const records = Array.isArray(payload?.prompts)
            ? payload.prompts
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
                ? payload.items
                : [];
          return records
            .map(normalizeMetronomePromptOption)
            .filter((prompt) => Boolean(prompt.id));
        }

        async function fetchMetronomePromptApi(promptId, options = {}) {
          const normalizedPromptId = String(promptId || "").trim();
          if (!normalizedPromptId) {
            throw new Error("Select a prompt first.");
          }
          const response = await fetch(
            getMetronomeApiBaseUrl(options) + "/prompts/" + encodeURIComponent(normalizedPromptId),
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: buildMetronomeApiHeaders(options),
              signal: options.signal,
            }
          );
          const payload = await readMetronomePromptResponse(response, "Failed to load this prompt.");
          return normalizeMetronomePromptOption(payload?.prompt || payload?.data || payload);
        }
`;

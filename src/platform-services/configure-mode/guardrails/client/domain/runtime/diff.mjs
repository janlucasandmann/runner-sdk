export const GUARDRAILS_DIFF_SCRIPT = `      function createPlaygroundGuardrailVersionPromptSlug(prompt, index = 0) {
        const source = String(prompt?.title || prompt?.id || ("prompt " + (index + 1))).trim().toLowerCase();
        const slug = source
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        return slug || ("prompt-" + (index + 1));
      }

      function buildPlaygroundGuardrailVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
        if (!baseSnapshot || !targetSnapshot) {
          return [];
        }
        const normalizedBaseSnapshot = normalizePlaygroundGuardrailVersion({ snapshot: baseSnapshot }).snapshot;
        const normalizedTargetSnapshot = normalizePlaygroundGuardrailVersion({ snapshot: targetSnapshot }).snapshot;
        const basePrompts = Array.isArray(normalizedBaseSnapshot.prompts) ? normalizedBaseSnapshot.prompts : [];
        const targetPrompts = Array.isArray(normalizedTargetSnapshot.prompts) ? normalizedTargetSnapshot.prompts : [];
        const promptIds = Array.from(new Set(basePrompts.concat(targetPrompts).map((prompt, index) => (
          String(prompt?.id || ("prompt_" + (index + 1))).trim()
        )))).filter(Boolean);
        const files = [
          createPlaygroundVersionDiffFile({
            id: "config",
            path: "guardrail-set/config.json",
            before: {
              name: normalizedBaseSnapshot.name,
              prompts: basePrompts.map((prompt, index) => ({
                id: String(prompt?.id || ("prompt_" + (index + 1))).trim(),
                title: String(prompt?.title || "").trim(),
              })),
            },
            after: {
              name: normalizedTargetSnapshot.name,
              prompts: targetPrompts.map((prompt, index) => ({
                id: String(prompt?.id || ("prompt_" + (index + 1))).trim(),
                title: String(prompt?.title || "").trim(),
              })),
            },
          }),
          createPlaygroundVersionDiffFile({
            id: "description",
            path: "guardrail-set/description.md",
            before: normalizedBaseSnapshot.description || "",
            after: normalizedTargetSnapshot.description || "",
          }),
        ];
        promptIds.forEach((promptId, index) => {
          const basePrompt = basePrompts.find((prompt) => String(prompt?.id || "").trim() === promptId) || null;
          const targetPrompt = targetPrompts.find((prompt) => String(prompt?.id || "").trim() === promptId) || null;
          const displayPrompt = targetPrompt || basePrompt || {};
          files.push(createPlaygroundVersionDiffFile({
            id: "prompt:" + promptId,
            path: "guardrail-set/prompts/" + createPlaygroundGuardrailVersionPromptSlug(displayPrompt, index) + ".md",
            before: basePrompt?.prompt || "",
            after: targetPrompt?.prompt || "",
          }));
        });
        return files.filter(Boolean);
      }

`;

export const RESOURCE_CREATION_ACTIONS_SCRIPT = `          function openPlatformResourceCreationModal(resourceType, options = {}) {
            const normalizedResourceType = resourceType === "computer" ? "computer" : resourceType === "agent" ? "agent" : "";
            if (!normalizedResourceType) {
              return;
            }
            setAccountMenuOpen(false);
            setProfileEditorOpen(false);
            setPlatformResourceCreationRequest({
              resourceType: normalizedResourceType,
              modelId: normalizedResourceType === "agent" ? String(options?.modelId || "").trim() : "",
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
          }

          function closePlatformResourceCreationModal() {
            setPlatformResourceCreationRequest(null);
          }
`;

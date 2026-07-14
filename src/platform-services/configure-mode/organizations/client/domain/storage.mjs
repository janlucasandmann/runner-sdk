export const ORGANIZATIONS_STORAGE_SCRIPT = `      function readPlaygroundActiveOrganizationId() {
        if (typeof window === "undefined" || !window.localStorage) {
          return "";
        }
        try {
          return String(window.localStorage.getItem(PLAYGROUND_ACTIVE_ORGANIZATION_STORAGE_KEY) || "").trim();
        } catch {
          return "";
        }
      }

      function writePlaygroundActiveOrganizationId(organizationId) {
        if (typeof window === "undefined" || !window.localStorage) {
          return;
        }
        const normalizedOrganizationId = String(organizationId || "").trim();
        try {
          if (normalizedOrganizationId) {
            window.localStorage.setItem(PLAYGROUND_ACTIVE_ORGANIZATION_STORAGE_KEY, normalizedOrganizationId);
          } else {
            window.localStorage.removeItem(PLAYGROUND_ACTIVE_ORGANIZATION_STORAGE_KEY);
          }
        } catch {}
      }
`;

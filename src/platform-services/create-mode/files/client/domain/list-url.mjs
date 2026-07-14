export const FILES_LIST_URL_DOMAIN_SCRIPT = `
      function buildPlaygroundEnvironmentFilesListUrl(backendUrl, environmentId, folderPath = "", depth = 1) {
        if (!backendUrl || !environmentId) return "";
        const normalizedFolderPath = normalizeHistoryPath(folderPath);
        const params = new URLSearchParams();
        params.set("depth", String(depth));
        if (normalizedFolderPath) {
          params.set("path", normalizedFolderPath);
        }
        return backendUrl + "/environments/" + encodeURIComponent(environmentId) + "/files?" + params.toString();
      }
`;

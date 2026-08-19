export const INFERENCE_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "inference") {
	            openInferencePage(entry.endpointId || "", {
	              detailTab: entry.detailTab || "general",
	              versionId: entry.versionId || "",
	            });
            return;
          }
`;

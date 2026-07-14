export const TEAMS_RESOURCE_SHARING_DOMAIN_SCRIPT = `        function parseTeamResourceShareMetadata(share) {
          const metadata = share?.metadata;
          if (!metadata) {
            return {};
          }
          if (typeof metadata === "string") {
            try {
              const parsed = JSON.parse(metadata);
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch {
              return {};
            }
          }
          return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
        }

        function getTeamResourceUiShareType(resourceTypeOrShare) {
          const share = resourceTypeOrShare && typeof resourceTypeOrShare === "object" && !Array.isArray(resourceTypeOrShare)
            ? resourceTypeOrShare
            : null;
          const normalizedType = String(share ? share.resourceType : resourceTypeOrShare || "").trim();
          const metadata = share ? parseTeamResourceShareMetadata(share) : {};
          const metadataType = String(
            metadata.resourceType
            || metadata.resource_type
            || metadata.resourceKind
            || metadata.resource_kind
            || metadata.kind
            || metadata.type
            || ""
          ).trim();
          if (normalizedType === "metronome_workflow" || metadataType === "metronome_workflow" || metadataType === "metronome") {
            return "metronome";
          }
          return normalizedType;
        }

        function getTeamResourceBackendShareType(resourceType) {
          const normalizedType = String(resourceType || "").trim();
          if (normalizedType === "metronome") {
            return "metronome_workflow";
          }
          return normalizedType;
        }
`;


export const MARKETPLACE_PREVIEW_METADATA_SCRIPT = `      function normalizePlaygroundResourceTemplatePreviewIdPart(value) {
        return String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
      }

      function getPlaygroundResourceTemplatePreviewResourceType(template) {
        const normalizedType = String(template?.type || "").trim();
        if (normalizedType === "database") {
          return "database";
        }
        if (normalizedType === "web_app" || normalizedType === "function") {
          return "server";
        }
        return "";
      }

      function getPlaygroundResourceTemplatePreviewResourceId(template) {
        const normalizedTemplateId = normalizePlaygroundResourceTemplatePreviewIdPart(template?.id);
        if (!normalizedTemplateId) {
          return "";
        }
        return getPlaygroundResourceTemplatePreviewResourceType(template) === "database"
          ? "template_preview_database_" + normalizedTemplateId
          : "template_preview_server_" + normalizedTemplateId;
      }

      function buildPlaygroundResourceTemplatePreviewMetadata(template) {
        const templateId = String(template?.id || "").trim();
        const templateType = String(template?.type || "").trim();
        return {
          resourceTemplatePreview: true,
          resource_template_preview: true,
          templatePreview: true,
          template_preview: true,
          resourceTemplateId: templateId,
          resource_template_id: templateId,
          resourceTemplateType: templateType,
          resource_template_type: templateType,
          runnerPlayground: {
            resourceTemplatePreview: true,
            resource_template_preview: true,
            resourceTemplateId: templateId,
            resource_template_id: templateId,
            resourceTemplateType: templateType,
            resource_template_type: templateType,
          },
        };
      }

      function isPlaygroundResourceTemplatePreviewRecord(record) {
        const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
          ? record.metadata
          : null;
        const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : null;
        return Boolean(
          record?.resourceTemplatePreview
          || record?.templatePreview
          || metadata?.resourceTemplatePreview
          || metadata?.resource_template_preview
          || metadata?.templatePreview
          || metadata?.template_preview
          || runnerPlayground?.resourceTemplatePreview
          || runnerPlayground?.resource_template_preview
        );
      }

      function buildPlaygroundResourceTemplateMaterializedMetadata(record) {
        const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
          ? record.metadata
          : {};
        const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const templateId = String(
          metadata.resourceTemplateId
          || metadata.resource_template_id
          || runnerPlayground.resourceTemplateId
          || runnerPlayground.resource_template_id
          || ""
        ).trim();
        const templateType = String(
          metadata.resourceTemplateType
          || metadata.resource_template_type
          || runnerPlayground.resourceTemplateType
          || runnerPlayground.resource_template_type
          || ""
        ).trim();
        const stripPreviewFlags = (source) => {
          const next = {};
          Object.entries(source && typeof source === "object" ? source : {}).forEach(([key, value]) => {
            if ([
              "resourceTemplatePreview",
              "resource_template_preview",
              "templatePreview",
              "template_preview",
            ].includes(key)) {
              return;
            }
            next[key] = value;
          });
          return next;
        };
        const nextMetadata = stripPreviewFlags(metadata);
        const nextRunnerPlayground = stripPreviewFlags(runnerPlayground);
        nextMetadata.createdFromResourceTemplate = true;
        nextMetadata.created_from_resource_template = true;
        if (templateId) {
          nextMetadata.resourceTemplateId = templateId;
          nextMetadata.resource_template_id = templateId;
          nextRunnerPlayground.resourceTemplateId = templateId;
          nextRunnerPlayground.resource_template_id = templateId;
        }
        if (templateType) {
          nextMetadata.resourceTemplateType = templateType;
          nextMetadata.resource_template_type = templateType;
          nextRunnerPlayground.resourceTemplateType = templateType;
          nextRunnerPlayground.resource_template_type = templateType;
        }
        nextRunnerPlayground.createdFromResourceTemplate = true;
        nextRunnerPlayground.created_from_resource_template = true;
        nextMetadata.runnerPlayground = nextRunnerPlayground;
        return nextMetadata;
      }

`;

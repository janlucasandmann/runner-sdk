export {
  PLATFORM_PROJECT_ICON_OPTIONS,
  PlatformProjectIdentityIcon,
  normalizePlatformProjectIconId,
  type PlatformProjectIconOption,
  type PlatformProjectIdentityIconProps,
} from "./project-identity-icon.js";
export {
  createPlatformProjectIdentityFallback,
  getPlatformProjectReferenceFromKnowledgeMetadata,
  normalizePlatformProjectIdentity,
  type PlatformProjectIdentity,
  type PlatformProjectReference,
} from "./project-identity.js";
export { PlatformProjectIdentityApi } from "./project-identity-api.js";
export {
  PLATFORM_PROJECT_SCOPE_SCHEMA_VERSION,
  getPlatformResourceProjectScopeIds,
  isPlatformProjectStrategyKnowledgeMetadata,
  withPlatformResourceProjectScope,
} from "./project-scope.js";

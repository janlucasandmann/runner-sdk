import { createHostedIdentityService } from "./hosted-identity-service.mjs";
import { createOidcIdentityService } from "./oidc-identity-service.mjs";

export function createIdentityService(config, dependencies) {
  return config.identityProvider === "oidc"
    ? createOidcIdentityService(config, dependencies)
    : createHostedIdentityService(config, dependencies);
}

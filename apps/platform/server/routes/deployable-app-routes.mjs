import { isDeployableAppRequestPath } from "../gateway/deployable-app-gateway.mjs";

export function createDeployableAppRoutes({
  deployableAppGatewayEnabled,
  proxyDeployableAppRequest,
}) {
  return (req, res, url) => {
    if (!deployableAppGatewayEnabled || !isDeployableAppRequestPath(url)) {
      return false;
    }
    void proxyDeployableAppRequest(req, res, url);
    return true;
  };
}

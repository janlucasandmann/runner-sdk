import os from "node:os";
import path from "node:path";

const PRODUCT_STATE_DIRECTORY = path.join(".computer-agents", "platform");

export function resolvePlatformDataRoot({
  env = process.env,
  cwd = process.cwd(),
  homeDirectory = "",
} = {}) {
  const configuredRoot = String(env.PLATFORM_DATA_ROOT || "").trim();
  if (configuredRoot) return path.resolve(configuredRoot);

  const configuredStateRoot = String(env.PLATFORM_LOCAL_STATE_ROOT || "").trim();
  if (configuredStateRoot) return path.resolve(configuredStateRoot);

  const home = String(
    homeDirectory
      || env.HOME
      || env.USERPROFILE
      || os.homedir(),
  ).trim();
  if (home) return path.join(path.resolve(home), PRODUCT_STATE_DIRECTORY);

  return path.join(path.resolve(cwd), ".platform-data");
}

export function resolvePlatformDataPath(fileName, options = {}) {
  return path.join(resolvePlatformDataRoot(options), fileName);
}

export function resolveLegacyPlatformDataPath(fileName, {
  cwd = process.cwd(),
} = {}) {
  return path.join(path.resolve(cwd), ".platform-data", fileName);
}

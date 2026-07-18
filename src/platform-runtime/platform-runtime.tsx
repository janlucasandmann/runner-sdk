import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

export interface PlatformRuntimeConfig {
  apiOrigin: string;
  appOrigin: string;
  aiosOrigin: string;
  environment: "development" | "production" | "test";
}

const DEFAULT_PLATFORM_RUNTIME_CONFIG: PlatformRuntimeConfig = Object.freeze({
  apiOrigin: "",
  appOrigin: "",
  aiosOrigin: "",
  environment: "production",
});

const PlatformRuntimeContext = createContext<PlatformRuntimeConfig>(
  DEFAULT_PLATFORM_RUNTIME_CONFIG,
);

function normalizeOrigin(value: string | undefined): string {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function normalizePlatformRuntimeConfig(
  config: Partial<PlatformRuntimeConfig> = {},
): PlatformRuntimeConfig {
  const environment = config.environment === "development"
    || config.environment === "test"
    ? config.environment
    : "production";

  return Object.freeze({
    apiOrigin: normalizeOrigin(config.apiOrigin),
    appOrigin: normalizeOrigin(config.appOrigin),
    aiosOrigin: normalizeOrigin(config.aiosOrigin),
    environment,
  });
}

export interface PlatformRuntimeProviderProps extends PropsWithChildren {
  config?: Partial<PlatformRuntimeConfig>;
}

export function PlatformRuntimeProvider({
  children,
  config,
}: PlatformRuntimeProviderProps) {
  const value = useMemo(
    () => normalizePlatformRuntimeConfig(config),
    [config],
  );

  return (
    <PlatformRuntimeContext.Provider value={value}>
      {children}
    </PlatformRuntimeContext.Provider>
  );
}

export function usePlatformRuntime(): PlatformRuntimeConfig {
  return useContext(PlatformRuntimeContext);
}

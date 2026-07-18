import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import {
  createPlatformApiClient,
  type PlatformApiClient,
} from "./platform-api-client.js";
import { usePlatformRuntime } from "./platform-runtime.js";

const PlatformApiContext = createContext<PlatformApiClient | null>(null);

export interface PlatformApiProviderProps extends PropsWithChildren {
  client?: PlatformApiClient;
  requestHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
}

export function PlatformApiProvider({
  children,
  client,
  requestHeaders,
  fetchImpl,
}: PlatformApiProviderProps) {
  const runtime = usePlatformRuntime();
  const value = useMemo(() => client || createPlatformApiClient({
    baseUrl: runtime.apiOrigin,
    fetchImpl,
    getHeaders: () => requestHeaders,
  }), [client, fetchImpl, requestHeaders, runtime.apiOrigin]);

  return (
    <PlatformApiContext.Provider value={value}>
      {children}
    </PlatformApiContext.Provider>
  );
}

export function usePlatformApiClient(): PlatformApiClient {
  const client = useContext(PlatformApiContext);
  if (!client) {
    throw new Error(
      "usePlatformApiClient must be used inside PlatformApiProvider.",
    );
  }
  return client;
}

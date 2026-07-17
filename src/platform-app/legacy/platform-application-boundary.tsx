import {
  Component,
  Suspense,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  PlatformRuntimeProvider,
  type PlatformRuntimeConfig,
} from "../runtime/platform-runtime.js";
import {
  PlatformApiProvider,
  type PlatformApiClient,
} from "../runtime/index.js";

interface PlatformErrorBoundaryState {
  error: Error | null;
}

class PlatformErrorBoundary extends Component<PropsWithChildren, PlatformErrorBoundaryState> {
  state: PlatformErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PlatformErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[platform-client] Unhandled render error.", error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="platform-client-fatal-error" role="alert">
          <h1>Unable to open the platform</h1>
          <p>{this.state.error.message || "An unexpected rendering error occurred."}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

function PlatformRouteLoadingFallback() {
  return (
    <div className="playground-static-boot" role="status" aria-live="polite">
      <div className="playground-static-boot-card">
        <div className="playground-static-boot-row">
          <span className="playground-static-boot-dots" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
          </span>
          <span className="playground-static-boot-title">Opening page</span>
        </div>
      </div>
    </div>
  );
}

export interface PlatformApplicationBoundaryProps extends PropsWithChildren {
  runtime?: Partial<PlatformRuntimeConfig>;
  apiClient?: PlatformApiClient;
  requestHeaders?: HeadersInit;
}

export function PlatformApplicationBoundary({
  children,
  runtime,
  apiClient,
  requestHeaders,
}: PlatformApplicationBoundaryProps) {
  return (
    <PlatformErrorBoundary>
      <PlatformRuntimeProvider config={runtime}>
        <PlatformApiProvider
          client={apiClient}
          requestHeaders={requestHeaders}
        >
          <Suspense fallback={<PlatformRouteLoadingFallback />}>
            {children}
          </Suspense>
        </PlatformApiProvider>
      </PlatformRuntimeProvider>
    </PlatformErrorBoundary>
  );
}

import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

export interface PlatformDeploymentMapLocation {
  code: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface PlatformDeploymentMapProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  regionCode: string;
  title?: ReactNode;
  location?: PlatformDeploymentMapLocation;
  imageSource?: string;
}

interface PlatformDeploymentMapRuntimeProfile {
  topology?: unknown;
  product?: {
    inference?: {
      deploymentEndpoint?: {
        region?: unknown;
      } | null;
    };
  };
}

const PLATFORM_DEPLOYMENT_MAP_BOUNDS = Object.freeze({
  latitude: Object.freeze({ min: -56, max: 71 }),
  longitude: Object.freeze({ min: -168, max: 168 }),
});

const PLATFORM_DEPLOYMENT_REGION_LOCATIONS = Object.freeze<
  Record<string, Omit<PlatformDeploymentMapLocation, "code">>
>({
  eur3: {
    label: "Europe",
    latitude: 50.1109,
    longitude: 8.6821,
  },
  "europe-west1": {
    label: "Belgium",
    latitude: 50.8503,
    longitude: 4.3517,
  },
  "europe-west2": {
    label: "London",
    latitude: 51.5072,
    longitude: -0.1276,
  },
  "europe-west3": {
    label: "Frankfurt",
    latitude: 50.1109,
    longitude: 8.6821,
  },
  "europe-west4": {
    label: "Netherlands",
    latitude: 53.4386,
    longitude: 6.8355,
  },
  "europe-north1": {
    label: "Finland",
    latitude: 60.1699,
    longitude: 24.9384,
  },
  "hr-zad-1": {
    label: "Zadar, Croatia",
    latitude: 44.1194,
    longitude: 15.2314,
  },
  "us-central1": {
    label: "Iowa",
    latitude: 41.878,
    longitude: -93.0977,
  },
  "us-east1": {
    label: "South Carolina",
    latitude: 33.8361,
    longitude: -80.898,
  },
  "us-east4": {
    label: "Northern Virginia",
    latitude: 38.9072,
    longitude: -77.0369,
  },
  "us-west1": {
    label: "Oregon",
    latitude: 45.5152,
    longitude: -122.6784,
  },
  "asia-east1": {
    label: "Taiwan",
    latitude: 25.033,
    longitude: 121.5654,
  },
  "asia-northeast1": {
    label: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  "asia-southeast1": {
    label: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  "australia-southeast1": {
    label: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
  },
});

const DEFAULT_REGION_CODE = "eur3";
const DEFAULT_IMAGE_SOURCE = "/img/platform/deployment-world-map.svg";

let platformDeploymentMapLocationOverride: PlatformDeploymentMapLocation | null =
  null;

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeRegionCode(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeDeploymentMapLocation(
  value: unknown,
): PlatformDeploymentMapLocation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as Partial<PlatformDeploymentMapLocation>;
  const code = normalizeRegionCode(candidate.code);
  const label = String(candidate.label || "").trim();
  const latitude = Number(candidate.latitude);
  const longitude = Number(candidate.longitude);
  if (
    !code ||
    !label ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return Object.freeze({ code, label, latitude, longitude });
}

/**
 * Configures the immutable deployment-site override used by appliance builds.
 * Hosted deployments deliberately clear the override so their resource maps
 * continue to reflect each resource's configured cloud region.
 */
export function configurePlatformDeploymentMapRuntime(
  profile: PlatformDeploymentMapRuntimeProfile | null | undefined,
) {
  platformDeploymentMapLocationOverride =
    profile?.topology === "on_prem"
      ? normalizeDeploymentMapLocation(
          profile.product?.inference?.deploymentEndpoint?.region,
        )
      : null;
}

export function resolvePlatformDeploymentMapLocation(
  regionCode: string,
): PlatformDeploymentMapLocation {
  const normalizedCode = normalizeRegionCode(regionCode) || DEFAULT_REGION_CODE;
  const location =
    PLATFORM_DEPLOYMENT_REGION_LOCATIONS[normalizedCode] ||
    PLATFORM_DEPLOYMENT_REGION_LOCATIONS[DEFAULT_REGION_CODE];

  return {
    code: normalizedCode,
    ...location,
  };
}

function getMarkerPosition(location: PlatformDeploymentMapLocation) {
  const longitudeRange =
    PLATFORM_DEPLOYMENT_MAP_BOUNDS.longitude.max -
    PLATFORM_DEPLOYMENT_MAP_BOUNDS.longitude.min;
  const latitudeRange =
    PLATFORM_DEPLOYMENT_MAP_BOUNDS.latitude.max -
    PLATFORM_DEPLOYMENT_MAP_BOUNDS.latitude.min;

  return {
    left:
      clamp(
        (location.longitude - PLATFORM_DEPLOYMENT_MAP_BOUNDS.longitude.min) /
          longitudeRange,
        0,
        1,
      ) * 100,
    top:
      clamp(
        (PLATFORM_DEPLOYMENT_MAP_BOUNDS.latitude.max - location.latitude) /
          latitudeRange,
        0,
        1,
      ) * 100,
  };
}

export function PlatformDeploymentMap({
  regionCode,
  title = "Deployment region",
  location,
  imageSource = DEFAULT_IMAGE_SOURCE,
  className = "",
  ...props
}: PlatformDeploymentMapProps) {
  const generatedId = useId();
  const resolvedLocation =
    platformDeploymentMapLocationOverride ||
    location ||
    resolvePlatformDeploymentMapLocation(regionCode);
  const markerPosition = getMarkerPosition(resolvedLocation);
  const markerStyle = {
    "--platform-deployment-map-marker-left": `${markerPosition.left}%`,
    "--platform-deployment-map-marker-top": `${markerPosition.top}%`,
  } as CSSProperties;
  const descriptionId = `platform-deployment-map-${generatedId.replace(/[^a-z0-9_-]/gi, "")}`;

  return (
    <figure
      {...props}
      className={joinClassNames("platform-deployment-map", className)}
      role="img"
      aria-labelledby={`${descriptionId}-title`}
      aria-describedby={`${descriptionId}-description`}
    >
      <div className="platform-deployment-map__header">
        <figcaption
          id={`${descriptionId}-title`}
          className="platform-deployment-map__title"
        >
          {title}
        </figcaption>
        <span
          id={`${descriptionId}-description`}
          className="platform-deployment-map__region"
        >
          {resolvedLocation.label} · {resolvedLocation.code}
        </span>
      </div>
      <div className="platform-deployment-map__viewport">
        <div className="platform-deployment-map__canvas">
          <img
            className="platform-deployment-map__image"
            src={imageSource}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
          <span
            className="platform-deployment-map__marker"
            style={markerStyle}
            aria-hidden="true"
          >
            <span className="platform-deployment-map__marker-core" />
            <span className="platform-deployment-map__marker-pulse" />
            <span className="platform-deployment-map__marker-label">
              {resolvedLocation.code}
            </span>
          </span>
        </div>
      </div>
    </figure>
  );
}

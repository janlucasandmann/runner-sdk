// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PlatformDeploymentMap,
  configurePlatformDeploymentMapRuntime,
  resolvePlatformDeploymentMapLocation,
} from "./platform-deployment-map.js";

beforeEach(() => configurePlatformDeploymentMapRuntime(null));
afterEach(() => {
  cleanup();
  configurePlatformDeploymentMapRuntime(null);
});

describe("PlatformDeploymentMap", () => {
  it("renders the resolved deployment region and cacheable map asset", () => {
    const { container } = render(
      <PlatformDeploymentMap regionCode="eur3" />,
    );

    expect(screen.getByText("Deployment region")).not.toBeNull();
    expect(screen.getByText("Europe · eur3")).not.toBeNull();
    expect(
      screen.getByRole("img", { name: "Deployment region" }),
    ).not.toBeNull();
    expect(container.querySelector(".platform-deployment-map__marker-label")?.textContent).toBe(
      "eur3",
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/img/platform/deployment-world-map.svg",
    );
  });

  it("normalizes known regions and gracefully locates unknown codes", () => {
    expect(resolvePlatformDeploymentMapLocation("EUROPE-WEST3")).toMatchObject({
      code: "europe-west3",
      label: "Frankfurt",
    });
    expect(resolvePlatformDeploymentMapLocation("private-region")).toMatchObject({
      code: "private-region",
      label: "Europe",
    });
  });

  it("accepts an explicit deployment location", () => {
    const { container } = render(
      <PlatformDeploymentMap
        regionCode="custom"
        location={{
          code: "custom",
          label: "Private region",
          latitude: 40.7128,
          longitude: -74.006,
        }}
      />,
    );

    expect(screen.getByText("Private region · custom")).not.toBeNull();
    expect(
      container
        .querySelector(".platform-deployment-map__marker")
        ?.getAttribute("style"),
    ).toContain("--platform-deployment-map-marker-left");
  });

  it("uses the appliance site for every map on an on-prem deployment", () => {
    configurePlatformDeploymentMapRuntime({
      topology: "on_prem",
      product: {
        inference: {
          deploymentEndpoint: {
            region: {
              code: "hr-zad-1",
              label: "Zadar, Croatia",
              latitude: 44.1194,
              longitude: 15.2314,
            },
          },
        },
      },
    });

    const { container } = render(
      <PlatformDeploymentMap
        regionCode="us-central1"
        location={{
          code: "custom",
          label: "Custom resource region",
          latitude: 40,
          longitude: -74,
        }}
      />,
    );

    expect(screen.getByText("Zadar, Croatia · hr-zad-1")).not.toBeNull();
    expect(
      container.querySelector(".platform-deployment-map__marker-label")
        ?.textContent,
    ).toBe("hr-zad-1");
  });

  it("keeps resource-specific regions on hosted deployments", () => {
    configurePlatformDeploymentMapRuntime({
      topology: "gcp_saas",
      product: {
        inference: {
          deploymentEndpoint: {
            region: {
              code: "hr-zad-1",
              label: "Zadar, Croatia",
              latitude: 44.1194,
              longitude: 15.2314,
            },
          },
        },
      },
    });

    render(<PlatformDeploymentMap regionCode="us-central1" />);

    expect(screen.getByText("Iowa · us-central1")).not.toBeNull();
  });
});

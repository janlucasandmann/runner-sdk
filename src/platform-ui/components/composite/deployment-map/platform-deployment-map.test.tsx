// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PlatformDeploymentMap,
  resolvePlatformDeploymentMapLocation,
} from "./platform-deployment-map.js";

afterEach(cleanup);

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
});

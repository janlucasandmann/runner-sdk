// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlatformFileExplorerFileIcon } from "./platform-file-explorer-file-icon.js";

describe("PlatformFileExplorerFileIcon", () => {
  it("uses the Files page folder artwork for folders", () => {
    const { container } = render(
      <PlatformFileExplorerFileIcon kind="folder" />,
    );

    const icon = container.querySelector(
      ".platform-file-explorer__file-icon.is-folder",
    );
    expect(icon?.tagName.toLowerCase()).toBe("img");
    expect(icon?.getAttribute("src")).toContain("folder.png");
  });

  it.each([
    "video",
    "audio",
    "pdf",
    "code",
    "spreadsheet",
    "document",
    "file",
  ] as const)("uses the Files page document artwork for %s files", (kind) => {
    const { container } = render(
      <PlatformFileExplorerFileIcon kind={kind} />,
    );

    const icon = container.querySelector(
      `.platform-file-explorer__file-icon.is-${kind}`,
    );
    expect(icon?.tagName.toLowerCase()).toBe("img");
    expect(icon?.getAttribute("src")).toContain("txtfile.png");
  });

  it("uses the Files page image fallback for images without thumbnails", () => {
    const { container } = render(
      <PlatformFileExplorerFileIcon kind="image" />,
    );

    const icon = container.querySelector(
      ".platform-file-explorer__file-icon.is-image",
    );
    expect(icon?.tagName.toLowerCase()).toBe("svg");
    expect(container.querySelector("img")).toBeNull();
  });
});

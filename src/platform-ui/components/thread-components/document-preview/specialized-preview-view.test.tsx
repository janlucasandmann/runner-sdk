// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RunnerImageUnderstandingSidebarPreview } from "./specialized-preview-view.js";

afterEach(cleanup);

describe("image understanding sidebar preview", () => {
  it("presents the filename above the analysis without the legacy preview heading", async () => {
    const { container } = render(
      <RunnerImageUnderstandingSidebarPreview
        data={{
          imageName: "architecture.png",
          images: [
            {
              path: "/workspace/architecture.png",
              name: "architecture.png",
              url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            },
          ],
          resultText: "Detected an **architecture diagram**.",
        }}
        requestHeaders={new Headers()}
      />,
    );

    expect(screen.queryByText("Image Understanding")).toBeNull();
    const title = screen.getByRole("heading", { level: 2, name: "architecture.png" });
    const analysis = container.querySelector(".tb-image-understanding-markdown");
    expect(analysis).toBeTruthy();
    expect(title.compareDocumentPosition(analysis as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await waitFor(() => {
      expect(container.querySelector("img.tb-image-understanding-preview-image")).toBeTruthy();
    });
  });
});

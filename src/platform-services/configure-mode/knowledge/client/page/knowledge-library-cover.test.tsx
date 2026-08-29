// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_KNOWLEDGE_LIBRARY_COVER,
  KnowledgeLibraryCover,
  withKnowledgeLibraryCoverMetadata,
} from "./knowledge-library-cover.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("KnowledgeLibraryCover", () => {
  it("links a computer image without re-uploading it into the default workspace", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url === "/api/real/environments") {
        return new Response(
          JSON.stringify({
            environments: [{ id: "environment-1", name: "Design Computer" }],
          }),
          { status: 200 },
        );
      }
      if (url === "/api/real/environments/environment-1/files?depth=1") {
        return new Response(
          JSON.stringify({
            files: [
              {
                path: "assets/library-cover.png",
                name: "library-cover.png",
                type: "file",
                mimeType: "image/png",
                size: 1024,
              },
            ],
          }),
          { status: 200 },
        );
      }
      if (url === "/api/real/environments/environment-1/files/download/assets/library-cover.png") {
        return {
          ok: true,
          blob: async () => new Blob(["cover-bytes"], { type: "image/png" }),
        } as Response;
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const onUpload = vi.fn();
    const onChange = vi.fn(async () => undefined);

    render(
      <KnowledgeLibraryCover
        cover={DEFAULT_KNOWLEDGE_LIBRARY_COVER}
        backendUrl="/api/real"
        onUpload={onUpload}
        onChange={onChange}
      />,
    );

    const settingsButton = screen.getByRole("button", { name: "Cover Settings" });
    expect(settingsButton.getAttribute("data-platform-button-variant")).toBe("primary");
    fireEvent.click(settingsButton);
    fireEvent.click(screen.getByRole("menuitem", { name: "From computer" }));
    const explorer = await screen.findByRole("dialog", { name: "Choose cover image" });
    expect(within(explorer).getByText("Computers")).not.toBeNull();
    expect(explorer.querySelector(".tb-file-browser-header-icon")).toBeNull();
    expect(within(explorer).queryByRole("button", { name: "Upload" })).toBeNull();
    expect(within(explorer).queryByRole("button", { name: "Close cover settings" })).toBeNull();
    fireEvent.click(await screen.findByRole("option", { name: /library-cover\.png/ }));
    fireEvent.click(screen.getByRole("button", { name: "Use as Cover" }));

    const cropModal = await screen.findByRole("dialog", { name: "Adjust cover" });
    expect(onChange).not.toHaveBeenCalled();
    const sourcePreview = cropModal.querySelector(
      ".knowledge-library-cover-crop-modal__source-preview",
    );
    expect(sourcePreview).not.toBeNull();
    fireEvent.load(sourcePreview as HTMLImageElement);
    fireEvent.change(within(cropModal).getByRole("slider", { name: "Cover zoom" }), {
      target: { value: "1.25" },
    });
    fireEvent.click(within(cropModal).getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        schemaVersion: "computer_agents_knowledge_cover_v1",
        type: "image",
        src: "/api/real/environments/environment-1/files/download/assets/library-cover.png",
        name: "library-cover.png",
        mimeType: "image/png",
        source: "computer",
        computerId: "environment-1",
        computerPath: "assets/library-cover.png",
        positionX: 50,
        positionY: 50,
        zoom: 1.25,
      });
    });
    expect(onUpload).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("offers the centralized cover actions and removes persisted cover metadata", async () => {
    const onChange = vi.fn(async () => undefined);

    render(
      <KnowledgeLibraryCover
        cover={DEFAULT_KNOWLEDGE_LIBRARY_COVER}
        onUpload={vi.fn()}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cover Settings" }));
    expect(screen.getByRole("menu", { name: "Cover settings" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "From computer" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Upload image" })).not.toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove background" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(null));
    expect(
      withKnowledgeLibraryCoverMetadata(
        { retained: true, knowledgeCover: DEFAULT_KNOWLEDGE_LIBRARY_COVER },
        null,
      ),
    ).toEqual({ retained: true });
  });

  it("uses the centralized loading state until an image cover is ready", () => {
    const { container } = render(
      <KnowledgeLibraryCover
        cover={{
          schemaVersion: "computer_agents_knowledge_cover_v1",
          type: "image",
          src: "/cover.png",
          name: "Cover",
          mimeType: "image/png",
          source: "upload",
          positionX: 32,
          positionY: 68,
          zoom: 1.4,
        }}
        onUpload={vi.fn()}
        onChange={vi.fn(async () => undefined)}
      />,
    );

    const cover = container.querySelector(".knowledge-library-cover");
    expect(cover?.classList.contains("is-image-loading")).toBe(true);
    expect(screen.getByRole("status", { name: "Loading cover image" })).not.toBeNull();
    const image = container.querySelector(".knowledge-library-cover__image") as HTMLImageElement;
    expect(image.style.objectPosition).toBe("32% 68%");
    expect(image.style.transform).toBe("scale(1.4)");

    fireEvent.load(image);
    expect(screen.queryByRole("status", { name: "Loading cover image" })).toBeNull();
  });
});

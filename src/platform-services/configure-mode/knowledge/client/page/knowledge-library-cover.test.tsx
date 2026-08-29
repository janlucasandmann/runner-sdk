// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_KNOWLEDGE_LIBRARY_COVER,
  KnowledgeLibraryCover,
  readKnowledgeLibraryCover,
  withKnowledgeLibraryCoverMetadata,
} from "./knowledge-library-cover.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("KnowledgeLibraryCover", () => {
  it("reads the first-class cover contract while retaining legacy metadata compatibility", () => {
    const cover = {
      schemaVersion: "computer_agents_knowledge_cover_v1",
      type: "image",
      assetId: "knowledge-cover-1",
      src: "/knowledge/library-1/cover/image?asset=knowledge-cover-1",
      name: "cover.webp",
      mimeType: "image/webp",
      source: "upload",
      positionX: 44,
      positionY: 56,
      zoom: 1.2,
    };
    expect(readKnowledgeLibraryCover(cover)).toEqual(cover);
    expect(readKnowledgeLibraryCover({ knowledgeCover: cover })).toEqual(cover);
  });

  it("loads durable cover assets through the authenticated Knowledge proxy", async () => {
    const fetchMock = vi.fn(async () => new Response(
      new Blob(["webp-bytes"], { type: "image/webp" }),
      { status: 200, headers: { "Content-Type": "image/webp" } },
    ));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(
      <KnowledgeLibraryCover
        cover={{
          schemaVersion: "computer_agents_knowledge_cover_v1",
          type: "image",
          assetId: "knowledge-cover-1",
          src: "/knowledge/library-1/cover/image?asset=knowledge-cover-1",
          name: "cover.webp",
          mimeType: "image/webp",
          source: "upload",
          positionX: 50,
          positionY: 50,
          zoom: 1,
        }}
        backendUrl="/api/real"
        requestHeaders={{ "X-Test-Identity": "user-1" }}
        onImageUpload={vi.fn()}
        onChange={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/real/knowledge/library-1/cover/image?asset=knowledge-cover-1",
        expect.objectContaining({
          credentials: "include",
          cache: "force-cache",
          headers: { "X-Test-Identity": "user-1" },
        }),
      );
      expect(container.querySelector(".knowledge-library-cover__image")).not.toBeNull();
    });
    fireEvent.load(container.querySelector(".knowledge-library-cover__image") as HTMLImageElement);
    expect(screen.queryByRole("status", { name: "Loading cover image" })).toBeNull();
  });

  it("uploads a computer image into the durable Knowledge cover store", async () => {
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
    const onImageUpload = vi.fn(async () => undefined);
    const onChange = vi.fn(async () => undefined);

    render(
      <KnowledgeLibraryCover
        cover={DEFAULT_KNOWLEDGE_LIBRARY_COVER}
        backendUrl="/api/real"
        onImageUpload={onImageUpload}
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
      expect(onImageUpload).toHaveBeenCalledWith({
        file: expect.any(Blob),
        filename: "library-cover.png",
        mimeType: "image/png",
        source: "computer",
        computerId: "environment-1",
        computerPath: "assets/library-cover.png",
      }, {
        positionX: 50,
        positionY: 50,
        zoom: 1.25,
      });
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("offers the centralized cover actions and removes persisted cover metadata", async () => {
    const onChange = vi.fn(async () => undefined);

    render(
      <KnowledgeLibraryCover
        cover={DEFAULT_KNOWLEDGE_LIBRARY_COVER}
        onImageUpload={vi.fn()}
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
    const cover = {
      schemaVersion: "computer_agents_knowledge_cover_v1" as const,
      type: "image" as const,
      src: "/cover.png",
      name: "Cover",
      mimeType: "image/png",
      source: "upload" as const,
      positionX: 32,
      positionY: 68,
      zoom: 1.4,
    };
    const { container, rerender } = render(
      <KnowledgeLibraryCover
        cover={cover}
        onImageUpload={vi.fn()}
        onChange={vi.fn(async () => undefined)}
      />,
    );

    const coverElement = container.querySelector(".knowledge-library-cover");
    expect(coverElement?.classList.contains("is-image-loading")).toBe(true);
    expect(screen.getByRole("status", { name: "Loading cover image" })).not.toBeNull();
    const image = container.querySelector(".knowledge-library-cover__image") as HTMLImageElement;
    expect(image.style.objectPosition).toBe("32% 68%");
    expect(image.style.transform).toBe("scale(1.4)");

    fireEvent.load(image);
    expect(screen.queryByRole("status", { name: "Loading cover image" })).toBeNull();

    rerender(
      <KnowledgeLibraryCover
        cover={{ ...cover, positionX: 48, positionY: 52 }}
        onImageUpload={vi.fn()}
        onChange={vi.fn(async () => undefined)}
      />,
    );
    expect(screen.queryByRole("status", { name: "Loading cover image" })).toBeNull();
    expect(
      (container.querySelector(".knowledge-library-cover__image") as HTMLImageElement).style
        .objectPosition,
    ).toBe("48% 52%");
  });

  it("recovers from a transient same-origin image failure", () => {
    const { container } = render(
      <KnowledgeLibraryCover
        cover={{
          schemaVersion: "computer_agents_knowledge_cover_v1",
          type: "image",
          src: "/cover.png",
          name: "Cover",
          mimeType: "image/png",
          source: "upload",
          positionX: 50,
          positionY: 50,
          zoom: 1,
        }}
        onImageUpload={vi.fn()}
        onChange={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.error(container.querySelector(".knowledge-library-cover__image") as HTMLImageElement);

    const retriedImage = container.querySelector(
      ".knowledge-library-cover__image",
    ) as HTMLImageElement;
    expect(retriedImage.getAttribute("src")).toBe("/cover.png?__ca_cover_retry=1");
    expect(screen.getByRole("status", { name: "Loading cover image" })).not.toBeNull();

    fireEvent.load(retriedImage);
    expect(screen.queryByRole("status", { name: "Loading cover image" })).toBeNull();
  });
});

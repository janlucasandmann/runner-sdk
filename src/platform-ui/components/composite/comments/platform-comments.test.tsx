// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformCommentCard } from "./platform-comment-card.js";
import { PlatformCommentComposer } from "./platform-comment-composer.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("platform comments", () => {
  it("ships the shared stylesheet through development and production assets", () => {
    const stylesheetSpecifier = "src/platform-ui/components/composite/comments/comments.css";
    const developmentAssetSource = readFileSync(
      resolve(process.cwd(), "apps/platform/shared/development-style-resolution.mjs"),
      "utf8",
    );
    const productionAssetSource = readFileSync(
      resolve(process.cwd(), "scripts/runner-chat-assets.mjs"),
      "utf8",
    );

    expect(developmentAssetSource).toContain(stylesheetSpecifier);
    expect(productionAssetSource).toMatch(
      /const platformCommentsCssPath[\s\S]*?"comments",[\s\S]*?"comments\.css"/,
    );
    expect(productionAssetSource).toMatch(
      /fs\.writeFile\(\s*distPlatformCommentsCssPath,\s*platformCommentsCssText,/,
    );
    expect(productionAssetSource).toMatch(
      /distPlatformPagesCssPath,[\s\S]*?\$\{platformCommentsCssText\}/,
    );
  });

  it("submits controlled comment text through the shared composer", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformCommentComposer
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          allowAttachments
        />
      );
    }

    render(<Example />);
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Shared comment");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith([]));
  });

  it("uses one shared card for comments, replies, and owner actions", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    render(
      <PlatformCommentCard
        author="Jan"
        timestamp="Now"
        content="Project update comment"
        replies={[
          {
            id: "reply",
            author: "Andrea",
            content: "Reply",
          },
        ]}
        replyComposer={{ onSubmit: onReply }}
        actions={{
          editableValue: "Project update comment",
          onEdit,
        }}
      />,
    );

    expect(screen.getByText("Reply")).not.toBeNull();
    const replyInput = screen.getByRole("textbox", { name: "Reply" });
    await user.type(replyInput, "Nested reply");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(onReply).toHaveBeenCalledWith("Nested reply"));
    await user.click(screen.getByRole("button", { name: "Comment actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    const editor = screen.getByRole("textbox", { name: "Edit comment" });
    await user.clear(editor);
    await user.type(editor, "Updated");
    await user.click(screen.getByRole("button", { name: "Save comment" }));
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith("Updated"));
  });
});

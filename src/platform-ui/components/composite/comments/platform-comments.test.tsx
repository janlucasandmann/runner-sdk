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
    const componentStyles = readFileSync(
      resolve(process.cwd(), stylesheetSpecifier),
      "utf8",
    );
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
    expect(componentStyles).toMatch(
      /\.platform-mention-suggestions__avatar\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px;/,
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

  it("locks selected mentions into inline identity tokens and submits structured data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformCommentComposer
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          mentionOptions={[
            {
              kind: "agent",
              id: "agent-spark",
              label: "Spark",
              description: "Project agent",
              avatar: <img src="/spark.png" alt="" />,
            },
          ]}
        />
      );
    }

    render(<Example />);
    const input = screen.getByRole("textbox", { name: "Comment" });
    await user.type(input, "@Spa");
    expect(screen.getByRole("listbox", { name: "Mention people or agents" }).className)
      .toContain("tb-composer-suggestion-popup");
    await user.click(screen.getByRole("option", { name: /Spark/ }));
    expect((input as HTMLTextAreaElement).value).toBe("");
    expect(screen.queryByRole("listbox", { name: "Mention people or agents" })).toBeNull();
    const selectedMentions = screen.getByRole("group", { name: "Selected mentions" });
    expect(selectedMentions.parentElement?.className).toContain(
      "platform-comment-composer__input-shell",
    );
    expect(screen.getByRole("button", { name: "Remove Spark mention" })).not.toBeNull();
    await user.type(input, "please review this");
    expect(screen.queryByRole("listbox", { name: "Mention people or agents" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith([], [
      { kind: "agent", id: "agent-spark", label: "Spark" },
    ], "@Spark please review this"));
  });

  it("removes the last locked mention with Backspace before comment text", async () => {
    const user = userEvent.setup();

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformCommentComposer
          value={value}
          onChange={setValue}
          onSubmit={vi.fn()}
          mentionOptions={[{
            kind: "human",
            id: "user-simone",
            label: "Simone",
          }]}
        />
      );
    }

    render(<Example />);
    const input = screen.getByRole("textbox", { name: "Comment" });
    await user.type(input, "@Sim");
    await user.click(screen.getByRole("option", { name: "Simone" }));
    expect(screen.getByRole("button", { name: "Remove Simone mention" })).not.toBeNull();

    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(screen.queryByRole("group", { name: "Selected mentions" })).toBeNull();
  });

  it("locks an exact mention when the author continues with a message", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformCommentComposer
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          mentionOptions={[{
            kind: "agent",
            id: "agent-spark",
            label: "Spark",
          }]}
        />
      );
    }

    render(<Example />);
    const input = screen.getByRole("textbox", { name: "Comment" });
    await user.type(input, "@Spark please investigate");

    expect((input as HTMLTextAreaElement).value).toBe("please investigate");
    expect(screen.getByRole("button", { name: "Remove Spark mention" })).not.toBeNull();
    expect(screen.queryByRole("listbox", { name: "Mention people or agents" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Add comment" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith([], [
      { kind: "agent", id: "agent-spark", label: "Spark" },
    ], "@Spark please investigate"));
  });

  it("does not reload mention candidates when only the parent callback identity changes", async () => {
    const user = userEvent.setup();
    const firstRequest = vi.fn();
    const secondRequest = vi.fn();

    function Example({ onQuery }: { onQuery: (query: string | null) => void }) {
      const [value, setValue] = useState("");
      return (
        <PlatformCommentComposer
          value={value}
          onChange={setValue}
          onSubmit={vi.fn()}
          onMentionQueryChange={onQuery}
        />
      );
    }

    const view = render(<Example onQuery={firstRequest} />);
    const input = screen.getByRole("textbox", { name: "Comment" });
    await user.type(input, "@");
    await waitFor(() => expect(firstRequest).toHaveBeenCalledWith(""));

    view.rerender(<Example onQuery={secondRequest} />);
    await Promise.resolve();
    expect(secondRequest).not.toHaveBeenCalled();
  });

  it("renders every mention candidate as a compact identity row with a manage-access footer", async () => {
    const user = userEvent.setup();
    const onManage = vi.fn();
    const options = Array.from({ length: 18 }, (_, index) => ({
      kind: index % 2 === 0 ? "human" as const : "agent" as const,
      id: `mention-${index}`,
      label: `Member ${index + 1}`,
      description: `Hidden subtitle ${index + 1}`,
      avatar: <img src={`/member-${index + 1}.png`} alt="" />,
    }));

    function Example() {
      const [value, setValue] = useState("");
      return (
        <PlatformCommentComposer
          value={value}
          onChange={setValue}
          onSubmit={vi.fn()}
          mentionOptions={options}
          mentionManageLabel="Manage Access"
          onMentionManage={onManage}
        />
      );
    }

    render(<Example />);
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "@");

    expect(screen.getAllByRole("option")).toHaveLength(18);
    expect(screen.queryByText("Hidden subtitle 1")).toBeNull();
    expect(screen.queryByText("Human")).toBeNull();
    expect(screen.queryByText("Agent")).toBeNull();
    const firstAvatar = screen.getByRole("option", { name: "Member 1" })
      .querySelector(".platform-mention-suggestions__avatar");
    expect(firstAvatar).not.toBeNull();
    expect(firstAvatar?.className).toContain("platform-mention-suggestions__avatar");

    await user.click(screen.getByRole("button", { name: "Manage Access" }));
    expect(onManage).toHaveBeenCalledTimes(1);
  });

  it("focuses a comment textarea as soon as an opened composer mounts", async () => {
    const user = userEvent.setup();

    function Example() {
      const [open, setOpen] = useState(false);
      const [value, setValue] = useState("");
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Comment</button>
          {open ? (
            <PlatformCommentComposer
              value={value}
              onChange={setValue}
              onSubmit={vi.fn()}
              ariaLabel="Timeline event comment"
              autoFocus
            />
          ) : null}
        </>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Comment" }));
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Timeline event comment" }),
    );
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

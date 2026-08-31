// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformActivityTimeline } from "./platform-activity-timeline.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformActivityTimeline", () => {
  it("renders activity in the provided chronological order", () => {
    const html = renderToStaticMarkup(
      <PlatformActivityTimeline
        items={[
          {
            id: "created",
            summary: "Created",
            trailing: <span>Completed</span>,
            timestamp: "2h ago",
          },
          {
            id: "comment",
            summary: "Commented",
            content: "Done",
            timestamp: "1h ago",
            avatar: <img src="/avatar.jpg" alt="" />,
          },
        ]}
        composer={{
          value: "",
          onChange: () => undefined,
          onSubmit: () => undefined,
          allowAttachments: true,
        }}
      />,
    );

    expect(html.indexOf("Created")).toBeLessThan(html.indexOf("Commented"));
    expect(html).toContain("Completed");
    expect(html).toContain("platform-activity-timeline__trailing");
    expect(html).toContain("platform-comment-card__avatar");
    expect(html).toContain("platform-comment-composer");
    expect(html).toContain('aria-label="Attach files"');
    expect(html).toContain("hugeicons-paperclip");
    expect(html).toContain("hugeicons-arrow-up");
  });

  it("supports a timeline without a composer", () => {
    const html = renderToStaticMarkup(
      <PlatformActivityTimeline items={[{ id: "created", summary: "Created" }]} />,
    );

    expect(html).not.toContain("platform-comment-composer");
  });

  it("supports a selectable list and preview inspector layout", async () => {
    const user = userEvent.setup();

    render(
      <PlatformActivityTimeline
        layout="inspector"
        title="Activity"
        titleActions={<button type="button">Filter activity</button>}
        headerActions={<input aria-label="Search activity" />}
        listFooter={<button type="button">Show more activity</button>}
        inspectorTitle="Inspector"
        items={[
          {
            id: "created",
            summary: "Created the issue",
            preview: <div>Created event details</div>,
            inspectorAction: <button type="button">Open created event</button>,
          },
          {
            id: "status",
            summary: "Moved to In Progress",
            preview: <div>Status event details</div>,
            inspectorAction: <button type="button">Open status event</button>,
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Activity" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Filter activity" })).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Search activity" })).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Show more activity" }),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Show more activity" })
        .closest(".platform-activity-timeline__list-pane"),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Inspector" })).not.toBeNull();
    expect(screen.getByText("Created event details")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Open created event" }),
    ).not.toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Inspect activity status" }),
    );

    expect(screen.getByText("Status event details")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Open status event" }),
    ).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Open created event" }),
    ).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Inspect activity status" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("renders comment replies and a compact reply composer", () => {
    const html = renderToStaticMarkup(
      <PlatformActivityTimeline
        items={[
          {
            id: "comment",
            summary: "Jan",
            content: "Parent comment",
            replies: [
              {
                id: "reply",
                author: "Andrea",
                timestamp: "Now",
                content: "Reply body",
              },
            ],
            replyComposer: {
              onSubmit: () => undefined,
            },
          },
        ]}
      />,
    );

    expect(html).toContain("platform-comment-card__reply-list");
    expect(html).toContain("Reply body");
    expect(html).toContain("platform-comment-reply-composer");
    expect(html).toContain("Leave a reply...");
    expect(html.indexOf("Reply body")).toBeLessThan(html.indexOf("Leave a reply..."));
    expect(html.match(/class="platform-comment-reply-composer"/g)).toHaveLength(1);
  });

  it("exposes owner actions without rendering another always-visible toolbar", () => {
    const html = renderToStaticMarkup(
      <PlatformActivityTimeline
        items={[
          {
            id: "comment",
            summary: "Jan",
            content: "Editable comment",
            actions: {
              editableValue: "Editable comment",
              onEdit: () => undefined,
              onDelete: () => undefined,
            },
          },
        ]}
      />,
    );

    expect(html).toContain("has-actions");
    expect(html).toContain('aria-label="Comment actions"');
    expect(html).toContain("hugeicons-ellipsis");
    expect(html).not.toContain("platform-activity-timeline__edit-form");
  });

  it("edits an actionable comment inline", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn().mockResolvedValue(undefined);

    render(
      <PlatformActivityTimeline
        items={[
          {
            id: "comment",
            summary: "Jan",
            content: "Original comment",
            actions: {
              editableValue: "Original comment",
              onEdit,
            },
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Comment actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    const editor = screen.getByRole("textbox", { name: "Edit comment" });
    await user.clear(editor);
    await user.type(editor, "Updated comment");
    await user.click(screen.getByRole("button", { name: "Save comment" }));

    await waitFor(() => expect(onEdit).toHaveBeenCalledWith("Updated comment"));
    expect(screen.queryByRole("textbox", { name: "Edit comment" })).toBeNull();
  });

  it("confirms before deleting an actionable comment", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <PlatformActivityTimeline
        items={[
          {
            id: "comment",
            summary: "Jan",
            content: "Delete me",
            actions: {
              editableValue: "Delete me",
              onDelete,
            },
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Comment actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(screen.getByRole("alertdialog")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledOnce());
  });

  it("places rich-content entries in the full timeline column", () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        "src/platform-ui/components/composite/activity-timeline/activity-timeline.css",
      ),
      "utf8",
    );
    const commentsCss = readFileSync(
      resolve(
        process.cwd(),
        "src/platform-ui/components/composite/comments/comments.css",
      ),
      "utf8",
    );

    expect(css).toMatch(
      /\.platform-activity-timeline__item\.has-content\s*\{\s*grid-template-columns: minmax\(0, 1fr\);/,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-card\s*\{[^}]*border: 1px solid rgba\(255, 255, 255, 0\.075\);[^}]*border-radius: var\(--platform-comment-card-radius, 15px\);[^}]*background: rgba\(255, 255, 255, 0\.075\);/s,
    );
    expect(css).toMatch(
      /\.platform-activity-timeline__list\s*\{[^}]*gap: 12px;/s,
    );
    expect(css).toMatch(
      /\.platform-activity-timeline__marker\s*\{[^}]*background: transparent;/s,
    );
    expect(css).not.toContain("platform-activity-timeline__connector");
    expect(css).toMatch(
      /\.platform-activity-timeline__meta\s*\{[^}]*align-items: center;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-card__replies\s*\{[^}]*width: calc\(100% \+ 32px\);[^}]*margin: 14px -16px -14px;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-card__reply \+ \.platform-comment-card__reply\s*\{[^}]*border-top:/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-composer\s*\{[^}]*border-radius: var\(--platform-comment-composer-radius, 15px\);[^}]*background: rgba\(255, 255, 255, 0\.075\);/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-composer__actions\s*\{[^}]*position: absolute;[^}]*right: 12px;[^}]*bottom: 12px;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-composer__actions \.platform-icon-button\s*\{[^}]*border-radius: 50%;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-composer__submit\.platform-icon-button:disabled\s*\{[^}]*background: rgba\(255, 255, 255, 0\.075\) !important;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-composer__submit\.platform-icon-button\s*\{[^}]*background: rgba\(255, 255, 255, 0\.15\) !important;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-reply-composer__submit\.platform-icon-button,\s*\.platform-comment-composer__submit\.platform-icon-button\s*\{[^}]*background: rgba\(255, 255, 255, 0\.15\) !important;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-reply-composer__submit\.platform-icon-button:disabled,\s*\.platform-comment-composer__submit\.platform-icon-button:disabled\s*\{[^}]*background: rgba\(255, 255, 255, 0\.075\) !important;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-composer__input\s*\{[^}]*min-height: 48px;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-card__actions\.platform-popup-anchor\s*\{[^}]*opacity: 0;[^}]*visibility: hidden;[^}]*pointer-events: none;/s,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-card\.has-actions:hover[\s\S]*?opacity: 1;[\s\S]*?visibility: visible;[\s\S]*?pointer-events: auto;/,
    );
    expect(commentsCss).toMatch(
      /\.platform-comment-card__edit-input\s*\{[^}]*width: 100%;[^}]*resize: none;/s,
    );
  });
});

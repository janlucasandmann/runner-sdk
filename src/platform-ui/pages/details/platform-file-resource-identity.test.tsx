// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformFileResourceIdentity } from "./platform-file-resource-identity.js";

afterEach(cleanup);

describe("PlatformFileResourceIdentity", () => {
  it("centralizes the editable icon, title, and description header", () => {
    const onTitleChange = vi.fn();
    const onDescriptionChange = vi.fn();
    const { container } = render(
      <PlatformFileResourceIdentity
        icon={<button type="button">Change icon</button>}
        title="Build Computer"
        description="Build and test software"
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        titleAriaLabel="Computer name"
        descriptionAriaLabel="Computer description"
      />,
    );

    expect(
      container.querySelector("[data-platform-file-resource-identity='true']"),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: "Change icon" })).not.toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Computer name" }), {
      target: { value: "Runtime Computer" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Computer description" }), {
      target: { value: "Runs builds" },
    });

    expect(onTitleChange).toHaveBeenCalledWith("Runtime Computer");
    expect(onDescriptionChange).toHaveBeenCalledWith("Runs builds");
  });
});

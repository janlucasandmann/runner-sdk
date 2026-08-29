// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { LibraryBig } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
import { PlatformDataTable } from "../../components/composite/data-table/index.js";
import { createResourceOverviewColumns } from "./resource-overview-columns.js";
import { ResourceOverviewValue } from "./resource-overview-cells.js";

afterEach(cleanup);

describe("createResourceOverviewColumns", () => {
  it("preserves the standard columns around typed extension columns", () => {
    const rows = [{
      id: "library-1",
      name: "Product handbook",
      description: "Shared product decisions.",
      creatorName: "Jane Doe",
      creatorAvatarUrl: "/jane.png",
      updatedAt: "2026-08-29T10:00:00.000Z",
      documentCount: 4,
    }];
    const columns = createResourceOverviewColumns<(typeof rows)[number]>({
      name: {
        getVisual: () => ({
          icon: <LibraryBig width={16} height={16} />,
          iconClassName: "is-skill",
        }),
      },
      extensions: {
        afterName: [{
          id: "documents",
          header: "Documents",
          accessor: "documentCount",
          cell: ({ row }) => <ResourceOverviewValue>{row.documentCount}</ResourceOverviewValue>,
        }],
      },
    });

    const { container } = render(
      <PlatformDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Libraries"
      />,
    );

    expect(
      within(screen.getByRole("table", { name: "Libraries" }))
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Name", "Documents", "Creator", "Updated"]);
    expect(screen.getByText("Shared product decisions.")).not.toBeNull();
    expect(screen.getByText("Jane Doe")).not.toBeNull();
    expect(container.querySelector('img[src="/jane.png"]')).not.toBeNull();
    expect(container.querySelector(".lucide-library-big")).not.toBeNull();
    expect(screen.getByText(/2026/)).not.toBeNull();
  });
});

// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { LibraryBig } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlatformDataTable } from "../../components/composite/data-table/index.js";
import { ResourceOverviewValue } from "./resource-overview-cells.js";
import { createResourceOverviewColumns } from "./resource-overview-columns.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-30T16:00:00.000Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("createResourceOverviewColumns", () => {
  it("preserves the standard columns around typed extension columns", () => {
    const rows = [
      {
        id: "library-1",
        name: "Product handbook",
        description: "Shared product decisions.",
        creatorName: "Jane Doe",
        creatorAvatarUrl: "/jane.png",
        updatedAt: "2026-08-29T10:00:00.000Z",
        documentCount: 4,
      },
    ];
    const columns = createResourceOverviewColumns<(typeof rows)[number]>({
      name: {
        getVisual: () => ({
          icon: <LibraryBig width={16} height={16} />,
          iconClassName: "is-skill",
        }),
      },
      extensions: {
        afterName: [
          {
            id: "documents",
            header: "Documents",
            accessor: "documentCount",
            cell: ({ row }) => <ResourceOverviewValue>{row.documentCount}</ResourceOverviewValue>,
          },
        ],
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
    expect(
      container.querySelector(
        ".resource-overview-standard-name-cell .resource-overview-identity__visual.is-standard-name",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".resource-overview-standard-creator-cell .resource-overview-identity__visual.is-standard-creator",
      ),
    ).not.toBeNull();
    expect(screen.getByText(/Yesterday,/)).not.toBeNull();
  });

  it("supports canonical creator cells for catalogs with derived identity fields", () => {
    const rows = [{
      id: "skill-1",
      name: "Browser",
      legacyCreatorName: "Computer Agents",
      legacyCreatorAvatarUrl: "/computer-agents.png",
      updatedAt: "2026-08-29T10:00:00.000Z",
    }];
    const columns = createResourceOverviewColumns<(typeof rows)[number]>({
      name: {
        getVisual: () => ({ icon: <LibraryBig width={16} height={16} /> }),
      },
      creator: {
        getName: (row) => row.legacyCreatorName,
        getAvatarUrl: (row) => row.legacyCreatorAvatarUrl,
      },
    });

    const { container } = render(
      <PlatformDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Skills"
      />,
    );

    expect(screen.getByText("Computer Agents")).not.toBeNull();
    expect(container.querySelector('img[src="/computer-agents.png"]')).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-creator-cell")).not.toBeNull();
  });

  it("pins the Knowledge-style visuals to semantic cell classes instead of page classes", () => {
    const styles = readFileSync(
      join(process.cwd(), "src/platform-ui/pages/overview/resource-overview.css"),
      "utf8",
    );

    expect(styles).toMatch(
      /\.resource-overview-identity__visual\.is-standard-name\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.1\);/,
    );
    expect(styles).toMatch(
      /\.resource-overview-identity__visual\.is-standard-creator\s*\{[\s\S]*?width:\s*26px;[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*50%;[\s\S]*?background:\s*transparent;/,
    );
  });
});

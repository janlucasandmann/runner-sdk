import { describe, expect, it, vi } from "vitest";

import { createEvidenceAgentsRepository } from "./evidence-agents-repository.js";

describe("Evidence Agents repository", () => {
  it("discovers only Equal Care services and uses the permission-checked proxy", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: "srv_equal_care",
            name: "Equal Care",
            metadata: {
              useCase: "equal-care",
              service: "full-text-acquisition",
            },
          },
          {
            id: "srv_other",
            name: "Other function",
            metadata: { useCase: "other" },
          },
        ],
      })
      .mockResolvedValueOnce({ pending_reviews: 2 })
      .mockResolvedValueOnce({ object: "list", data: [] })
      .mockResolvedValueOnce({ review_task_id: "REVIEW_1" });
    const post = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, outcome: "promoted" })
      .mockResolvedValueOnce({ ok: true, outcome: "rejected" });
    const repository = createEvidenceAgentsRepository({ get, post });

    await expect(repository.listServices()).resolves.toHaveLength(1);
    await repository.getOverview("srv / equal");
    await repository.listReviews("srv / equal", {
      status: "open,in_review",
      query: "fatigue",
      limit: 50,
    });
    await repository.getReview("srv / equal", "REVIEW / 1");
    await repository.approveReview("srv / equal", "REVIEW / 1", {
      rationale: "The exact source span supports this finding.",
      candidate_patch: {
        normalized_statement: "Fatigue was more frequent in women.",
        direction: "increase",
      },
    });
    await repository.rejectReview("srv / equal", "REVIEW / 1", {
      rationale: "The comparator is not supported by the source text.",
    });

    expect(get).toHaveBeenNthCalledWith(
      2,
      "/api/real/evidence-agents/srv%20%2F%20equal/overview",
      { signal: undefined },
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      "/api/real/evidence-agents/srv%20%2F%20equal/reviews/REVIEW%20%2F%201",
      { signal: undefined },
    );
    expect(post).toHaveBeenNthCalledWith(
      1,
      "/api/real/evidence-agents/srv%20%2F%20equal/reviews/REVIEW%20%2F%201/approve",
      expect.objectContaining({
        rationale: "The exact source span supports this finding.",
      }),
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/api/real/evidence-agents/srv%20%2F%20equal/reviews/REVIEW%20%2F%201/reject",
      {
        rationale: "The comparator is not supported by the source text.",
      },
    );
  });

  it("rejects blank resource identifiers before issuing a request", () => {
    const get = vi.fn();
    const repository = createEvidenceAgentsRepository({
      get,
      post: vi.fn(),
    });
    expect(() => repository.getOverview(" ")).toThrow("Evidence service id is required");
    expect(get).not.toHaveBeenCalled();
  });
});

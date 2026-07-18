// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ApiKeyRepository } from "../api/api-key-repository.js";
import { useApiKeyManagement } from "./use-api-key-management.js";

function createRepository(overrides: Partial<ApiKeyRepository> = {}): ApiKeyRepository {
  return {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({
      id: "key_created",
      key: "tb_created",
      record: {},
    }),
    reveal: vi.fn().mockResolvedValue("tb_revealed"),
    revoke: vi.fn().mockResolvedValue(undefined),
    readAnalytics: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useApiKeyManagement", () => {
  it("commits a successful creation before reporting a refresh failure", async () => {
    const repository = createRepository();
    const onChanged = vi.fn().mockRejectedValue(new Error("Refresh failed"));
    const onRefreshError = vi.fn();
    const { result } = renderHook(() =>
      useApiKeyManagement({
        repository,
        onChanged,
        onRefreshError,
      }),
    );

    act(() => result.current.openCreate());

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.submitCreate({
        name: "  CI key  ",
        permissions: ["threads:read"],
      });
    });

    expect(succeeded).toBe(true);
    expect(repository.create).toHaveBeenCalledOnce();
    expect(repository.create).toHaveBeenCalledWith({
      name: "CI key",
      permissions: ["threads:read"],
    });
    expect(result.current.createOpen).toBe(false);
    expect(result.current.created).toMatchObject({
      id: "key_created",
      key: "tb_created",
    });
    expect(onRefreshError).toHaveBeenCalledWith("Refresh failed");
  });

  it("keeps revealed secrets in memory and avoids duplicate reveal requests", async () => {
    const reveal = vi.fn().mockResolvedValue("tb_revealed");
    const repository = createRepository({ reveal });
    const { result } = renderHook(() =>
      useApiKeyManagement({
        repository,
        onChanged: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.openReveal({ id: "key_1", name: "Automation" });
    });

    expect(result.current.reveal).toMatchObject({
      id: "key_1",
      key: "tb_revealed",
      loading: false,
    });

    act(() => result.current.closeReveal());
    await act(async () => {
      await result.current.openReveal({ id: "key_1", name: "Automation" });
    });

    expect(result.current.reveal).toMatchObject({
      id: "key_1",
      key: "tb_revealed",
      loading: false,
    });
    expect(reveal).toHaveBeenCalledOnce();
  });

  it("aborts an in-flight reveal when its dialog closes", async () => {
    let requestSignal: AbortSignal | undefined;
    const reveal = vi.fn((_keyId: string, signal?: AbortSignal) => {
      requestSignal = signal;
      return new Promise<string>(() => {});
    });
    const repository = createRepository({ reveal });
    const { result, unmount } = renderHook(() =>
      useApiKeyManagement({
        repository,
        onChanged: vi.fn(),
      }),
    );

    act(() => {
      void result.current.openReveal({ id: "key_1", name: "Automation" });
    });
    expect(requestSignal?.aborted).toBe(false);

    act(() => result.current.closeReveal());

    expect(requestSignal?.aborted).toBe(true);
    expect(result.current.reveal).toBeNull();
    unmount();
  });
});

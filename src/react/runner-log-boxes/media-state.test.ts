import { describe, expect, it } from "vitest";

import type { RunnerLog } from "../../types.js";
import {
  extractImagePrompt,
  extractImageUnderstandingImagePaths,
  extractVideoPrompt,
  isLikelyImageGenerationLog,
  isLikelyVideoGenerationLog,
} from "./media-state.js";

describe("runner media log state", () => {
  it("classifies explicit image generation logs", () => {
    const log = {
      eventType: "mcp_tool_call",
      message: "Generated image saved to: /workspace/art.png",
      metadata: {
        command: "python generate-image.py",
        savedImagePath: "art.png",
      },
    } as RunnerLog;
    expect(isLikelyImageGenerationLog(log, log.metadata?.command)).toBe(true);
  });

  it("requires an explicit source for video classification", () => {
    expect(
      isLikelyVideoGenerationLog({
        eventType: "file_change",
        message: "video saved to: clip.mp4",
        metadata: {},
      } as RunnerLog),
    ).toBe(false);
    expect(
      isLikelyVideoGenerationLog({
        eventType: "video_generation",
        message: "video saved to: clip.mp4",
        metadata: {},
      } as unknown as RunnerLog),
    ).toBe(true);
  });

  it("extracts prompts without output metadata", () => {
    expect(
      extractImagePrompt('python generate-image.py "a blue house" out.png'),
    ).toBe("a blue house");
    expect(
      extractVideoPrompt("Generating video: a bird in flight...\nSize: 720P"),
    ).toBe("a bird in flight");
  });

  it("deduplicates image-understanding paths", () => {
    const log = {
      eventType: "command_execution",
      message: "",
      metadata: {
        imagePaths: ["/workspace/a.png", "/workspace/a.png"],
      },
    } as unknown as RunnerLog;
    expect(
      extractImageUnderstandingImagePaths(
        log,
        "view-image.py /workspace/a.png",
      ),
    ).toEqual(["/workspace/a.png"]);
  });
});

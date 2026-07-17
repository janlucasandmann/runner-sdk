import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";

export function getSourceSha256(source) {
  return crypto
    .createHash("sha256")
    .update(String(source ?? ""))
    .digest("hex");
}

export async function assertLegacyBrowserSourceContract({
  label,
  source,
  expectedSha256,
  fragmentGroups,
  maxFragmentLines,
}) {
  assert.equal(
    getSourceSha256(source),
    expectedSha256,
    `${label} changed byte-for-byte. Update the compatibility fixture only after reviewing the assembled browser source.`,
  );

  for (const { baseUrl, paths } of fragmentGroups) {
    assert.ok(
      Array.isArray(paths) && paths.length > 1,
      `${label} must remain decomposed into an ordered fragment manifest.`,
    );
    for (const relativePath of paths) {
      const fragmentUrl = new URL(relativePath, baseUrl);
      const fragmentSource = await fs.readFile(fragmentUrl, "utf8");
      const fragmentLines = fragmentSource.split("\n").length;
      assert.ok(
        fragmentLines <= maxFragmentLines,
        `${label} fragment ${relativePath} exceeded ${maxFragmentLines} lines (${fragmentLines}).`,
      );
    }
  }
}

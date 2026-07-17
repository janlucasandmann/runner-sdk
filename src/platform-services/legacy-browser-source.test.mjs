import assert from "node:assert/strict";

import {
  flattenLegacyBrowserSourceBindings,
  joinLegacyBrowserSourceFragments,
  renderLegacyBrowserSourceTemplate,
} from "./legacy-browser-source.mjs";

assert.equal(
  joinLegacyBrowserSourceFragments(["first", "", "second"]),
  "firstsecond",
);
assert.deepEqual(
  flattenLegacyBrowserSourceBindings(
    { comments: "comment source", nested: { view: "view source" } },
    "CALENDAR",
  ),
  {
    "CALENDAR.comments": "comment source",
    "CALENDAR.nested.view": "view source",
  },
);
assert.equal(
  renderLegacyBrowserSourceTemplate(
    "before ${CALENDAR.comments} after",
    { "CALENDAR.comments": "value with $& kept" },
  ),
  "before value with $& kept after",
);
assert.throws(
  () => renderLegacyBrowserSourceTemplate("${MISSING.value}", {}),
  /Missing legacy browser-source binding/,
);

console.log("Legacy browser-source composition contracts passed.");

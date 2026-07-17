import assert from "node:assert/strict";

import {
  flattenLegacySourceBindings,
  renderLegacySourceTemplate,
} from "./source-template.mjs";

const flattened = flattenLegacySourceBindings({
  DOMAIN: {
    state: "const state = true;",
    nested: {
      view: "return state;",
    },
  },
});

assert.deepEqual(flattened, {
  "DOMAIN.state": "const state = true;",
  "DOMAIN.nested.view": "return state;",
});
assert.equal(
  renderLegacySourceTemplate(
    "${DOMAIN.state}\n${DOMAIN.nested.view}",
    flattened,
  ),
  "const state = true;\nreturn state;",
);
assert.throws(
  () => renderLegacySourceTemplate("${DOMAIN.missing}", flattened),
  /Missing legacy source-template binding/,
);

console.log("Legacy source-template composition contracts passed.");

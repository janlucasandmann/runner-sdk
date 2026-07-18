import fs from "node:fs";

import {
  PLATFORM_COMPATIBILITY_BINDING_COUNT,
  createPlatformCompatibilityTemplateBindings,
} from "./templates/template-bindings.mjs";

const PLATFORM_COMPATIBILITY_BINDING_PATTERN =
  /__PLATFORM_COMPATIBILITY_BINDING_(\d{3})__/g;

function readTemplate(filename) {
  return fs.readFileSync(new URL(`./templates/${filename}`, import.meta.url), "utf8");
}

const PLATFORM_DOCUMENT_TEMPLATE = readTemplate(
  "platform-shell.template.html",
);
const PLATFORM_STYLE_TEMPLATE = readTemplate(
  "platform-compatibility.template.css",
);
const PLATFORM_MODULE_TEMPLATE = readTemplate(
  "platform-compatibility.template.js",
);

function renderCompatibilityTemplate(
  template,
  bindings,
  consumedBindingIndexes,
  label,
) {
  const rendered = template.replace(
    PLATFORM_COMPATIBILITY_BINDING_PATTERN,
    (token, rawIndex) => {
      const index = Number(rawIndex);
      if (!Number.isInteger(index) || index < 0 || index >= bindings.length) {
        throw new Error(`${label} references unknown binding ${token}.`);
      }
      consumedBindingIndexes.add(index);
      return String(bindings[index]);
    },
  );

  if (PLATFORM_COMPATIBILITY_BINDING_PATTERN.test(rendered)) {
    PLATFORM_COMPATIBILITY_BINDING_PATTERN.lastIndex = 0;
    throw new Error(`${label} contains an unresolved compatibility binding.`);
  }
  PLATFORM_COMPATIBILITY_BINDING_PATTERN.lastIndex = 0;
  return rendered;
}

/**
 * Composes the quarantined compatibility program as explicit source assets.
 *
 * The server receives an HTML shell, stylesheet, and browser module directly;
 * it never generates a monolithic inline document or parses assets back out of
 * HTML. New platform routes belong in the typed Vite client.
 */
export function createLegacyPlatformSources(bindings) {
  const templateBindings =
    createPlatformCompatibilityTemplateBindings(bindings);
  if (templateBindings.length !== PLATFORM_COMPATIBILITY_BINDING_COUNT) {
    throw new Error(
      "Platform compatibility binding count does not match its templates.",
    );
  }

  const consumedBindingIndexes = new Set();
  const documentTemplate = renderCompatibilityTemplate(
    PLATFORM_DOCUMENT_TEMPLATE,
    templateBindings,
    consumedBindingIndexes,
    "Platform document template",
  );
  const styleSource = renderCompatibilityTemplate(
    PLATFORM_STYLE_TEMPLATE,
    templateBindings,
    consumedBindingIndexes,
    "Platform style template",
  );
  const moduleSource = renderCompatibilityTemplate(
    PLATFORM_MODULE_TEMPLATE,
    templateBindings,
    consumedBindingIndexes,
    "Platform module template",
  );

  if (consumedBindingIndexes.size !== PLATFORM_COMPATIBILITY_BINDING_COUNT) {
    const missingIndexes = Array.from(
      { length: PLATFORM_COMPATIBILITY_BINDING_COUNT },
      (_value, index) => index,
    ).filter((index) => !consumedBindingIndexes.has(index));
    throw new Error(
      `Platform compatibility templates do not consume bindings: ${missingIndexes.join(", ")}.`,
    );
  }

  return Object.freeze({
    documentTemplate,
    styleSource,
    moduleSource,
  });
}

/**
 * Joins quarantined legacy browser-source fragments without adding separators.
 * The explicit manifest order is the compatibility contract.
 */
export function joinLegacyBrowserSourceFragments(fragments) {
  if (!Array.isArray(fragments)) {
    throw new TypeError("Legacy browser-source fragments must be an array.");
  }
  return fragments.map((fragment) => String(fragment ?? "")).join("");
}

/**
 * Resolves named `${BINDING.path}` placeholders without evaluating source.
 * Replacements use a callback so `$` sequences inside injected source remain
 * byte-for-byte intact.
 */
export function renderLegacyBrowserSourceTemplate(source, replacements) {
  const values = new Map(Object.entries(replacements || {}));
  const rendered = String(source || "").replace(
    /\$\{([A-Z][A-Za-z0-9_.]*)\}/g,
    (match, key) => {
      if (!values.has(key)) {
        throw new Error(
          `Missing legacy browser-source binding: ${key}`,
        );
      }
      return String(values.get(key) ?? "");
    },
  );
  const unresolved = rendered.match(/\$\{([A-Z][A-Za-z0-9_.]*)\}/);
  if (unresolved) {
    throw new Error(
      `Unresolved legacy browser-source binding: ${unresolved[1]}`,
    );
  }
  return rendered;
}

export function flattenLegacyBrowserSourceBindings(
  value,
  prefix = "",
  target = {},
) {
  if (
    typeof value === "string"
    || typeof value === "number"
    || typeof value === "boolean"
  ) {
    if (prefix) target[prefix] = value;
    return target;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return target;
  }
  for (const [key, child] of Object.entries(value)) {
    flattenLegacyBrowserSourceBindings(
      child,
      prefix ? `${prefix}.${key}` : key,
      target,
    );
  }
  return target;
}

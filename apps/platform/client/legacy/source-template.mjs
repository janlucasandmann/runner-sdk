export function renderLegacySourceTemplate(source, replacements) {
  const values = new Map(Object.entries(replacements || {}));
  const rendered = String(source || "").replace(
    /\$\{([A-Z][A-Za-z0-9_.]*)\}/g,
    (match, key) => {
      if (!values.has(key)) {
        throw new Error(`Missing legacy source-template binding: ${key}`);
      }
      return String(values.get(key) ?? "");
    },
  );
  const unresolved = rendered.match(/\$\{([A-Z][A-Za-z0-9_.]*)\}/);
  if (unresolved) {
    throw new Error(`Unresolved legacy source-template binding: ${unresolved[1]}`);
  }
  return rendered;
}

export function flattenLegacySourceBindings(
  value,
  prefix = "",
  target = {},
) {
  if (
    typeof value === "string"
    || typeof value === "number"
    || typeof value === "boolean"
  ) {
    if (prefix) {
      target[prefix] = value;
    }
    return target;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return target;
  }
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    flattenLegacySourceBindings(child, path, target);
  }
  return target;
}

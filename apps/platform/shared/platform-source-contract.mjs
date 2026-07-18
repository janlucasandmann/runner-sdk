const PLATFORM_STYLE_MARKER =
  /<link\s+data-platform-compatibility-style\s*\/>/;
const PLATFORM_MODULE_MARKER =
  /<script\s+type="module"\s+data-platform-compatibility-module><\/script>/;

export function normalizePlatformSources(sources) {
  const documentTemplate = String(sources?.documentTemplate || "");
  const styleSource = String(sources?.styleSource || "");
  const moduleSource = String(sources?.moduleSource || "");
  if (!documentTemplate) {
    throw new Error("Platform sources require a document template.");
  }
  if (!styleSource) {
    throw new Error("Platform sources require a stylesheet.");
  }
  if (!moduleSource) {
    throw new Error("Platform sources require a browser module.");
  }
  return Object.freeze({
    documentTemplate,
    styleSource,
    moduleSource,
  });
}

function replaceRequiredMarker(source, matcher, replacement, label) {
  if (!matcher.test(source)) {
    throw new Error(`Platform document is missing its ${label}.`);
  }
  return source.replace(matcher, replacement);
}

export function renderPlatformDocument(
  documentTemplate,
  {
    styleTag,
    moduleTag,
  },
) {
  const withStyle = replaceRequiredMarker(
    documentTemplate,
    PLATFORM_STYLE_MARKER,
    styleTag,
    "compatibility style marker",
  );
  return replaceRequiredMarker(
    withStyle,
    PLATFORM_MODULE_MARKER,
    moduleTag,
    "compatibility module marker",
  );
}

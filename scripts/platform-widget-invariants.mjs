import fs from "node:fs/promises";
import { readPlatformCompositionSource } from "../apps/platform/testing/platform-composition-source.mjs";

const packageJson = JSON.parse(await fs.readFile(new URL("../package.json", import.meta.url), "utf8"));
const demoServerSource = await readPlatformCompositionSource();
const calendarRuntimeSource = await fs.readFile(
  new URL("../src/platform-services/create-mode/calendar/client/domain/runtime.mjs", import.meta.url),
  "utf8"
);

const requiredWidgetFiles = [
  "platform-widget.tsx",
  "project-widget.tsx",
  "calendar-widget.tsx",
  "usage-widget.tsx",
  "index.ts",
  "README.md",
];

await Promise.all(requiredWidgetFiles.map(async (fileName) => {
  const fileUrl = new URL(`../src/platform-ui/components/composite/widgets/${fileName}`, import.meta.url);
  try {
    await fs.access(fileUrl);
  } catch {
    throw new Error(`Missing shared widget module: ${fileName}`);
  }
}));

const widgetsExport = packageJson.exports?.["./platform-ui/components/composite/widgets"];
if (widgetsExport?.default !== "./dist/platform-ui/components/composite/widgets/index.js") {
  throw new Error("The shared widgets package export must target the canonical component directory.");
}
const legacyWidgetsExport = packageJson.exports?.["./platform-ui/components/widgets"];
if (legacyWidgetsExport?.default !== widgetsExport.default) {
  throw new Error("The legacy widgets package export must target the canonical composite output.");
}

if (!demoServerSource.includes('from "/dist/platform-ui/components/composite/widgets/index.js"')) {
  throw new Error("The platform demo must import the shared home widgets.");
}

for (const retiredImplementation of [
  "renderWelcomeProjectWidgetShell",
  'className: "playground-thread-widget playground-thread-widget-usage"',
]) {
  if (demoServerSource.includes(retiredImplementation)) {
    throw new Error(`Embedded home widget implementation remains: ${retiredImplementation}`);
  }
}

if (calendarRuntimeSource.includes("function PlaygroundWelcomeCalendarWidget")) {
  throw new Error("Calendar UI must live in platform-ui/components/composite/widgets, not the calendar service runtime.");
}

if (!calendarRuntimeSource.includes("function buildPlaygroundWelcomeCalendarWidgetView")) {
  throw new Error("Calendar domain runtime must retain the home widget view builder.");
}

console.log(`Platform widget invariants passed (${requiredWidgetFiles.length} canonical files).`);

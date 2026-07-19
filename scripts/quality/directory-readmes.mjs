import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const guideMarker = "<!-- platform-directory-guide:v1 -->";
const ignoredDirectoryNames = new Set([
  ".cache",
  ".git",
  ".next",
  ".nyc_output",
  ".platform-dev",
  ".turbo",
  ".vite",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const permittedArguments = new Set(["--write"]);

const exactTitles = new Map([
  [".github", "GitHub automation"],
  [".github/workflows", "GitHub Actions workflows"],
  ["apps", "Platform applications"],
  ["apps/platform", "Platform application"],
  ["apps/platform/client", "Platform browser client"],
  ["apps/platform/client/legacy", "Legacy browser composition"],
  ["apps/platform/client/legacy/domains", "Legacy browser domains"],
  ["apps/platform/development", "Platform development runtime"],
  ["apps/platform/server", "Platform host server"],
  ["apps/platform/server/admin", "Administrative pages"],
  ["apps/platform/server/gateway", "Platform gateways"],
  ["apps/platform/server/gateway/thread", "Thread gateway"],
  ["apps/platform/server/integrations", "Server integrations"],
  ["apps/platform/server/routes", "Platform HTTP routes"],
  ["apps/platform/shared", "Shared application contracts"],
  ["apps/platform/testing", "Platform architecture testing"],
  ["deployment", "Platform deployment"],
  ["deployment/platform", "Platform container deployment"],
  ["docs", "Platform documentation"],
  ["docs/architecture", "Architecture documentation"],
  ["docs/architecture/decisions", "Architecture decision records"],
  ["docs/development", "Development documentation"],
  ["examples", "Platform examples"],
  ["img", "Platform image assets"],
  ["img/001-docs", "Legacy documentation images"],
  ["img/010-svgs", "Legacy SVG assets"],
  ["img/Neuer Ordner", "Legacy miscellaneous image assets"],
  ["img/agent-profile-pics", "Agent profile images"],
  ["img/bg", "Background images"],
  ["img/empty-state", "Empty-state images"],
  ["img/file-icons", "File-type icons"],
  ["img/imagine", "Imagine assets"],
  ["img/imagine/pitch-deck", "Pitch-deck assets"],
  ["img/imagine/pitch-deck-classic", "Classic pitch-deck assets"],
  ["img/imagine/pitch-deck-modern", "Modern pitch-deck assets"],
  ["img/metronome-bg", "Metronome background assets"],
  ["scripts", "Repository automation"],
  ["scripts/migrations", "Repository migrations"],
  ["scripts/quality", "Quality gates"],
  ["src", "Platform source"],
  ["src/platform-integrations", "Platform integrations"],
  ["src/platform-integrations/google-drive", "Google Drive integration"],
  ["src/platform-resources", "Shared platform resources"],
  ["src/platform-runtime", "Typed platform runtime"],
  ["src/platform-services", "Product-mode services"],
  ["src/platform-shell", "Platform application shell"],
  ["src/platform-shell/presentation", "Typed shell presentation"],
  ["src/platform-ui", "Platform UI system"],
  ["src/platform-ui/components", "Platform UI components"],
  ["src/platform-ui/components/composite", "Composite UI components"],
  ["src/platform-ui/components/thread-components", "Thread presentation components"],
  ["src/platform-ui/components/ui", "UI primitives"],
  ["src/platform-ui/pages", "Shared platform pages"],
  ["src/react", "React compatibility surfaces"],
  ["src/react/runner-chat", "RunnerChat implementation"],
  ["src/react/runner-chat/execution", "Runner execution controllers"],
  ["src/react/runner-chat/hydration", "Runner hydration"],
  ["src/react/thread", "Canonical thread presentation"],
  ["src/realtime", "Realtime client"],
  ["src/thread", "Canonical thread domain"],
  ["src/thread/adapters", "Thread event adapters"],
  ["tests", "Repository integration tests"],
]);

const exactPurposes = new Map([
  [
    ".github",
    "This directory owns repository automation that runs on GitHub. Keep hosted workflow policy here and keep product runtime behavior in `apps/` or `src/`.",
  ],
  [
    ".github/workflows",
    "This directory contains the CI workflows that execute the repository's checked-in quality and build commands.",
  ],
  [
    "apps",
    "This directory contains executable application composition roots. Reusable domain, runtime, and UI behavior belongs under `src/`.",
  ],
  [
    "apps/platform",
    "This directory owns the executable platform host, browser composition, local development orchestration, and architecture tests.",
  ],
  [
    "apps/platform/client",
    "This directory owns browser-entry composition that has not yet moved behind a typed domain boundary.",
  ],
  [
    "apps/platform/client/legacy",
    "This directory contains the remaining fragment-based browser composition for the single platform document. It is compatibility debt, not a second application.",
  ],
  [
    "apps/platform/client/legacy/domains",
    "This directory separates the remaining legacy browser program by product domain so each fragment can be migrated to its typed owner independently.",
  ],
  [
    "apps/platform/development",
    "This directory owns the local Vite bridge, Fast Refresh integration, CSS HMR, and backend reload policy used by `npm run dev`.",
  ],
  [
    "apps/platform/server",
    "This directory is the Node platform host. It composes identity, routes, gateways, static assets, integrations, and WebSocket proxies without owning product-domain behavior.",
  ],
  [
    "apps/platform/server/admin",
    "This directory owns restricted operational pages and their safe HTML rendering boundary.",
  ],
  [
    "apps/platform/server/gateway",
    "This directory contains authenticated, provider-aware transports between the platform host and upstream control-plane services.",
  ],
  [
    "apps/platform/server/gateway/thread",
    "This directory owns focused thread transport, streaming, and protocol helpers used by the platform gateway.",
  ],
  [
    "apps/platform/server/integrations",
    "This directory contains server-side adapters for external providers. Provider credentials and protocol behavior must remain behind these modules.",
  ],
  [
    "apps/platform/server/identity",
    "This directory owns provider-neutral browser identity, hosted Firebase and on-prem OIDC adapters, encrypted sessions, and short-lived principal assertions for the control API.",
  ],
  [
    "apps/platform/server/routes",
    "This directory owns ordered HTTP route-family matching. Route modules translate requests and delegate to gateways or owning services.",
  ],
  [
    "apps/platform/shared",
    "This directory contains contracts shared across application-level client and server composition. Domain-specific contracts remain with their owners.",
  ],
  [
    "apps/platform/shared/billing",
    "This directory owns the platform billing catalog adapter, resilient browser fallback, and billing proxy route composition.",
  ],
  [
    "apps/platform/testing",
    "This directory owns architecture budgets, compatibility audits, and source-composition test helpers for the platform application.",
  ],
  [
    "deployment",
    "This directory contains deployment definitions for the platform application. Workspace-wide topology and appliance tooling remain at the workspace deployment boundary.",
  ],
  [
    "deployment/platform",
    "This directory defines the production platform container, Cloud Build job, and explicit deployment script.",
  ],
  [
    "docs",
    "This directory is the durable engineering handbook for architecture, development workflows, compatibility contracts, and operational guidance.",
  ],
  [
    "docs/architecture",
    "This directory documents system structure, ownership boundaries, and the decisions that constrain future platform changes.",
  ],
  [
    "docs/architecture/decisions",
    "This directory contains immutable Architecture Decision Records. Supersede an accepted decision with a new record instead of silently rewriting its history.",
  ],
  [
    "docs/development",
    "This directory contains contributor workflows for configuration, testing, and repository documentation.",
  ],
  [
    "examples",
    "This directory contains consumer-oriented examples and manual previews. Automated regression tests belong under `tests/` or beside their source.",
  ],
  [
    "scripts",
    "This directory contains deterministic repository automation and architectural invariant checks invoked by package scripts and CI.",
  ],
  [
    "scripts/migrations",
    "This directory is reserved for explicit, reviewable repository or persisted-data migrations. Migrations must be idempotent or document their rollback and one-shot semantics.",
  ],
  [
    "scripts/quality",
    "This directory owns static quality gates, artifact checks, documentation policy, import boundaries, and test discovery.",
  ],
  [
    "src",
    "This directory contains reusable platform domains, runtime adapters, shell features, shared UI, and compatibility surfaces.",
  ],
  [
    "src/platform-integrations",
    "This directory contains typed browser integrations with external platforms. Each provider must remain isolated behind its own adapter.",
  ],
  [
    "src/platform-integrations/google-drive",
    "This directory owns the browser-side Google Drive picker adapter and its provider-specific contract.",
  ],
  [
    "src/platform-resources",
    "This directory owns reusable resource domains such as Agents, Computers, Skills, Tags, and Plugins.",
  ],
  [
    "src/platform-resources/shared",
    "This directory contains narrow presentation adapters genuinely shared by multiple resource domains. Generic UI remains in `src/platform-ui`.",
  ],
  [
    "src/platform-resources/shared/connections",
    "This directory owns the cross-resource connection overview adapter built on the canonical resource overview page.",
  ],
  [
    "src/platform-runtime",
    "This directory owns the typed browser API client, provider, Suspense/error boundary, and runtime composition used by platform pages.",
  ],
  [
    "src/platform-services",
    "This directory contains product services organized exactly by Create, Configure, and Develop mode.",
  ],
  [
    "src/platform-services/configure-mode",
    "This directory contains services for policy, organization, model, evaluation, and other Configure-mode administration experiences.",
  ],
  [
    "src/platform-services/create-mode",
    "This directory contains task-producing Create-mode services such as Projects, Calendar, Files, Imagine, and Metronome.",
  ],
  [
    "src/platform-services/develop-mode",
    "This directory contains developer-facing resource services and the shared typed overview foundation used by Develop mode.",
  ],
  [
    "src/platform-shell",
    "This directory owns application-wide navigation, overlays, creation flows, and presentation composition that sit above individual services.",
  ],
  [
    "src/platform-shell/presentation",
    "This directory exposes typed page and resource registries to the remaining browser composition without leaking owning-domain internals.",
  ],
  [
    "src/platform-ui",
    "This directory is the provider-neutral shared UI system. It may not import owning services, resources, shell features, or Runner compatibility modules.",
  ],
  [
    "src/platform-ui/components/thread-components/assets",
    "This directory contains static file, attachment, and server-resource imagery used by platform-owned thread presentation.",
  ],
  [
    "src/platform-ui/pages",
    "This directory owns reusable page-level layouts for overview, detail, home, and permission experiences.",
  ],
  [
    "src/react",
    "This directory contains the Runner compatibility composition and public React facades that are still consumed by embedded execution surfaces.",
  ],
  [
    "src/react/runner-chat",
    "This directory contains bounded RunnerChat implementation modules composed by the compatibility root. Leaf modules must never import that root.",
  ],
  [
    "src/react/thread",
    "This directory renders the canonical event-projected thread timeline, live supervision docks, routing receipts, and permission decisions.",
  ],
  [
    "src/realtime",
    "This directory owns the provider-neutral realtime session contract used to receive execution and thread events.",
  ],
  [
    "src/thread",
    "This directory owns canonical thread types, normalization, event projection, selectors, and compatibility adaptation independently of React.",
  ],
  [
    "src/thread/adapters",
    "This directory translates provider- or workflow-specific records into canonical thread events.",
  ],
  [
    "tests",
    "This directory contains build-dependent integration and smoke tests that exercise public artifacts and cross-module behavior.",
  ],
]);

const serviceTestCommands = new Map([
  ["app-header", "npm run app-header-service-test"],
  ["app-sidebar", "npm run app-sidebar-service-test"],
  ["api-keys", "npm run api-keys-service-test"],
  ["calendar", "npm run calendar-service-test"],
  ["configure-home", "npm run configure-home-service-test"],
  ["develop-home", "npm run develop-home-service-test"],
  ["evaluations", "npm run evaluations-service-test"],
  ["files", "npm run files-service-test"],
  ["fine-tuning", "npm run fine-tuning-service-test"],
  ["guardrails", "npm run guardrails-service-test"],
  ["imagine", "npm run imagine-service-test"],
  ["inference", "npm run inference-service-test"],
  ["marketplace", "npm run marketplace-service-test"],
  ["metronome", "npm run metronome-service-test"],
  ["models", "npm run models-service-test"],
  ["navigation-guard", "npm run navigation-guard-service-test"],
  ["organizations", "npm run organizations-service-test"],
  ["projects", "npm run projects-service-test"],
  ["resource-creation", "npm run check:static"],
  ["settings-modal", "npm run settings-modal-service-test"],
  ["teams", "npm run teams-service-test"],
]);

const specialWords = new Map([
  ["api", "API"],
  ["apis", "APIs"],
  ["aios", "AIOS"],
  ["ci", "CI"],
  ["css", "CSS"],
  ["github", "GitHub"],
  ["google", "Google"],
  ["hmr", "HMR"],
  ["html", "HTML"],
  ["http", "HTTP"],
  ["id", "ID"],
  ["js", "JavaScript"],
  ["json", "JSON"],
  ["mcp", "MCP"],
  ["nextjs", "Next.js"],
  ["oauth", "OAuth"],
  ["oidc", "OIDC"],
  ["pdf", "PDF"],
  ["pdfjs", "PDF.js"],
  ["react", "React"],
  ["readme", "README"],
  ["runner", "Runner"],
  ["runnerchat", "RunnerChat"],
  ["sdk", "SDK"],
  ["sse", "SSE"],
  ["svg", "SVG"],
  ["ui", "UI"],
  ["url", "URL"],
  ["vite", "Vite"],
  ["vm", "VM"],
  ["vnc", "VNC"],
  ["websocket", "WebSocket"],
]);

const layerPurposes = new Map([
  ["actions", "user and system actions that mutate or navigate the owning feature"],
  ["analytics", "analytics loading, normalization, and presentation"],
  ["api", "typed transport and endpoint adapters"],
  ["assets", "static assets consumed by the owning presentation layer"],
  ["client", "browser-side public composition and integration"],
  ["components", "focused presentation components"],
  ["connections", "shared connection overview composition"],
  ["controller", "interaction controllers and effect orchestration"],
  ["data", "data loading, normalization, and projection"],
  ["detail", "resource-detail composition and controls"],
  ["domain", "domain contracts, normalization, and pure transformations"],
  ["foundation", "initialization and third-party foundation adapters"],
  ["hydration", "history and execution-state hydration"],
  ["inspector", "inspector composition and interaction behavior"],
  ["integrations", "explicit adapters consumed across ownership boundaries"],
  ["management", "mutation and lifecycle orchestration"],
  ["overview", "overview models, analytics, tables, and page composition"],
  ["page", "page composition and page-local interaction behavior"],
  ["runtime", "stateful runtime orchestration"],
  ["server", "HTTP routing and server-side domain adapters"],
  ["shared", "narrow contracts reused by sibling features"],
  ["shell", "application-shell state, lifecycle, and navigation integration"],
  ["state", "state contracts and transition helpers"],
  ["styles", "ordered, owner-scoped style modules"],
  ["templates", "static templates used by the owning renderer"],
  ["vendor", "third-party loading and compatibility adapters"],
  ["views", "focused view renderers"],
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function humanize(value) {
  return value
    .replace(/\.(?:spec|template|test)\.[^.]+$/, "")
    .replace(/\.[^.]+$/, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      return specialWords.get(lower) ?? `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`;
    })
    .join(" ");
}

function directoryTitle(relativeDirectory) {
  const exact = exactTitles.get(relativeDirectory);
  if (exact) return exact;

  const parts = relativeDirectory.split("/");
  const name = humanize(parts.at(-1));
  const parent = parts.length > 1 ? humanize(parts.at(-2)) : "";
  if (["client", "server", "domain", "page", "runtime", "shell", "styles"].includes(parts.at(-1))) {
    return `${parent} ${name}`;
  }
  return name;
}

function serviceContext(relativeDirectory) {
  const parts = relativeDirectory.split("/");
  const modeIndex = parts.findIndex((part) => part.endsWith("-mode"));
  if (modeIndex >= 0 && parts.length > modeIndex + 1) {
    return {
      mode: humanize(parts[modeIndex]),
      owner: humanize(parts[modeIndex + 1]),
      roleParts: parts.slice(modeIndex + 2),
    };
  }
  return null;
}

function resourceContext(relativeDirectory) {
  const parts = relativeDirectory.split("/");
  const rootIndex = parts.indexOf("platform-resources");
  if (rootIndex >= 0 && parts.length > rootIndex + 1) {
    return {
      owner: humanize(parts[rootIndex + 1]),
      roleParts: parts.slice(rootIndex + 2),
    };
  }
  return null;
}

function shellContext(relativeDirectory) {
  const parts = relativeDirectory.split("/");
  const rootIndex = parts.indexOf("platform-shell");
  if (rootIndex >= 0 && parts.length > rootIndex + 1) {
    return {
      owner: humanize(parts[rootIndex + 1]),
      roleParts: parts.slice(rootIndex + 2),
    };
  }
  return null;
}

function describeRole(roleParts) {
  if (roleParts.length === 0) return null;
  const role = roleParts.at(-1);
  return (
    layerPurposes.get(role) ?? `${humanize(role).toLowerCase()} behavior for the owning feature`
  );
}

function purposeFor(relativeDirectory) {
  const exact = exactPurposes.get(relativeDirectory);
  if (exact) return exact;

  if (relativeDirectory === "img" || relativeDirectory.startsWith("img/")) {
    const warning =
      relativeDirectory === "img/Neuer Ordner"
        ? " Do not add new assets here; move referenced files into a clearly named owner when touching them."
        : "";
    return `This directory contains ${directoryTitle(relativeDirectory).toLowerCase()} consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.${warning}`;
  }

  const service = serviceContext(relativeDirectory);
  if (service) {
    const role = describeRole(service.roleParts);
    if (!role) {
      return `This directory is the ${service.mode} ownership boundary for the ${service.owner} service. It keeps product behavior behind one public integration surface.`;
    }
    return `This directory contains ${role} for the ${service.owner} service in ${service.mode}. It remains subordinate to the service boundary and must not become a cross-service utility layer.`;
  }

  const resource = resourceContext(relativeDirectory);
  if (resource) {
    const role = describeRole(resource.roleParts);
    if (!role) {
      return `This directory is the shared resource boundary for ${resource.owner}. It owns the resource-specific typed clients and pages that exist today, plus their public exports.`;
    }
    return `This directory contains ${role} for the shared ${resource.owner} resource. Resource-independent UI belongs in \`src/platform-ui\`.`;
  }

  const shell = shellContext(relativeDirectory);
  if (shell) {
    const role = describeRole(shell.roleParts);
    if (!role) {
      return `This directory owns the ${shell.owner} shell feature and its explicit integration with global platform navigation and overlays.`;
    }
    return `This directory contains ${role} for the ${shell.owner} shell feature. Product-domain behavior remains with its owning service or resource.`;
  }

  if (relativeDirectory.startsWith("src/platform-ui/components/")) {
    const parts = relativeDirectory.split("/");
    const categoryIndex = parts.findIndex((part) =>
      ["composite", "thread-components", "ui"].includes(part),
    );
    const category = humanize(parts[categoryIndex] ?? "component");
    const owner = humanize(parts[categoryIndex + 1] ?? parts.at(-1));
    const roleParts = parts.slice(categoryIndex + 2);
    const role = describeRole(roleParts);
    if (role) {
      return `This directory contains ${role} for the ${owner} ${category.toLowerCase()} component. It follows the component's public API and dependency direction.`;
    }
    return `This directory owns the ${owner} ${category.toLowerCase()} component, including its public API, presentation, styles, and colocated tests.`;
  }

  if (relativeDirectory.startsWith("src/platform-ui/pages/")) {
    return `This directory owns the shared ${humanize(path.basename(relativeDirectory))} page contract and presentation used by resource and service domains.`;
  }

  if (relativeDirectory.startsWith("src/react/runner-chat/")) {
    const role = describeRole(relativeDirectory.split("/").slice(3));
    return `This directory contains ${role ?? "bounded implementation modules"} for RunnerChat. It must not import the RunnerChat composition root.`;
  }

  if (relativeDirectory.startsWith("apps/platform/client/legacy/domains/")) {
    const parts = relativeDirectory.split("/");
    const owner = humanize(parts[5] ?? "browser");
    const role = parts.slice(6);
    return `This directory contains remaining legacy browser ${
      describeRole(role) ?? "composition"
    } for ${owner}. Migrate behavior toward its typed owner without creating another application runtime.`;
  }

  if (relativeDirectory.startsWith("apps/platform/server/admin/templates")) {
    return "This directory contains escaped HTML templates used only by restricted administrative page renderers.";
  }

  const basename = path.basename(relativeDirectory);
  const role = layerPurposes.get(basename);
  if (role) {
    return `This directory contains ${role} within ${humanize(path.basename(path.dirname(relativeDirectory)))}. Follow the parent directory's ownership boundary.`;
  }

  return `This directory groups the ${directoryTitle(relativeDirectory)} modules within the platform repository. Follow the parent boundary and keep each module focused on the responsibility expressed by its name.`;
}

function fileDescription(fileName) {
  const lower = fileName.toLowerCase();
  const stem = humanize(fileName);
  if (lower === "index.ts" || lower === "index.tsx" || lower === "index.mjs") {
    return "Public barrel or composition entry point.";
  }
  if (lower === "package.json") return "Package metadata and executable commands.";
  if (lower === "tsconfig.json") return "TypeScript project configuration.";
  if (lower.includes(".test.") || lower.includes(".spec.")) {
    return `Regression coverage for ${humanize(fileName.replace(/\.(test|spec)/, ""))}.`;
  }
  if (lower.endsWith(".css")) return `Styles for ${humanize(fileName)}.`;
  if (lower.endsWith(".md")) return `Engineering documentation for ${humanize(fileName)}.`;
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) {
    return `Declarative configuration for ${humanize(fileName)}.`;
  }
  if (lower === "dockerfile") return "Container image definition.";
  if (lower.endsWith(".sh")) return `Operational script for ${humanize(fileName)}.`;
  if (/\.(?:png|jpe?g|gif|webp|svg|avif|ico|mp4|webm)$/i.test(fileName)) {
    return "Presentation asset.";
  }
  if (/^(?:public-)?types?\./.test(lower) || lower.endsWith(".d.ts")) {
    return "Type contracts for this boundary.";
  }
  if (/^constants?\./.test(lower)) {
    return "Constants shared within this boundary.";
  }
  if (/^state\./.test(lower)) return "State ownership for this layer.";
  if (/^runtime\./.test(lower)) return "Runtime composition for this layer.";
  if (/^view\./.test(lower)) return "Presentation renderer for this layer.";
  if (/^setup\./.test(lower)) return "Initialization for this layer.";
  if (/\.template\.[^.]+$/.test(lower)) return `Ordered source fragment for ${stem}.`;
  if (lower.includes("config")) return `Configuration behavior for ${stem}.`;
  if (lower.includes("invariants")) return `Architecture invariant check for ${stem}.`;
  if (lower.startsWith("use-")) return `React controller for ${stem.replace(/^Use /, "")}.`;
  if (/(?:^|-)(?:adapter|client)(?:\.|-)/.test(lower)) {
    return `Boundary adapter for ${stem}.`;
  }
  if (/(?:^|-)(?:normalize|normalization)(?:\.|-)/.test(lower)) {
    return `Input normalization for ${stem}.`;
  }
  if (/(?:^|-)(?:page|view)(?:\.|-)/.test(lower)) {
    return `Presentation composition for ${stem}.`;
  }
  if (/(?:^|-)(?:model|projection|selectors?|state)(?:\.|-)/.test(lower)) {
    return `State and projection logic for ${stem}.`;
  }
  if (/(?:^|-)(?:styles?|css)(?:\.|-)/.test(lower)) {
    return `Style composition for ${stem}.`;
  }
  if (/(?:^|-)(?:utils?|helpers?)(?:\.|-)/.test(lower)) {
    return `Focused helpers for ${stem}.`;
  }
  if (lower.includes("routes")) return `Route composition for ${stem}.`;
  if (lower.includes("controller")) return `Interaction orchestration for ${stem}.`;
  return `Focused implementation of ${stem}.`;
}

function isScaffoldDescription(description) {
  return [
    /^Architecture invariant check for /,
    /^Boundary adapter for /,
    /^Configuration behavior for /,
    /^Constants shared within this boundary\.$/,
    /^Container image definition\.$/,
    /^Declarative configuration for /,
    /^Engineering documentation for /,
    /^Focused helpers for /,
    /^Focused implementation of /,
    /^Initialization for this layer\.$/,
    /^Input normalization for /,
    /^Interaction orchestration for /,
    /^Operational script for /,
    /^Ordered source fragment for /,
    /^Owns .+ behavior\.$/,
    /^Package metadata and executable commands\.$/,
    /^Presentation asset\.$/,
    /^Presentation composition for /,
    /^Presentation renderer for this layer\.$/,
    /^Public barrel or composition entry point\.$/,
    /^React controller for /,
    /^Regression coverage for /,
    /^Route composition for /,
    /^Runtime composition for this layer\.$/,
    /^State and projection logic for /,
    /^State ownership for this layer\.$/,
    /^Style composition for /,
    /^Styles for /,
    /^Type contracts for this boundary\.$/,
    /^TypeScript project configuration\.$/,
  ].some((pattern) => pattern.test(description));
}

function markdownTarget(value) {
  const normalized = toPosix(value);
  return /\s/.test(normalized) ? `<${normalized}>` : normalized;
}

async function contentsSection(directory, relativeDirectory) {
  const entries = (await fs.readdir(directory, { withFileTypes: true })).filter(
    (entry) =>
      entry.name !== "README.md" &&
      entry.name !== ".DS_Store" &&
      !(entry.isDirectory() && ignoredDirectoryNames.has(entry.name)),
  );
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));
  const files = entries
    .filter((entry) => entry.isFile())
    .sort((left, right) => left.name.localeCompare(right.name));

  if (directories.length === 0 && files.length === 0) {
    return [
      "This directory currently has no implementation files. Keep this guide",
      "when introducing the first module, and update it with the new contract.",
    ].join(" ");
  }

  const lines = [];
  for (const child of directories) {
    const childRelative = toPosix(path.join(relativeDirectory, child.name));
    lines.push(
      `- [\`${child.name}/\`](${markdownTarget(`${child.name}/`)}) — ${purposeFor(childRelative)}`,
    );
  }

  const isAssetDirectory = relativeDirectory === "img" || relativeDirectory.startsWith("img/");
  if (isAssetDirectory && files.length > 8) {
    const counts = new Map();
    for (const file of files) {
      const extension = path.extname(file.name).toLowerCase() || "extensionless";
      counts.set(extension, (counts.get(extension) ?? 0) + 1);
    }
    const summary = [...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([extension, count]) => `${count} ${extension} file${count === 1 ? "" : "s"}`)
      .join(", ");
    lines.push(`- Asset inventory — ${summary}.`);
  } else {
    for (const file of files) {
      lines.push(
        `- [\`${file.name}\`](${markdownTarget(file.name)}) — ${fileDescription(file.name)}`,
      );
    }
  }
  return lines.join("\n");
}

function nearestServiceName(relativeDirectory) {
  const context = serviceContext(relativeDirectory);
  return context
    ? relativeDirectory.split("/")[
        relativeDirectory.split("/").findIndex((part) => part.endsWith("-mode")) + 1
      ]
    : null;
}

function verificationCommands(relativeDirectory) {
  const commands = [];
  const serviceName = nearestServiceName(relativeDirectory);
  const shellFeature = relativeDirectory.startsWith("src/platform-shell/")
    ? relativeDirectory.split("/")[2]
    : null;
  const serviceCommand =
    serviceTestCommands.get(serviceName) ?? serviceTestCommands.get(shellFeature);

  if (serviceCommand) commands.push(serviceCommand);

  if (
    relativeDirectory === "apps/platform/server/identity" ||
    relativeDirectory.startsWith("apps/platform/server/identity/")
  ) {
    commands.push("npm run platform:identity-test");
  } else if (relativeDirectory.startsWith("apps/platform/client/legacy")) {
    commands.push("npm run platform:legacy-syntax-test");
  } else if (relativeDirectory.startsWith("apps/platform/server")) {
    commands.push("npm run test:contracts");
  } else if (relativeDirectory.startsWith("apps/platform/development")) {
    commands.push("npm run platform:development-asset-test");
  } else if (relativeDirectory.startsWith("apps/platform/testing")) {
    commands.push("npm run platform:architecture-test");
  } else if (relativeDirectory.includes("/data-table")) {
    commands.push("npm run platform-table-test");
  } else if (relativeDirectory.includes("/modal")) {
    commands.push("npm run platform-modal-test");
  } else if (relativeDirectory.includes("/popup")) {
    commands.push("npm run platform-popup-test");
  } else if (relativeDirectory.startsWith("src/platform-resources")) {
    commands.push("npm run platform-resource-overview-test");
  } else if (
    relativeDirectory.startsWith("src/react/runner-chat") ||
    relativeDirectory.startsWith("src/react/thread") ||
    relativeDirectory.startsWith("src/thread")
  ) {
    commands.push("npm run thread-ui-test");
  } else if (relativeDirectory.startsWith("src/realtime")) {
    commands.push("npm run realtime-metronome-test");
  } else if (
    relativeDirectory === "docs" ||
    relativeDirectory.startsWith("docs/") ||
    relativeDirectory === ".github" ||
    relativeDirectory.startsWith(".github/")
  ) {
    commands.push("npm run docs:check");
  } else if (
    relativeDirectory === "deployment" ||
    relativeDirectory.startsWith("deployment/") ||
    relativeDirectory === "examples" ||
    relativeDirectory.startsWith("examples/") ||
    relativeDirectory === "img" ||
    relativeDirectory.startsWith("img/")
  ) {
    commands.push("npm run build");
  }

  commands.push("npm run check:static");
  return [...new Set(commands)].slice(0, 2);
}

function workingSection(relativeDirectory) {
  const guidance = [
    "Keep changes inside this directory's stated ownership boundary and use the",
    "parent's public entry point instead of importing sibling internals.",
    "Update this guide when responsibilities, entry points, or verification",
    "commands change. Place focused tests beside the behavior they protect and",
    "promote reusable, domain-neutral presentation to `src/platform-ui`.",
  ].join(" ");

  if (relativeDirectory === "img" || relativeDirectory.startsWith("img/")) {
    return [
      "Reference assets through their owning feature rather than relying on",
      "unexplained global paths. Optimize large files before committing, retain",
      "source/licensing information when applicable, and remove an asset only",
      "after searching both typed and legacy browser sources for consumers.",
    ].join(" ");
  }

  if (relativeDirectory === "docs" || relativeDirectory.startsWith("docs/")) {
    return [
      "Write for a developer who does not have historical context. Prefer",
      "repository-relative links, executable commands from the repository root,",
      "and explicit ownership or safety boundaries. Update documentation in the",
      "same change as the contract it describes.",
    ].join(" ");
  }

  if (relativeDirectory === ".") {
    return [
      "Use the repository root only for package configuration, repository-wide",
      "documentation, and public compatibility entry points. Put executable",
      "application code in `apps`, owned product behavior in `src`, and",
      "operational definitions in `deployment`.",
    ].join(" ");
  }

  return guidance;
}

function relatedDocumentationSection(relativeDirectory) {
  const directory = path.join(repositoryRoot, relativeDirectory);
  const links = [];

  if (relativeDirectory !== ".") {
    const parentReadme = path.join(path.dirname(directory), "README.md");
    const target = path.relative(directory, parentReadme);
    links.push(`- [Parent directory guide](${markdownTarget(target)})`);
  }

  const architecturePath = path.join(repositoryRoot, "docs", "platform-architecture.md");
  const architectureTarget = path.relative(directory, architecturePath);
  links.push(`- [Platform architecture](${markdownTarget(architectureTarget)})`);

  const standardPath = path.join(repositoryRoot, "docs", "development", "readme-standard.md");
  const standardTarget = path.relative(directory, standardPath);
  links.push(`- [Directory README standard](${markdownTarget(standardTarget)})`);

  return links.join("\n");
}

function verificationSection(relativeDirectory) {
  const commands = verificationCommands(relativeDirectory);
  return `Run the narrowest relevant checks from the repository root:

\`\`\`bash
${commands.join("\n")}
\`\`\`

Escalate to \`npm run check\` before merging changes that affect shared contracts,
build output, or application composition.`;
}

async function renderNewReadme(directory, relativeDirectory) {
  return `${guideMarker}

# ${directoryTitle(relativeDirectory)}

## Purpose

${purposeFor(relativeDirectory)}

## Contents

${await contentsSection(directory, relativeDirectory)}

## Working in this directory

${workingSection(relativeDirectory)}

## Verification

${verificationSection(relativeDirectory)}

## Related documentation

${relatedDocumentationSection(relativeDirectory)}
`;
}

async function collectDirectories(directory = repositoryRoot) {
  const directories = [directory];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || ignoredDirectoryNames.has(entry.name)) continue;
    directories.push(...(await collectDirectories(path.join(directory, entry.name))));
  }
  return directories;
}

function relativeDirectory(directory) {
  const relative = toPosix(path.relative(repositoryRoot, directory));
  return relative || ".";
}

function isMissingFileError(error) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function normalizeExistingReadme(readmePath, relativeDirectoryPath) {
  let source = await fs.readFile(readmePath, "utf8");
  let changed = false;

  if (!source.startsWith(guideMarker)) {
    source = `${guideMarker}\n\n${source.trimStart()}`;
    changed = true;
  }
  if (!/^## Purpose\s*$/m.test(source)) {
    const title = source.match(/^# [^\n]+$/m);
    if (!title || title.index === undefined) {
      throw new Error(
        `${relativeDirectoryPath}/README.md must have an H1 before it can be normalized.`,
      );
    }
    const titleEnd = title.index + title[0].length;
    source = `${source.slice(0, titleEnd).trimEnd()}

## Purpose

${source.slice(titleEnd).trimStart()}`;
    changed = true;
  }
  if (!/^## Working in this directory\s*$/m.test(source)) {
    source = `${source.trimEnd()}

## Working in this directory

${workingSection(relativeDirectoryPath)}
`;
    changed = true;
  }
  if (!/^## Verification\s*$/m.test(source)) {
    source = `${source.trimEnd()}

## Verification

${verificationSection(relativeDirectoryPath)}
`;
    changed = true;
  }
  if (!/^## Related documentation\s*$/m.test(source)) {
    source = `${source.trimEnd()}

## Related documentation

${relatedDocumentationSection(relativeDirectoryPath)}
`;
    changed = true;
  }
  source = source.replace(
    /^(- \[`([^`]+)`\]\([^)]+\) —) ([^\n]+)$/gm,
    (line, prefix, fileName, description) => {
      if (fileName.endsWith("/") || !isScaffoldDescription(description)) return line;
      const replacement = `${prefix} ${fileDescription(fileName)}`;
      if (replacement !== line) changed = true;
      return replacement;
    },
  );

  if (changed) await fs.writeFile(readmePath, `${source.trimEnd()}\n`, "utf8");
  return changed;
}

function validateReadme(source, relativeDirectoryPath) {
  const issues = [];
  const titles = source.match(/^# [^\n]+$/gm) ?? [];
  if (!source.startsWith(guideMarker)) {
    issues.push("missing platform directory-guide marker");
  }
  if (titles.length !== 1) {
    issues.push(`expected exactly one H1 title, found ${titles.length}`);
  }
  if (!/^## Purpose\s*$/m.test(source)) {
    issues.push("missing Purpose section");
  }
  if (!/^## Working in this directory\s*$/m.test(source)) {
    issues.push("missing Working in this directory section");
  }
  if (!/^## Verification\s*$/m.test(source)) {
    issues.push("missing Verification section");
  }
  if (!/^## Related documentation\s*$/m.test(source)) {
    issues.push("missing Related documentation section");
  }
  if (source.trim().length < 240) {
    issues.push("guide is too short to orient another developer");
  }
  return issues.map((issue) => `${relativeDirectoryPath}/README.md: ${issue}`);
}

async function main() {
  const unknownArguments = process.argv
    .slice(2)
    .filter((argument) => !permittedArguments.has(argument));
  if (unknownArguments.length > 0) {
    throw new Error(`Unknown arguments: ${unknownArguments.join(", ")}`);
  }

  const write = process.argv.includes("--write");
  const directories = await collectDirectories();
  const created = [];
  const normalized = [];

  if (write) {
    for (const directory of directories) {
      const relative = relativeDirectory(directory);
      const readmePath = path.join(directory, "README.md");
      let readmeExists = true;
      try {
        await fs.access(readmePath);
      } catch (error) {
        if (!isMissingFileError(error)) throw error;
        readmeExists = false;
      }
      if (!readmeExists) {
        await fs.writeFile(readmePath, await renderNewReadme(directory, relative), "utf8");
        created.push(relative);
        continue;
      }
      if (await normalizeExistingReadme(readmePath, relative)) {
        normalized.push(relative);
      }
    }
  }

  const issues = [];
  for (const directory of directories) {
    const relative = relativeDirectory(directory);
    const readmePath = path.join(directory, "README.md");
    try {
      const source = await fs.readFile(readmePath, "utf8");
      issues.push(...validateReadme(source, relative));
    } catch (error) {
      issues.push(
        isMissingFileError(error)
          ? `${relative}/README.md: missing directory guide`
          : `${relative}/README.md: cannot be read (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `Directory README policy failed:\n${issues
        .map((issue) => `- ${issue}`)
        .join("\n")}\nRun npm run docs:readmes:write to scaffold and normalize guides.`,
    );
  }

  if (write) {
    console.log(
      `Directory guides synchronized: ${created.length} created, ` +
        `${normalized.length} normalized, ${directories.length} covered.`,
    );
  } else {
    console.log(
      `Directory README coverage passed for ${directories.length} maintained directories.`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

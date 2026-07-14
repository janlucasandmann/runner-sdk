export const MARKETPLACE_PREVIEW_SERVER_FILES_SCRIPT = `      function createPlaygroundResourceTemplatePreviewFile(filePath, content, options = {}) {
        const normalizedPath = normalizeHistoryPath(filePath);
        const normalizedContent = typeof content === "string" ? content : "";
        const normalizedName = normalizedPath.split("/").filter(Boolean).pop() || normalizedPath;
        return {
          path: normalizedPath,
          name: normalizedName,
          type: "file",
          isDirectory: false,
          size: normalizedContent.length,
          mimeType: options.mimeType || getPlaygroundPreviewMimeType({ path: normalizedPath, name: normalizedName }) || "text/plain",
          modifiedTime: options.modifiedTime || "",
          content: normalizedContent,
        };
      }

      function createPlaygroundResourceTemplatePreviewPackage(name, dependencies = {}, options = {}) {
        return JSON.stringify({
          name,
          version: "1.0.0",
          private: true,
          type: "module",
          scripts: options.scripts && typeof options.scripts === "object" ? options.scripts : {
            start: "node index.js",
          },
          engines: {
            node: ">=22",
          },
          dependencies,
        }, null, 2) + "\\n";
      }

      function getPlaygroundResourceTemplatePreviewServerFiles(template) {
        const templateId = String(template?.id || "").trim();
        if (templateId === "launch-landing-page") {
          return [
            createPlaygroundResourceTemplatePreviewFile("index.html", [
              "<!doctype html>",
              "<html lang=\\"en\\">",
              "  <head>",
              "    <meta charset=\\"utf-8\\" />",
              "    <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1\\" />",
              "    <title>Launch Landing Page</title>",
              "    <style>",
              "      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }",
              "      * { box-sizing: border-box; }",
              "      body { margin: 0; min-height: 100vh; background: #060606; color: #fff; }",
              "      main { min-height: 100vh; display: grid; align-content: center; gap: 28px; width: min(1040px, calc(100vw - 48px)); margin: 0 auto; }",
              "      .eyebrow { color: #8fc4ff; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }",
              "      h1 { max-width: 760px; margin: 0; font-size: clamp(44px, 8vw, 92px); line-height: .94; font-weight: 700; }",
              "      p { max-width: 560px; margin: 0; color: rgba(255,255,255,.72); font-size: 18px; line-height: 1.6; }",
              "      form { display: flex; gap: 10px; width: min(520px, 100%); }",
              "      input, button { border: 0; border-radius: 999px; padding: 14px 18px; font: inherit; }",
              "      input { flex: 1; background: rgba(255,255,255,.1); color: #fff; outline: 1px solid rgba(255,255,255,.12); }",
              "      button { background: #fff; color: #060606; font-weight: 650; }",
              "      .proof { display: flex; flex-wrap: wrap; gap: 10px; color: rgba(255,255,255,.66); font-size: 13px; }",
              "      .proof span { padding: 8px 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 999px; background: rgba(255,255,255,.05); }",
              "    </style>",
              "  </head>",
              "  <body>",
              "    <main>",
              "      <div class=\\"eyebrow\\">Private beta opens soon</div>",
              "      <h1>Turn a launch brief into a live campaign page.</h1>",
              "      <p>Capture waitlist demand, explain the offer, and hand agents a deployable surface for copy, analytics, and follow-up work.</p>",
              "      <form>",
              "        <input aria-label=\\"Email address\\" placeholder=\\"name@company.com\\" />",
              "        <button type=\\"button\\">Join waitlist</button>",
              "      </form>",
              "      <div class=\\"proof\\"><span>Responsive</span><span>Analytics ready</span><span>Agent handoff notes</span></div>",
              "    </main>",
              "  </body>",
              "</html>",
            ].join("\\n")),
            createPlaygroundResourceTemplatePreviewFile("package.json", createPlaygroundResourceTemplatePreviewPackage("launch-landing-page", {
              serve: "latest",
            }, {
              scripts: {
                start: "serve -s . -l $" + "{PORT:-8080}",
              },
            })),
          ];
        }
        if (templateId === "product-status-dashboard") {
          return [
            createPlaygroundResourceTemplatePreviewFile("index.html", [
              "<!doctype html>",
              "<html lang=\\"en\\">",
              "  <head>",
              "    <meta charset=\\"utf-8\\" />",
              "    <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1\\" />",
              "    <title>Product Status Dashboard</title>",
              "    <style>",
              "      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }",
              "      * { box-sizing: border-box; }",
              "      body { margin: 0; min-height: 100vh; background: #090909; color: #f7f7f7; }",
              "      main { width: min(1180px, calc(100vw - 40px)); margin: 0 auto; padding: 32px 0; }",
              "      header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }",
              "      h1 { margin: 0; font-size: 34px; line-height: 1.05; }",
              "      .timestamp { color: rgba(255,255,255,.54); font-size: 13px; }",
              "      .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }",
              "      section { border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: rgba(255,255,255,.055); padding: 16px; }",
              "      .wide { grid-column: span 2; }",
              "      .kpi { color: rgba(255,255,255,.58); font-size: 12px; }",
              "      .value { margin-top: 8px; font-size: 30px; font-weight: 700; }",
              "      ul { display: grid; gap: 10px; padding: 0; margin: 14px 0 0; list-style: none; }",
              "      li { display: flex; justify-content: space-between; gap: 14px; color: rgba(255,255,255,.72); }",
              "      .ok { color: #9ee6b8; } .warn { color: #ffd98e; }",
              "    </style>",
              "  </head>",
              "  <body>",
              "    <main>",
              "      <header><h1>Product Status Dashboard</h1><div class=\\"timestamp\\">Generated from project resources</div></header>",
              "      <div class=\\"grid\\">",
              "        <section><div class=\\"kpi\\">Release progress</div><div class=\\"value\\">82%</div></section>",
              "        <section><div class=\\"kpi\\">Active users</div><div class=\\"value\\">14.2k</div></section>",
              "        <section><div class=\\"kpi\\">Open incidents</div><div class=\\"value warn\\">2</div></section>",
              "        <section><div class=\\"kpi\\">Resource health</div><div class=\\"value ok\\">Stable</div></section>",
              "        <section class=\\"wide\\"><div class=\\"kpi\\">Release checklist</div><ul><li><span>Docs update</span><span class=\\"ok\\">Done</span></li><li><span>Billing smoke test</span><span>In progress</span></li><li><span>Launch monitor</span><span>Queued</span></li></ul></section>",
              "        <section class=\\"wide\\"><div class=\\"kpi\\">Resource activity</div><ul><li><span>Function deploy</span><span class=\\"ok\\">Healthy</span></li><li><span>Database writes</span><span>Normal</span></li><li><span>Auth sign-ins</span><span>+8%</span></li></ul></section>",
              "      </div>",
              "    </main>",
              "  </body>",
              "</html>",
            ].join("\\n")),
            createPlaygroundResourceTemplatePreviewFile("package.json", createPlaygroundResourceTemplatePreviewPackage("product-status-dashboard", {
              serve: "latest",
            }, {
              scripts: {
                start: "serve -s . -l $" + "{PORT:-8080}",
              },
            })),
          ];
        }
        if (templateId === "webhook-intake-function") {
          return [
            createPlaygroundResourceTemplatePreviewFile("index.js", [
              "import { z } from \\"zod\\";",
              "",
              "const WebhookPayload = z.object({",
              "  event: z.string(),",
              "  source: z.string().optional(),",
              "  customerEmail: z.string().email().optional(),",
              "  priority: z.enum([\\"low\\", \\"normal\\", \\"high\\"]).default(\\"normal\\"),",
              "  data: z.record(z.any()).default({}),",
              "});",
              "",
              "export default async function handler(request) {",
              "  const signature = request.headers.get(\\"x-webhook-signature\\") || \\"\\";",
              "  if (!signature) {",
              "    return { status: 401, body: JSON.stringify({ error: \\"Missing signature\\" }) };",
              "  }",
              "",
              "  const rawPayload = await request.json().catch(() => null);",
              "  const payload = WebhookPayload.parse(rawPayload);",
              "",
              "  const task = {",
              "    title: \\"Review \\" + payload.event,",
              "    priority: payload.priority,",
              "    customerEmail: payload.customerEmail || null,",
              "    source: payload.source || \\"webhook\\",",
              "    data: payload.data,",
              "  };",
              "",
              "  return {",
              "    status: 202,",
              "    headers: { \\"content-type\\": \\"application/json; charset=utf-8\\" },",
              "    body: JSON.stringify({ accepted: true, task }),",
              "  };",
              "}",
            ].join("\\n")),
            createPlaygroundResourceTemplatePreviewFile("package.json", createPlaygroundResourceTemplatePreviewPackage("webhook-intake-function", {
              zod: "latest",
              nanoid: "latest",
            })),
          ];
        }
        if (templateId === "payment-reconciliation-function") {
          return [
            createPlaygroundResourceTemplatePreviewFile("index.js", [
              "function normalizeAmount(event) {",
              "  const amount = Number(event.amount_cents || event.amount || 0);",
              "  return Number.isFinite(amount) ? Math.round(amount) : 0;",
              "}",
              "",
              "function buildMismatchTask(event, reason) {",
              "  return {",
              "    title: \\"Reconcile payment \\" + (event.id || event.payment_id || \\"unknown\\"),",
              "    reason,",
              "    customerEmail: event.customer_email || event.email || null,",
              "    amountCents: normalizeAmount(event),",
              "    provider: event.provider || \\"stripe\\",",
              "  };",
              "}",
              "",
              "export default async function handler(request) {",
              "  const event = await request.json().catch(() => ({}));",
              "  const normalized = {",
              "    id: event.id || event.payment_id || \\"pending\\",",
              "    customerEmail: event.customer_email || event.email || null,",
              "    amountCents: normalizeAmount(event),",
              "    currency: String(event.currency || \\"usd\\").toUpperCase(),",
              "    status: event.status || \\"received\\",",
              "  };",
              "",
              "  const mismatchTask = normalized.status === \\"paid\\"",
              "    ? null",
              "    : buildMismatchTask(event, \\"Provider event is not marked paid.\\");",
              "",
              "  return {",
              "    status: 200,",
              "    headers: { \\"content-type\\": \\"application/json; charset=utf-8\\" },",
              "    body: JSON.stringify({ normalized, mismatchTask }),",
              "  };",
              "}",
            ].join("\\n")),
            createPlaygroundResourceTemplatePreviewFile("package.json", createPlaygroundResourceTemplatePreviewPackage("payment-reconciliation-function", {
              "date-fns": "latest",
            })),
          ];
        }
        return [
          createPlaygroundResourceTemplatePreviewFile(
            String(template?.type || "").trim() === "function" ? PLAYGROUND_DEFAULT_FUNCTION_SOURCE_PATH : PLAYGROUND_DEFAULT_WEB_APP_SOURCE_PATH,
            String(template?.type || "").trim() === "function" ? PLAYGROUND_DEFAULT_FUNCTION_SOURCE_CONTENT : PLAYGROUND_DEFAULT_WEB_APP_SOURCE_CONTENT
          ),
          createPlaygroundResourceTemplatePreviewFile(
            String(template?.type || "").trim() === "function" ? PLAYGROUND_DEFAULT_FUNCTION_PACKAGE_PATH : PLAYGROUND_DEFAULT_WEB_APP_PACKAGE_PATH,
            String(template?.type || "").trim() === "function" ? PLAYGROUND_DEFAULT_FUNCTION_PACKAGE_CONTENT : PLAYGROUND_DEFAULT_WEB_APP_PACKAGE_CONTENT
          ),
        ];
      }

`;

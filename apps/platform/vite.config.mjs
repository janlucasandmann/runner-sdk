import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createRunnerChatCssHmrPlugin } from "./development/runner-chat-css-hmr.mjs";
import { resolveLegacyBrowserSourcePath } from "./shared/legacy-source-resolution.mjs";

const platformRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(platformRoot, "../..");
const backendPort = Number(process.env.PLATFORM_API_PORT || process.env.PORT || 4177);
const vitePort = Number(process.env.PLATFORM_VITE_PORT || 5173);
const platformAppOrigin = String(
  process.env.PLATFORM_APP_ORIGIN || `http://localhost:${backendPort}`,
).replace(/\/+$/, "");
const remoteBrowserImports = Object.freeze({
  react: "https://esm.sh/react@18.3.1",
  "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
  "react/jsx-dev-runtime": "https://esm.sh/react@18.3.1/jsx-dev-runtime",
  "react-dom": "https://esm.sh/react-dom@18.3.1?external=react",
  "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?external=react",
  "@monaco-editor/react": "https://esm.sh/@monaco-editor/react@4.7.0?external=react,react-dom",
  "@git-diff-view/react": "https://esm.sh/@git-diff-view/react@0.1.3?bundle&external=react",
  "@git-diff-view/file": "https://esm.sh/@git-diff-view/file@0.1.3?bundle",
  "docx-preview": "https://esm.sh/docx-preview@0.3.7?bundle",
  dompurify: "https://esm.sh/dompurify@3.3.3?bundle",
  "pdfjs-dist/build/pdf.mjs": "https://esm.sh/pdfjs-dist@5.4.624/build/pdf.mjs?bundle",
  "date-fns": "https://esm.sh/date-fns@4.1.0?bundle",
  "date-fns/locale/en-US": "https://esm.sh/date-fns@4.1.0/locale/en-US?bundle",
  "lucide-react": "https://esm.sh/lucide-react@0.575.0?external=react",
  "@xyflow/react": "https://esm.sh/@xyflow/react@12.8.4?external=react,react-dom",
  "react-big-calendar": "https://esm.sh/react-big-calendar@1.19.4?bundle&external=react,react-dom",
  "react-markdown": "https://esm.sh/react-markdown@10.1.0?bundle&external=react",
  "rehype-raw": "https://esm.sh/rehype-raw@7.0.0?bundle",
  "remark-gfm": "https://esm.sh/remark-gfm@4.0.1?bundle",
  "unist-util-visit": "https://esm.sh/unist-util-visit@5.0.0",
  "chart.js/auto": "https://esm.sh/chart.js@4.5.1/auto?bundle",
  "@tanstack/react-table": "https://esm.sh/@tanstack/react-table@8.21.3?bundle&external=react",
  "@tiptap/extension-image": "https://esm.sh/@tiptap/extension-image@3.28.0?bundle",
  "@tiptap/extension-placeholder": "https://esm.sh/@tiptap/extension-placeholder@3.28.0?bundle",
  "@tiptap/extension-table": "https://esm.sh/@tiptap/extension-table@3.28.0?bundle",
  "@tiptap/extension-task-item": "https://esm.sh/@tiptap/extension-task-item@3.28.0?bundle",
  "@tiptap/extension-task-list": "https://esm.sh/@tiptap/extension-task-list@3.28.0?bundle",
  "@tiptap/markdown": "https://esm.sh/@tiptap/markdown@3.28.0?bundle",
  "@tiptap/react": "https://esm.sh/@tiptap/react@3.28.0?bundle&external=react,react-dom",
  "@tiptap/starter-kit": "https://esm.sh/@tiptap/starter-kit@3.28.0?bundle",
  "pptx-preview": "https://esm.sh/pptx-preview@1.0.7?bundle",
  jszip: "https://esm.sh/jszip@3.10.1?bundle",
  xlsx: `http://127.0.0.1:${backendPort}/vendor/xlsx/xlsx.mjs`,
});
function platformSourceResolver() {
  return {
    name: "platform-source-resolver",
    enforce: "pre",
    resolveId(id) {
      return resolveLegacyBrowserSourcePath(packageRoot, id);
    },
  };
}

function platformHmrOnlyNavigation() {
  return {
    name: "platform-hmr-only-navigation",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const method = String(req.method || "GET").toUpperCase();
        const acceptsHtml = String(req.headers.accept || "").includes("text/html");
        if (!["GET", "HEAD"].includes(method) || !acceptsHtml) {
          next();
          return;
        }
        const requestUrl = new URL(req.url || "/", platformAppOrigin);
        const target = new URL("/", platformAppOrigin);
        target.search = requestUrl.search;
        const threadPathMatch = requestUrl.pathname.match(
          /^\/(thread[_-][A-Za-z0-9_-]+)\/?$/,
        );
        if (threadPathMatch && !target.searchParams.has("thread")) {
          target.searchParams.set("thread", threadPathMatch[1]);
        }
        res.statusCode = 307;
        res.setHeader("Location", target.toString());
        res.setHeader("Cache-Control", "no-store");
        res.end();
      });
    },
  };
}

function platformRemoteBrowserImports() {
  return {
    name: "platform-remote-browser-imports",
    enforce: "pre",
    resolveId(id) {
      const target = remoteBrowserImports[id];
      return target ? { id: target, external: true } : null;
    },
  };
}

export default defineConfig(() => ({
  root: packageRoot,
  // Vite serves source modules and Fast Refresh only. The platform document
  // itself has exactly one owner: the application server on port 4177.
  base: "/",
  appType: "custom",
  plugins: [
    platformHmrOnlyNavigation(),
    platformRemoteBrowserImports(),
    platformSourceResolver(),
    createRunnerChatCssHmrPlugin({ packageRoot }),
    react(),
  ],
  server: {
    host: "127.0.0.1",
    port: vitePort,
    strictPort: true,
    cors: true,
    fs: {
      allow: [
        packageRoot,
      ],
    },
    hmr: {
      host: "127.0.0.1",
      port: vitePort,
    },
    proxy: {
      "/api": `http://127.0.0.1:${backendPort}`,
      "/img": `http://127.0.0.1:${backendPort}`,
      "/vendor": `http://127.0.0.1:${backendPort}`,
    },
  },
}));

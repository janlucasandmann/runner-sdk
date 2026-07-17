import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createRunnerChatCssHmrPlugin } from "./development/runner-chat-css-hmr.mjs";
import { resolveLegacyBrowserSourcePath } from "./shared/legacy-source-resolution.mjs";

const platformRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(platformRoot, "../..");
const clientRoot = path.join(platformRoot, "client");
const backendPort = Number(process.env.PLATFORM_API_PORT || process.env.PORT || 4177);
const vitePort = Number(process.env.PLATFORM_VITE_PORT || 5173);
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
  "pptx-preview": "https://esm.sh/pptx-preview@1.0.7?bundle",
  jszip: "https://esm.sh/jszip@3.10.1?bundle",
  xlsx: `http://127.0.0.1:${backendPort}/vendor/xlsx/xlsx.mjs`,
});

function platformLegacySourceResolver() {
  return {
    name: "platform-legacy-source-resolver",
    enforce: "pre",
    resolveId(id) {
      return resolveLegacyBrowserSourcePath(packageRoot, id);
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

export default defineConfig(({ command }) => ({
  root: clientRoot,
  // The compatibility document loads Vite-native /@vite and /@fs URLs
  // directly from the development origin. The production client remains
  // mounted below /platform-client/.
  base: command === "serve" ? "/" : "/platform-client/",
  appType: "spa",
  plugins: [
    platformRemoteBrowserImports(),
    platformLegacySourceResolver(),
    createRunnerChatCssHmrPlugin({ packageRoot }),
    react({
      exclude: [/\.platform-dev\/platform-legacy\.js$/],
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: vitePort,
    strictPort: true,
    cors: true,
    fs: {
      allow: [
        packageRoot,
        path.join(packageRoot, ".platform-dev"),
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
  build: {
    outDir: path.join(packageRoot, "dist", "platform-client"),
    emptyOutDir: true,
    manifest: true,
    sourcemap: true,
  },
}));

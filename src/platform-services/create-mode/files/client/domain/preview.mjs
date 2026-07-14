export const FILES_PREVIEW_DOMAIN_SCRIPT = `
      function isPlaygroundPresentationFile(entry) {
        if (!entry || entry.isFolder) return false;
        const mimeType = String(entry.mimeType || entry.type || entry.contentType || "").toLowerCase();
        const fileName = String(entry.name || entry.filename || entry.path || entry.url || "").trim().toLowerCase();
        const extension = fileName.includes(".")
          ? fileName.split(".").pop().toLowerCase()
          : "";
        return (
          ["ppt", "pptx", "pps", "ppsx", "pot", "potx"].includes(extension)
          || mimeType.includes("powerpoint")
          || mimeType.includes("presentationml")
          || mimeType.includes("vnd.ms-powerpoint")
        );
      }

      function buildPlaygroundStableDocumentPreviewToken(threadId, attachment, fallback = "") {
        const normalizedThreadId = String(threadId || "").trim();
        const tokenParts = [
          "file-preview",
          normalizedThreadId,
          attachment?.id,
          attachment?.fileId,
          attachment?.environmentId,
          attachment?.workspacePath,
          attachment?.sourcePath,
          attachment?.path,
          attachment?.filename,
          attachment?.name,
          fallback,
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean);
        return tokenParts.length > 1 ? tokenParts.join(":") : "file-preview:" + (normalizedThreadId || "thread");
      }

      function getPlaygroundFileKind(entry) {
        if (!entry || entry.isFolder) return "folder";

        const mimeType = String(entry.mimeType || "").toLowerCase();
        const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
        const extension = fileName.includes(".")
          ? fileName.split(".").pop().toLowerCase()
          : "";
        const isDockerfile = fileName === "dockerfile";

        if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"].includes(extension)) {
          return "image";
        }

        if (mimeType.startsWith("video/") || ["mp4", "m4v", "mov", "webm", "mkv"].includes(extension)) {
          return "video";
        }

        if (
          mimeType === "text/csv" ||
          mimeType === "text/tab-separated-values" ||
          mimeType === "application/vnd.ms-excel" ||
          mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          mimeType === "application/vnd.ms-excel.sheet.macroenabled.12" ||
          mimeType === "application/vnd.ms-excel.sheet.binary.macroenabled.12" ||
          mimeType === "application/vnd.oasis.opendocument.spreadsheet" ||
          mimeType === "application/vnd.apple.numbers" ||
          mimeType === "application/x-iwork-numbers-sffnumbers" ||
          ["csv", "tsv", "xls", "xlsx", "xlsm", "xlsb", "ods", "numbers"].includes(extension)
        ) {
          return "spreadsheet";
        }

        if (isPlaygroundPresentationFile(entry)) {
          return "presentation";
        }

        if (mimeType.includes("json") || extension === "json") {
          return "code";
        }

        if (
          mimeType.startsWith("text/") ||
          [
            "ts",
            "tsx",
            "js",
            "jsx",
            "mjs",
            "cjs",
            "css",
            "html",
            "md",
            "txt",
            "py",
            "rb",
            "go",
            "rs",
            "java",
            "c",
            "cpp",
            "cc",
            "cxx",
            "h",
            "hpp",
            "yml",
            "yaml",
            "sh",
            "swift",
            "kt",
            "kts",
            "php",
            "sql",
            "toml",
            "ini",
            "xml",
            "cs",
            "dart",
            "lua",
            "pl",
            "r",
            "scala",
          ].includes(extension)
          || isDockerfile
        ) {
          return extension === "md" ? "markdown" : extension === "html" ? "html" : "code";
        }

        if (extension === "pdf" || mimeType === "application/pdf") {
          return "pdf";
        }

        return "file";
      }

      function formatPlaygroundFileTypeLabel(entry) {
        const kind = getPlaygroundFileKind(entry);
        if (!kind) return "-";
        return kind.charAt(0).toUpperCase() + kind.slice(1);
      }

      function getPlaygroundPreviewMimeType(entry) {
        if (!entry || entry.isFolder) {
          return "";
        }

        const explicitMimeType = String(entry.mimeType || "").trim();
        if (explicitMimeType) {
          return explicitMimeType;
        }

        const kind = getPlaygroundFileKind(entry);
        if (kind === "image") {
          const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
          if (fileName.endsWith(".png")) return "image/png";
          if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
          if (fileName.endsWith(".gif")) return "image/gif";
          if (fileName.endsWith(".webp")) return "image/webp";
          if (fileName.endsWith(".svg")) return "image/svg+xml";
          if (fileName.endsWith(".bmp")) return "image/bmp";
          return "image/png";
        }
        if (kind === "markdown") return "text/markdown";
        if (kind === "html") return "text/html";
        if (kind === "pdf") return "application/pdf";
        if (kind === "presentation") {
          const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
          if (fileName.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
          if (fileName.endsWith(".pps")) return "application/vnd.ms-powerpoint";
          if (fileName.endsWith(".pot")) return "application/vnd.ms-powerpoint";
          return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        }
        if (kind === "video") {
          const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
          if (fileName.endsWith(".webm")) return "video/webm";
          if (fileName.endsWith(".mov")) return "video/quicktime";
          if (fileName.endsWith(".mkv")) return "video/x-matroska";
          return "video/mp4";
        }
        if (kind === "spreadsheet") {
          const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
          if (fileName.endsWith(".csv")) return "text/csv";
          if (fileName.endsWith(".tsv")) return "text/tab-separated-values";
          if (fileName.endsWith(".xls")) return "application/vnd.ms-excel";
          if (fileName.endsWith(".xlsm")) return "application/vnd.ms-excel.sheet.macroEnabled.12";
          if (fileName.endsWith(".xlsb")) return "application/vnd.ms-excel.sheet.binary.macroEnabled.12";
          if (fileName.endsWith(".ods")) return "application/vnd.oasis.opendocument.spreadsheet";
          if (fileName.endsWith(".numbers")) return "application/vnd.apple.numbers";
          return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        if (kind === "code") return "text/plain";
        return "application/octet-stream";
      }

      function isPlaygroundTextPreviewable(entry) {
        const kind = getPlaygroundFileKind(entry);
        return kind === "code" || kind === "markdown" || kind === "html";
      }

      function isPlaygroundImagePreviewable(entry) {
        return getPlaygroundFileKind(entry) === "image";
      }

      function getPlaygroundCodeEditorLanguage(entry) {
        if (!entry || entry.isFolder) return "plaintext";

        const fileName = String(entry.name || entry.path || "").trim().toLowerCase();
        const extension = fileName.includes(".")
          ? fileName.split(".").pop().toLowerCase()
          : "";

        if (fileName === "dockerfile") return "dockerfile";
        if (extension === "tsx" || extension === "ts") return "typescript";
        if (extension === "jsx" || extension === "js" || extension === "mjs" || extension === "cjs") return "javascript";
        if (extension === "json") return "json";
        if (extension === "css") return "css";
        if (extension === "py") return "python";
        if (extension === "sh") return "shell";
        if (extension === "yml" || extension === "yaml") return "yaml";
        if (extension === "go") return "go";
        if (extension === "rs") return "rust";
        if (extension === "java") return "java";
        if (extension === "c") return "c";
        if (extension === "cpp" || extension === "cc" || extension === "cxx" || extension === "h" || extension === "hpp") return "cpp";
        if (extension === "cs") return "csharp";
        if (extension === "php") return "php";
        if (extension === "rb") return "ruby";
        if (extension === "swift") return "swift";
        if (extension === "kt" || extension === "kts") return "kotlin";
        if (extension === "sql") return "sql";
        if (extension === "html" || extension === "htm") return "html";
        if (extension === "md" || extension === "markdown" || extension === "mdx") return "markdown";
        if (extension === "xml") return "xml";
        if (extension === "toml") return "ini";
        if (extension === "ini" || extension === "env") return "ini";
        if (extension === "dart") return "dart";
        if (extension === "lua") return "lua";
        if (extension === "pl") return "perl";
        if (extension === "r") return "r";
        if (extension === "scala") return "scala";
        return "plaintext";
      }

      function formatPlaygroundCodeEditorLanguageLabel(entry) {
        const language = getPlaygroundCodeEditorLanguage(entry);
        const labels = {
          c: "C",
          cpp: "C++",
          csharp: "C#",
          css: "CSS",
          dart: "Dart",
          dockerfile: "Dockerfile",
          go: "Go",
          ini: "Config",
          java: "Java",
          javascript: "JavaScript",
          json: "JSON",
          kotlin: "Kotlin",
          lua: "Lua",
          html: "HTML",
          markdown: "Markdown",
          perl: "Perl",
          php: "PHP",
          plaintext: "Text",
          python: "Python",
          r: "R",
          ruby: "Ruby",
          rust: "Rust",
          scala: "Scala",
          shell: "Shell",
          sql: "SQL",
          swift: "Swift",
          typescript: "TypeScript",
          xml: "XML",
          yaml: "YAML",
        };
        return labels[language] || "Text";
      }

      function normalizePlaygroundEnvironmentInventory(items) {
        return (Array.isArray(items) ? items : [])
          .map((item) => {
            const rawPath = String(item?.path || "").trim();
            if (!rawPath) return null;

            const normalizedPath = normalizeHistoryPath(rawPath.replace(/\\/+$/, ""));
            if (!normalizedPath) return null;
            if (normalizedPath.split("/").some((part) => part.startsWith("."))) return null;

            const isFolder =
              item?.isDirectory === true ||
              item?.type === "directory" ||
              item?.type === "folder" ||
              rawPath.endsWith("/");

            return {
              id: normalizedPath,
              name: normalizedPath.split("/").filter(Boolean).pop() || normalizedPath,
              path: normalizedPath,
              isFolder,
              size: Number.isFinite(item?.size) ? item.size : 0,
              createdTime: item?.createdTime || item?.createdAt || item?.lastModified || item?.modifiedTime || "",
              modifiedTime: item?.lastModified || item?.modifiedTime || "",
              mimeType: item?.mimeType || "",
              hasChildren: Boolean(item?.hasChildren),
            };
          })
          .filter(Boolean);
      }
`;

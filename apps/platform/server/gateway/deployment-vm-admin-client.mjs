import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function quoteShellArgument(value) {
  return "'" + String(value || "").replace(/'/g, "'\"'\"'") + "'";
}

export function createDeploymentVmAdminClient({
  deploymentVmNameOverride,
  deploymentVmNamePrefix,
  deploymentVmProject,
  execFileImpl = execFileAsync,
  accessImpl = fs.access,
}) {
  let cachedDeploymentVm = null;
  let cachedGcloudCommand = null;

  async function resolveGcloudCommand() {
    if (cachedGcloudCommand) return cachedGcloudCommand;
    const configuredCandidates = [
      process.env.GCLOUD_BIN,
      process.env.GCLOUD_COMMAND,
    ].map((candidate) => String(candidate || "").trim()).filter(Boolean);
    const candidates = [
      ...configuredCandidates.filter((candidate) => candidate.includes("/")),
      "/Users/jansandmann/google-cloud-sdk/bin/gcloud",
      "/opt/homebrew/bin/gcloud",
      "/usr/local/bin/gcloud",
      ...configuredCandidates.filter((candidate) => !candidate.includes("/")),
      "gcloud",
    ];
    for (const candidate of candidates) {
      try {
        if (candidate.includes("/")) {
          await accessImpl(candidate);
          cachedGcloudCommand = candidate;
          return cachedGcloudCommand;
        }
        const { stdout } = await execFileImpl("/bin/zsh", [
          "-lc",
          `command -v ${quoteShellArgument(candidate)}`,
        ], {
          maxBuffer: 1024 * 16,
        });
        const resolved = stdout.trim().split(/\r?\n/).find(Boolean);
        if (!resolved) continue;
        cachedGcloudCommand = resolved;
        return cachedGcloudCommand;
      } catch {
        // Try the next candidate.
      }
    }
    throw new Error("gcloud was not found for admin summary VM fallback.");
  }

  async function resolveDeploymentVm() {
    if (cachedDeploymentVm) return cachedDeploymentVm;
    const gcloudCommand = await resolveGcloudCommand();
    const args = deploymentVmNameOverride
      ? [
          "compute",
          "instances",
          "list",
          `--project=${deploymentVmProject}`,
          `--filter=name=${deploymentVmNameOverride}`,
          "--format=value(name,zone.basename())",
          "--limit=1",
        ]
      : [
          "compute",
          "instances",
          "list",
          `--project=${deploymentVmProject}`,
          `--filter=name~^${deploymentVmNamePrefix} AND status=RUNNING`,
          "--format=value(name,zone.basename())",
          "--limit=1",
        ];
    const { stdout } = await execFileImpl(gcloudCommand, args, {
      maxBuffer: 1024 * 256,
    });
    const line = stdout.trim().split(/\r?\n/).find(Boolean);
    const [name, zone] = String(line || "").trim().split(/\s+/);
    if (!name || !zone) {
      if (deploymentVmNameOverride) {
        throw new Error(`Deployment VM ${deploymentVmNameOverride} was not found.`);
      }
      throw new Error(
        `No running deployment VM matching ${deploymentVmNamePrefix} was found.`,
      );
    }
    cachedDeploymentVm = { name, zone };
    return cachedDeploymentVm;
  }

  async function fetchAdminSummaryViaDeploymentVm(
    requestSearch,
    upstreamPath,
    statusMarker,
    maxBuffer,
  ) {
    const normalizedSearch = String(requestSearch || "").startsWith("?")
      ? String(requestSearch || "")
      : "";
    const remoteUrl = `http://127.0.0.1:8080${upstreamPath}${normalizedSearch}`;
    const remoteCommand = [
      "set -e",
      "admin_key=$(sudo awk -F= '$1==\"ADMIN_API_KEY\"{print $0}' /opt/testbase-cloud/.env | tail -1 | cut -d= -f2-)",
      `curl -sS -w '\\n${statusMarker}%{http_code}' -H "Authorization: Bearer \${admin_key}" -H "X-Admin-Key: \${admin_key}" ${quoteShellArgument(remoteUrl)}`,
    ].join("; ");
    const deploymentVm = await resolveDeploymentVm();
    const gcloudCommand = await resolveGcloudCommand();
    const { stdout } = await execFileImpl(gcloudCommand, [
      "compute",
      "ssh",
      deploymentVm.name,
      `--project=${deploymentVmProject}`,
      `--zone=${deploymentVm.zone}`,
      "--quiet",
      "--command",
      remoteCommand,
    ], {
      maxBuffer,
    });
    const markerIndex = stdout.lastIndexOf(statusMarker);
    if (markerIndex === -1) {
      throw new Error(
        "Admin summary VM fallback did not return a status marker.",
      );
    }
    const bodyText = stdout.slice(0, markerIndex).trim();
    const status = Number(
      stdout.slice(markerIndex + statusMarker.length).trim(),
    ) || 502;
    let parsed = {};
    try {
      parsed = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      parsed = { message: bodyText };
    }
    return { status, parsed };
  }

  return Object.freeze({
    fetchFeedbackSummaryViaDeploymentVm(requestSearch) {
      return fetchAdminSummaryViaDeploymentVm(
        requestSearch,
        "/admin/feedback-summary",
        "__TB_FEEDBACK_SUMMARY_STATUS__:",
        1024 * 1024 * 5,
      );
    },
    fetchProductUsageSummaryViaDeploymentVm(requestSearch) {
      return fetchAdminSummaryViaDeploymentVm(
        requestSearch,
        "/admin/product-usage-summary",
        "__TB_PRODUCT_USAGE_SUMMARY_STATUS__:",
        1024 * 1024 * 10,
      );
    },
  });
}

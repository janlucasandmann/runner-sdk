import assert from "node:assert/strict";
import test from "node:test";

import {
  createDeploymentVmAdminClient,
  quoteShellArgument,
} from "./deployment-vm-admin-client.mjs";

test("quotes shell arguments without opening an interpolation boundary", () => {
  assert.equal(quoteShellArgument("it's safe"), "'it'\"'\"'s safe'");
});

test("uses the configured gcloud command and parses VM fallback responses", async () => {
  const calls = [];
  const client = createDeploymentVmAdminClient({
    deploymentVmNameOverride: "platform-vm",
    deploymentVmNamePrefix: "platform-",
    deploymentVmProject: "platform-project",
    accessImpl: async () => undefined,
    execFileImpl: async (command, args) => {
      calls.push({ command, args });
      if (args.includes("instances")) {
        return { stdout: "platform-vm europe-west1-b\n" };
      }
      return {
        stdout: '{"items":[1]}\n__TB_FEEDBACK_SUMMARY_STATUS__:200\n',
      };
    },
  });

  const previous = process.env.GCLOUD_BIN;
  process.env.GCLOUD_BIN = "/test/gcloud";
  try {
    assert.deepEqual(
      await client.fetchFeedbackSummaryViaDeploymentVm("?period=day"),
      { status: 200, parsed: { items: [1] } },
    );
  } finally {
    if (previous === undefined) delete process.env.GCLOUD_BIN;
    else process.env.GCLOUD_BIN = previous;
  }
  assert.equal(calls[0].command, "/test/gcloud");
  assert.equal(calls[1].command, "/test/gcloud");
});

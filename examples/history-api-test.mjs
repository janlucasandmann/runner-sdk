import { RunnerClient } from "../dist/index.js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function pickStepWithSnapshot(steps, preferredStepId) {
  if (preferredStepId) {
    const preferred = steps.find((step) => step.id === preferredStepId);
    if (!preferred) {
      throw new Error(`Requested step ${preferredStepId} was not found in the thread step list.`);
    }
    return preferred;
  }

  const candidate = steps.find((step) => step.snapshotAfterId || step.snapshotBeforeId);
  if (!candidate) {
    throw new Error("No thread step with a snapshot was found.");
  }
  return candidate;
}

function pickUserVisiblePath(paths) {
  return paths.find((path) => path && !path.startsWith(".")) || paths[0] || null;
}

function printSection(title, payload) {
  console.log(`\n=== ${title} ===`);
  console.log(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
}

async function main() {
  const backendUrl = requireEnv("RUNNER_BACKEND_URL");
  const apiKey = requireEnv("RUNNER_API_KEY");
  const threadId = requireEnv("RUNNER_THREAD_ID");
  const stepId = process.env.RUNNER_STEP_ID?.trim() || null;
  const allowMutations = process.env.RUNNER_ALLOW_MUTATIONS === "1";
  const allowRevert = process.env.RUNNER_ALLOW_REVERT === "1";
  const initializeEnvironmentHistory = process.env.RUNNER_INITIALIZE_ENV_HISTORY === "1";

  const headers = {
    "X-API-Key": apiKey,
  };

  const client = new RunnerClient();

  if (initializeEnvironmentHistory) {
    const initialized = await client.initializeEnvironmentSnapshots({
      backendUrl,
      environmentId: requireEnv("RUNNER_ENVIRONMENT_ID"),
      headers,
    });
    printSection("Initialized Environment Snapshot History", initialized);
  }

  const steps = await client.listThreadSteps({
    backendUrl,
    threadId,
    headers,
    limit: 500,
  });
  printSection("Thread Steps", {
    count: steps.length,
    firstFive: steps.slice(0, 5).map((step) => ({
      id: step.id,
      sequence: step.sequence,
      title: step.title,
      snapshotBeforeId: step.snapshotBeforeId,
      snapshotAfterId: step.snapshotAfterId,
    })),
  });

  const selectedStep = pickStepWithSnapshot(steps, stepId);
  printSection("Selected Step", {
    id: selectedStep.id,
    sequence: selectedStep.sequence,
    title: selectedStep.title,
    environmentId: selectedStep.environmentId,
    snapshotBeforeId: selectedStep.snapshotBeforeId,
    snapshotAfterId: selectedStep.snapshotAfterId,
  });

  const threadDiff = await client.getThreadStepDiff({
    backendUrl,
    threadId,
    stepId: selectedStep.id,
    headers,
  });
  printSection("Thread Step Diff Summary", {
    additions: threadDiff.additions,
    deletions: threadDiff.deletions,
    changedPaths: threadDiff.changedPaths,
    diffPreview: threadDiff.diff.slice(0, 1000),
  });

  const stepFiles = await client.listThreadStepFiles({
    backendUrl,
    threadId,
    stepId: selectedStep.id,
    headers,
  });
  printSection("Thread Step Files", {
    count: stepFiles.length,
    firstTen: stepFiles.slice(0, 10),
  });

  const selectedPath = pickUserVisiblePath(threadDiff.changedPaths);
  if (selectedPath) {
    const stepFile = await client.getThreadStepFile({
      backendUrl,
      threadId,
      stepId: selectedStep.id,
      path: selectedPath,
      headers,
    });
    printSection("Thread Step File Preview", {
      path: stepFile.path,
      snapshotId: stepFile.snapshotId,
      contentPreview: stepFile.content.slice(0, 600),
    });

    const fileHistory = await client.listThreadFileHistory({
      backendUrl,
      threadId,
      path: selectedPath,
      headers,
      limit: 50,
    });
    printSection("Thread File History", {
      path: selectedPath,
      totalCount: fileHistory.total_count,
      firstTen: fileHistory.data.slice(0, 10),
    });
  } else {
    printSection("Thread Step File Preview", "No changed file path was available on the selected step.");
  }

  const snapshots = await client.listEnvironmentSnapshots({
    backendUrl,
    environmentId: selectedStep.environmentId,
    headers,
    limit: 20,
  });
  printSection("Environment Snapshots", {
    count: snapshots.length,
    firstFive: snapshots.slice(0, 5).map((snapshot) => ({
      id: snapshot.id,
      additions: snapshot.additions,
      deletions: snapshot.deletions,
      sourceStepId: snapshot.sourceStepId,
      createdAt: snapshot.createdAt,
    })),
  });

  const selectedSnapshot = snapshots.find((snapshot) => snapshot.id === (selectedStep.snapshotAfterId || selectedStep.snapshotBeforeId))
    || snapshots[0]
    || null;

  if (selectedSnapshot) {
    const snapshotFiles = await client.listEnvironmentSnapshotFiles({
      backendUrl,
      environmentId: selectedStep.environmentId,
      snapshotId: selectedSnapshot.id,
      headers,
    });
    printSection("Environment Snapshot Files", {
      snapshotId: selectedSnapshot.id,
      count: snapshotFiles.length,
      firstTen: snapshotFiles.slice(0, 10),
    });

    const snapshotDiff = await client.getEnvironmentSnapshotDiff({
      backendUrl,
      environmentId: selectedStep.environmentId,
      snapshotId: selectedSnapshot.id,
      headers,
    });
    printSection("Environment Snapshot Diff Summary", {
      snapshotId: selectedSnapshot.id,
      additions: snapshotDiff.additions,
      deletions: snapshotDiff.deletions,
      changedPaths: snapshotDiff.changedPaths,
      diffPreview: snapshotDiff.diff.slice(0, 1000),
    });
  } else {
    printSection("Environment Snapshot Diff Summary", "No environment snapshots were available.");
  }

  if (!allowMutations) {
    printSection(
      "Mutations Skipped",
      "Set RUNNER_ALLOW_MUTATIONS=1 to also exercise historical/latest fork. Set RUNNER_ALLOW_REVERT=1 as well to exercise revert.",
    );
    return;
  }

  const historicalFork = await client.forkThreadFromStep({
    backendUrl,
    threadId,
    stepId: selectedStep.id,
    mode: "historical",
    headers,
    title: `History fork ${Date.now()}`,
    environmentName: `History fork env ${Date.now()}`,
  });
  printSection("Historical Fork Result", historicalFork);

  const latestFork = await client.forkThreadFromStep({
    backendUrl,
    threadId,
    stepId: selectedStep.id,
    mode: "latest",
    headers,
    title: `Latest fork ${Date.now()}`,
    environmentName: `Latest fork env ${Date.now()}`,
  });
  printSection("Latest Fork Result", latestFork);

  if (!allowRevert) {
    printSection("Revert Skipped", "Set RUNNER_ALLOW_REVERT=1 to exercise destructive revert on the source thread.");
    return;
  }

  const revertResult = await client.revertThreadToStep({
    backendUrl,
    threadId,
    stepId: selectedStep.id,
    headers,
  });
  printSection("Revert Result", revertResult);
}

main().catch((error) => {
  console.error("\nHistory API test failed.");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});

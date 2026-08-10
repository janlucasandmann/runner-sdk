import assert from "node:assert/strict";
import test from "node:test";

import { createExternalAgentDeliveryService } from "./delivery.mjs";

test("provider-side delivery markers suppress duplicate replies after an outbox retry", async () => {
  const comments = [];
  const invocations = [];
  const adapter = {
    async invoke(request) {
      invocations.push(request);
      if (request.name === "list_comments") return { comments };
      if (request.name === "add_comment") {
        comments.push({
          id: `comment_${comments.length + 1}`,
          body: request.arguments.body,
          properties: request.arguments.properties,
        });
        return comments.at(-1);
      }
      throw new Error(`Unexpected action: ${request.name}`);
    },
  };
  const service = createExternalAgentDeliveryService({
    adapterRegistry: { get: () => adapter },
    platformOrigin: "https://platform.example.test",
    logger: { info() {} },
  });
  const delivery = {
    id: "delivery_1",
    kind: "completion",
    eventId: "event_1",
    provider: "jira",
    threadId: "thread_1",
    platformUserId: "user_1",
    summary: "The issue has been investigated.",
    envelope: {
      provider: "jira",
      resource: { id: "issue_1", key: "OPS-1" },
    },
  };
  const installation = {
    organizationId: "organization_1",
    credentialId: "credential_jira_1",
  };
  const binding = { agentId: "agent_1", agentName: "Operations Agent" };

  await service.deliver({ delivery, installation, binding });
  const retried = await service.deliver({ delivery, installation, binding });

  assert.equal(retried.duplicateSuppressed, true);
  assert.equal(invocations.filter((entry) => entry.name === "add_comment").length, 1);
  assert.equal(comments.length, 1);
  assert.doesNotMatch(comments[0].body, /computer-agents-delivery/);
  assert.match(comments[0].body, /Open in Computer Agents/);
  assert.deepEqual(comments[0].properties, [{
    key: "computer-agents.delivery",
    value: {
      source: "computer-agents",
      version: 1,
      kind: "completion",
      eventId: "event_1",
    },
  }]);
  assert.equal(
    invocations.find((entry) => entry.name === "list_comments")?.arguments?.expand,
    "properties",
  );
});

test("Linear delivery keeps its retry marker hidden in Markdown comments", async () => {
  const invocations = [];
  const adapter = {
    async invoke(request) {
      invocations.push(request);
      if (request.name === "list_issue_comments") return { nodes: [] };
      if (request.name === "add_issue_comment") return { id: "comment_linear_1" };
      throw new Error(`Unexpected action: ${request.name}`);
    },
  };
  const service = createExternalAgentDeliveryService({
    adapterRegistry: { get: () => adapter },
    logger: { info() {} },
  });

  await service.deliver({
    delivery: {
      id: "delivery_linear_1",
      kind: "completion",
      eventId: "event_linear_1",
      provider: "linear",
      threadId: "thread_linear_1",
      summary: "Completed the Linear task.",
      envelope: {
        provider: "linear",
        resource: { id: "issue_linear_1", key: "LIN-1" },
      },
    },
    installation: {
      organizationId: "organization_1",
      credentialId: "credential_linear_1",
    },
    binding: { agentId: "agent_1", agentName: "Operations Agent" },
  });

  const comment = invocations.find((entry) => entry.name === "add_issue_comment");
  assert.match(comment.arguments.body, /computer-agents-delivery:completion:event_linear_1/);
});

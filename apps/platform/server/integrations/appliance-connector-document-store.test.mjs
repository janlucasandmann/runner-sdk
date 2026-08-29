import assert from "node:assert/strict";
import test from "node:test";

import {
  createApplianceConnectorDocumentStore,
  isApplianceConnectorDocumentStoreEnabled,
} from "./appliance-connector-document-store.mjs";

test("appliance connector storage is selected only for on-prem deployments", () => {
  assert.equal(isApplianceConnectorDocumentStoreEnabled({}), false);
  assert.equal(
    isApplianceConnectorDocumentStoreEnabled({ DEPLOYMENT_TOPOLOGY: "gcp_saas" }),
    false,
  );
  assert.equal(
    isApplianceConnectorDocumentStoreEnabled({ DEPLOYMENT_TOPOLOGY: "on_prem" }),
    true,
  );
});

test("appliance connector storage authenticates local control-plane operations", async () => {
  const requests = [];
  const documents = new Map();
  const secret = "connector-control-secret-with-32-bytes-minimum";
  const store = createApplianceConnectorDocumentStore({
    env: {
      DEPLOYMENT_TOPOLOGY: "on_prem",
      RUNNER_UPSTREAM_ORIGIN: "http://127.0.0.1:8080/v1",
      PLATFORM_CONTROL_PLANE_SECRET: secret,
    },
    async fetchImpl(input, init) {
      const url = new URL(input);
      const body = init.body ? JSON.parse(init.body) : {};
      requests.push({ url, init, body });
      assert.equal(
        init.headers.get("X-Computer-Agents-Control-Secret"),
        secret,
      );
      const path = url.searchParams.get("path") || body.path;
      if (init.method === "PATCH") {
        const document = { fields: body.fields };
        documents.set(path, document);
        return Response.json({ document });
      }
      if (url.pathname.endsWith("/consume")) {
        const document = documents.get(path);
        documents.delete(path);
        return document
          ? Response.json({ document })
          : Response.json({ error: "Not Found" }, { status: 404 });
      }
      const document = documents.get(path);
      return document
        ? Response.json({ document })
        : Response.json({ error: "Not Found" }, { status: 404 });
    },
  });

  const fields = { provider: { stringValue: "github" } };
  await store.patchDocument("oauth_states/state_1", fields, ["provider"]);
  assert.deepEqual(
    await store.getDocument("oauth_states/state_1"),
    { fields },
  );
  assert.deepEqual(
    await store.consumeDocument("oauth_states/state_1"),
    { fields },
  );
  assert.equal(await store.getDocument("oauth_states/state_1"), null);
  assert.equal(requests[0].url.origin, "http://127.0.0.1:8080");
});

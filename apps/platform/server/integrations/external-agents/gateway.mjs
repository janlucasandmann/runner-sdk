import {
  ExternalAgentError,
  createExternalAgentId,
  sanitizeExternalAgentRecord,
} from "./domain.mjs";
import {
  findExternalAgentIdentity,
  selectExternalAgentBinding,
} from "./policy.mjs";

export function createExternalAgentGateway({
  repository,
  policy,
  threadInvoker,
  deliveryService,
  maxEventAttempts = 5,
  maxDeliveryAttempts = 8,
  pollIntervalMs = 1_000,
  staleClaimMs = 35 * 60 * 1_000,
  logger = console,
} = {}) {
  assertDependency(repository?.ingestEvent, "repository");
  assertDependency(policy?.authorize, "policy");
  assertDependency(threadInvoker?.createThread, "thread invoker");
  assertDependency(deliveryService?.deliver, "delivery service");

  let started = false;
  let stopping = false;
  let drainPromise = null;
  let interval = null;

  async function ingest(envelope) {
    const snapshot = await repository.snapshot();
    const installation = snapshot.installations.find((candidate) => (
      candidate.id === envelope?.installationId
      && candidate.provider === envelope?.provider
      && candidate.enabled !== false
    ));
    if (!installation) {
      throw new ExternalAgentError(
        403,
        "external_installation_unavailable",
        "The external-agent installation is unavailable.",
      );
    }
    const result = await repository.ingestEvent(envelope, {
      organizationId: installation.organizationId,
    });
    if (!result.duplicate) wake();
    return result;
  }

  function start() {
    if (started) return;
    started = true;
    stopping = false;
    void repository.recoverStaleClaims({ before: Date.now() - staleClaimMs })
      .catch((error) => logFailure(logger, "claim recovery", error))
      .finally(wake);
    interval = setInterval(wake, Math.max(250, Number(pollIntervalMs) || 1_000));
    interval.unref?.();
  }

  async function stop({ wait = true } = {}) {
    stopping = true;
    started = false;
    if (interval) clearInterval(interval);
    interval = null;
    if (wait && drainPromise) await drainPromise.catch(() => undefined);
  }

  function wake() {
    if (stopping || drainPromise) return;
    drainPromise = drain()
      .catch((error) => logFailure(logger, "worker drain", error))
      .finally(() => {
        drainPromise = null;
      });
  }

  async function drain() {
    while (!stopping) {
      const delivery = await repository.claimDelivery();
      if (delivery) {
        await processDelivery(delivery);
        continue;
      }
      const event = await repository.claimEvent();
      if (event) {
        await processEvent(event);
        continue;
      }
      return;
    }
  }

  async function processEvent(claimedEvent) {
    const envelope = claimedEvent.envelope;
    try {
      const snapshot = await repository.snapshot();
      const installation = snapshot.installations.find((candidate) => candidate.id === envelope.installationId);
      if (!installation) {
        throw new ExternalAgentError(403, "external_installation_missing", "The installation is unavailable.");
      }
      const binding = selectExternalAgentBinding({
        bindings: snapshot.bindings,
        installation,
        envelope,
      });
      const identity = findExternalAgentIdentity({
        identities: snapshot.identities,
        installation,
        envelope,
      });
      const authorization = await policy.authorize({ envelope, installation, binding, identity });
      let conversation = snapshot.conversations.find((candidate) => (
        candidate.installationId === installation.id
        && candidate.bindingId === binding.id
        && candidate.conversationKey === envelope.conversationKey
      ));
      let threadId = String(conversation?.threadId || claimedEvent.threadId || "").trim();
      await updateExecutionTask({
        claimedEvent,
        binding,
        identity,
        threadId,
        status: threadId ? "resuming" : "creating_thread",
      });
      if (!threadId) {
        const thread = await threadInvoker.createThread({ envelope, binding, identity, installation });
        threadId = thread.id;
        conversation = await persistConversation({
          eventId: claimedEvent.id,
          envelope,
          installation,
          binding,
          identity,
          threadId,
        });
      } else {
        await persistEventThread({ eventId: claimedEvent.id, threadId });
      }
      await updateExecutionTask({
        claimedEvent,
        binding,
        identity,
        threadId,
        status: "running",
      });
      const result = await threadInvoker.runTurn({
        envelope,
        binding,
        identity,
        installation,
        threadId,
      });
      await completeEvent({
        claimedEvent,
        installation,
        binding,
        identity,
        authorization,
        conversation,
        threadId,
        summary: result.summary,
      });
      logger?.info?.("[external-agents] Event completed", {
        eventId: claimedEvent.id,
        providerEventId: envelope.eventId,
        provider: envelope.provider,
        threadId,
      });
    } catch (error) {
      await failEvent(claimedEvent, error);
    }
  }

  async function persistConversation({ eventId, envelope, installation, binding, identity, threadId }) {
    const now = new Date().toISOString();
    return repository.transact((store) => {
      const event = store.events.find((candidate) => candidate.id === eventId);
      if (event) {
        event.threadId = threadId;
        event.updatedAt = now;
      }
      let conversation = store.conversations.find((candidate) => (
        candidate.installationId === installation.id
        && candidate.bindingId === binding.id
        && candidate.conversationKey === envelope.conversationKey
      ));
      if (!conversation) {
        conversation = {
          id: createExternalAgentId("external_conversation"),
          organizationId: installation.organizationId,
          installationId: installation.id,
          bindingId: binding.id,
          conversationKey: envelope.conversationKey,
          threadId,
          providerResourceId: envelope.resource.id,
          platformUserId: identity?.platformUserId || "",
          createdAt: now,
          updatedAt: now,
        };
        store.conversations.push(conversation);
      } else {
        conversation.threadId = conversation.threadId || threadId;
        conversation.updatedAt = now;
      }
      return conversation;
    });
  }

  async function persistEventThread({ eventId, threadId }) {
    await repository.transact((store) => {
      const event = store.events.find((candidate) => candidate.id === eventId);
      if (!event) return;
      event.threadId = threadId;
      event.updatedAt = new Date().toISOString();
    });
  }

  async function updateExecutionTask({ claimedEvent, binding, identity, threadId, status }) {
    const now = new Date().toISOString();
    await repository.transact((store) => {
      let task = store.tasks.find((candidate) => candidate.eventId === claimedEvent.id);
      if (!task) {
        task = {
          id: createExternalAgentId("external_task"),
          eventId: claimedEvent.id,
          bindingId: binding.id,
          platformUserId: identity?.platformUserId || "",
          threadId: threadId || "",
          status,
          attempts: claimedEvent.attempts,
          createdAt: now,
          updatedAt: now,
        };
        store.tasks.push(task);
      } else {
        task.status = status;
        task.threadId = threadId || task.threadId;
        task.attempts = claimedEvent.attempts;
        task.updatedAt = now;
      }
    });
  }

  async function completeEvent({
    claimedEvent,
    installation,
    binding,
    identity,
    authorization,
    conversation,
    threadId,
    summary,
  }) {
    const now = new Date().toISOString();
    await repository.transact((store) => {
      const event = store.events.find((candidate) => candidate.id === claimedEvent.id);
      if (!event || event.status !== "processing") return;
      const activeInstallation = store.installations.find((candidate) => (
        candidate.id === installation.id && candidate.enabled !== false
      ));
      const activeBinding = store.bindings.find((candidate) => (
        candidate.id === binding.id
        && candidate.installationId === installation.id
        && candidate.enabled !== false
      ));
      if (!activeInstallation || !activeBinding) {
        event.status = "denied";
        event.errorCode = "external_configuration_unavailable";
        event.errorMessage = "The external-agent configuration was disabled before the run completed.";
        event.cancelledAt = now;
        event.updatedAt = now;
        delete event.nextAttemptAt;
        const cancelledTask = store.tasks.find((candidate) => candidate.eventId === claimedEvent.id);
        if (cancelledTask) {
          cancelledTask.status = "denied";
          cancelledTask.errorCode = event.errorCode;
          cancelledTask.errorMessage = event.errorMessage;
          cancelledTask.cancelledAt = now;
          cancelledTask.updatedAt = now;
        }
        return;
      }
      event.status = "completed";
      event.threadId = threadId;
      event.summary = summary;
      event.completedAt = now;
      event.updatedAt = now;
      delete event.nextAttemptAt;
      const task = store.tasks.find((candidate) => candidate.eventId === claimedEvent.id);
      if (task) {
        task.status = "completed";
        task.summary = summary;
        task.completedAt = now;
        task.updatedAt = now;
      }
      const activeConversation = store.conversations.find((candidate) => (
        candidate.id === conversation?.id
        || (
          candidate.installationId === installation.id
          && candidate.bindingId === binding.id
          && candidate.conversationKey === claimedEvent.envelope.conversationKey
        )
      ));
      if (activeConversation) activeConversation.updatedAt = now;
      if (!store.deliveries.some((candidate) => (
        candidate.eventId === claimedEvent.id && candidate.kind === "completion"
      ))) {
        store.deliveries.push({
          id: createExternalAgentId("external_delivery"),
          kind: "completion",
          eventId: claimedEvent.id,
          organizationId: installation.organizationId,
          installationId: installation.id,
          bindingId: binding.id,
          provider: claimedEvent.envelope.provider,
          envelope: claimedEvent.envelope,
          threadId,
          summary,
          platformUserId: identity?.platformUserId || "",
          authorizationMode: authorization.mode,
          status: "pending",
          attempts: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    });
  }

  async function failEvent(claimedEvent, error) {
    const statusCode = Number(error?.statusCode) || 500;
    const denied = statusCode === 401 || statusCode === 403;
    const exhausted = Number(claimedEvent.attempts || 0) >= maxEventAttempts;
    const now = new Date().toISOString();
    const errorCode = String(error?.code || "external_agent_event_failed").slice(0, 160);
    const errorMessage = String(error?.message || "External-agent event processing failed.").slice(0, 1_000);
    await repository.transact((store) => {
      const event = store.events.find((candidate) => candidate.id === claimedEvent.id);
      if (!event) return;
      event.status = denied ? "denied" : exhausted ? "failed" : "pending";
      event.errorCode = errorCode;
      event.errorMessage = errorMessage;
      event.updatedAt = now;
      if (!denied && !exhausted) event.nextAttemptAt = nextRetryAt(claimedEvent.attempts);
      else delete event.nextAttemptAt;
      const task = store.tasks.find((candidate) => candidate.eventId === claimedEvent.id);
      if (task) {
        task.status = event.status;
        task.errorCode = errorCode;
        task.errorMessage = errorMessage;
        task.updatedAt = now;
      }
      if (!denied && exhausted && !store.deliveries.some((candidate) => (
        candidate.eventId === claimedEvent.id && candidate.kind === "failure"
      ))) {
        const installation = store.installations.find((candidate) => candidate.id === claimedEvent.envelope.installationId);
        const binding = selectExternalAgentBinding({
          bindings: store.bindings,
          installation: installation || {},
          envelope: claimedEvent.envelope,
        });
        if (installation && binding) {
          store.deliveries.push({
            id: createExternalAgentId("external_delivery"),
            kind: "failure",
            eventId: claimedEvent.id,
            organizationId: installation.organizationId,
            installationId: installation.id,
            bindingId: binding.id,
            provider: claimedEvent.envelope.provider,
            envelope: claimedEvent.envelope,
            threadId: event.threadId || "",
            summary: "Computer Agents could not complete this request. Please retry or open the linked thread for details.",
            status: "pending",
            attempts: 0,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    });
    logger?.warn?.("[external-agents] Event processing failed", {
      eventId: claimedEvent.id,
      providerEventId: claimedEvent.envelope?.eventId,
      status: denied ? "denied" : exhausted ? "failed" : "retrying",
      errorCode,
      errorMessage,
    });
  }

  async function processDelivery(claimedDelivery) {
    try {
      const snapshot = await repository.snapshot();
      const installation = snapshot.installations.find((candidate) => candidate.id === claimedDelivery.installationId);
      const binding = snapshot.bindings.find((candidate) => candidate.id === claimedDelivery.bindingId);
      if (!installation?.enabled || !binding?.enabled) {
        throw new ExternalAgentError(
          409,
          "external_delivery_configuration_unavailable",
          "The delivery configuration is no longer enabled.",
        );
      }
      const result = await deliveryService.deliver({ delivery: claimedDelivery, installation, binding });
      const now = new Date().toISOString();
      await repository.transact((store) => {
        const delivery = store.deliveries.find((candidate) => candidate.id === claimedDelivery.id);
        if (!delivery) return;
        delivery.status = "completed";
        delivery.completedAt = now;
        delivery.updatedAt = now;
        delivery.result = sanitizeExternalAgentRecord(result);
        delete delivery.nextAttemptAt;
      });
    } catch (error) {
      const exhausted = Number(claimedDelivery.attempts || 0) >= maxDeliveryAttempts;
      const now = new Date().toISOString();
      await repository.transact((store) => {
        const delivery = store.deliveries.find((candidate) => candidate.id === claimedDelivery.id);
        if (!delivery) return;
        delivery.status = exhausted ? "failed" : "pending";
        delivery.errorCode = String(error?.code || "external_delivery_failed").slice(0, 160);
        delivery.errorMessage = String(error?.message || "Provider delivery failed.").slice(0, 1_000);
        delivery.updatedAt = now;
        if (!exhausted) delivery.nextAttemptAt = nextRetryAt(claimedDelivery.attempts);
        else delete delivery.nextAttemptAt;
      });
      logger?.warn?.("[external-agents] Provider delivery failed", {
        deliveryId: claimedDelivery.id,
        eventId: claimedDelivery.eventId,
        status: exhausted ? "failed" : "retrying",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function getHealth(organizationId = "") {
    const snapshot = await repository.snapshot();
    const normalizedOrganizationId = String(organizationId || "").trim();
    const installations = normalizedOrganizationId
      ? snapshot.installations.filter((record) => record.organizationId === normalizedOrganizationId)
      : snapshot.installations;
    const installationIds = new Set(installations.map((record) => record.id));
    const belongsToOrganization = (record) => (
      !normalizedOrganizationId
      || record.organizationId === normalizedOrganizationId
      || installationIds.has(record.installationId || record.envelope?.installationId)
    );
    return {
      started,
      stopping,
      installations: installations.length,
      bindings: snapshot.bindings.filter(belongsToOrganization).length,
      events: countStatuses(snapshot.events.filter(belongsToOrganization)),
      deliveries: countStatuses(snapshot.deliveries.filter(belongsToOrganization)),
    };
  }

  return Object.freeze({ getHealth, ingest, start, stop, wake });
}

function nextRetryAt(attempt) {
  const delayMs = Math.min(5 * 60 * 1_000, 1_000 * (2 ** Math.max(0, Number(attempt || 1) - 1)));
  return new Date(Date.now() + delayMs).toISOString();
}

function countStatuses(records) {
  return (Array.isArray(records) ? records : []).reduce((counts, record) => {
    const status = String(record?.status || "unknown");
    counts[status] = Number(counts[status] || 0) + 1;
    return counts;
  }, {});
}

function assertDependency(value, label) {
  if (typeof value !== "function") {
    throw new TypeError(`External-agent gateway requires its ${label}.`);
  }
}

function logFailure(logger, operation, error) {
  logger?.error?.(`[external-agents] ${operation} failed`, error);
}

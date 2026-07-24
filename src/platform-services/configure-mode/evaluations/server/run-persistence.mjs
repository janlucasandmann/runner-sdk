function sleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(delayMs) || 0)));
}

function shouldRetryPersistenceError(error) {
  const status = Number(error?.status || 0);
  if (!status) return true;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

/**
 * Serializes and coalesces durable evaluation-run writes by run id.
 *
 * A newer snapshot supersedes queued snapshots that have not started writing.
 * Callers waiting on an older snapshot are resolved once that snapshot or a
 * newer one has been persisted.
 */
export function createEvaluationRunPersistenceCoordinator(options = {}) {
  const persist = options.persist;
  if (typeof persist !== "function") {
    throw new TypeError("Evaluation run persistence requires a persist function.");
  }

  const maxAttempts = Math.max(1, Number(options.maxAttempts) || 4);
  const retryDelaysMs = Array.isArray(options.retryDelaysMs) && options.retryDelaysMs.length
    ? options.retryDelaysMs.map((value) => Math.max(0, Number(value) || 0))
    : [100, 300, 1000];
  const wait = typeof options.sleep === "function" ? options.sleep : sleep;
  const shouldRetry = typeof options.shouldRetry === "function"
    ? options.shouldRetry
    : shouldRetryPersistenceError;
  const onError = typeof options.onError === "function" ? options.onError : () => {};
  const states = new Map();

  function getState(runId) {
    const normalizedRunId = String(runId || "").trim();
    if (!normalizedRunId) {
      throw new TypeError("Evaluation run persistence requires a run id.");
    }
    let state = states.get(normalizedRunId);
    if (!state) {
      state = {
        nextSequence: 0,
        persistedSequence: 0,
        failedSequence: 0,
        failure: null,
        pending: null,
        processing: null,
        waiters: [],
      };
      states.set(normalizedRunId, state);
    }
    return { runId: normalizedRunId, state };
  }

  function settleWaiters(state, sequence, result, error = null) {
    const remaining = [];
    for (const waiter of state.waiters) {
      if (waiter.sequence > sequence) {
        remaining.push(waiter);
      } else if (error) {
        waiter.reject(error);
      } else {
        waiter.resolve(result);
      }
    }
    state.waiters = remaining;
  }

  async function persistWithRetry(snapshot) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await persist(snapshot.record, snapshot.run);
      } catch (error) {
        lastError = error;
        if (attempt >= maxAttempts || !shouldRetry(error)) {
          break;
        }
        const delayMs = retryDelaysMs[Math.min(attempt - 1, retryDelaysMs.length - 1)] || 0;
        if (delayMs > 0) {
          await wait(delayMs);
        }
      }
    }
    throw lastError || new Error("Failed to persist evaluation run.");
  }

  async function drain(runId, state) {
    while (state.pending) {
      const snapshot = state.pending;
      state.pending = null;
      try {
        const result = await persistWithRetry(snapshot);
        state.persistedSequence = Math.max(state.persistedSequence, snapshot.sequence);
        state.failedSequence = 0;
        state.failure = null;
        settleWaiters(state, snapshot.sequence, result);
      } catch (error) {
        if (state.pending) {
          continue;
        }
        state.failedSequence = Math.max(state.failedSequence, snapshot.sequence);
        state.failure = error;
        settleWaiters(state, snapshot.sequence, null, error);
        onError(error, {
          runId,
          sequence: snapshot.sequence,
          run: snapshot.run,
        });
      }
    }
  }

  function startDrain(runId, state) {
    if (state.processing) return;
    const processing = drain(runId, state);
    state.processing = processing.finally(() => {
      state.processing = null;
      if (state.pending) {
        startDrain(runId, state);
      } else if (!state.waiters.length && !state.failure) {
        states.delete(runId);
      }
    });
  }

  function enqueue(record, run) {
    const normalizedRunId = String(run?.id || record?.run?.id || "").trim();
    const { runId, state } = getState(normalizedRunId);
    const sequence = state.nextSequence + 1;
    state.nextSequence = sequence;
    state.pending = { sequence, record, run };
    state.failure = null;
    state.failedSequence = 0;
    const result = new Promise((resolve, reject) => {
      state.waiters.push({ sequence, resolve, reject });
    });
    startDrain(runId, state);
    return result;
  }

  function waitForIdle(runId) {
    const normalizedRunId = String(runId || "").trim();
    const state = states.get(normalizedRunId);
    if (!state) return Promise.resolve(null);
    const sequence = state.nextSequence;
    if (state.persistedSequence >= sequence) return Promise.resolve(null);
    if (!state.pending && !state.processing && state.failedSequence >= sequence && state.failure) {
      return Promise.reject(state.failure);
    }
    return new Promise((resolve, reject) => {
      state.waiters.push({ sequence, resolve, reject });
    });
  }

  function forget(runId) {
    states.delete(String(runId || "").trim());
  }

  return Object.freeze({
    enqueue,
    forget,
    waitForIdle,
  });
}


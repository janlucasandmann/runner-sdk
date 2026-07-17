export function summarizeRunnerStreamChunkForLog(value) {
  const text = new TextDecoder().decode(value || new Uint8Array());
  const summaries = [];
  for (const block of text.split(/\n\n+/)) {
    const data = block
      .split(/\r?\n/)
      .map((line) => line.startsWith("data:") ? line.slice(5).trimStart() : "")
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!data || data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data);
      summaries.push({
        type: typeof parsed?.type === "string" ? parsed.type : "",
        status: typeof parsed?.status === "string" ? parsed.status : undefined,
        eventType: typeof parsed?.eventType === "string"
          ? parsed.eventType
          : undefined,
        model: typeof parsed?.response?.model === "string"
          ? parsed.response.model
          : undefined,
        environmentId: typeof parsed?.response?.environment_id === "string"
          ? parsed.response.environment_id
          : undefined,
        agentId: typeof parsed?.response?.agent_id === "string"
          ? parsed.response.agent_id
          : undefined,
        error: typeof parsed?.error?.message === "string"
          ? parsed.error.message
          : typeof parsed?.message === "string"
              && String(parsed.type || "").includes("error")
            ? parsed.message
            : undefined,
      });
    } catch {
      summaries.push({ parseError: true, sample: data.slice(0, 120) });
    }
  }
  return summaries;
}

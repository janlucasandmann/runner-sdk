export function getAgentAssistantPresetVisiblePrompt(value) {
        const text = extractAgentAssistantPresetText(value);
        if (text.includes("Preset action: Optimize Agent based on latest threads.")) {
            return "Optimize Agent based on latest threads";
        }
        if (text.includes("Preset action: Analyze model & reasoning effort fit.")) {
            return "Analyze model & reasoning effort fit";
        }
        if (text.includes("Preset action: Analyze efficiency.")) {
            return "Analyze model & reasoning effort fit";
        }
        return "";
    }
export function extractAgentAssistantPresetText(value) {
        if (typeof value === "string") {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(extractAgentAssistantPresetText).filter(Boolean).join("\n");
        }
        if (value && typeof value === "object") {
            if (typeof value.text === "string")
                return value.text;
            if (typeof value.content === "string")
                return value.content;
            if (Array.isArray(value.content))
                return extractAgentAssistantPresetText(value.content);
        }
        return String(value || "");
    }
export function isAgentAssistantPresetExecutionContent(value) {
        return Boolean(getAgentAssistantPresetVisiblePrompt(value));
    }
export function sanitizeAgentAssistantPresetMessage(message) {
        if (!message || typeof message !== "object" || Array.isArray(message)) {
            return message;
        }
        const visiblePrompt = getAgentAssistantPresetVisiblePrompt(message.content);
        if (!visiblePrompt || String(message.role || "").trim().toLowerCase() !== "user") {
            return message;
        }
        return {
            ...message,
            content: visiblePrompt,
        };
    }
export function sanitizeAgentAssistantPresetMessagesPayload(payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return payload;
        }
        return {
            ...payload,
            ...(Array.isArray(payload.data)
                ? { data: payload.data.map(sanitizeAgentAssistantPresetMessage) }
                : {}),
            ...(Array.isArray(payload.messages)
                ? { messages: payload.messages.map(sanitizeAgentAssistantPresetMessage) }
                : {}),
        };
    }

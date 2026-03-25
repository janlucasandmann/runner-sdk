import { RunnerAttachment, RunnerChat } from "../src/react/index.js";

// Example: drop-in runner-style chat panel with real backend calls.
export function RunnerChatExample() {
  return (
    <div style={{ height: 640 }}>
      <RunnerChat
        backendUrl="https://api.computer-agents.com"
        apiKey="YOUR_REAL_API_KEY"
        appId="my-webapp"
        placeholder="What should the agent do?"
        onThreadIdChange={(threadId) => {
          console.log("Thread created:", threadId);
        }}
        onRunError={(error) => {
          console.error("Run failed:", error.message);
        }}
        // Optional: plug in real upload flow (S3/GCS/your API), then return
        // attachment objects that your backend expects.
        uploadFiles={async (files): Promise<RunnerAttachment[]> => {
          return files.map((file) => ({
            id: `uploaded-${crypto.randomUUID()}`,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            type: file.type.startsWith("image/") ? "image" : "document",
            uploadedAt: new Date().toISOString(),
          }));
        }}
      />
    </div>
  );
}

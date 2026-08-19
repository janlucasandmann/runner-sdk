const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resetEmailContent({ displayName, resetUrl, expiresInMinutes }) {
  const greeting = displayName ? `Hi ${displayName},` : "Hi,";
  const text = `${greeting}\n\nWe received a request to reset your Computer Agents password.\n\nReset your password: ${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes and can be used once. If you did not request this change, you can ignore this email.\n\nComputer Agents`;
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#000;color:#fff;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:48px 24px">
      <p style="font-size:18px;margin:0 0 32px">computer <span style="font-family:Georgia,serif">agents</span></p>
      <h1 style="font-size:24px;font-weight:600;margin:0 0 16px">Reset your password</h1>
      <p style="color:rgba(255,255,255,.72);font-size:14px;line-height:1.6;margin:0 0 14px">${escapeHtml(greeting)}</p>
      <p style="color:rgba(255,255,255,.72);font-size:14px;line-height:1.6;margin:0 0 28px">We received a request to reset your Computer Agents password.</p>
      <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#fff;color:#090909;text-decoration:none;border-radius:10px;padding:13px 20px;font-size:14px;font-weight:600">Reset password</a>
      <p style="color:rgba(255,255,255,.5);font-size:12px;line-height:1.6;margin:28px 0 0">This link expires in ${expiresInMinutes} minutes and can be used once. If you did not request this change, you can ignore this email.</p>
    </div>
  </body>
</html>`;
  return { html, text };
}

async function providerFailureMessage(response) {
  try {
    const payload = await response.json();
    const message = String(payload?.errors?.[0]?.message || "").trim();
    if (message && message.length <= 240 && !/[\r\n\0]/.test(message)) {
      return message;
    }
  } catch {
    // The HTTP status remains the canonical error when the body is not JSON.
  }
  return "The provider rejected the request.";
}

export function createPasswordResetMailer(config, dependencies = {}) {
  if (!config?.enabled || config.provider === "disabled") return null;
  if (config.provider !== "sendgrid") {
    throw new Error(`Unsupported password reset email provider: ${config.provider}`);
  }
  const fetchImpl = dependencies.fetchImpl || fetch;
  return Object.freeze({
    async sendPasswordReset({ email, displayName, resetUrl, expiresInMinutes }) {
      const content = resetEmailContent({
        displayName: String(displayName || "").trim(),
        resetUrl,
        expiresInMinutes,
      });
      const response = await fetchImpl(SENDGRID_API_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: {
            email: config.fromAddress,
            name: config.fromName,
          },
          subject: "Reset your Computer Agents password",
          content: [
            { type: "text/plain", value: content.text },
            { type: "text/html", value: content.html },
          ],
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        const providerMessage = await providerFailureMessage(response);
        throw new Error(
          `Password reset email delivery failed with HTTP ${response.status}: ${providerMessage}`,
        );
      }
    },
  });
}

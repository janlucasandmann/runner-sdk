const MAX_FORM_BYTES = 16 * 1_024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pageStyles() {
  return `
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #000; color: #fff; }
    body::before { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .15; background-image: radial-gradient(circle, #555 1px, transparent 1px); background-size: 24px 24px; }
    a { color: inherit; }
    .auth-header { position: relative; z-index: 1; padding: 24px; }
    .wordmark { display: inline-flex; color: #fff; font-size: 18px; font-weight: 500; text-decoration: none; }
    .wordmark em { margin-left: 5px; font-family: Georgia, serif; font-weight: 400; }
    .auth-main { position: relative; z-index: 1; display: flex; min-height: calc(100vh - 76px); align-items: center; justify-content: center; padding: 30px 24px 70px; }
    .auth-shell { width: min(100%, 384px); text-align: center; }
    .auth-logo { display: block; width: 32px; height: 32px; margin: 0 auto 12px; object-fit: contain; }
    h1 { margin: 0 0 8px; font-size: 24px; line-height: 1.25; font-weight: 600; letter-spacing: 0; }
    .subtitle { margin: 0 0 32px; color: rgba(255,255,255,.6); font-size: 12px; }
    form { display: grid; gap: 12px; text-align: left; }
    input { width: 100%; min-height: 46px; border: 1px solid rgba(255,255,255,.2); border-radius: 12px; background: transparent; color: #fff; padding: 0 16px; font: inherit; font-size: 14px; outline: none; transition: border-color 140ms ease, background 140ms ease; }
    input::placeholder { color: #666; }
    input:focus { border-color: rgba(255,255,255,.45); background: rgba(255,255,255,.025); }
    button { min-height: 46px; border: 0; border-radius: 12px; background: #fff; color: #090909; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 140ms ease, transform 140ms ease; }
    button:hover { opacity: .9; }
    button:active { transform: scale(.99); }
    .error { margin: 0 0 14px; border: 1px solid rgba(245,59,58,.3); border-radius: 12px; background: rgba(245,59,58,.1); color: #ff8f8e; padding: 12px 14px; font-size: 12px; line-height: 1.5; }
    .requirements { margin: 0 2px 2px; color: rgba(255,255,255,.48); font-size: 11px; line-height: 1.5; }
    .legal { margin: 18px 0 0; color: rgba(255,255,255,.45); font-size: 11px; line-height: 1.55; }
    .legal a, .switch-copy a { color: rgba(255,255,255,.85); }
    .switch-copy { margin: 24px 0 0; color: rgba(255,255,255,.55); font-size: 12px; }
    @media (max-width: 520px) { .auth-header { padding: 20px; } .auth-main { align-items: flex-start; padding-top: 50px; } }
  `;
}

export function renderSignUpPage({ csrfToken, values = {}, error = "" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Create your Computer Agents account</title>
    <style>${pageStyles()}</style>
  </head>
  <body>
    <header class="auth-header"><a class="wordmark" href="/"><span>computer</span><em>agents</em></a></header>
    <main class="auth-main">
      <section class="auth-shell" aria-labelledby="signup-title">
        <img class="auth-logo" src="/img/logos/runnertransparent.webp" alt="">
        <h1 id="signup-title">Create your account</h1>
        <p class="subtitle">Start creating with Computer Agents</p>
        ${error ? `<div class="error" role="alert">${escapeHtml(error)}</div>` : ""}
        <form method="post" action="/signup" autocomplete="on">
          <input type="hidden" name="csrf" value="${escapeHtml(csrfToken)}">
          <input required maxlength="100" name="name" autocomplete="name" placeholder="Full name" value="${escapeHtml(values.name)}">
          <input required maxlength="320" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" value="${escapeHtml(values.email)}">
          <input required minlength="12" maxlength="128" name="password" type="password" autocomplete="new-password" placeholder="Password">
          <input required minlength="12" maxlength="128" name="confirmPassword" type="password" autocomplete="new-password" placeholder="Confirm password">
          <p class="requirements">Use at least 12 characters with uppercase, lowercase, a number, and a symbol.</p>
          <button type="submit">Create account</button>
        </form>
        <p class="legal">By creating an account, you agree to the <a href="https://computer-agents.com/terms">Terms</a> and <a href="https://computer-agents.com/privacy">Privacy Policy</a>.</p>
        <p class="switch-copy">Already have an account? <a href="/api/platform/auth/login">Sign in</a></p>
      </section>
    </main>
  </body>
</html>`;
}

export function validateSignUpFields(fields) {
  const values = {
    name: String(fields.name || "").trim().replace(/\s+/g, " "),
    email: String(fields.email || "").trim().toLowerCase(),
  };
  const password = String(fields.password || "");
  const confirmPassword = String(fields.confirmPassword || "");
  if (!values.name || values.name.length > 100) {
    return { ok: false, values, error: "Enter your full name." };
  }
  if (
    !EMAIL_PATTERN.test(values.email)
    || values.email.length > 320
    || /[\r\n\0]/.test(values.email)
  ) {
    return { ok: false, values, error: "Enter a valid email address." };
  }
  const passwordIsStrong = password.length >= 12
    && password.length <= 128
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
  if (!passwordIsStrong) {
    return {
      ok: false,
      values,
      error: "Use at least 12 characters with uppercase, lowercase, a number, and a symbol.",
    };
  }
  if (password !== confirmPassword) {
    return { ok: false, values, error: "Passwords do not match." };
  }
  return { ok: true, values, password };
}

export async function readUrlEncodedForm(request) {
  const contentType = String(request.headers["content-type"] || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/x-www-form-urlencoded") {
    throw new Error("Submit the form using the expected content type.");
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_FORM_BYTES) throw new Error("The form is too large.");
    chunks.push(chunk);
  }
  return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString("utf8")));
}

export function createSignUpRateLimiter({ limit = 5, windowMs = 10 * 60_000 } = {}) {
  const attempts = new Map();
  return Object.freeze({
    consume(key, now = Date.now()) {
      const normalizedKey = String(key || "unknown").slice(0, 256);
      const existing = attempts.get(normalizedKey);
      const entry = !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : existing;
      entry.count += 1;
      attempts.set(normalizedKey, entry);
      if (attempts.size > 2_000) {
        for (const [candidate, value] of attempts) {
          if (value.resetAt <= now) attempts.delete(candidate);
        }
      }
      return entry.count <= limit;
    },
  });
}

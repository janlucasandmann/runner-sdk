import { randomBytes } from "node:crypto";
import { createPasswordResetTokenStore } from "./password-reset-token-store.mjs";

const TOKEN_KIND = "local_password_reset";

export function createPasswordResetService({
  accountService,
  mailer,
  platformOrigin,
  sessionCodec,
  statePath = "",
  tokenTtlSeconds = 30 * 60,
}, dependencies = {}) {
  if (!accountService || !mailer) return null;
  const expiresInMinutes = Math.max(1, Math.ceil(tokenTtlSeconds / 60));
  const clock = dependencies.clock || Date.now;
  const tokenStore = dependencies.tokenStore
    || createPasswordResetTokenStore({ filePath: statePath, clock });

  async function readToken(token) {
    const payload = await sessionCodec.open(token, TOKEN_KIND);
    if (
      !payload?.email
      || !payload?.userId
      || !payload?.nonce
    ) {
      return null;
    }
    const account = await accountService.findAccount(payload.email);
    if (
      !account
      || account.userId !== payload.userId
      || (
        payload.passwordFingerprint
        && account.passwordFingerprint
        && account.passwordFingerprint !== payload.passwordFingerprint
      )
      || !(await tokenStore.has({
        nonce: payload.nonce,
        email: payload.email,
        userId: payload.userId,
      }))
    ) {
      return null;
    }
    return { account, payload };
  }

  return Object.freeze({
    async request(email) {
      const account = await accountService.findAccount(email);
      if (!account) return Object.freeze({ accepted: true, delivered: false });
      const nonce = randomBytes(24).toString("base64url");
      const token = await sessionCodec.seal(TOKEN_KIND, {
        email: account.email,
        userId: account.userId,
        ...(account.passwordFingerprint
          ? { passwordFingerprint: account.passwordFingerprint }
          : {}),
        nonce,
      }, tokenTtlSeconds);
      const resetUrl = new URL("/reset-password", platformOrigin);
      resetUrl.searchParams.set("token", token);
      await tokenStore.register({
        nonce,
        email: account.email,
        userId: account.userId,
        expiresAt: clock() + tokenTtlSeconds * 1000,
      });
      try {
        await mailer.sendPasswordReset({
          email: account.email,
          displayName: account.displayName,
          resetUrl: resetUrl.toString(),
          expiresInMinutes,
        });
      } catch (error) {
        await tokenStore.remove(nonce);
        throw error;
      }
      return Object.freeze({ accepted: true, delivered: true });
    },
    async inspect(token) {
      return Boolean(await readToken(token));
    },
    async reset(token, password) {
      const decoded = await readToken(token);
      if (!decoded) return Object.freeze({ updated: false, invalidated: true });
      const consumed = await tokenStore.consume({
        nonce: decoded.payload.nonce,
        email: decoded.account.email,
        userId: decoded.account.userId,
      });
      if (!consumed) return Object.freeze({ updated: false, invalidated: true });
      const result = await accountService.resetPassword({
        email: decoded.account.email,
        password,
        expectedFingerprint: decoded.payload.passwordFingerprint || "",
        expectedUserId: decoded.payload.userId,
      });
      if (result.updated) {
        await tokenStore.revokeIdentity(
          decoded.account.email,
          decoded.account.userId,
        );
      }
      return result;
    },
  });
}

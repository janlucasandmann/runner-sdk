import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";

const encoder = new TextEncoder();

export function createPrincipalAssertionSigner({
  secret,
  issuer,
  audience,
  clock = Date.now,
}) {
  const key = encoder.encode(secret);

  return Object.freeze({
    async sign(principal) {
      const now = Math.floor(clock() / 1000);
      return new SignJWT({
        purpose: "principal_session_exchange",
        provider: principal.provider,
        identity_issuer: principal.issuer,
        identity_subject: principal.subject,
        ...(principal.email ? { email: principal.email } : {}),
        email_verified: Boolean(principal.emailVerified),
        ...(principal.displayName ? { name: principal.displayName } : {}),
        ...(principal.pictureUrl ? { picture: principal.pictureUrl } : {}),
        ...(principal.tenant ? { tenant: principal.tenant } : {}),
      })
        .setProtectedHeader({ alg: "HS256", typ: "ca-principal+jwt" })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject(principal.subject)
        .setJti(randomUUID())
        .setIssuedAt(now)
        .setExpirationTime(now + 60)
        .sign(key);
    },
  });
}

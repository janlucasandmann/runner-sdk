import { createPrivateKey, createSign } from "node:crypto";

export function createGcpConnectorOAuthAdapter({ readEnvironmentValue }) {
  if (typeof readEnvironmentValue !== "function") {
    throw new TypeError("A connector environment reader is required.");
  }

  let cachedGoogleAccessToken = null;

  async function verifyFirebaseUser(idToken, apiKey) {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    const payload = await response.json().catch(() => ({}));
    const user = Array.isArray(payload?.users) ? payload.users[0] : null;
    return response.ok && user?.localId ? user : null;
  }

  async function getDocument(documentPath, envFileCandidates) {
    const { projectId, accessToken } = await getAccessContext(envFileCandidates);
    const response = await fetch(documentUrl(projectId, documentPath), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(message || `Firestore GET failed (${response.status})`);
    }
    return response.json();
  }

  async function listDocuments(collectionPath, envFileCandidates) {
    const { projectId, accessToken } = await getAccessContext(envFileCandidates);
    const documents = [];
    let pageToken = "";
    do {
      const target = new URL(documentUrl(projectId, collectionPath));
      target.searchParams.set("pageSize", "100");
      if (pageToken) target.searchParams.set("pageToken", pageToken);
      const response = await fetch(target, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 404) return documents;
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || `Firestore LIST failed (${response.status})`);
      }
      const payload = await response.json().catch(() => ({}));
      if (Array.isArray(payload.documents)) documents.push(...payload.documents);
      pageToken = String(payload.nextPageToken || "").trim();
    } while (pageToken);
    return documents;
  }

  async function deleteDocument(documentPath, envFileCandidates) {
    const { projectId, accessToken } = await getAccessContext(envFileCandidates);
    const response = await fetch(documentUrl(projectId, documentPath), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok && response.status !== 404) {
      const message = await response.text().catch(() => "");
      throw new Error(message || `Firestore DELETE failed (${response.status})`);
    }
  }

  async function patchDocument(
    documentPath,
    fields,
    updateFieldPaths,
    envFileCandidates,
  ) {
    const { projectId, accessToken } = await getAccessContext(envFileCandidates);
    const target = new URL(documentUrl(projectId, documentPath));
    updateFieldPaths.forEach((fieldPath) => {
      target.searchParams.append("updateMask.fieldPaths", fieldPath);
    });
    const response = await fetch(target, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(message || `Firestore PATCH failed (${response.status})`);
    }
  }

  async function getAccessContext(envFileCandidates) {
    const serviceAccount = await getServiceAccountConfig(envFileCandidates);
    const projectId = serviceAccount?.projectId
      || await readEnvironmentValue(
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        envFileCandidates,
      )
      || "testbaseai";
    const accessToken = serviceAccount
      ? await getServiceAccountAccessToken(serviceAccount)
      : await getMetadataAccessToken();
    if (!accessToken) throw new Error("Unable to acquire Firestore access token");
    return { projectId, accessToken };
  }

  async function getServiceAccountAccessToken(serviceAccount) {
    const now = Date.now();
    if (cachedGoogleAccessToken?.expiresAt - 60_000 > now) {
      return cachedGoogleAccessToken.accessToken;
    }
    const issuedAt = Math.floor(now / 1000);
    const expiresAt = issuedAt + 3600;
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      iss: serviceAccount.clientEmail,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      exp: expiresAt,
      iat: issuedAt,
    })).toString("base64url");
    const unsignedToken = `${header}.${payload}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsignedToken);
    signer.end();
    const assertion = `${unsignedToken}.${signer
      .sign(serviceAccount.privateKey)
      .toString("base64url")}`;
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    const payloadJson = await response.json().catch(() => ({}));
    if (!response.ok || !payloadJson?.access_token) {
      throw new Error(
        payloadJson?.error_description
        || payloadJson?.error
        || "Failed to obtain Google access token",
      );
    }
    cachedGoogleAccessToken = {
      accessToken: payloadJson.access_token,
      expiresAt: now + Math.max((payloadJson.expires_in || 3600) * 1000, 60_000),
    };
    return payloadJson.access_token;
  }

  async function getMetadataAccessToken() {
    const now = Date.now();
    if (cachedGoogleAccessToken?.expiresAt - 60_000 > now) {
      return cachedGoogleAccessToken.accessToken;
    }
    const response = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        method: "GET",
        headers: { "Metadata-Flavor": "Google" },
      },
    ).catch(() => null);
    const payload = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok || !payload?.access_token) return "";
    cachedGoogleAccessToken = {
      accessToken: payload.access_token,
      expiresAt: now + Math.max((payload.expires_in || 3600) * 1000, 60_000),
    };
    return payload.access_token;
  }

  async function getServiceAccountConfig(envFileCandidates) {
    const raw = await readEnvironmentValue(
      "FB_SERVICE_ACCOUNT_KEY",
      envFileCandidates,
    );
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const privateKey = typeof parsed.private_key === "string"
        ? parsed.private_key.replace(/\\n/g, "\n")
        : "";
      if (!parsed.client_email || !privateKey) return null;
      createPrivateKey(privateKey);
      return {
        clientEmail: parsed.client_email,
        privateKey,
        projectId: parsed.project_id
          || await readEnvironmentValue(
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            envFileCandidates,
          )
          || "testbaseai",
      };
    } catch {
      return null;
    }
  }

  return {
    deleteDocument,
    getDocument,
    listDocuments,
    patchDocument,
    verifyFirebaseUser,
  };
}

function documentUrl(projectId, documentPath) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${documentPath}`;
}

function normalizeTeamMemberProfileLookupString(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function collectTeamMemberProfileLookupIdentifiers(body) {
  const emails = new Set();
  const userIds = new Set();
  const addRecord = (record) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return;
    }
    const sources = [
      record,
      record.user,
      record.profile,
      record.account,
      record.member,
      record.identity,
      record.metadata,
      record.metadata?.user,
      record.metadata?.profile,
      record.metadata?.account,
    ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
    sources.slice().forEach((source) => {
      [source.providerUserInfo, source.providerData].forEach((providerProfiles) => {
        if (!Array.isArray(providerProfiles)) {
          return;
        }
        providerProfiles.forEach((providerProfile) => {
          if (providerProfile && typeof providerProfile === "object" && !Array.isArray(providerProfile)) {
            sources.push(providerProfile);
          }
        });
      });
    });
    sources.forEach((source) => {
      [
        source.email,
        source.emailAddress,
        source.email_address,
        source.mail,
        source.primaryEmail,
        source.primary_email,
      ].forEach((value) => {
        const email = normalizeTeamMemberProfileLookupString(value).toLowerCase();
        if (email && email.includes("@")) {
          emails.add(email);
        }
      });
      [
        source.userId,
        source.user_id,
        source.uid,
        source.id,
        source.localId,
        source.local_id,
      ].forEach((value) => {
        const userId = normalizeTeamMemberProfileLookupString(value);
        if (userId) {
          userIds.add(userId);
        }
      });
    });
  };
  (Array.isArray(body?.members) ? body.members : []).forEach(addRecord);
  (Array.isArray(body?.emails) ? body.emails : []).forEach((value) => {
    const email = normalizeTeamMemberProfileLookupString(value).toLowerCase();
    if (email && email.includes("@")) {
      emails.add(email);
    }
  });
  (Array.isArray(body?.userIds) ? body.userIds : []).forEach((value) => {
    const userId = normalizeTeamMemberProfileLookupString(value);
    if (userId) {
      userIds.add(userId);
    }
  });
  return {
    emails: Array.from(emails).slice(0, 100),
    userIds: Array.from(userIds).slice(0, 100),
  };
}

function normalizeTeamMemberLookupProfilesPayload(data) {
  if (!data || typeof data !== "object") {
    return [];
  }
  const candidates = [
    data,
    data.profile,
    data.user,
    data.account,
    data.member,
    data.profiles,
    data.memberProfiles,
    data.member_profiles,
    data.users,
    data.accounts,
    data.items,
    data.results,
    data.data,
    data.data?.profile,
    data.data?.user,
    data.data?.account,
    data.data?.member,
    data.data?.profiles,
    data.data?.memberProfiles,
    data.data?.users,
    data.data?.accounts,
    data.data?.items,
    data.data?.results,
    data.included?.profile,
    data.included?.user,
    data.included?.account,
    data.included?.member,
    data.included?.profiles,
    data.included?.users,
    data.included?.accounts,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((profile) => profile && typeof profile === "object" && !Array.isArray(profile));
    }
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      if (
        candidate.displayName
        || candidate.display_name
        || candidate.name
        || candidate.fullName
        || candidate.full_name
        || candidate.email
        || candidate.emailAddress
        || candidate.mail
        || candidate.userId
        || candidate.user_id
        || candidate.uid
        || candidate.localId
        || candidate.local_id
      ) {
        return [candidate];
      }
      const values = Object.values(candidate).filter((profile) => profile && typeof profile === "object" && !Array.isArray(profile));
      if (values.length > 0) {
        return values;
      }
    }
  }
  return [];
}

export function createTeamMemberProfileLookupHandler(adapters) {
  return async function handleTeamMemberProfileLookup(req, res) {
    let body = {};
    try {
      body = await adapters.readRequestBody(req);
    } catch (error) {
      return adapters.sendJson(res, 400, {
        error: "Invalid request body",
        message: error instanceof Error ? error.message : "Invalid JSON body.",
      });
    }
    if (!adapters.hasAiosSession(req) && !adapters.readOptionalApiKey(req, body)) {
      return adapters.sendJson(res, 401, {
        error: "Unauthorized",
        message: "Sign in with Computer Agents or provide an API key.",
      });
    }

    const teamId = normalizeTeamMemberProfileLookupString(body?.teamId);
    const identifiers = collectTeamMemberProfileLookupIdentifiers(body);
    const lookupBody = {
      teamId,
      emails: identifiers.emails,
      userIds: identifiers.userIds,
      memberIds: identifiers.userIds,
      ids: identifiers.userIds,
    };
    const lookupPaths = [
      teamId ? `/teams/${encodeURIComponent(teamId)}/member-profiles/lookup` : "",
      teamId ? `/teams/${encodeURIComponent(teamId)}/member-profiles:lookup` : "",
      teamId ? `/teams/${encodeURIComponent(teamId)}/members/profiles/lookup` : "",
      teamId ? `/teams/${encodeURIComponent(teamId)}/members/profile-lookup` : "",
      teamId ? `/teams/${encodeURIComponent(teamId)}/users/lookup` : "",
      "/users/lookup",
      "/users/profiles/lookup",
      "/user-profiles/lookup",
      "/profiles/lookup",
      "/accounts/lookup",
    ].filter(Boolean);
    for (const path of lookupPaths) {
      try {
        const result = await adapters.fetchUpstreamJsonForProxyExactPath(req, path, "POST", lookupBody);
        if (result.status >= 200 && result.status < 300) {
          const profiles = normalizeTeamMemberLookupProfilesPayload(result.data);
          if (profiles.length > 0) {
            return adapters.sendJson(res, 200, {
              profiles,
              source: path,
            });
          }
        }
      } catch {}
    }

    const encodedEmails = encodeURIComponent(identifiers.emails.join(","));
    const encodedUserIds = encodeURIComponent(identifiers.userIds.join(","));
    const getPaths = [
      teamId ? `/teams/${encodeURIComponent(teamId)}/member-profiles?emails=${encodedEmails}&userIds=${encodedUserIds}` : "",
      teamId ? `/teams/${encodeURIComponent(teamId)}/members/profiles?emails=${encodedEmails}&userIds=${encodedUserIds}` : "",
      `/users?emails=${encodedEmails}&userIds=${encodedUserIds}`,
      `/users/profiles?emails=${encodedEmails}&userIds=${encodedUserIds}`,
      `/user-profiles?emails=${encodedEmails}&userIds=${encodedUserIds}`,
      `/profiles?emails=${encodedEmails}&userIds=${encodedUserIds}`,
    ].filter(Boolean);
    for (const path of getPaths) {
      try {
        const result = await adapters.fetchUpstreamJsonForProxyExactPath(req, path, "GET");
        if (result.status >= 200 && result.status < 300) {
          const profiles = normalizeTeamMemberLookupProfilesPayload(result.data);
          if (profiles.length > 0) {
            return adapters.sendJson(res, 200, {
              profiles,
              source: path,
            });
          }
        }
      } catch {}
    }

    return adapters.sendJson(res, 200, {
      profiles: [],
      source: "none",
    });
  };
}

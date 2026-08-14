export const TEAMS_MEMBER_IDENTITY_SCRIPT = `        function getTeamPageApiErrorMessage(data, fallback = "Failed to load teams.") {
          const rawMessage = String(data?.message || data?.error || fallback || "").trim();
          const normalizedMessage = rawMessage.toLowerCase();
          const isHtmlRouteError = normalizedMessage.includes("<!doctype html")
            || normalizedMessage.includes("<html")
            || ["get", "post", "patch", "put", "delete"].some((method) =>
              normalizedMessage.includes("cannot " + method + " /teams")
            );
          if (isHtmlRouteError) {
            return "Team workspace API is not available on this backend yet. Redeploy the backend, then refresh this page.";
          }
          if (
            normalizedMessage.includes("signal is aborted")
            || normalizedMessage.includes("aborted without reason")
            || normalizedMessage.includes("aborterror")
          ) {
            return "The team data request was interrupted. Refresh the team page to try again.";
          }
          if (normalizedMessage.includes("timeouterror") || normalizedMessage.includes("request timed out")) {
            return "Team data is taking longer than expected to load. Refresh the team page to try again.";
          }
          return rawMessage || fallback;
        }

        function normalizeTeamPageTeamRecord(team) {
          const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
          return {
            ...source,
            profileImageUrl: getTeamPageProfileImageUrl(source),
            permissionSet: normalizePlaygroundPermissionSet(source.permissionSet, "team"),
            rolePermissionSets: normalizePlaygroundTeamRolePermissionSets(source.rolePermissionSets || source.rolePermissions || source.permissionSets),
          };
        }

        function getTeamPageDescription(team) {
          const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {};
          return String(
            source.description
            || source.summary
            || source.purpose
            || metadata.description
            || metadata.summary
            || metadata.purpose
            || ""
          ).replace(/\s+/g, " ").trim();
        }

        function getTeamPageProfileImageUrl(team) {
          const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {};
          const profile = metadata.profile && typeof metadata.profile === "object" && !Array.isArray(metadata.profile)
            ? metadata.profile
            : {};
          const rawUrl = String(
            source.profileImageUrl
            || source.profile_image_url
            || source.avatarUrl
            || source.avatar_url
            || profile.photoURL
            || profile.photoUrl
            || profile.imageUrl
            || metadata.profileImageUrl
            || metadata.profile_image_url
            || metadata.avatarUrl
            || metadata.avatar_url
            || ""
          ).trim();
          const normalizedUrl = normalizeSessionPhotoUrl(rawUrl);
          return canRenderAvatarImage(normalizedUrl) ? normalizedUrl : "";
        }

        function buildTeamPageMetadataWithProfileImage(team, profileImageUrl, description) {
          const source = team && typeof team === "object" && !Array.isArray(team) ? team : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? { ...source.metadata }
            : {};
          const profile = metadata.profile && typeof metadata.profile === "object" && !Array.isArray(metadata.profile)
            ? { ...metadata.profile }
            : {};
          const normalizedUrl = String(profileImageUrl || "").trim();
          if (normalizedUrl) {
            profile.photoURL = normalizedUrl;
            delete profile.photoUrl;
            metadata.profile = profile;
            metadata.profileImageUrl = normalizedUrl;
            delete metadata.profile_image_url;
          } else {
            delete profile.photoURL;
            delete profile.photoUrl;
            delete profile.imageUrl;
            if (Object.keys(profile).length > 0) metadata.profile = profile;
            else delete metadata.profile;
            delete metadata.profileImageUrl;
            delete metadata.profile_image_url;
            delete metadata.avatarUrl;
            delete metadata.avatar_url;
          }
          if (typeof description === "string") {
            const normalizedDescription = description.replace(/\s+/g, " ").trim();
            if (normalizedDescription) {
              metadata.description = normalizedDescription;
            } else {
              delete metadata.description;
            }
          }
          return metadata;
        }

        function getTeamPageIdentitySources(record) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
          const sources = [
            source,
            source.user,
            source.profile,
            source.authProfile,
            source.account,
            source.member,
            source.identity,
            source.userProfile,
            source.accountProfile,
            source.publicProfile,
            source.firebaseUser,
            source.authUser,
            metadata,
            metadata.user,
            metadata.profile,
            metadata.authProfile,
            metadata.account,
            metadata.member,
            metadata.identity,
            metadata.userProfile,
            metadata.accountProfile,
            metadata.publicProfile,
            metadata.firebaseUser,
            metadata.authUser,
          ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
          sources.slice().forEach((value) => {
            [value.providerUserInfo, value.providerData].forEach((providerProfiles) => {
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
          return sources;
        }

        function readTeamPageIdentityString(record, keys = []) {
          for (const source of getTeamPageIdentitySources(record)) {
            for (const key of keys) {
              const value = String(source?.[key] || "").replace(/\\s+/g, " ").trim();
              if (value) {
                return value;
              }
            }
          }
          return "";
        }

        function readTeamPageIdentityDisplayName(record) {
          const directName = readTeamPageIdentityString(record, [
            "displayName",
            "display_name",
            "name",
            "fullName",
            "full_name",
            "accountDisplayName",
            "accountName",
            "memberDisplayName",
            "memberName",
            "firebaseDisplayName",
            "providerDisplayName",
            "publicName",
            "username",
            "userName",
          ]);
          if (directName) {
            return directName;
          }
          for (const source of getTeamPageIdentitySources(record)) {
            const firstName = String(source.firstName || source.first_name || source.givenName || source.given_name || "").trim();
            const lastName = String(source.lastName || source.last_name || source.familyName || source.family_name || "").trim();
            const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
            if (fullName) {
              return fullName;
            }
          }
          return "";
        }

        function readTeamPageIdentityEmail(record) {
          return readTeamPageIdentityString(record, [
            "email",
            "emailAddress",
            "email_address",
            "mail",
            "primaryEmail",
            "primary_email",
          ]).toLowerCase();
        }

        function readTeamPageIdentityAvatarUrl(record) {
          return readTeamPageIdentityString(record, [
            "photoURL",
            "photoUrl",
            "photo_url",
            "avatarUrl",
            "avatarURL",
            "avatar",
            "picture",
            "imageUrl",
            "profileImageUrl",
            "profile_image_url",
          ]);
        }

        function getTeamPageMemberProfileKeyCandidates(record) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          const values = [
            source.userId,
            source.user_id,
            source.uid,
            source.id,
            source.localId,
            source.local_id,
            source.memberId,
            source.member_id,
          ];
          getTeamPageIdentitySources(source).forEach((identitySource) => {
            values.push(
              identitySource.id,
              identitySource.uid,
              identitySource.userId,
              identitySource.user_id,
              identitySource.localId,
              identitySource.local_id,
              identitySource.memberId,
              identitySource.member_id,
              identitySource.email,
              identitySource.emailAddress,
              identitySource.email_address,
              identitySource.mail,
            );
          });
          return values.map((value) => String(value || "").trim()).filter(Boolean);
        }

        function buildTeamPageMemberProfileMap(payload) {
          const profileMap = new Map();
          const addProfile = (profile, explicitKey = "") => {
            if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
              return;
            }
            const normalizedProfile = explicitKey
              ? { id: explicitKey, ...profile }
              : profile;
            const keys = getTeamPageMemberProfileKeyCandidates(normalizedProfile);
            keys.forEach((key) => profileMap.set(key.toLowerCase(), normalizedProfile));
          };
          const addProfiles = (value) => {
            if (Array.isArray(value)) {
              value.forEach((profile) => addProfile(profile));
              return;
            }
            if (!value || typeof value !== "object") {
              return;
            }
            if (
              readTeamPageIdentityDisplayName(value)
              || readTeamPageIdentityEmail(value)
              || getTeamPageMemberProfileKeyCandidates(value).length > 0
            ) {
              addProfile(value);
            }
            if (Array.isArray(value.data)) {
              value.data.forEach((profile) => addProfile(profile));
              return;
            }
            Object.entries(value).forEach(([key, profile]) => addProfile(profile, key));
          };
          [
            payload,
            payload?.profile,
            payload?.user,
            payload?.account,
            payload?.member,
            payload?.profiles,
            payload?.memberProfiles,
            payload?.member_profiles,
            payload?.users,
            payload?.accounts,
            payload?.items,
            payload?.results,
            payload?.data,
            payload?.data?.profile,
            payload?.data?.user,
            payload?.data?.account,
            payload?.data?.member,
            payload?.included?.profiles,
            payload?.included?.users,
            payload?.included?.accounts,
            payload?.data?.profiles,
            payload?.data?.memberProfiles,
            payload?.data?.users,
            payload?.data?.accounts,
            payload?.data?.items,
            payload?.data?.results,
          ].forEach(addProfiles);
          return profileMap;
        }

        function mergeTeamPageMemberProfiles(members, ...profilePayloads) {
          const profileMap = new Map();
          profilePayloads.forEach((payload) => {
            buildTeamPageMemberProfileMap(payload).forEach((profile, key) => {
              profileMap.set(key, profile);
            });
          });
          return (Array.isArray(members) ? members : []).map((member) => {
            const matchingProfile = getTeamPageMemberProfileKeyCandidates(member)
              .map((key) => profileMap.get(key.toLowerCase()))
              .find(Boolean);
            if (!matchingProfile) {
              return member;
            }
            const memberEmail = readTeamPageIdentityEmail(member);
            const profileEmail = readTeamPageIdentityEmail(matchingProfile);
            const email = memberEmail || profileEmail;
            const memberDisplayName = readTeamPageIdentityDisplayName(member);
            const profileDisplayName = readTeamPageIdentityDisplayName(matchingProfile);
            const displayName = getTrustedDisplayName(profileDisplayName, email)
              || getTrustedDisplayName(memberDisplayName, email);
            const avatarUrl = readTeamPageIdentityAvatarUrl(matchingProfile)
              || readTeamPageIdentityAvatarUrl(member);
            return {
              ...member,
              ...(displayName ? { displayName, name: displayName } : {}),
              ...(email ? { email } : {}),
              ...(avatarUrl ? { photoURL: avatarUrl, photoUrl: avatarUrl } : {}),
              profile: {
                ...(member.profile && typeof member.profile === "object" && !Array.isArray(member.profile) ? member.profile : {}),
                ...(matchingProfile && typeof matchingProfile === "object" ? matchingProfile : {}),
                ...(displayName ? { displayName, name: displayName } : {}),
                ...(email ? { email } : {}),
                ...(avatarUrl ? { photoURL: avatarUrl, photoUrl: avatarUrl } : {}),
              },
              user: {
                ...(member.user && typeof member.user === "object" && !Array.isArray(member.user) ? member.user : {}),
                ...(matchingProfile && typeof matchingProfile === "object" ? matchingProfile : {}),
                ...(displayName ? { displayName, name: displayName } : {}),
                ...(email ? { email } : {}),
                ...(avatarUrl ? { photoURL: avatarUrl, photoUrl: avatarUrl } : {}),
              },
            };
          });
        }

        async function fetchTeamPageMemberProfilePayload(teamId, members = [], options = {}) {
          const normalizedTeamId = String(teamId || "").trim();
          if (!normalizedTeamId) {
            return null;
          }
          const memberPayload = Array.isArray(members) ? members : [];
          const requestSignal = options && typeof options === "object" ? options.signal : undefined;
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/team-member-profiles/lookup", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              signal: requestSignal,
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                teamId: normalizedTeamId,
                members: memberPayload,
              }),
            }, 8000);
            if (response.ok) {
              const profiles = Array.isArray(data?.profiles)
                ? data.profiles
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              if (profiles.length > 0) {
                return data;
              }
            }
          } catch {}
          const profilePaths = [
            "/teams/" + encodeURIComponent(normalizedTeamId) + "/member-profiles",
            "/teams/" + encodeURIComponent(normalizedTeamId) + "/members/profiles",
          ];
          for (const path of profilePaths) {
            try {
              const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + path, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: requestSignal,
                headers: requestHeaders,
              }, 5000);
              if (response.ok) {
                return data;
              }
            } catch {}
          }
          return null;
        }
`;

import {
  ClipboardCheck,
  History,
  KeyRound,
  ShieldCheck,
} from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import {
  normalizeOrganizationAccessResource,
} from "./organization-access-normalization.js";
import { OrganizationApprovalsPanel } from "./organization-approvals-panel.js";
import { OrganizationAuditPanel } from "./organization-audit-panel.js";
import { OrganizationDelegationsPanel } from "./organization-delegations-panel.js";
import { OrganizationIdentityProvidersPanel } from "./organization-identity-providers-panel.js";
import { OrganizationAccessNotice } from "./organization-access-presentation.js";
import {
  createOrganizationAccessRepository,
  type OrganizationAccessRepository,
} from "./organization-access-repository.js";
import type {
  OrganizationAccessAgent,
  OrganizationAccessResource,
  OrganizationAccessSection,
  OrganizationAccessTeam,
  OrganizationAuthorizationApproval,
  OrganizationAuthorizationDecision,
  OrganizationAuthorizationDelegation,
  OrganizationIdentityConnection,
} from "./organization-access-types.js";

export interface OrganizationAccessControlPageProps {
  organizationId: string;
  organizationName?: string;
  apiBase?: string;
  requestHeaders?: Record<string, string>;
  resources?: readonly unknown[];
  canManage?: boolean;
  initialSection?: OrganizationAccessSection;
}

const ACCESS_SECTIONS = [
  { value: "identity", label: "Identity" },
  { value: "approvals", label: "Approvals" },
  { value: "delegations", label: "Delegations" },
  { value: "audit", label: "Audit" },
] as const;

function sectionDescription(section: OrganizationAccessSection): string {
  if (section === "identity") {
    return "Connect trusted identity providers, provision members with SCIM, and map external groups without overwriting manual access.";
  }
  if (section === "approvals") {
    return "Resolve expiring permission requests for exact principal, action, and resource tuples.";
  }
  if (section === "delegations") {
    return "Issue short-lived, least-privilege authority for agents without inheriting the full authority of their human operator.";
  }
  return "Inspect the immutable authorization evidence produced by policy checks across this organization.";
}

export function OrganizationAccessControlPage({
  organizationId,
  organizationName = "Organization",
  apiBase = "/api/real",
  requestHeaders = {},
  resources = [],
  canManage = false,
  initialSection = "identity",
}: OrganizationAccessControlPageProps) {
  const availableSections = canManage
    ? ACCESS_SECTIONS
    : ACCESS_SECTIONS.filter((section) => section.value !== "audit");
  const [activeSection, setActiveSection] =
    useState<OrganizationAccessSection>(
      !canManage && initialSection === "audit" ? "identity" : initialSection,
    );
  const [connections, setConnections] = useState<
    OrganizationIdentityConnection[]
  >([]);
  const [teams, setTeams] = useState<OrganizationAccessTeam[]>([]);
  const [agents, setAgents] = useState<OrganizationAccessAgent[]>([]);
  const [approvals, setApprovals] = useState<
    OrganizationAuthorizationApproval[]
  >([]);
  const [delegations, setDelegations] = useState<
    OrganizationAuthorizationDelegation[]
  >([]);
  const [decisions, setDecisions] = useState<
    OrganizationAuthorizationDecision[]
  >([]);
  const [loadingSections, setLoadingSections] = useState<Set<string>>(
    () => new Set(["identity"]),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const loadedSectionsRef = useRef(new Set<OrganizationAccessSection>());
  const requestSequenceRef = useRef(0);
  const requestHeadersKey = JSON.stringify(requestHeaders || {});
  const repository = useMemo<OrganizationAccessRepository>(
    () =>
      createOrganizationAccessRepository({
        apiBase,
        organizationId,
        requestHeaders,
      }),
    // The serialized key intentionally stabilizes callers that recreate an
    // equivalent headers object during legacy host renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase, organizationId, requestHeadersKey],
  );
  const normalizedResources = useMemo<OrganizationAccessResource[]>(
    () =>
      resources
        .map(normalizeOrganizationAccessResource)
        .filter((resource) => resource.id && resource.type),
    [resources],
  );

  const setSectionLoading = (section: OrganizationAccessSection, value: boolean) => {
    setLoadingSections((current) => {
      const next = new Set(current);
      if (value) next.add(section);
      else next.delete(section);
      return next;
    });
  };

  const loadIdentity = async () => {
    setSectionLoading("identity", true);
    const requestSequence = ++requestSequenceRef.current;
    try {
      const [nextConnections, nextTeams, nextAgents] = await Promise.all([
        repository.listConnections(),
        repository.listTeams(),
        repository.listAgents(),
      ]);
      if (requestSequence !== requestSequenceRef.current) return;
      setConnections(nextConnections);
      setTeams(nextTeams.filter((team) => team.id));
      setAgents(nextAgents.filter((agent) => agent.id));
      loadedSectionsRef.current.add("identity");
    } catch (error) {
      if (requestSequence !== requestSequenceRef.current) return;
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load identity and access data.",
      );
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        setSectionLoading("identity", false);
      }
    }
  };

  useEffect(() => {
    loadedSectionsRef.current.clear();
    setConnections([]);
    setTeams([]);
    setAgents([]);
    setApprovals([]);
    setDelegations([]);
    setDecisions([]);
    setErrorMessage("");
    void loadIdentity();
    return () => {
      requestSequenceRef.current += 1;
    };
    // Repository changes exactly when the API or organization context changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository]);

  useEffect(() => {
    if (!canManage && activeSection === "audit") {
      setActiveSection("identity");
    }
  }, [activeSection, canManage]);

  useEffect(() => {
    if (
      (!canManage && activeSection === "audit") ||
      activeSection === "identity" ||
      loadedSectionsRef.current.has(activeSection)
    ) {
      return;
    }
    let active = true;
    setSectionLoading(activeSection, true);
    setErrorMessage("");
    const load =
      activeSection === "approvals"
        ? repository.listApprovals().then((rows) => {
            if (active) setApprovals(rows);
          })
        : activeSection === "delegations"
          ? repository.listDelegations().then((rows) => {
              if (active) setDelegations(rows);
            })
          : repository.listDecisions().then((rows) => {
              if (active) setDecisions(rows);
            });
    void load
      .then(() => {
        if (active) loadedSectionsRef.current.add(activeSection);
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : `Failed to load ${activeSection}.`,
          );
        }
      })
      .finally(() => {
        if (active) setSectionLoading(activeSection, false);
      });
    return () => {
      active = false;
    };
  }, [activeSection, canManage, repository]);

  return (
    <section
      className="organization-access-control"
      aria-label={`${organizationName} identity and access`}
    >
      <header className="organization-access-control__header">
        <div>
          <span className="organization-access-control__eyebrow">
            Identity &amp; Access
          </span>
          <h2>{organizationName}</h2>
          <p>{sectionDescription(activeSection)}</p>
        </div>
        <PlatformSwitch
          value={activeSection}
          options={availableSections}
          onValueChange={(value) =>
            setActiveSection(value as OrganizationAccessSection)
          }
          ariaLabel="Identity and access section"
        />
      </header>

      {errorMessage ? (
        <OrganizationAccessNotice tone="error">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage("")}>
            Dismiss
          </button>
        </OrganizationAccessNotice>
      ) : null}

      <div className="organization-access-control__section-intro">
        {activeSection === "identity" ? (
          <ShieldCheck aria-hidden="true" />
        ) : activeSection === "approvals" ? (
          <ClipboardCheck aria-hidden="true" />
        ) : activeSection === "delegations" ? (
          <KeyRound aria-hidden="true" />
        ) : (
          <History aria-hidden="true" />
        )}
        <span>{sectionDescription(activeSection)}</span>
      </div>

      <div className="organization-access-control__content">
        {activeSection === "identity" ? (
          <OrganizationIdentityProvidersPanel
            repository={repository}
            connections={connections}
            teams={teams}
            loading={loadingSections.has("identity")}
            canManage={canManage}
            onConnectionsChange={setConnections}
            onReload={loadIdentity}
            onError={setErrorMessage}
          />
        ) : activeSection === "approvals" ? (
          <OrganizationApprovalsPanel
            repository={repository}
            approvals={approvals}
            agents={agents}
            loading={loadingSections.has("approvals")}
            canManage={canManage}
            onApprovalsChange={setApprovals}
            onError={setErrorMessage}
          />
        ) : activeSection === "delegations" ? (
          <OrganizationDelegationsPanel
            repository={repository}
            delegations={delegations}
            agents={agents}
            resources={normalizedResources}
            loading={loadingSections.has("delegations")}
            canManage={canManage}
            onDelegationsChange={setDelegations}
            onError={setErrorMessage}
          />
        ) : (
          <OrganizationAuditPanel
            decisions={decisions}
            loading={loadingSections.has("audit")}
          />
        )}
      </div>
    </section>
  );
}

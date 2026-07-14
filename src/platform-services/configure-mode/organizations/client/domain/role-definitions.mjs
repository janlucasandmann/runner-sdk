export const ORGANIZATIONS_ROLE_DEFINITIONS_SCRIPT = `      const PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS = [
        {
          id: "owner",
          label: "Owner",
          description: "Has permanent full control of the organization, members, resources, usage, billing, and governance settings.",
        },
        {
          id: "admin",
          label: "Admin",
          description: "Can manage organization members, resources, role permissions, and workspace settings.",
        },
        {
          id: "billing",
          label: "Billing",
          description: "Can review and manage organization usage, credits, budgets, reservations, and billing operations.",
        },
        {
          id: "developer",
          label: "Developer",
          description: "Can create and operate agents, computers, workflows, projects, and deployed resources.",
        },
        {
          id: "member",
          label: "Member",
          description: "Can participate in organization work with standard access to shared resources.",
        },
        {
          id: "viewer",
          label: "Viewer",
          description: "Can inspect organization resources and activity without changing workspace state.",
        },
      ];
      const PLAYGROUND_ASSIGNABLE_ORGANIZATION_ROLE_DEFINITIONS = PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.filter((role) => role.id !== "owner");
      const PLAYGROUND_ORGANIZATION_ROLE_IDS = PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.map((role) => role.id);
`;

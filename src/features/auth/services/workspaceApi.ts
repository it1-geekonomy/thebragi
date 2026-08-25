import { apiClient } from "@/shared/lib/api-client";
import { type OrganizationSummary } from "@/features/auth/lib/auth-session";

export type WorkspaceInfo = OrganizationSummary & {
  isCurrent?: boolean;
  memberCount?: number;
  plan?: string;
};

export type SwitchOrgResponse = {
  accessToken: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    organizationId?: string;
    role?: string;
  };
  organizationId?: string;
};

export const workspaceApi = {
  getWorkspaces: () => apiClient<WorkspaceInfo[]>("/auth/workspaces"),

  switchOrganization: (organizationId: string) =>
    apiClient<SwitchOrgResponse>("/auth/switch-organization", {
      method: "POST",
      body: JSON.stringify({ organizationId }),
    }),
};

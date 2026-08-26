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

let cachedWorkspaces: { data: WorkspaceInfo[]; timestamp: number } | null = null;
let activeWorkspacesPromise: Promise<WorkspaceInfo[]> | null = null;
const WORKSPACE_CACHE_TTL_MS = 30_000; // 30 seconds

export const workspaceApi = {
  getWorkspaces: async (forceRefresh = false): Promise<WorkspaceInfo[]> => {
    const now = Date.now();
    if (!forceRefresh && cachedWorkspaces && now - cachedWorkspaces.timestamp < WORKSPACE_CACHE_TTL_MS) {
      return cachedWorkspaces.data;
    }

    if (!activeWorkspacesPromise || forceRefresh) {
      activeWorkspacesPromise = apiClient<WorkspaceInfo[]>("/auth/workspaces")
        .then((data) => {
          cachedWorkspaces = { data, timestamp: Date.now() };
          activeWorkspacesPromise = null;
          return data;
        })
        .catch((err) => {
          activeWorkspacesPromise = null;
          throw err;
        });
    }

    return activeWorkspacesPromise;
  },

  switchOrganization: async (organizationId: string) => {
    cachedWorkspaces = null;
    return apiClient<SwitchOrgResponse>("/auth/switch-organization", {
      method: "POST",
      body: JSON.stringify({ organizationId }),
    });
  },

  clearCache: () => {
    cachedWorkspaces = null;
    activeWorkspacesPromise = null;
  },
};

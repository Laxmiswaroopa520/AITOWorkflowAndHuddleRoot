//create end point constants
//Stores all backend API endpoint URLs in one place.
/*
 export const apiEndpoints = {
  health: "/api/health",
  currentUser: "/api/auth/me",
} as const;
 */
export const apiEndpoints = {
  health: "/api/health",

  auth: {
    currentUser: "/api/auth/me",
  },

  roles: {
    getAll: "/api/roles",
  },

  aiTools: {
    getAll: "/api/ai-tools",
  },

  workflowBuckets: {
    getAll: "/api/workflow-buckets",
  },

  activities: {
    getAll: "/api/activities",

    getById: (id: number): string =>
      `/api/activities/${id}`,

    getByRole: (
      roleExternalId: string,
    ): string =>
      `/api/activities/by-role/${encodeURIComponent(
        roleExternalId,
      )}`,
  },
  // Saved Workflows

  workflows: {
    root: "/api/workflows",

    byId: (
      workflowId: string,
    ): string =>
      `/api/workflows/${workflowId}`,

    favorites:
      "/api/workflows/favorites",

    favorite: (
      workflowId: string,
    ): string =>
      `/api/workflows/${workflowId}/favorite`,
  },
} as const;

export const endpoints =
  apiEndpoints;

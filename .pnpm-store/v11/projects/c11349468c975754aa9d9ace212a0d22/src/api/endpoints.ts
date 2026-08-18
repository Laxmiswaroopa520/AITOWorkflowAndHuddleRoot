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

  huddles: {
    root: "/api/huddles",

    byExternalId: (
      externalId: string,
    ): string =>
      `/api/huddles/${encodeURIComponent(externalId)}`,

    recommendedPath:
      "/api/huddles/recommended-path",

    votes: "/api/huddles/votes",

    vote: (externalId: string): string =>
      `/api/huddles/${encodeURIComponent(externalId)}/vote`,

    session: (externalId: string): string =>
      `/api/huddles/${encodeURIComponent(externalId)}/session`,

    sessionActivity: (externalId: string, activityExternalId: string): string =>
      `/api/huddles/${encodeURIComponent(externalId)}/session/activities/${encodeURIComponent(activityExternalId)}`,

    completeSession: (externalId: string): string =>
      `/api/huddles/${encodeURIComponent(externalId)}/session/complete`,
  },

  huddlePlans: {
    mine: "/api/huddle-plans/me",
    mineByRole: (roleExternalId: string): string =>
      `/api/huddle-plans/me/${encodeURIComponent(roleExternalId)}`,
  },

  huddleLaunchPlans: {
    mine: "/api/huddle-launch-plans/me",
  },

  huddleSessions: {
    incomplete: "/api/huddle-sessions/me/incomplete",
  },

  huddleCoaching: {
    coaches: "/api/huddle-coaching/coaches",
    availability: (coachExternalId: string): string =>
      `/api/huddle-coaching/coaches/${encodeURIComponent(coachExternalId)}/availability`,
    bookings: "/api/huddle-coaching/bookings",
  },
} as const;

export const endpoints =
  apiEndpoints;

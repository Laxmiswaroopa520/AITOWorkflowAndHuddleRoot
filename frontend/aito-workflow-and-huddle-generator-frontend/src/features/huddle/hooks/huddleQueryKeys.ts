import type { HuddleCatalogFilters } from "../types";

export const huddleQueryKeys = {
  all: ["huddles"] as const,

  // Kept separate from `catalog` on purpose: this is the plain role list (same shape the
  // Workflow builder reads from `/api/roles`), not a projection of the catalogue read, so it
  // must not share a cache entry or a loading state with the heavier catalogue query.
  audienceRoles: () => [...huddleQueryKeys.all, "audience-roles"] as const,

  catalog: (filters: HuddleCatalogFilters) =>
    [...huddleQueryKeys.all, "catalog", filters] as const,

  detail: (externalId: string, placementExternalId: string | null = null) =>
    [...huddleQueryKeys.all, "detail", externalId, placementExternalId] as const,

  recommendedPath: (roleExternalId: string) =>
    [...huddleQueryKeys.all, "recommended-path", roleExternalId] as const,

  votes: () => [...huddleQueryKeys.all, "votes"] as const,
  plan: (roleExternalId: string) =>
    [...huddleQueryKeys.all, "plan", roleExternalId] as const,
  // The placement is part of the key: the tracked activity set differs per placement, so the
  // two reads must not share a cache entry.
  session: (externalId: string, placementExternalId: string | null = null) =>
    [...huddleQueryKeys.all, "session", externalId, placementExternalId] as const,
  incompleteSessions: () =>
    [...huddleQueryKeys.all, "sessions", "incomplete"] as const,
  launchPlan: () => [...huddleQueryKeys.all, "launch-plan"] as const,
  coaches: (huddleExternalId: string) =>
    [...huddleQueryKeys.all, "coaches", huddleExternalId] as const,
  coachAvailability: (coachExternalId: string, startUtc: string, endUtc: string, durationMinutes: number) =>
    [...huddleQueryKeys.all, "coaches", coachExternalId, "availability", startUtc, endUtc, durationMinutes] as const,
};

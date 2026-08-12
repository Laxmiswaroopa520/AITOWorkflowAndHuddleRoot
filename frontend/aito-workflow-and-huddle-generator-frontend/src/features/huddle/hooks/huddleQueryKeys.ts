import type { HuddleCatalogFilters } from "../types";

export const huddleQueryKeys = {
  all: ["huddles"] as const,

  catalog: (filters: HuddleCatalogFilters) =>
    [...huddleQueryKeys.all, "catalog", filters] as const,

  detail: (externalId: string) =>
    [...huddleQueryKeys.all, "detail", externalId] as const,

  recommendedPath: (roleExternalId: string) =>
    [...huddleQueryKeys.all, "recommended-path", roleExternalId] as const,

  votes: () => [...huddleQueryKeys.all, "votes"] as const,
  plan: (roleExternalId: string) =>
    [...huddleQueryKeys.all, "plan", roleExternalId] as const,
  session: (externalId: string) =>
    [...huddleQueryKeys.all, "session", externalId] as const,
  incompleteSessions: () =>
    [...huddleQueryKeys.all, "sessions", "incomplete"] as const,
  coaches: (huddleExternalId: string) =>
    [...huddleQueryKeys.all, "coaches", huddleExternalId] as const,
  coachAvailability: (coachExternalId: string, startUtc: string, endUtc: string, durationMinutes: number) =>
    [...huddleQueryKeys.all, "coaches", coachExternalId, "availability", startUtc, endUtc, durationMinutes] as const,
};

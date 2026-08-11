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
};

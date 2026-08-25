import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleRoleResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

/**
 * The role list backing the Huddle audience picker and the Additional Topics filter.
 *
 * This used to be derived from the full Huddle catalogue read (every published topic's roles,
 * deduplicated client-side), which meant the audience dropdown could not render until the
 * heaviest read on the page finished -- the catalogue query joins topics, phases, activities,
 * agents and facilitator guides across dozens of rows, while the role list itself is eight
 * stable reference rows. Reading `/api/roles` directly (the same endpoint the Workflow builder
 * already uses) makes the audience picker render as soon as its own tiny request completes,
 * independent of how long the catalogue takes.
 */
export function useHuddleAudienceRoles(): UseQueryResult<HuddleRoleResponse[], Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: huddleQueryKeys.audienceRoles(),
    queryFn: ({ signal }) =>
      apiClient.get<HuddleRoleResponse[]>(apiEndpoints.roles.getAll, signal),
    // Roles are small, stable reference data shared with the Workflow builder's own role read.
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });
}

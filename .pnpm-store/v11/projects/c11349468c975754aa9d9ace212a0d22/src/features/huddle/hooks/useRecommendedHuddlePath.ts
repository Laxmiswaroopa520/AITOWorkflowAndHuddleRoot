import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getRecommendedPath } from "../api";
import type { RecommendedHuddlePathResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useRecommendedHuddlePath(
  roleExternalId: string | null,
): UseQueryResult<RecommendedHuddlePathResponse, Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: huddleQueryKeys.recommendedPath(roleExternalId ?? ""),
    queryFn: ({ signal }) =>
      getRecommendedPath(apiClient, roleExternalId ?? "", signal),
    enabled: Boolean(roleExternalId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

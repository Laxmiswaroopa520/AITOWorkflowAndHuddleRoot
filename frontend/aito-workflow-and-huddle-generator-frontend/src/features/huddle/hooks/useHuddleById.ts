import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getHuddleById } from "../api";
import type { HuddleDetailResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useHuddleById(
  externalId: string | null,
  placementExternalId: string | null = null,
): UseQueryResult<HuddleDetailResponse, Error> {
  const apiClient = useApiClient();

  return useQuery({
    // The placement is part of the key: the same topic returns different phases and
    // activities per role, so the two reads must not share a cache entry.
    queryKey: huddleQueryKeys.detail(externalId ?? "", placementExternalId),
    queryFn: ({ signal }) =>
      getHuddleById(apiClient, externalId ?? "", placementExternalId, signal),
    enabled: Boolean(externalId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

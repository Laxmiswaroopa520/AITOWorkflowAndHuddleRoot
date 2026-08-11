import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getHuddleById } from "../api";
import type { HuddleDetailResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useHuddleById(
  externalId: string | null,
): UseQueryResult<HuddleDetailResponse, Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: huddleQueryKeys.detail(externalId ?? ""),
    queryFn: ({ signal }) =>
      getHuddleById(apiClient, externalId ?? "", signal),
    enabled: Boolean(externalId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

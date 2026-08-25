import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getHuddleSession } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useHuddleSession(externalId: string | null, placementExternalId: string | null = null) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: huddleQueryKeys.session(externalId ?? "", placementExternalId),
    queryFn: ({ signal }) => getHuddleSession(apiClient, externalId!, placementExternalId, signal),
    enabled: Boolean(externalId),
    retry: (count, error) => !("status" in error && error.status === 409) && count < 2,
  });
}

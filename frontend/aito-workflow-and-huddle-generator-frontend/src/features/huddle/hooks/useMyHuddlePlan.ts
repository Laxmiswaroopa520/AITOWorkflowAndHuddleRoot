import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getMyHuddlePlan } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useMyHuddlePlan(roleExternalId: string | null) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: huddleQueryKeys.plan(roleExternalId ?? ""),
    queryFn: ({ signal }) => getMyHuddlePlan(apiClient, roleExternalId!, signal),
    enabled: Boolean(roleExternalId),
    retry: (count, error) => !("status" in error && error.status === 409) && count < 2,
  });
}

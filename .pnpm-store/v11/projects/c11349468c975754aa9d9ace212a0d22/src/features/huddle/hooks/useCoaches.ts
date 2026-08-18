import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getCoaches } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useCoaches(huddleExternalId: string | null, enabled = true) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: huddleQueryKeys.coaches(huddleExternalId ?? ""), queryFn: ({ signal }) => getCoaches(apiClient, huddleExternalId!, signal), enabled: enabled && Boolean(huddleExternalId), retry: 1 });
}

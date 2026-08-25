import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getMyHuddlePlan } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

/**
 * The saved or recommended Role Path for a role.
 *
 * `enabled` exists so the caller can scope this to the tab that shows it. Loading the Role Path
 * while the reader is on Additional Topics meant a Role Path problem surfaced on a tab that does
 * not use it, and it cost a request nobody was waiting for.
 */
export function useMyHuddlePlan(roleExternalId: string | null, enabled = true) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: huddleQueryKeys.plan(roleExternalId ?? ""),
    queryFn: ({ signal }) => getMyHuddlePlan(apiClient, roleExternalId!, signal),
    enabled: enabled && Boolean(roleExternalId),
    // The plan is governed content that only this user can change, and every mutation
    // invalidates the key. Without a stale time the Role Path refetched on every mount and
    // every window focus, so switching tabs re-ran the whole read.
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (count, error) => !("status" in error && error.status === 409) && count < 2,
  });
}

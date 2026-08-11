import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getHuddleVotes } from "../api";
import type { HuddleVoteResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useHuddleVotes(): UseQueryResult<HuddleVoteResponse[], Error> {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: huddleQueryKeys.votes(),
    queryFn: ({ signal }) => getHuddleVotes(apiClient, signal),
    staleTime: 60 * 1000,
  });
}

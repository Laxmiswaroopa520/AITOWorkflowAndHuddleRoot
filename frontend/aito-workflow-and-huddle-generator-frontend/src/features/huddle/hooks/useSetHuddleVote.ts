import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { removeHuddleVote, setHuddleVote } from "../api";
import type { HuddleVoteResponse, SetHuddleVoteRequest } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface VoteVariables {
  externalId: string;
  request: SetHuddleVoteRequest | null;
}

export function useSetHuddleVote() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<HuddleVoteResponse | void, Error, VoteVariables>({
    mutationFn: ({ externalId, request }) => request === null
      ? removeHuddleVote(apiClient, externalId)
      : setHuddleVote(apiClient, externalId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: huddleQueryKeys.votes() }),
  });
}

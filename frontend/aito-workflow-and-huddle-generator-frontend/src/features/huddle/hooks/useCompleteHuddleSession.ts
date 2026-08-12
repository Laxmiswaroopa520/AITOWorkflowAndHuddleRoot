import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { completeHuddleSession } from "../api";
import type { CompleteHuddleSessionRequest, HuddleSessionResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface Variables { externalId: string; request: CompleteHuddleSessionRequest }

export function useCompleteHuddleSession() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<HuddleSessionResponse, Error, Variables>({
    mutationFn: ({ externalId, request }) => completeHuddleSession(apiClient, externalId, request),
    // Completion is intentionally not optimistic. The UI only becomes complete
    // after the protected API confirms the persisted state change.
    onSuccess: (data) => queryClient.setQueryData(huddleQueryKeys.session(data.huddleExternalId), data),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.session(variables.externalId) });
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.incompleteSessions() });
    },
  });
}

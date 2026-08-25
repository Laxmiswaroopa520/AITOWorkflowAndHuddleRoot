import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { completeHuddleSession } from "../api";
import type { CompleteHuddleSessionRequest, HuddleSessionResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface Variables { externalId: string; request: CompleteHuddleSessionRequest; placementExternalId?: string | null }

export function useCompleteHuddleSession() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<HuddleSessionResponse, Error, Variables>({
    mutationFn: ({ externalId, request, placementExternalId }) => completeHuddleSession(apiClient, externalId, request, placementExternalId ?? null),
    // Completion is intentionally not optimistic. The UI only becomes complete
    // after the protected API confirms the persisted state change.
    onSuccess: (data, variables) => queryClient.setQueryData(huddleQueryKeys.session(data.huddleExternalId, variables.placementExternalId ?? null), data),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.session(variables.externalId, variables.placementExternalId ?? null) });
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.incompleteSessions() });
    },
  });
}

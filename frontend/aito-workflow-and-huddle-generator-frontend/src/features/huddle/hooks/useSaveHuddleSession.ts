import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { saveHuddleSession } from "../api";
import type { HuddleSessionResponse, SaveHuddleSessionRequest } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface Variables { externalId: string; request: SaveHuddleSessionRequest; placementExternalId?: string | null }

export function useSaveHuddleSession() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<HuddleSessionResponse, Error, Variables, HuddleSessionResponse | null | undefined>({
    mutationFn: ({ externalId, request, placementExternalId }) => saveHuddleSession(apiClient, externalId, request, placementExternalId ?? null),
    onMutate: async ({ externalId, request, placementExternalId }) => {
      const key = huddleQueryKeys.session(externalId, placementExternalId ?? null);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HuddleSessionResponse | null>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, currentPhaseExternalId: request.currentPhaseExternalId, facilitatorNotes: request.facilitatorNotes });
      return previous;
    },
    onError: (_error, variables, previous) => queryClient.setQueryData(huddleQueryKeys.session(variables.externalId, variables.placementExternalId ?? null), previous),
    onSuccess: (data, variables) => queryClient.setQueryData(huddleQueryKeys.session(data.huddleExternalId, variables.placementExternalId ?? null), data),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.session(variables.externalId, variables.placementExternalId ?? null) });
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.incompleteSessions() });
    },
  });
}

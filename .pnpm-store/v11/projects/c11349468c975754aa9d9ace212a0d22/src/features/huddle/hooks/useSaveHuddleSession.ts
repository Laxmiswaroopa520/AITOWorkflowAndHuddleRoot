import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { saveHuddleSession } from "../api";
import type { HuddleSessionResponse, SaveHuddleSessionRequest } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface Variables { externalId: string; request: SaveHuddleSessionRequest }

export function useSaveHuddleSession() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<HuddleSessionResponse, Error, Variables, HuddleSessionResponse | null | undefined>({
    mutationFn: ({ externalId, request }) => saveHuddleSession(apiClient, externalId, request),
    onMutate: async ({ externalId, request }) => {
      const key = huddleQueryKeys.session(externalId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HuddleSessionResponse | null>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, currentPhaseExternalId: request.currentPhaseExternalId, facilitatorNotes: request.facilitatorNotes });
      return previous;
    },
    onError: (_error, variables, previous) => queryClient.setQueryData(huddleQueryKeys.session(variables.externalId), previous),
    onSuccess: (data) => queryClient.setQueryData(huddleQueryKeys.session(data.huddleExternalId), data),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.session(variables.externalId) });
      void queryClient.invalidateQueries({ queryKey: huddleQueryKeys.incompleteSessions() });
    },
  });
}

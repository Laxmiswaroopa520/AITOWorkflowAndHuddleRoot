import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { setHuddleActivityCompletion } from "../api";
import type { HuddleSessionResponse, SetHuddleActivityCompletionRequest } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface Variables { externalId: string; activityExternalId: string; request: SetHuddleActivityCompletionRequest }

export function useSetHuddleActivityCompletion() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<HuddleSessionResponse, Error, Variables, HuddleSessionResponse | null | undefined>({
    mutationFn: ({ externalId, activityExternalId, request }) => setHuddleActivityCompletion(apiClient, externalId, activityExternalId, request),
    onMutate: async ({ externalId, activityExternalId, request }) => {
      const key = huddleQueryKeys.session(externalId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HuddleSessionResponse | null>(key);
      if (previous) {
        const existing = previous.activities.find((activity) => activity.activityExternalId === activityExternalId);
        const activities = existing
          ? previous.activities.map((activity) => activity.activityExternalId === activityExternalId ? { ...activity, isCompleted: request.isCompleted, completedAtUtc: request.isCompleted ? new Date().toISOString() : null } : activity)
          : [...previous.activities, { activityExternalId, isCompleted: request.isCompleted, completedAtUtc: request.isCompleted ? new Date().toISOString() : null }];
        const completedActivityCount = activities.filter((activity) => activity.isCompleted && !previous.removedActivityExternalIds.includes(activity.activityExternalId)).length;
        queryClient.setQueryData(key, {
          ...previous,
          activities,
          completedActivityCount,
          canContinue: completedActivityCount < previous.validActivityCount,
          ...(request.isCompleted ? {} : { sessionStatus: "InProgress", completedAtUtc: null }),
        });
      }
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

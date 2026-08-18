import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { saveHuddlePlan } from "../api";
import type { HuddlePlanResponse, SaveHuddlePlanRequest } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface SaveVariables { request: SaveHuddlePlanRequest; optimisticPlan: HuddlePlanResponse }

export function useSaveHuddlePlan() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<HuddlePlanResponse, Error, SaveVariables, HuddlePlanResponse | undefined>({
    mutationFn: ({ request }) => saveHuddlePlan(apiClient, request),
    onMutate: async ({ request, optimisticPlan }) => {
      const key = huddleQueryKeys.plan(request.roleExternalId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HuddlePlanResponse>(key);
      queryClient.setQueryData(key, optimisticPlan);
      return previous;
    },
    onError: (_error, variables, previous) => queryClient.setQueryData(huddleQueryKeys.plan(variables.request.roleExternalId), previous),
    onSuccess: (data) => queryClient.setQueryData(huddleQueryKeys.plan(data.roleExternalId), data),
    onSettled: (_data, _error, variables) => queryClient.invalidateQueries({ queryKey: huddleQueryKeys.plan(variables.request.roleExternalId) }),
  });
}

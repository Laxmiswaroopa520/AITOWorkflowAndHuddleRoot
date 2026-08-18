import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { resetHuddlePlan } from "../api";
import type { HuddlePlanResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface ResetVariables { roleExternalId: string; optimisticPlan: HuddlePlanResponse }

export function useResetHuddlePlan() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ResetVariables, HuddlePlanResponse | undefined>({
    mutationFn: ({ roleExternalId }) => resetHuddlePlan(apiClient, roleExternalId),
    onMutate: async ({ roleExternalId, optimisticPlan }) => {
      const key = huddleQueryKeys.plan(roleExternalId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HuddlePlanResponse>(key);
      queryClient.setQueryData(key, optimisticPlan);
      return previous;
    },
    onError: (_error, variables, previous) => queryClient.setQueryData(huddleQueryKeys.plan(variables.roleExternalId), previous),
    onSettled: (_data, _error, variables) => queryClient.invalidateQueries({ queryKey: huddleQueryKeys.plan(variables.roleExternalId) }),
  });
}

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  saveWorkflow,
} from "../api/saveWorkflow";

import {
  savedWorkflowKeys,
} from "./savedWorkflowKeys";

export function useSaveWorkflow() {
  const apiClient =
    useApiClient();

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: Parameters<
        typeof saveWorkflow
      >[1],
    ) =>
      saveWorkflow(
        apiClient,
        input,
      ),

    onSuccess: async workflow => {
      queryClient.setQueryData(
        savedWorkflowKeys.detail(
          workflow.id,
        ),
        workflow,
      );

      await queryClient
        .invalidateQueries({
          queryKey:
            savedWorkflowKeys
              .lists(),
        });
    },
  });
}
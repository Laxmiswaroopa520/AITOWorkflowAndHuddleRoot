import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  updateWorkflow,
} from "../api/updateWorkflow";

import {
  savedWorkflowKeys,
} from "./savedWorkflowKeys";

export function useUpdateWorkflow() {
  const apiClient =
    useApiClient();

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: Parameters<
        typeof updateWorkflow
      >[1],
    ) =>
      updateWorkflow(
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
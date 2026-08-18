import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  deleteWorkflow,
} from "../api/deleteWorkflow";

import {
  savedWorkflowKeys,
} from "./savedWorkflowKeys";

export function useDeleteWorkflow() {
  const apiClient =
    useApiClient();

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      workflowId: string,
    ) =>
      deleteWorkflow(
        apiClient,
        workflowId,
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            savedWorkflowKeys
              .lists(),
        });
    },
  });
}

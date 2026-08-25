import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  toggleFavorite,
} from "../api/toggleFavorite";

import {
  savedWorkflowKeys,
} from "./savedWorkflowKeys";

export function useToggleFavorite() {
  const apiClient =
    useApiClient();

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: Parameters<
        typeof toggleFavorite
      >[1],
    ) =>
      toggleFavorite(
        apiClient,
        input,
      ),

    onSuccess: async workflow => {
      await queryClient
        .invalidateQueries({
          queryKey:
            savedWorkflowKeys
              .lists(),
        });

      await queryClient
        .invalidateQueries({
          queryKey:
            savedWorkflowKeys.detail(
              workflow.id,
            ),
        });
    },
  });
}
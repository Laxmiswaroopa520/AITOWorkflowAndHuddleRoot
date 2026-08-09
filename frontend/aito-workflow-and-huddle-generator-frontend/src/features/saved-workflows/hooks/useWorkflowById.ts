import {
  useQuery,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getWorkflowById,
} from "../api/getWorkflowById";

import {
  savedWorkflowKeys,
} from "./savedWorkflowKeys";

export function useWorkflowById(
  workflowId: string | null,
) {
  const apiClient =
    useApiClient();

  return useQuery({
    queryKey:
      savedWorkflowKeys.detail(
        workflowId ?? "",
      ),

    queryFn: ({ signal }) =>
      getWorkflowById(
        apiClient,
        workflowId!,
        signal,
      ),

    enabled:
      Boolean(workflowId),
  });
}
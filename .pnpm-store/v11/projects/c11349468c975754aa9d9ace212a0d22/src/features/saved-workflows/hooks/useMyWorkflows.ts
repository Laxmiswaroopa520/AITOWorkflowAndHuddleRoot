import {
  useQuery,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getMyWorkflows,
} from "../api/getMyWorkflows";

import type {
  MyWorkflowFilters,
} from "../types/savedWorkflow.types";

import {
  savedWorkflowKeys,
} from "./savedWorkflowKeys";

export function useMyWorkflows(
  filters: MyWorkflowFilters = {},
) {
  const apiClient =
    useApiClient();

  return useQuery({
    queryKey:
      savedWorkflowKeys.list(
        filters,
      ),

    queryFn: ({ signal }) =>
      getMyWorkflows(
        apiClient,
        filters,
        signal,
      ),
  });
}
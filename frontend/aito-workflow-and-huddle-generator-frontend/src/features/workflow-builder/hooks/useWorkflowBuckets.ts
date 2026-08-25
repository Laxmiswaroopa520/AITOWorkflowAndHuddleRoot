import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getWorkflowBuckets,
} from "../api/getWorkflowBuckets";

import type {
  WorkflowBucket,
} from "../types/workflowBucket.types";

import {
  workflowQueryKeys,
} from "./workflowQueryKeys";

export function useWorkflowBuckets():
  UseQueryResult<
    WorkflowBucket[],
    Error
  > {
  const apiClient = useApiClient();

  return useQuery({
    queryKey:
      workflowQueryKeys
        .workflowBuckets(),

    queryFn: ({ signal }) =>
      getWorkflowBuckets(
        apiClient,
        signal,
      ),

    staleTime:
      30 * 60 * 1000,
  });
}
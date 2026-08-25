import type {
  ApiClient,
} from "@/api/apiClient";

import {
  apiEndpoints,
} from "@/api/endpoints";

import type {
  WorkflowBucket,
} from "../types/workflowBucket.types";

export function getWorkflowBuckets(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<WorkflowBucket[]> {
  return apiClient.get<
    WorkflowBucket[]
  >(
    apiEndpoints.workflowBuckets.getAll,
    signal,
  );
}
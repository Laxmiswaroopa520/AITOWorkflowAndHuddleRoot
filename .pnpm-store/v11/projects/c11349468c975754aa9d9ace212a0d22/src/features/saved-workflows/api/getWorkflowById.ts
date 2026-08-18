import type {
  ApiClient,
} from "@/api/apiClient";

import {
  endpoints,
} from "@/api/endpoints";

import type {
  SavedWorkflow,
} from "../types/savedWorkflow.types";

export async function getWorkflowById(
  apiClient: ApiClient,
  workflowId: string,
  signal?: AbortSignal,
): Promise<SavedWorkflow> {
  return apiClient.get<SavedWorkflow>(
    endpoints.workflows.byId(
      workflowId,
    ),
    signal,
  );
}
import type {
  ApiClient,
} from "@/api/apiClient";

import {
  endpoints,
} from "@/api/endpoints";

import type {
  SaveWorkflowInput,
  SavedWorkflow,
} from "../types/savedWorkflow.types";

export async function saveWorkflow(
  apiClient: ApiClient,
  input: SaveWorkflowInput,
): Promise<SavedWorkflow> {
  return apiClient.post<
    SavedWorkflow,
    SaveWorkflowInput
  >(
    endpoints.workflows.root,
    input,
  );
}
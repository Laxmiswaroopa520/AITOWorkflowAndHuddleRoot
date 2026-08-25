import type {
  ApiClient,
} from "@/api/apiClient";

import {
  endpoints,
} from "@/api/endpoints";

import type {
  SavedWorkflow,
  UpdateWorkflowInput,
} from "../types/savedWorkflow.types";

export async function updateWorkflow(
  apiClient: ApiClient,
  input: UpdateWorkflowInput,
): Promise<SavedWorkflow> {
  const request = {
    name: input.name,
    description:
      input.description,
    roleExternalId:
      input.roleExternalId,
    activityExternalIds:
      input.activityExternalIds,
    rowVersion:
      input.rowVersion,
  };

  return apiClient.put<
    SavedWorkflow,
    typeof request
  >(
    endpoints.workflows.byId(
      input.id,
    ),
    request,
  );
}
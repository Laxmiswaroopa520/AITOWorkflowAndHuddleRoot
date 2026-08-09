import type {
  ApiClient,
} from "@/api/apiClient";

import {
  endpoints,
} from "@/api/endpoints";

export async function deleteWorkflow(
  apiClient: ApiClient,
  workflowId: string,
): Promise<void> {
  await apiClient.delete(
    endpoints.workflows.byId(
      workflowId,
    ),
  );
}
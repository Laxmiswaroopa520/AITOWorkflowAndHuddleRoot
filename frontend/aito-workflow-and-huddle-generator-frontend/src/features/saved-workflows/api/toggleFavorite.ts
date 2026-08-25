import type {
  ApiClient,
} from "@/api/apiClient";

import {
  endpoints,
} from "@/api/endpoints";

import type {
  SavedWorkflowSummary,
  ToggleFavoriteInput,
} from "../types/savedWorkflow.types";

export async function toggleFavorite(
  apiClient: ApiClient,
  input: ToggleFavoriteInput,
): Promise<SavedWorkflowSummary> {
  const request = {
    isFavorite:
      input.isFavorite,
    rowVersion:
      input.rowVersion,
  };

  return apiClient.patch<
    SavedWorkflowSummary,
    typeof request
  >(
    endpoints.workflows.favorite(
      input.id,
    ),
    request,
  );
}
import type {
  ApiClient,
} from "@/api/apiClient";

import {
  endpoints,
} from "@/api/endpoints";

import type {
  MyWorkflowFilters,
  SavedWorkflowSummary,
} from "../types/savedWorkflow.types";

export async function getMyWorkflows(
  apiClient: ApiClient,
  filters: MyWorkflowFilters = {},
  signal?: AbortSignal,
): Promise<SavedWorkflowSummary[]> {
  const searchParams =
    new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set(
      "search",
      filters.search.trim(),
    );
  }

  if (
    filters.isFavorite !==
    undefined
  ) {
    searchParams.set(
      "isFavorite",
      String(filters.isFavorite),
    );
  }

  const query =
    searchParams.toString();

  const url = query
    ? `${endpoints.workflows.root}?${query}`
    : endpoints.workflows.root;

  return apiClient.get<
    SavedWorkflowSummary[]
  >(url, signal);
}
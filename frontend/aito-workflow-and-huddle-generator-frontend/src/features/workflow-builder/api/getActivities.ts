import type {
  ApiClient,
} from "@/api/apiClient";

import {
  apiEndpoints,
} from "@/api/endpoints";

import type {
  Activity,
  ActivityFilters,
} from "../types/activity.types";

import {
  buildActivityQueryString,
} from "./buildActivityQueryString";

export function getActivities(
  apiClient: ApiClient,
  filters: ActivityFilters = {},
  signal?: AbortSignal,
): Promise<Activity[]> {
  const queryString =
    buildActivityQueryString(filters);

  return apiClient.get<Activity[]>(
    `${apiEndpoints.activities.getAll}${queryString}`,
    signal,
  );
}
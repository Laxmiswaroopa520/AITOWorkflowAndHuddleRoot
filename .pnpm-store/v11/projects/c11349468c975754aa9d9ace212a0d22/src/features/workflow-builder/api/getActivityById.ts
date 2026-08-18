import type {
  ApiClient,
} from "@/api/apiClient";

import {
  apiEndpoints,
} from "@/api/endpoints";

import type {
  Activity,
} from "../types/activity.types";

export function getActivityById(
  apiClient: ApiClient,
  id: number,
  signal?: AbortSignal,
): Promise<Activity> {
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(
      new Error(
        "Activity ID must be a positive integer.",
      ),
    );
  }

  return apiClient.get<Activity>(
    apiEndpoints.activities.getById(id),
    signal,
  );
}
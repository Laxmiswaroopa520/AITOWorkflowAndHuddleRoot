import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getActivities,
} from "../api/getActivities";

import type {
  Activity,
  ActivityFilters,
} from "../types/activity.types";

import {
  workflowQueryKeys,
} from "./workflowQueryKeys";

export function useActivities(
  filters: ActivityFilters = {},
  enabled = true,
): UseQueryResult<Activity[], Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey:
      workflowQueryKeys
        .activityList(filters),

    queryFn: ({ signal }) =>
      getActivities(
        apiClient,
        filters,
        signal,
      ),

    enabled,

    staleTime:
      15 * 60 * 1000,
  });
}
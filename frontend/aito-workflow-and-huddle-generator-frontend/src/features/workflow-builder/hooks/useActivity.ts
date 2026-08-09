import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getActivityById,
} from "../api/getActivityById";

import type {
  Activity,
} from "../types/activity.types";

import {
  workflowQueryKeys,
} from "./workflowQueryKeys";

export function useActivity(
  id: number | null,
): UseQueryResult<Activity, Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey:
      workflowQueryKeys
        .activityDetail(id ?? 0),

    queryFn: ({ signal }) => {
      if (id === null) {
        throw new Error(
          "An activity ID is required.",
        );
      }

      return getActivityById(
        apiClient,
        id,
        signal,
      );
    },

    enabled:
      id !== null && id > 0,

    staleTime:
      15 * 60 * 1000,
  });
}
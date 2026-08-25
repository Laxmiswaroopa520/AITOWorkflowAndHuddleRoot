/*This hook replaces the old SharePoint-based useWorkflowData data-loading responsibility.*/
import {
  useAiTools,
} from "./useAiTools";

import {
  useRoles,
} from "./useRoles";

import {
  useWorkflowBuckets,
} from "./useWorkflowBuckets";

import type {
  ActivityFilters,
} from "../types/activity.types";

import {
  useActivities,
} from "./useActivities";

export function useWorkflowData(
  activityFilters: ActivityFilters = {},
  loadActivities = true,
) {
  const rolesQuery =
    useRoles();

  const aiToolsQuery =
    useAiTools();

  const workflowBucketsQuery =
    useWorkflowBuckets();

  const activitiesQuery =
    useActivities(
      activityFilters,
      loadActivities,
    );

  const isLoading =
    rolesQuery.isPending ||
    aiToolsQuery.isPending ||
    workflowBucketsQuery.isPending ||
    (
      loadActivities &&
      activitiesQuery.isPending
    );

  const isFetching =
    rolesQuery.isFetching ||
    aiToolsQuery.isFetching ||
    workflowBucketsQuery.isFetching ||
    activitiesQuery.isFetching;

  const firstError =
    rolesQuery.error ??
    aiToolsQuery.error ??
    workflowBucketsQuery.error ??
    activitiesQuery.error ??
    null;

  const refetchAll =
    async (): Promise<void> => {
      await Promise.all([
        rolesQuery.refetch(),
        aiToolsQuery.refetch(),
        workflowBucketsQuery.refetch(),
        loadActivities
          ? activitiesQuery.refetch()
          : Promise.resolve(),
      ]);
    };

  return {
    roles:
      rolesQuery.data ?? [],

    aiTools:
      aiToolsQuery.data ?? [],

    workflowBuckets:
      workflowBucketsQuery.data ?? [],

    activities:
      activitiesQuery.data ?? [],

    isLoading,
    isFetching,

    isError:
      firstError !== null,

    error:
      firstError,

    refetchAll,
  };
}
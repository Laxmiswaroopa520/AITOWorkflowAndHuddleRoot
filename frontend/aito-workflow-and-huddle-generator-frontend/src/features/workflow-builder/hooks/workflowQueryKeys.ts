import type {
  ActivityFilters,
} from "../types/activity.types";

export const workflowQueryKeys = {
  all: [
    "workflow-reference-data",
  ] as const,

  roles: () =>
    [
      ...workflowQueryKeys.all,
      "roles",
    ] as const,

  aiTools: () =>
    [
      ...workflowQueryKeys.all,
      "ai-tools",
    ] as const,

  workflowBuckets: () =>
    [
      ...workflowQueryKeys.all,
      "workflow-buckets",
    ] as const,

  activities: () =>
    [
      ...workflowQueryKeys.all,
      "activities",
    ] as const,

  activityList: (
    filters: ActivityFilters,
  ) =>
    [
      ...workflowQueryKeys.activities(),
      "list",
      filters,
    ] as const,

  activityDetail: (
    id: number,
  ) =>
    [
      ...workflowQueryKeys.activities(),
      "detail",
      id,
    ] as const,
};
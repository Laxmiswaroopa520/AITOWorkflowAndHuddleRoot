/*Activities are retrieved from SQL through the Part 5 API. Small UI filters can then be applied locally to avoid repeated calls while the user changes dropdowns.*/

import {
  useMemo,
} from "react";

import type {
  Activity,
} from "../types/activity.types";

import type {
  WorkflowFilters,
} from "../types/workflowBuilder.types";

interface UseFilteredActivitiesOptions {
  activities: Activity[];
  filters: WorkflowFilters;
}

export function useFilteredActivities({
  activities,
  filters,
}: UseFilteredActivitiesOptions):
  Activity[] {
  return useMemo(() => {
    const search =
      filters.search
        .trim()
        .toLowerCase();

    return activities.filter(
      activity => {
        if (
          search &&
          !matchesSearch(
            activity,
            search,
          )
        ) {
          return false;
        }

        if (
          filters.aiToolId !==
            "all" &&
          !activity.aiTools.some(
            tool =>
              tool.externalId ===
              filters.aiToolId,
          )
        ) {
          return false;
        }

        if (
          filters.workflowBucketId !==
            "all" &&
          activity
            .workflowBucketExternalId !==
            filters.workflowBucketId
        ) {
          return false;
        }

        if (
          filters.category !==
            "all" &&
          activity.category !==
            filters.category
        ) {
          return false;
        }

        if (
          filters.priority !==
            "all" &&
          activity.priority !==
            filters.priority
        ) {
          return false;
        }

        if (
          filters.frequency !==
            "all" &&
          activity.frequency !==
            filters.frequency
        ) {
          return false;
        }

        return matchesDuration(
          activity.durationMinutes,
          filters.duration,
        );
      },
    );
  }, [
    activities,
    filters,
  ]);
}

function matchesSearch(
  activity: Activity,
  search: string,
): boolean {
  return [
    activity.title,
    activity.description ?? "",
    activity.businessOutcome ?? "",
    activity.workflowBucketName,
    activity.category,
    activity.priority,
    ...activity.aiTools.map(
      tool => tool.name,
    ),
  ].some(value =>
    value
      .toLowerCase()
      .includes(search),
  );
}

function matchesDuration(
  durationMinutes: number,
  duration:
    WorkflowFilters["duration"],
): boolean {
  switch (duration) {
    case "short":
      return durationMinutes <= 15;

    case "medium":
      return (
        durationMinutes > 15 &&
        durationMinutes <= 30
      );

    case "long":
      return durationMinutes > 30;

    default:
      return true;
  }
}
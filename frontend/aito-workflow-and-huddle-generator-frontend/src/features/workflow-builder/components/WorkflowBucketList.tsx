import {
  Filter,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  Activity,
} from "../types/activity.types";

import type {
  ActivityBucketGroup,
} from "../utils/groupActivitiesByBucket";

import {
  WorkflowBucketSection,
} from "./WorkflowBucketSection";

interface WorkflowBucketListProps {
  groups: ActivityBucketGroup[];

  selectedActivityIds:
    Set<number>;

  expandedActivityId:
    number | null;

  onToggleActivity: (
    activity: Activity,
  ) => void;

  onToggleDetails: (
    activityId: number,
  ) => void;

  onSelectActivities: (
    activities: Activity[],
  ) => void;

  onDeselectActivities: (
    activityIds: number[],
  ) => void;

  onClearFilters: () => void;
}

export function WorkflowBucketList({
  groups,
  selectedActivityIds,
  expandedActivityId,
  onToggleActivity,
  onToggleDetails,
  onSelectActivities,
  onDeselectActivities,
  onClearFilters,
}: WorkflowBucketListProps) {
  if (groups.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-border
          bg-muted/20
          px-6
          py-14
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-muted
          "
        >
          <Filter
            className="
              h-7
              w-7
              text-muted-foreground
            "
            aria-hidden="true"
          />
        </div>

        <h2
          className="
            mt-4
            text-lg
            font-semibold
          "
        >
          No activities match your
          filters
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          Change your filters or clear
          them to view all recommended
          activities.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(group => (
        <WorkflowBucketSection
          key={group.id}
          name={group.name}
          activities={
            group.activities
          }
          selectedActivityIds={
            selectedActivityIds
          }
          expandedActivityId={
            expandedActivityId
          }
          onToggleActivity={
            onToggleActivity
          }
          onToggleDetails={
            onToggleDetails
          }
          onSelectAll={
            onSelectActivities
          }
          onDeselectAll={
            onDeselectActivities
          }
        />
      ))}
    </div>
  );
}
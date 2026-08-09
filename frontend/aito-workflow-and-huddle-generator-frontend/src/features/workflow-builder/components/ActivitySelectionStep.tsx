import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  ErrorState,
} from "@/components/feedback/ErrorState";

import type {
  Activity,
} from "../types/activity.types";

import type {
  AiTool,
} from "../types/aiTool.types";

import type {
  Role,
} from "../types/role.types";

import type {
  WorkflowBucket,
} from "../types/workflowBucket.types";

import type {
  WorkflowFilters,
} from "../types/workflowBuilder.types";

import {
  useFilteredActivities,
} from "../hooks/useFilteredActivities";

import {
  groupActivitiesByBucket,
} from "../utils/groupActivitiesByBucket";

import {
  ActivityFilters,
} from "./ActivityFilters";

import {
  SelectedActivitiesPanel,
} from "./SelectedActivitiesPanel";

import {
  WorkflowBucketList,
} from "./WorkflowBucketList";

interface ActivitySelectionStepProps {
  role: Role;
  activities: Activity[];
  aiTools: AiTool[];
  workflowBuckets: WorkflowBucket[];

  isLoading: boolean;
  error: Error | null;

  filters: WorkflowFilters;

  selectedActivities: Activity[];
  selectedActivityIds: Set<number>;

  expandedActivityId: number | null;
  totalDuration: number;

  onBack: () => void;
  onRetry: () => void;

  onFiltersChange: (
    filters: WorkflowFilters,
  ) => void;

  onClearFilters: () => void;

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

  onRemoveActivity: (
    activityId: number,
  ) => void;

  onClearActivities: () => void;
  onBuild: () => void;
}

export function ActivitySelectionStep({
  role,
  activities,
  aiTools,
  workflowBuckets,
  isLoading,
  error,
  filters,
  selectedActivities,
  selectedActivityIds,
  expandedActivityId,
  totalDuration,
  onBack,
  onRetry,
  onFiltersChange,
  onClearFilters,
  onToggleActivity,
  onToggleDetails,
  onSelectActivities,
  onDeselectActivities,
  onRemoveActivity,
  onClearActivities,
  onBuild,
}: ActivitySelectionStepProps) {
  const filteredActivities =
    useFilteredActivities({
      activities,
      filters,
    });

  const groups = useMemo(
    () =>
      groupActivitiesByBucket(
        filteredActivities,
        workflowBuckets,
      ),
    [
      filteredActivities,
      workflowBuckets,
    ],
  );

  const categories = useMemo(
    () =>
      uniqueSorted(
        activities.map(
          activity =>
            activity.category,
        ),
      ),
    [activities],
  );

  const priorities = useMemo(
    () =>
      uniqueSorted(
        activities.map(
          activity =>
            activity.priority,
        ),
      ),
    [activities],
  );

  const frequencies = useMemo(
    () =>
      uniqueSorted(
        activities.map(
          activity =>
            activity.frequency,
        ),
      ),
    [activities],
  );

  if (isLoading) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <Loader2
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              text-primary
            "
            aria-hidden="true"
          />

          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
            "
          >
            Loading activities for{" "}
            {role.name}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Activities could not be loaded"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  /*
   * This means the API itself returned no
   * activities for the selected role.
   *
   * This is different from filters hiding
   * otherwise available activities.
   */
  if (activities.length === 0) {
    return (
      <section
        className="
          mx-auto
          flex
          min-h-[60vh]
          w-full
          max-w-xl
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            w-full
            rounded-2xl
            border
            border-dashed
            border-border
            bg-card
            px-6
            py-12
            text-center
          "
        >
          <h2
            className="
              text-lg
              font-semibold
            "
          >
            No activities are configured
            for this role
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Select another role or ask
            the administrator to configure
            activities for {role.name}.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={onBack}
          >
            Select another role
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1500px]
        px-4
        pb-10
        pt-4
      "
    >
      <Button
        type="button"
        variant="ghost"
        className="gap-2"
        onClick={onBack}
      >
        <ArrowLeft
          className="h-4 w-4"
          aria-hidden="true"
        />

        Change role
      </Button>

      <div
        className="
          mt-5
          flex
          flex-wrap
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.14em]
              text-primary
            "
          >
            Customize
          </p>

          <h1
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
            "
          >
            Build your workflow
          </h1>

          <p
            className="
              mt-2
              text-muted-foreground
            "
          >
            Recommended activities for{" "}
            <strong className="text-foreground">
              {role.name}
            </strong>
            .
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-border
            bg-card
            px-4
            py-3
            text-right
            shadow-sm
          "
        >
          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            Available activities
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
            "
          >
            {activities.length}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ActivityFilters
          filters={filters}
          aiTools={aiTools}
          workflowBuckets={
            workflowBuckets
          }
          categories={categories}
          priorities={priorities}
          frequencies={frequencies}
          onChange={
            onFiltersChange
          }
          onClear={
            onClearFilters
          }
        />
      </div>

      <div
        className="
          mt-6
          grid
          gap-6
          lg:grid-cols-[minmax(0,1fr)_310px]
        "
      >
        <WorkflowBucketList
          groups={groups}
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
          onSelectActivities={
            onSelectActivities
          }
          onDeselectActivities={
            onDeselectActivities
          }
          onClearFilters={
            onClearFilters
          }
        />

        <SelectedActivitiesPanel
          activities={
            selectedActivities
          }
          totalDuration={
            totalDuration
          }
          onRemove={
            onRemoveActivity
          }
          onClear={
            onClearActivities
          }
          onBuild={onBuild}
        />
      </div>
    </section>
  );
}

function uniqueSorted(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(Boolean),
    ),
  ).sort(
    (left, right) =>
      left.localeCompare(right),
  );
}
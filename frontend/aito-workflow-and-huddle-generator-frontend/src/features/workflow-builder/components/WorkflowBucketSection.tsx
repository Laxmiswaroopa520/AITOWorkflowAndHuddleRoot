import {
  CheckCircle2,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Button,
} from "@/components/ui/button";

import type {
  Activity,
} from "../types/activity.types";

import {
  BUCKET_ICONS,
} from "../constants/workflowStyles";

import {
  ActivityCard,
} from "./ActivityCard";

interface WorkflowBucketSectionProps {
  name: string;
  activities: Activity[];
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
  onSelectAll: (
    activities: Activity[],
  ) => void;
  onDeselectAll: (
    activityIds: number[],
  ) => void;
}

export function WorkflowBucketSection({
  name,
  activities,
  selectedActivityIds,
  expandedActivityId,
  onToggleActivity,
  onToggleDetails,
  onSelectAll,
  onDeselectAll,
}: WorkflowBucketSectionProps) {
  const BucketIcon =
    BUCKET_ICONS[name] ??
    CheckCircle2;

  const activityIds =
    activities.map(
      activity => activity.id,
    );

  const selectedCount =
    activityIds.filter(id =>
      selectedActivityIds.has(id),
    ).length;

  const allSelected =
    activities.length > 0 &&
    selectedCount ===
      activities.length;

  const handleSelectAll =
    (): void => {
      if (allSelected) {
        onDeselectAll(
          activityIds,
        );
        return;
      }

      onSelectAll(activities);
    };

  return (
    <motion.section
      layout
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        shadow-sm
      "
    >
      <header
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
          border-b
          border-border
          bg-muted/20
          px-5
          py-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
            "
          >
            <BucketIcon
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-foreground
              "
            >
              {name}
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-muted-foreground
              "
            >
              {activities.length}{" "}
              activities
              {selectedCount > 0 &&
                ` • ${selectedCount} selected`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={
            handleSelectAll
          }
        >
          {allSelected
            ? "Clear bucket"
            : "Select all"}
        </Button>
      </header>

      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="
            grid
            gap-3
            p-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {activities.map(
            activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSelected={
                  selectedActivityIds.has(
                    activity.id,
                  )
                }
                isExpanded={
                  expandedActivityId ===
                  activity.id
                }
                onToggle={() =>
                  onToggleActivity(
                    activity,
                  )
                }
                onToggleDetails={() =>
                  onToggleDetails(
                    activity.id,
                  )
                }
              />
            ),
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
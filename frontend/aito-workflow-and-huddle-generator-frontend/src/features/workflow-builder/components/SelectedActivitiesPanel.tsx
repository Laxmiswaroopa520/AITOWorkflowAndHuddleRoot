import {
  ArrowRight,
  Clock,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  Activity,
} from "../types/activity.types";

interface SelectedActivitiesPanelProps {
  activities: Activity[];
  totalDuration: number;
  onRemove: (
    activityId: number,
  ) => void;
  onClear: () => void;
  onBuild: () => void;
}

export function SelectedActivitiesPanel({
  activities,
  totalDuration,
  onRemove,
  onClear,
  onBuild,
}: SelectedActivitiesPanelProps) {
  return (
    <aside
      className="
        sticky
        bottom-4
        z-20
        rounded-2xl
        border
        border-primary/20
        bg-card/95
        p-4
        shadow-xl
        backdrop-blur-xl
        lg:top-24
        lg:bottom-auto
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div>
          <h2
            className="
              text-sm
              font-semibold
            "
          >
            Selected activities
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            {activities.length} selected
          </p>
        </div>

        {activities.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            Clear
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-dashed
            border-border
            bg-muted/20
            px-4
            py-8
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
            "
          >
            No activities selected
          </p>

          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            Choose activities to build
            your workflow.
          </p>
        </div>
      ) : (
        <div
          className="
            mt-4
            max-h-[280px]
            space-y-2
            overflow-y-auto
            pr-1
          "
        >
          {activities.map(
            activity => (
              <div
                key={activity.id}
                className="
                  flex
                  items-start
                  gap-2
                  rounded-lg
                  border
                  border-border
                  bg-background
                  p-2.5
                "
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate
                      text-xs
                      font-medium
                    "
                  >
                    {activity.title}
                  </p>

                  <p
                    className="
                      mt-1
                      flex
                      items-center
                      gap-1
                      text-[10px]
                      text-muted-foreground
                    "
                  >
                    <Clock
                      className="h-3 w-3"
                    />

                    {
                      activity.durationMinutes
                    }{" "}
                    min
                  </p>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${activity.title}`}
                  className="
                    rounded-md
                    p-1
                    text-muted-foreground
                    transition
                    hover:bg-destructive/10
                    hover:text-destructive
                  "
                  onClick={() =>
                    onRemove(
                      activity.id,
                    )
                  }
                >
                  <Trash2
                    className="h-3.5 w-3.5"
                  />
                </button>
              </div>
            ),
          )}
        </div>
      )}

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          border-t
          border-border
          pt-4
        "
      >
        <span
          className="
            text-xs
            text-muted-foreground
          "
        >
          Total duration
        </span>

        <strong
          className="
            text-sm
            text-foreground
          "
        >
          {formatDuration(
            totalDuration,
          )}
        </strong>
      </div>

      <Button
        type="button"
        size="lg"
        className="
          mt-4
          w-full
          gap-2
          rounded-xl
        "
        disabled={
          activities.length === 0
        }
        onClick={onBuild}
      >
        Build My Day

        <ArrowRight
          className="h-4 w-4"
        />
      </Button>
    </aside>
  );
}

function formatDuration(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}
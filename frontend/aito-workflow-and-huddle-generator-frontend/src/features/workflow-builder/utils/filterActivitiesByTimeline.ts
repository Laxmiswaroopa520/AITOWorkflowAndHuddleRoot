import type { Activity } from "../types/activity.types";
import type { TimelineView } from "../types/timeline.types";

const VISIBLE_TIMELINES: Record<string, readonly TimelineView[]> = {
  daily: ["day", "week", "month", "quarter", "year"],
  weekly: ["week", "month", "quarter", "year"],
  monthly: ["month", "quarter", "year"],
  quarterly: ["quarter", "year"],
};

export function filterActivitiesByTimeline(
  activities: readonly Activity[],
  timeline: TimelineView,
): Activity[] {
  return activities.filter(activity =>
    (VISIBLE_TIMELINES[activity.frequency.trim().toLowerCase()] ?? ["year"]).includes(timeline),
  );
}

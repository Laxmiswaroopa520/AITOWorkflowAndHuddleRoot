import { ArrowRight, CalendarDays, Lightbulb, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Activity } from "../types/activity.types";
import type { TimelineView } from "../types/timeline.types";
import { TIMELINE_LABELS } from "../types/timeline.types";
import { groupActivitiesByBucket } from "../utils/groupActivitiesByBucket";
import { CalendarReviewDialog } from "./CalendarReviewDialog";
import { ScheduledActivityCard } from "./ScheduledActivityCard";
import type { WorkflowCalendarItem } from "../types/workflowCalendar.types";

interface TimelineBucketViewProps {
  activities: Activity[];
  timeline: Exclude<TimelineView, "day">;
  headerActions?: ReactNode;
}

export function TimelineBucketView({ activities, timeline, headerActions }: TimelineBucketViewProps) {
  const groups = groupActivitiesByBucket(activities, [], true);
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);
  const [copiedActivityId, setCopiedActivityId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [quickAddItem, setQuickAddItem] = useState<WorkflowCalendarItem | null>(null);
  const calendarItems = useMemo<WorkflowCalendarItem[]>(() => {
    const today = new Date();
    const baseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).getTime();
    return activities.map((activity, index) => {
      const elapsedMinutes = activities.slice(0, index).reduce((sum, prior) => sum + prior.durationMinutes, 0);
      const start = new Date(baseTime + elapsedMinutes * 60000);
      const end = new Date(start.getTime() + activity.durationMinutes * 60000);
      return { requestId: crypto.randomUUID(), activityExternalId: activity.externalId, subject: activity.title, body: [activity.description, activity.businessOutcome ? `Business Outcome: ${activity.businessOutcome}` : null, activity.beginnerPrompt ? `Recommended Prompt: ${activity.beginnerPrompt}` : null].filter(Boolean).join("\n\n"), start: start.toISOString(), end: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    });
  }, [activities]);

  const copyPrompt = async (activity: Activity) => {
    const prompt = activity.beginnerPrompt ?? activity.advancedPrompt;
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopiedActivityId(activity.id);
    window.setTimeout(() => setCopiedActivityId(current => current === activity.id ? null : current), 1600);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-semibold text-foreground">Quick Prompts</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {headerActions}
            <Button type="button" size="sm" disabled={!calendarItems.length} onClick={() => setCalendarOpen(true)}><CalendarDays className="mr-2 h-4 w-4" />Add to my calendar</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.slice(0, 3).map(activity => (
            <button
              key={activity.id}
              type="button"
              onClick={() => {
                void copyPrompt(activity);
              }}
              className="group flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-foreground">
                {copiedActivityId === activity.id ? "Copied!" : activity.title}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">No activities are scheduled for {TIMELINE_LABELS[timeline].toLowerCase()}.</div>
      ) : groups.map(group => (
        <section key={group.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <header className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
            <span className="rounded-lg bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></span>
            <div><h3 className="font-semibold">{group.name}</h3><p className="text-xs text-muted-foreground">{group.activities.length} {group.activities.length === 1 ? "activity" : "activities"}</p></div>
          </header>
          <div className="space-y-3 p-4">
            {group.activities.map(activity => (
              <ScheduledActivityCard
                key={activity.id}
                activity={activity}
                isExpanded={expandedActivityId === activity.id}
                onClick={() => setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)}
                copiedActivityId={copiedActivityId}
                onCopyPrompt={a => {
                  void copyPrompt(a);
                }}
                onQuickAdd={a => {
                  const item = calendarItems.find(calendarItem => calendarItem.activityExternalId === a.externalId);
                  if (item) {
                    setQuickAddItem(item);
                  }
                }}
              />
            ))}
          </div>
        </section>
      ))}
      <CalendarReviewDialog open={calendarOpen} onOpenChange={setCalendarOpen} items={calendarItems} />
      <CalendarReviewDialog
        open={quickAddItem !== null}
        onOpenChange={open => {
          if (!open) {
            setQuickAddItem(null);
          }
        }}
        items={quickAddItem ? [quickAddItem] : []}
      />
    </div>
  );
}

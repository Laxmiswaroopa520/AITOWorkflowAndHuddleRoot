import { Calendar, CalendarDays, ChevronDown, Copy, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Activity } from "../types/activity.types";
import type { TimelineView } from "../types/timeline.types";
import { TIMELINE_LABELS } from "../types/timeline.types";
import { groupActivitiesByBucket } from "../utils/groupActivitiesByBucket";
import { CalendarReviewDialog } from "./CalendarReviewDialog";
import type { WorkflowCalendarItem } from "../types/workflowCalendar.types";

interface TimelineBucketViewProps {
  activities: Activity[];
  timeline: Exclude<TimelineView, "day">;
}

export function TimelineBucketView({ activities, timeline }: TimelineBucketViewProps) {
  const groups = groupActivitiesByBucket(activities, [], true);
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);
  const [copiedActivityId, setCopiedActivityId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-3 text-primary"><Calendar className="h-6 w-6" /></span>
          <div>
            <h2 className="font-bold">{TIMELINE_LABELS[timeline]} at a Glance</h2>
            <p className="text-sm text-muted-foreground">{activities.length} {activities.length === 1 ? "activity" : "activities"} · {groups.length} {groups.length === 1 ? "bucket" : "buckets"}</p>
          </div>
        </div>
        <Button type="button" size="sm" disabled={!calendarItems.length} onClick={() => setCalendarOpen(true)}><CalendarDays className="mr-2 h-4 w-4" />Add to my calendar</Button>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">No activities are scheduled for {TIMELINE_LABELS[timeline].toLowerCase()}.</div>
      ) : groups.map(group => (
        <section key={group.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <header className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
            <span className="rounded-lg bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></span>
            <div><h3 className="font-semibold">{group.name}</h3><p className="text-xs text-muted-foreground">{group.activities.length} {group.activities.length === 1 ? "activity" : "activities"}</p></div>
          </header>
          <div className="divide-y">
            {group.activities.map(activity => {
              const expanded = expandedActivityId === activity.id;
              const prompt = activity.beginnerPrompt ?? activity.advancedPrompt;
              return <article key={activity.id}>
                <button type="button" onClick={() => setExpandedActivityId(expanded ? null : activity.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={expanded}>
                  <span className="min-w-0"><strong className="block">{activity.title}</strong><span className="mt-1 block text-sm text-muted-foreground">{activity.frequency} · {activity.durationMinutes} min · {activity.priority} priority</span></span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && <div className="space-y-4 bg-muted/20 px-5 pb-5 pt-1">
                  {activity.description && <p className="text-sm text-muted-foreground">{activity.description}</p>}
                  {activity.businessOutcome && <div className="rounded-xl border bg-background p-4"><p className="text-xs font-semibold uppercase text-primary">Business outcome</p><p className="mt-1 text-sm">{activity.businessOutcome}</p></div>}
                  {prompt && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><div className="flex justify-between gap-3"><p className="text-xs font-semibold uppercase text-primary">Recommended prompt</p><button type="button" onClick={() => void copyPrompt(activity)} className="inline-flex items-center gap-1 text-xs font-medium text-primary"><Copy className="h-3.5 w-3.5" />{copiedActivityId === activity.id ? "Copied" : "Copy"}</button></div><p className="mt-2 whitespace-pre-wrap text-sm">{prompt}</p></div>}
                  {activity.aiTools.length > 0 && <div className="flex flex-wrap gap-2">{activity.aiTools.map(tool => <span key={tool.id} className="rounded-full border bg-background px-3 py-1 text-xs">{tool.name}{tool.isPrimary ? " · Primary" : ""}</span>)}</div>}
                </div>}
              </article>;
            })}
          </div>
        </section>
      ))}
      <CalendarReviewDialog open={calendarOpen} onOpenChange={setCalendarOpen} items={calendarItems} />
    </div>
  );
}

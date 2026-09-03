import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  Coffee,
  CalendarDays,
  MoveRight,
  Sun,
  Sunset,
  Zap,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  DAY_ZONES,
  getUsedMinutes,
  useDaySchedule,
} from "../hooks/useDaySchedule";

import type {
  Activity,
} from "../types/activity.types";

import type {
  DayZoneId,
  SchedulePosition,
} from "../types/daySchedule.types";
import { CalendarReviewDialog } from "./CalendarReviewDialog";
import { ScheduledActivityCard } from "./ScheduledActivityCard";
import type { WorkflowCalendarItem } from "../types/workflowCalendar.types";

interface DayScheduleProps {
  activities: Activity[];
  headerActions?: ReactNode;
}

const ZONE_STYLES: Record<
  DayZoneId,
  {
    icon: typeof Coffee;
    gradient: string;
    iconClassName: string;
  }
> = {
  morning: {
    icon: Sun,
    gradient:
      "from-[oklch(0.65_0.20_50/0.15)] via-[oklch(0.65_0.20_50/0.05)] to-transparent border-[oklch(0.65_0.20_50/0.3)]",
    iconClassName:
      "bg-[oklch(0.65_0.20_50/0.15)] text-foreground",
  },
  midday: {
    icon: Zap,
    gradient:
      "from-primary/15 via-primary/5 to-transparent border-primary/30",
    iconClassName:
      "bg-primary/15 text-foreground",
  },
  "late-day": {
    icon: Sunset,
    gradient:
      "from-[oklch(0.55_0.15_280/0.15)] via-[oklch(0.55_0.15_280/0.05)] to-transparent border-[oklch(0.55_0.15_280/0.3)]",
    iconClassName:
      "bg-[oklch(0.55_0.15_280/0.15)] text-foreground",
  },
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function DaySchedule({
  activities,
  headerActions,
}: DayScheduleProps) {
  const {
    schedule,
    totalDuration,
    swap,
    move,
  } = useDaySchedule(activities);

  const [swapSource, setSwapSource] =
    useState<SchedulePosition | null>(null);
  const [moveSource, setMoveSource] =
    useState<SchedulePosition | null>(null);
  const [expandedZones, setExpandedZones] =
    useState<Set<DayZoneId>>(
      () => new Set(),
    );
  const [capacityError, setCapacityError] =
    useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] =
    useState<number | null>(null);
  const [copiedActivityId, setCopiedActivityId] =
    useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [quickAddItem, setQuickAddItem] = useState<WorkflowCalendarItem | null>(null);

  const calendarItems = useMemo<WorkflowCalendarItem[]>(() => {
    const starts: Record<DayZoneId, [number, number]> = { morning: [8, 30], midday: [11, 30], "late-day": [15, 30] };
    const today = new Date();
    return DAY_ZONES.flatMap(zone => {
      const [hour, minute] = starts[zone.id];
      let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
      return schedule[zone.id].map(scheduled => {
        const start = cursor;
        const end = new Date(start.getTime() + scheduled.activity.durationMinutes * 60000);
        cursor = end;
        return {
          requestId: crypto.randomUUID(), activityExternalId: scheduled.activity.externalId,
          subject: scheduled.activity.title,
          body: [scheduled.activity.description, scheduled.activity.businessOutcome ? `Business Outcome: ${scheduled.activity.businessOutcome}` : null, scheduled.activity.beginnerPrompt ? `Recommended Prompt: ${scheduled.activity.beginnerPrompt}` : null].filter(Boolean).join("\n\n"),
          start: start.toISOString(), end: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      });
    });
  }, [schedule]);

  const isOverDayCapacity =
    totalDuration > 480;

  const toggleZone = (zoneId: DayZoneId): void => {
    setExpandedZones(current => {
      const next = new Set(current);

      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }

      return next;
    });
  };

  const handleSwap = (
    position: SchedulePosition,
  ): void => {
    setMoveSource(null);
    setCapacityError(null);

    if (!swapSource) {
      setSwapSource(position);
      return;
    }

    if (
      swapSource.zoneId === position.zoneId &&
      swapSource.index === position.index
    ) {
      setSwapSource(null);
      return;
    }

    swap(swapSource, position);
    setSwapSource(null);
  };

  const handleMoveTo = (
    targetZoneId: DayZoneId,
  ): void => {
    if (!moveSource) {
      return;
    }

    const result = move(
      moveSource,
      targetZoneId,
    );

    if (result === "capacity-exceeded") {
      const targetName = DAY_ZONES.find(
        zone => zone.id === targetZoneId,
      )?.title;
      setCapacityError(
        `${targetName ?? "Selected"} slot is full. Remove or swap an activity before moving it here.`,
      );
      return;
    }

    setCapacityError(null);
    setMoveSource(null);
  };

  const copyPrompt = async (
    activity: Activity,
  ): Promise<void> => {
    const prompt =
      activity.beginnerPrompt ??
      activity.advancedPrompt;

    if (!prompt) {
      return;
    }

    await navigator.clipboard.writeText(prompt);
    setCopiedActivityId(activity.id);

    window.setTimeout(() => {
      setCopiedActivityId(current =>
        current === activity.id
          ? null
          : current,
      );
    }, 1800);
  };

  return (
    <div className="space-y-5">
      {isOverDayCapacity && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              Schedule exceeds the recommended 8-hour day
            </p>
            <p className="mt-1 text-xs">
              Total: {formatDuration(totalDuration)}. Use Swap or Move to rebalance your day.
            </p>
          </div>
        </div>
      )}

      {swapSource && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            <strong>Swap mode active.</strong> Select “Swap here” on any other activity.
          </span>
        </div>
      )}

      {moveSource && (
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <MoveRight className="h-4 w-4 shrink-0" />
          <span>
            <strong>Move mode active.</strong> Choose a destination shown on the selected activity.
          </span>
        </div>
      )}

      {capacityError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{capacityError}</span>
          <button
            type="button"
            onClick={() => setCapacityError(null)}
            aria-label="Dismiss capacity warning"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Your Day at a Glance</h2>
            <p className="text-sm text-muted-foreground">
              {activities.length} activities · {formatDuration(totalDuration)} total
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {DAY_ZONES.map(zone => {
            const ZoneSummaryIcon = ZONE_STYLES[zone.id].icon;

            return (
              <span
                key={zone.id}
                title={zone.title}
                aria-label={`${zone.title}: ${schedule[zone.id].length}`}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium"
              >
                <ZoneSummaryIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {schedule[zone.id].length}
              </span>
            );
          })}
          {headerActions}
          <Button type="button" size="sm" disabled={!calendarItems.length} onClick={() => setCalendarOpen(true)} className="ml-1 gap-2"><CalendarDays className="h-4 w-4" />Add to my calendar</Button>
        </div>
      </div>

      {DAY_ZONES.map(zone => {
        const items = schedule[zone.id];
        const usedMinutes = getUsedMinutes(items);
        const capacityPercent = Math.min(
          100,
          Math.round(
            usedMinutes / zone.capacityMinutes * 100,
          ),
        );
        const style = ZONE_STYLES[zone.id];
        const ZoneIcon = style.icon;
        const isExpanded = expandedZones.has(zone.id);

        return (
          <section key={zone.id}>
            <button
              type="button"
              onClick={() => toggleZone(zone.id)}
              className={`flex w-full items-start justify-between gap-4 rounded-2xl border bg-gradient-to-r p-5 text-left ${style.gradient} ${isExpanded ? "rounded-b-none" : ""}`}
              aria-expanded={isExpanded}
            >
              <span className="flex min-w-0 items-start gap-4">
                <span className={`rounded-xl p-3 ${style.iconClassName}`}>
                  <ZoneIcon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-3">
                    <strong className="text-xl">{zone.title}</strong>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {zone.timeRange}
                    </Badge>
                  </span>
                  <span className="mt-1 block max-w-xl text-sm text-muted-foreground">
                    {zone.description}
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted/50">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${capacityPercent >= 100 ? "bg-[oklch(0.70_0.18_60)]" : "bg-primary/50"}`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(usedMinutes)} / {formatDuration(zone.capacityMinutes)}
                    </span>
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <Badge className="gap-1.5 border-transparent bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {items.length} {items.length === 1 ? "task" : "tasks"}
                </Badge>
                <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </span>
            </button>

            {isExpanded && (
              <div className={`space-y-4 rounded-b-2xl border border-t-0 bg-card/60 p-4 ${style.gradient.split(" ").at(-1) ?? ""}`}>
                {items.length === 0 ? (
                  <div className="flex min-h-20 items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground">
                    No activities scheduled
                  </div>
                ) : (
                  items.map((scheduled, index) => {
                    const position = {
                      zoneId: zone.id,
                      index,
                    } satisfies SchedulePosition;
                    const isSwapSource =
                      swapSource?.zoneId === zone.id &&
                      swapSource.index === index;
                    const isMoveSource =
                      moveSource?.zoneId === zone.id &&
                      moveSource.index === index;

                    return (
                      <div
                        key={scheduled.activity.id}
                        className="grid items-start gap-3 sm:grid-cols-[96px_56px_minmax(0,1fr)]"
                      >
                        <div className="pt-5 text-right">
                          <p className="text-lg font-bold">{scheduled.timeSlot}</p>
                          <p className="text-xs text-muted-foreground">
                            {scheduled.activity.durationMinutes} min
                          </p>
                          {index < items.length - 1 && (
                            <div className="mt-4 flex justify-end">
                              <div className="h-16 w-px bg-border" />
                            </div>
                          )}
                        </div>

                        <div className="flex w-14 shrink-0 flex-col gap-1.5 pt-4">
                          <button
                            type="button"
                            onClick={() => handleSwap(position)}
                            disabled={moveSource !== null && !isMoveSource}
                            className={`flex w-full flex-col items-center gap-0.5 rounded-xl border px-1.5 py-2 text-[10px] transition-all ${
                              isSwapSource
                                ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                                : swapSource
                                  ? "animate-pulse border-[oklch(0.55_0.22_145/0.35)] bg-[oklch(0.55_0.22_145/0.08)] font-semibold text-[oklch(0.45_0.20_145)] ring-1 ring-[oklch(0.55_0.22_145/0.25)]"
                                  : "border-border/40 bg-muted/30 font-medium text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                            <span>
                              {isSwapSource
                                ? "Cancel"
                                : swapSource
                                  ? "Here"
                                  : "Swap"}
                            </span>
                          </button>

                          {!swapSource && (
                            <button
                              type="button"
                              onClick={() => {
                                setCapacityError(null);
                                setMoveSource(
                                  isMoveSource
                                    ? null
                                    : position,
                                );
                              }}
                              className={`flex w-full flex-col items-center gap-0.5 rounded-xl border px-1.5 py-2 text-[10px] transition-all ${
                                isMoveSource
                                  ? "border-[oklch(0.65_0.20_50/0.40)] bg-[oklch(0.65_0.20_50/0.12)] font-semibold text-[oklch(0.55_0.18_50)]"
                                  : "border-border/40 bg-muted/30 font-medium text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
                              }`}
                            >
                              <MoveRight className="h-3.5 w-3.5" />
                              <span>{isMoveSource ? "Cancel" : "Move"}</span>
                            </button>
                          )}
                        </div>

                        <ScheduledActivityCard
                          activity={scheduled.activity}
                          isExpanded={expandedActivityId === scheduled.activity.id}
                          onClick={() => {
                            if (swapSource && !isSwapSource) {
                              handleSwap(position);
                              return;
                            }

                            setExpandedActivityId(
                              expandedActivityId === scheduled.activity.id
                                ? null
                                : scheduled.activity.id,
                            );
                          }}
                          copiedActivityId={copiedActivityId}
                          onCopyPrompt={activity => {
                            void copyPrompt(activity);
                          }}
                          onQuickAdd={activity => {
                            const item = calendarItems.find(
                              calendarItem => calendarItem.activityExternalId === activity.externalId,
                            );
                            if (item) {
                              setQuickAddItem(item);
                            }
                          }}
                          headerExtra={
                            swapSource && !isSwapSource ? (
                              <span className="rounded-full border border-[oklch(0.55_0.22_145/0.25)] bg-[oklch(0.55_0.22_145/0.10)] px-2 py-0.5 text-xs font-semibold text-[oklch(0.45_0.20_145)]">
                                Tap to swap here
                              </span>
                            ) : undefined
                          }
                          topContent={
                            isMoveSource ? (
                              <div className="flex flex-wrap items-center gap-2 border-b border-[oklch(0.80_0.08_75/0.4)] bg-[oklch(0.97_0.02_80)] px-3 py-2.5">
                                <span className="mr-1 text-xs font-medium text-muted-foreground">
                                  Move to:
                                </span>
                                {DAY_ZONES.filter(target => target.id !== zone.id).map(target => (
                                  <button
                                    key={target.id}
                                    type="button"
                                    onClick={() => handleMoveTo(target.id)}
                                    className="rounded-lg border px-3 py-1 text-xs font-semibold transition-colors hover:bg-background"
                                  >
                                    {target.title}
                                  </button>
                                ))}
                              </div>
                            ) : undefined
                          }
                          className={
                            isSwapSource
                              ? "ring-2 ring-primary/40 ring-offset-1"
                              : isMoveSource
                                ? "ring-2 ring-[oklch(0.65_0.20_50/0.5)] ring-offset-1"
                                : swapSource
                                  ? "ring-1 ring-[oklch(0.55_0.22_145/0.30)]"
                                  : undefined
                          }
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        );
      })}
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

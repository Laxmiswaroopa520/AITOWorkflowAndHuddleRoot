import {
  ArrowRight,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Activity } from "../types/activity.types";
import {
  AI_TOOL_LAUNCH_LINKS,
  CATEGORY_ICONS,
  CATEGORY_STYLES,
  parseSuggestedOutputs,
} from "../constants/workflowStyles";

interface ScheduledActivityCardProps {
  activity: Activity;
  isExpanded: boolean;
  onClick: () => void;
  copiedActivityId: number | null;
  onCopyPrompt: (activity: Activity) => void;
  /** Omit to hide the quick-add-to-calendar "+" button entirely. */
  onQuickAdd?: (activity: Activity) => void;
  /** Extra content rendered next to the title (e.g. a "Tap to swap here" badge). */
  headerExtra?: ReactNode;
  /** Extra content rendered above the card body (e.g. a Day view "Move to:" zone picker). */
  topContent?: ReactNode;
  /** Extra classes for the outer article -- used for swap/move ring highlighting in Day view. */
  className?: string;
}

/**
 * The rich activity card shared by every timeline view (Day, Week, Month, Quarter, Year) --
 * category/duration/frequency badges, real per-tool colored pills, and an expanded panel with
 * Business outcome / How AI helps / Try this prompt. Originally built for the Day view only;
 * extracted here so Week/Month/Quarter/Year render the identical card instead of a plain
 * accordion row.
 */
export function ScheduledActivityCard({
  activity,
  isExpanded,
  onClick,
  copiedActivityId,
  onCopyPrompt,
  onQuickAdd,
  headerExtra,
  topContent,
  className,
}: ScheduledActivityCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/20 shadow-[8px_8px_20px_rgb(15_23_42/0.06),-8px_-8px_20px_rgb(255_255_255/0.8)] transition-all",
        className,
      )}
    >
      {topContent}

      <div className="cursor-pointer select-none p-5 pb-4" onClick={onClick}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {activity.priority === "High" && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              )}
              <h3 className="text-lg font-bold leading-tight text-card-foreground">
                {activity.title}
              </h3>
              {headerExtra}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const categoryStyle = CATEGORY_STYLES[activity.category] ?? CATEGORY_STYLES.Admin;
                const CategoryIcon = CATEGORY_ICONS[activity.category] ?? Target;

                return (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      categoryStyle.background,
                      categoryStyle.text,
                    )}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {activity.category}
                  </span>
                );
              })()}
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {activity.durationMinutes} min
              </span>
              <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                {activity.frequency}
              </span>
            </div>

            {activity.description && (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activity.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {onQuickAdd && (
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation();
                  onQuickAdd(activity);
                }}
                aria-label={`Add ${activity.title} to my calendar`}
                title="Add this activity to my calendar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {activity.aiTools.slice(0, 3).map(tool => {
            const toolColor = tool.color ?? "#64748b";

            return (
              <span
                key={tool.id}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: `${toolColor}1a`,
                  color: toolColor,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: toolColor }} aria-hidden="true" />
                {tool.name}
              </span>
            );
          })}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t">
          {activity.businessOutcome && (
            <div className="flex items-start gap-2 border-y bg-accent/30 px-5 py-3">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Business outcome
                </h4>
                <p className="mt-1 text-sm leading-6">{activity.businessOutcome}</p>
              </div>
            </div>
          )}

          {parseSuggestedOutputs(activity.suggestedOutputs).length > 0 && (
            <div className="px-5 py-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  How AI helps
                </h4>
              </div>
              <ul className="space-y-1.5">
                {parseSuggestedOutputs(activity.suggestedOutputs).map(line => (
                  <li key={line} className="flex items-start gap-2 text-sm leading-6">
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(activity.beginnerPrompt || activity.advancedPrompt) && (
            <div className="border-t bg-muted/20 px-5 py-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Try this prompt
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onCopyPrompt(activity);
                    }}
                    className="gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedActivityId === activity.id ? "Copied" : "Copy"}
                  </Button>

                  {activity.aiTools
                    .filter(tool => AI_TOOL_LAUNCH_LINKS[tool.name])
                    .map(tool => {
                      const launchUrl = AI_TOOL_LAUNCH_LINKS[tool.name];
                      const toolColor = tool.color ?? undefined;

                      return (
                        <Button
                          key={tool.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          style={toolColor ? { borderColor: `${toolColor}59`, color: toolColor } : undefined}
                          asChild
                        >
                          <a href={launchUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Launch {tool.name}
                          </a>
                        </Button>
                      );
                    })}
                </div>
              </div>
              <p className="line-clamp-3 rounded-lg border bg-background p-3 font-mono text-xs leading-6">
                {activity.beginnerPrompt ?? activity.advancedPrompt}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

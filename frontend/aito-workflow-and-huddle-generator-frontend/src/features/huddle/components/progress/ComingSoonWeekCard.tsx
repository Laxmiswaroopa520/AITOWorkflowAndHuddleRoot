import { Bot, CalendarDays, Clock, Clock3, Download } from "lucide-react";
import type { HuddleUpcomingWeekResponse } from "../../types";

interface ComingSoonWeekCardProps {
  upcoming: HuddleUpcomingWeekResponse;
}

/**
 * A common Role Path week that has no Huddle yet. It uses RecommendedPathCard's layout and styling so it
 * reads as part of the same path, but it is not selectable, votable or manageable, and its HTML action is
 * disabled.
 */
export function ComingSoonWeekCard({ upcoming }: ComingSoonWeekCardProps) {
  return (
    <article
      aria-disabled="true"
      className="relative grid grid-cols-[58px_minmax(0,1fr)] items-start gap-3 rounded-xl border border-[#E1DFDD] bg-white p-4 shadow-sm before:absolute before:-bottom-4 before:left-[39px] before:top-8 before:w-px before:bg-[#C7E0F4] last:before:hidden sm:grid-cols-[58px_minmax(0,1fr)_auto]"
    >
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F6CBD] text-sm font-bold text-white shadow-sm">
        W{upcoming.week}
      </div>

      <div className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold leading-5 text-[#242424]">{upcoming.title}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#0F6CBD]/25 bg-[#E8F2FF] px-2 py-0.5 text-[10px] font-semibold text-[#0F6CBD]">
            <Clock3 className="h-3 w-3" />Coming soon
          </span>
        </span>

        <span className="mt-1 block line-clamp-2 text-sm leading-5 text-muted-foreground">
          {upcoming.description ?? "Description unavailable."}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />Week {upcoming.week}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />30 minutes
          </span>
        </span>

        <span className="mt-3 block rounded-lg border border-[#C7E0F4] bg-[#F5F9FF] px-3 py-2.5">
          <span className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(170px,0.9fr)_minmax(0,1.6fr)]">
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Primary AI Tool</span>
              <span className="mt-1 block truncate whitespace-nowrap text-sm font-semibold text-[#0F6CBD]">
                <Bot className="mr-1 inline h-3.5 w-3.5" />Coming soon
              </span>
            </span>
            <span className="min-w-0 border-t border-[#D6E7F7] pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Secondary AI Tools</span>
              <span className="mt-1 block truncate whitespace-nowrap text-sm text-[#424242]">Coming soon</span>
            </span>
          </span>
        </span>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-1 pt-1 sm:col-span-1 sm:pt-0">
        <button
          type="button"
          disabled
          className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-semibold text-[#242424] opacity-50"
          title="HTML download coming soon"
          aria-label={`Week ${upcoming.week} HTML download coming soon`}
        >
          <Download className="h-3.5 w-3.5" />HTML
        </button>
      </div>
    </article>
  );
}

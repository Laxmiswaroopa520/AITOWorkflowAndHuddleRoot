import type { ReactNode } from "react";
import { Bot, CalendarDays, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { mapHuddleCatalogItemToCard } from "../../mappers";
import type { HuddleCatalogItemResponse, HuddleVoteResponse } from "../../types";
import { HuddleVoteControls } from "../catalog";

interface RecommendedPathCardProps {
  week: number;
  huddle: HuddleCatalogItemResponse;
  customized: boolean;
  selected: boolean;
  vote?: HuddleVoteResponse;
  votePending: boolean;
  managementMenu: ReactNode;
  onSelect: (externalId: string) => void;
  onVote: (externalId: string, value: -1 | 1 | null) => void;
}

function agentLabel(names: string[]): string {
  return names.length === 0 ? "None" : names.join(", ");
}

export function RecommendedPathCard({
  week,
  huddle,
  customized,
  selected,
  vote,
  votePending,
  managementMenu,
  onSelect,
  onVote,
}: RecommendedPathCardProps) {
  const card = mapHuddleCatalogItemToCard(huddle);

  return (
    <article
      className={cn(
        "group relative grid gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 md:grid-cols-[58px_minmax(0,1fr)]",
        selected
          ? "border-[#0F6CBD] bg-[#0F6CBD]/[0.035] ring-2 ring-[#0F6CBD]/15"
          : "border-[#E1DFDD] hover:-translate-y-0.5 hover:border-[#0F6CBD]/60 hover:bg-[#F5F9FF] hover:shadow-md",
      )}
    >
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F6CBD] text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
        W{week}
      </div>

      <button
        type="button"
        className="min-w-0 text-left"
        onClick={() => onSelect(huddle.externalId)}
      >
        <span className="flex flex-wrap items-center gap-2 pr-28">
          <span className="text-base font-semibold leading-5 text-[#242424] transition-colors group-hover:text-[#115EA3]">
            {card.title}
          </span>
          <span className="rounded border border-[#0F6CBD]/20 bg-[#E8F2FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#0F6CBD]">
            {card.category}
          </span>
          {customized && (
            <span className="rounded-full border border-[#D83B01]/30 bg-[#FFF4CE] px-2 py-0.5 text-[10px] font-semibold text-[#8A4B08]">
              Customized
            </span>
          )}
        </span>

        <span className="mt-1 block line-clamp-2 pr-28 text-sm leading-5 text-muted-foreground">
          {card.description ?? "Description unavailable."}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />Week {week}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {card.durationMinutes === null ? "Duration unavailable" : `${card.durationMinutes} minutes`}
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />{card.audienceLabel}
          </span>
          {card.focusArea && <span>{card.focusArea}</span>}
        </span>

        <span className="mt-3 block rounded-lg border border-[#C7E0F4] bg-[#F5F9FF] px-3 py-2.5">
          <span className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(230px,0.9fr)_minmax(0,1.6fr)]">
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Primary AI Tool</span>
              <span className="mt-1 block truncate whitespace-nowrap text-sm font-semibold text-[#0F6CBD]">
                <Bot className="mr-1 inline h-3.5 w-3.5" />{agentLabel(card.primaryAgentNames)}
              </span>
            </span>
            <span className="min-w-0 border-t border-[#D6E7F7] pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Secondary AI Tools</span>
              <span className="mt-1 block truncate whitespace-nowrap text-sm text-[#424242]">
                {agentLabel(card.secondaryAgentNames)}
              </span>
            </span>
          </span>
        </span>
      </button>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-1">
        <HuddleVoteControls
          huddleName={card.title}
          vote={vote}
          disabled={votePending}
          onVote={(value) => onVote(huddle.externalId, value)}
        />
        {managementMenu}
      </div>
    </article>
  );
}

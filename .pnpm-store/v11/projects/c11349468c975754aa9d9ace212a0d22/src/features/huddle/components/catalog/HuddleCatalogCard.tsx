import { useState } from "react";
import { Bot, Clock, ExternalLink, ListChecks, MoreHorizontal, Presentation, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HuddleCatalogCardViewModel, HuddleVoteResponse } from "../../types";
import { HuddleVoteControls } from "./HuddleVoteControls";

interface HuddleCatalogCardProps {
  huddle: HuddleCatalogCardViewModel;
  selected: boolean;
  vote?: HuddleVoteResponse;
  votePending?: boolean;
  week?: number;
  onSelect: (externalId: string) => void;
  onVote: (externalId: string, value: -1 | 1 | null) => void;
  primaryAccessUrl?: string | null;
  showManagementMenu?: boolean;
  /** Renders the custom learning plan checkbox when provided. */
  planChecked?: boolean;
  onTogglePlan?: (externalId: string) => void;
}

function agentLabel(names: string[]): string {
  return names.length === 0 ? "None" : names.join(", ");
}

export function HuddleCatalogCard({ huddle, selected, vote, votePending, week, onSelect, onVote, primaryAccessUrl, showManagementMenu = false, planChecked = false, onTogglePlan }: HuddleCatalogCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // A single activation path for the card: tick the plan checkbox and make this the
  // Huddle shown in the detail panel. The checkbox and the card body must never
  // disagree, so every click routes through here.
  const activate = () => {
    onTogglePlan?.(huddle.id);
    onSelect(huddle.id);
  };

  return (
    <article onClick={activate} className={cn("group relative w-full cursor-pointer overflow-visible rounded-xl border bg-white p-4 pl-5 text-left shadow-sm transition-all duration-200", planChecked ? "border-[#0F6CBD]/50 bg-[#0F6CBD]/[0.04] ring-2 ring-[#0F6CBD]/60 ring-offset-2" : selected ? "border-[#0F6CBD] bg-[#F5F9FF] ring-2 ring-[#0F6CBD] ring-offset-2" : "hover:-translate-y-0.5 hover:border-[#0F6CBD]/60 hover:bg-[#F5F9FF] hover:shadow-md")}>
      <div className="flex items-start gap-4">
        {onTogglePlan && <input type="checkbox" checked={planChecked} onClick={(event) => event.stopPropagation()} onChange={activate} aria-label={`Add ${huddle.title} to your custom learning plan`} className="mt-1 h-4 w-4 flex-none cursor-pointer rounded border-border accent-[#0F6CBD]" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-left">
              <span className="flex flex-wrap items-center gap-2">
                {week !== undefined && <span className="rounded-full bg-[#E8F2FF] px-2 py-0.5 text-[11px] font-bold text-[#0F6CBD]">W{week}</span>}
                <span className={cn("font-semibold", selected && "text-[#115EA3]")}>{huddle.title}</span>
              </span>
            </div>
            <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}><HuddleVoteControls huddleName={huddle.title} vote={vote} disabled={votePending} onVote={(value) => onVote(huddle.id, value)} />{showManagementMenu && <div className="relative"><button type="button" aria-label={`Manage ${huddle.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>{menuOpen && <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border bg-white p-1 shadow-xl"><button type="button" onClick={() => { onSelect(huddle.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#F5F9FF]"><Presentation className="h-4 w-4" />View details</button>{primaryAccessUrl && <a href={primaryAccessUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#F5F9FF]"><ExternalLink className="h-4 w-4" />Open AI Tool</a>}</div>}</div>}</div>
          </div>
          <div className="block w-full text-left">
            <span className="mt-1 block min-h-10 line-clamp-2 text-sm text-muted-foreground">{huddle.description ?? "Description unavailable."}</span>
            <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{huddle.durationMinutes === null ? "Duration unavailable" : `${huddle.durationMinutes} min`}</span><span className="flex items-center gap-1"><Users className="h-3 w-3" />{huddle.audienceLabel}</span><span className="flex items-center gap-1"><ListChecks className="h-3 w-3" />{huddle.activityCount} {huddle.activityCount === 1 ? "activity" : "activities"}</span>{huddle.mcemStageLabel && <span className="flex items-center gap-1"><Target className="h-3 w-3" />{huddle.mcemStageLabel}</span>}</span>
            <span className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-[#C7E0F4] bg-[#F5F9FF] p-3 sm:grid-cols-2"><span><span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Primary AI Tool</span><span className="mt-1 block text-sm font-semibold text-[#0F6CBD]"><Bot className="mr-1 inline h-3.5 w-3.5" />{agentLabel(huddle.primaryAgentNames)}</span></span><span className="border-t border-[#D6E7F7] pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Secondary AI Tools</span><span className="mt-1 block text-sm text-[#424242]">{agentLabel(huddle.secondaryAgentNames)}</span></span></span>
          </div>
        </div>
      </div>
    </article>
  );
}

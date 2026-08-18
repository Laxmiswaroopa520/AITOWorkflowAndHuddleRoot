import { useState } from "react";
import { Bot, Clock, ExternalLink, MoreHorizontal, Presentation, Users } from "lucide-react";
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
}

function agentLabel(names: string[]): string {
  return names.length === 0 ? "None" : names.join(", ");
}

export function HuddleCatalogCard({ huddle, selected, vote, votePending, week, onSelect, onVote, primaryAccessUrl, showManagementMenu = false }: HuddleCatalogCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className={cn("group relative w-full overflow-visible rounded-xl border bg-white p-4 pl-5 text-left shadow-sm transition-all duration-200", selected ? "border-[#0F6CBD] bg-[#F5F9FF] ring-2 ring-[#0F6CBD] ring-offset-2" : "hover:-translate-y-0.5 hover:border-[#0F6CBD]/60 hover:bg-[#F5F9FF] hover:shadow-md")}>
      <div className="flex items-start gap-4">
        <button type="button" onClick={() => onSelect(huddle.id)} aria-label={`Select ${huddle.title}`} className={cn("mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2", selected ? "border-[#0F6CBD] bg-[#0F6CBD]" : "border-border group-hover:border-[#0F6CBD]/50")}><span className={cn("h-2 w-2 rounded-full", selected ? "bg-white" : "bg-transparent")} /></button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <button type="button" onClick={() => onSelect(huddle.id)} className="min-w-0 text-left">
              <span className="flex flex-wrap items-center gap-2">
                {week !== undefined && <span className="rounded-full bg-[#E8F2FF] px-2 py-0.5 text-[11px] font-bold text-[#0F6CBD]">W{week}</span>}
                <span className={cn("font-semibold", selected && "text-[#115EA3]")}>{huddle.title}</span>
                <span className="rounded border border-[#0F6CBD]/20 bg-[#E8F2FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#0F6CBD]">{huddle.category}</span>
              </span>
            </button>
            <div className="flex items-center gap-1"><HuddleVoteControls huddleName={huddle.title} vote={vote} disabled={votePending} onVote={(value) => onVote(huddle.id, value)} />{showManagementMenu && <div className="relative"><button type="button" aria-label={`Manage ${huddle.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>{menuOpen && <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border bg-white p-1 shadow-xl"><button type="button" onClick={() => { onSelect(huddle.id); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#F5F9FF]"><Presentation className="h-4 w-4" />View details</button>{primaryAccessUrl && <a href={primaryAccessUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#F5F9FF]"><ExternalLink className="h-4 w-4" />Open AI Tool</a>}</div>}</div>}</div>
          </div>
          <button type="button" onClick={() => onSelect(huddle.id)} className="block w-full text-left">
            <span className="mt-1 block min-h-10 line-clamp-2 text-sm text-muted-foreground">{huddle.description ?? "Description unavailable."}</span>
            <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{huddle.durationMinutes === null ? "Duration unavailable" : `${huddle.durationMinutes} min`}</span><span className="flex items-center gap-1"><Users className="h-3 w-3" />{huddle.audienceLabel}</span>{huddle.focusArea && <span>{huddle.focusArea}</span>}</span>
            <span className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-[#C7E0F4] bg-[#F5F9FF] p-3 sm:grid-cols-2"><span><span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Primary AI Tool</span><span className="mt-1 block text-sm font-semibold text-[#0F6CBD]"><Bot className="mr-1 inline h-3.5 w-3.5" />{agentLabel(huddle.primaryAgentNames)}</span></span><span className="border-t border-[#D6E7F7] pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-[#616161]">Secondary AI Tools</span><span className="mt-1 block text-sm text-[#424242]">{agentLabel(huddle.secondaryAgentNames)}</span></span></span>
          </button>
        </div>
      </div>
    </article>
  );
}

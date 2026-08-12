import { ArrowRight, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncompleteHuddleSessionResponse } from "../../types";

interface ContinueLearningCardProps { item: IncompleteHuddleSessionResponse; onContinue: (externalId: string) => void }

export function ContinueLearningCard({ item, onContinue }: ContinueLearningCardProps) {
  return <article className="rounded-xl border border-[#0F6CBD]/30 bg-[#F5F9FF] p-4 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex min-w-0 gap-3"><span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E8F2FF] text-[#0F6CBD]"><PlayCircle className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#0F6CBD]">Continue Learning</p><h3 className="truncate font-semibold text-[#242424]">{item.huddleName}</h3><p className="mt-1 flex items-center gap-1 text-xs text-[#616161]"><Clock className="h-3.5 w-3.5" />{item.session.completedActivityCount} of {item.session.validActivityCount} activities complete · Saved {new Date(item.session.lastSavedAtUtc).toLocaleString()}</p></div></div><Button onClick={() => onContinue(item.huddleExternalId)} className="bg-[#0F6CBD] text-white hover:bg-[#115EA3]">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button></div></article>;
}

import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncompleteHuddleSessionResponse } from "../../types";

interface ContinueLearningCardProps { item: IncompleteHuddleSessionResponse; onContinue: (externalId: string) => void }

/**
 * Deliberately a single slim row: this sits above the topic list and should not
 * compete with it for vertical space.
 */
export function ContinueLearningCard({ item, onContinue }: ContinueLearningCardProps) {
  const savedAt = new Date(item.session.lastSavedAtUtc).toLocaleString();

  return (
    <article className="flex items-center gap-3 rounded-lg border border-[#0F6CBD]/30 bg-[#F5F9FF] px-3 py-2 shadow-sm">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#E8F2FF] text-[#0F6CBD]"><PlayCircle className="h-4 w-4" /></span>
      <p className="min-w-0 flex-1 truncate text-sm" title={`Saved ${savedAt}`}>
        <span className="font-semibold text-[#0F6CBD]">Continue Learning</span>
        <span className="text-[#616161]"> · </span>
        <span className="font-semibold text-[#242424]">{item.huddleName}</span>
        <span className="text-[#616161]"> · {item.session.completedActivityCount} of {item.session.validActivityCount} activities</span>
        <span className="hidden text-[#616161] lg:inline"> · Saved {savedAt}</span>
      </p>
      <Button size="sm" onClick={() => onContinue(item.huddleExternalId)} className="h-8 flex-none bg-[#0F6CBD] px-3 text-white hover:bg-[#115EA3]">Continue<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
    </article>
  );
}

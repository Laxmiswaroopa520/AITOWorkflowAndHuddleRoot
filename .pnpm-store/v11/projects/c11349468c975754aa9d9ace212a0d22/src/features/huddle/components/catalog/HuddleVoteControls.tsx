import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HuddleVoteResponse } from "../../types";

interface HuddleVoteControlsProps {
  huddleName: string;
  vote: HuddleVoteResponse | undefined;
  disabled?: boolean;
  onVote: (value: -1 | 1 | null) => void;
}

export function HuddleVoteControls({ huddleName, vote, disabled, onVote }: HuddleVoteControlsProps) {
  return (
    <div className="flex flex-none items-center gap-1" aria-label={`Vote on ${huddleName}`}>
      <button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); onVote(vote?.currentUserVote === 1 ? null : 1); }} className={cn("inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs transition-colors", vote?.currentUserVote === 1 ? "border-[#0F6CBD]/45 bg-[#0F6CBD]/[0.12] text-[#115EA3]" : "border-border text-muted-foreground hover:bg-muted")} aria-pressed={vote?.currentUserVote === 1} title="Upvote this Huddle"><ThumbsUp className={cn("h-3.5 w-3.5", vote?.currentUserVote === 1 && "fill-current")} />{vote?.upvotes ?? 0}</button>
      <button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); onVote(vote?.currentUserVote === -1 ? null : -1); }} className={cn("inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs transition-colors", vote?.currentUserVote === -1 ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:bg-muted")} aria-pressed={vote?.currentUserVote === -1} title="Downvote this Huddle"><ThumbsDown className={cn("h-3.5 w-3.5", vote?.currentUserVote === -1 && "fill-current")} />{vote?.downvotes ?? 0}</button>
    </div>
  );
}

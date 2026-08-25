import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncompleteHuddleSessionResponse } from "../../types";
import { ContinueLearningCard } from "./ContinueLearningCard";
import { isContinueLearningAvailable } from "./huddleSessionProgress";

interface ContinueLearningListProps {
  /** Every in-progress session, already ordered most-recently-saved first by the API. */
  items: IncompleteHuddleSessionResponse[] | undefined;
  onContinue: (externalId: string) => void;
}

/**
 * Shows the most recent in-progress Huddle, and lets the facilitator expand to pick any
 * of the others. Collapsed by default so a long backlog does not push the topic list down.
 */
export function ContinueLearningList({ items, onContinue }: ContinueLearningListProps) {
  const [expanded, setExpanded] = useState(false);
  const sessions = (items ?? []).filter(isContinueLearningAvailable);

  if (sessions.length === 0) return null;

  const [latest, ...older] = sessions;
  const visible = expanded ? sessions : [latest];

  return (
    <div className="space-y-2">
      {visible.map((item) => <ContinueLearningCard key={item.huddleExternalId} item={item} onContinue={onContinue} />)}

      {older.length > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-semibold text-[#0F6CBD] hover:underline"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded
            ? "Show only the most recent"
            : `Show ${older.length} more in progress`}
        </button>
      )}
    </div>
  );
}

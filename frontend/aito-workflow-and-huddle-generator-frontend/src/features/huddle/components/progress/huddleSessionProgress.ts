import type { HuddleSessionResponse, IncompleteHuddleSessionResponse } from "../../types";

export interface HuddleSessionProgressSummary {
  completedActivityIds: ReadonlySet<string>;
  completedCount: number;
  totalCount: number;
  percentage: number;
  canComplete: boolean;
}

export function createHuddleSessionProgressSummary(
  session: HuddleSessionResponse | null | undefined,
  catalogActivityCount: number,
): HuddleSessionProgressSummary {
  const completedActivityIds = new Set(
    (session?.activities ?? [])
      .filter((activity) => activity.isCompleted && !session?.removedActivityExternalIds.includes(activity.activityExternalId))
      .map((activity) => activity.activityExternalId),
  );
  const totalCount = session?.validActivityCount ?? catalogActivityCount;
  const completedCount = session?.completedActivityCount ?? 0;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedActivityIds,
    completedCount,
    totalCount,
    percentage,
    canComplete: Boolean(
      session
      && session.sessionStatus === "InProgress"
      && totalCount > 0
      && completedCount === totalCount,
    ),
  };
}

export function isContinueLearningAvailable(
  item: IncompleteHuddleSessionResponse | undefined,
): item is IncompleteHuddleSessionResponse {
  return Boolean(
    item
    && item.session.sessionStatus === "InProgress"
    && item.session.canContinue
    && item.session.validActivityCount > item.session.completedActivityCount,
  );
}

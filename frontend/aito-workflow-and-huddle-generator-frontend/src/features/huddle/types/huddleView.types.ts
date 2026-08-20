export interface HuddleCatalogCardViewModel {
  id: string;
  title: string;
  description: string | null;
  category: string;
  focusArea: string | null;
  /** Pre-formatted `MCEM Stage: Name (n)` label, or null when the topic has no stages. */
  mcemStageLabel: string | null;
  activityCount: number;
  durationMinutes: number | null;
  desiredOutcome: string | null;
  audienceDescription: string | null;
  audienceLabel: string;
  primaryAgentNames: string[];
  secondaryAgentNames: string[];
  primaryAccessUrl: string | null;
  primaryAccessLabel: string | null;
}

export interface RecommendedHuddleWeekViewModel {
  week: number;
  pathOrder: number;
  huddle: HuddleCatalogCardViewModel;
}

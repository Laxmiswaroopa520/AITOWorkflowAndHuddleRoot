export interface HuddleCatalogCardViewModel {
  id: string;
  title: string;
  description: string | null;
  category: string;
  focusArea: string | null;
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

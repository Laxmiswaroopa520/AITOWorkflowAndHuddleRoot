export interface HuddleRoleResponse {
  externalId: string;
  name: string;
  abbreviation: string;
  segment: string | null;
  description: string | null;
}

export interface HuddleResourceResponse {
  externalId: string;
  title: string;
  description: string | null;
  url: string | null;
  type: string | null;
  linkLabel: string | null;
  displayOrder: number;
}

export interface HuddleAgentResponse {
  externalId: string;
  name: string;
  shortDescription: string | null;
  whatItIs: string | null;
  whatItHelpsYouDo: string | null;
  whenToUseIt: string | null;
  keyBenefits: string[];
  usageType: string;
  displayLabel: string | null;
  showAccessLink: boolean;
  accessUrl: string | null;
  accessLinkLabel: string | null;
  displayOrder: number;
  resources: HuddleResourceResponse[];
}

export interface HuddleCatalogItemResponse {
  externalId: string;
  name: string;
  description: string | null;
  type: string;
  focusAreaExternalId: string | null;
  focusAreaName: string | null;
  durationMinutes: number | null;
  recommendationPriority: number | null;
  audienceDescription: string | null;
  desiredOutcome: string | null;
  roles: HuddleRoleResponse[];
  primaryAgents: HuddleAgentResponse[];
  secondaryAgents: HuddleAgentResponse[];
  mcemStages: HuddleMcemStageResponse[];
  activityCount: number;
}

export interface HuddleMcemStageResponse {
  externalId: string;
  name: string;
  description: string | null;
  displayOrder: number;
}

export interface HuddleActivityResponse {
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  displayOrder: number;
  prompt: string | null;
  expectedOutput: string | null;
  humanCheckpoint: string | null;
  requiredContext: string | null;
  bestFitJob: string | null;
  agents: HuddleAgentResponse[];
  resources: HuddleResourceResponse[];
}

export interface HuddlePhaseResponse {
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  displayOrder: number;
  activities: HuddleActivityResponse[];
}

export interface HuddleFacilitatorGuideResponse {
  sessionIntroduction: string | null;
  keyTalkingPoints: string[];
  discussionQuestions: string[];
  suggestedTransitions: string[];
  wrapUpGuidance: string | null;
}

export interface HuddleContentAvailabilityResponse {
  narrativeComplete: boolean;
  facilitatorGuideAvailable: boolean;
  phasesAvailable: boolean;
  activitiesAvailable: boolean;
  agentsAvailable: boolean;
  resourcesAvailable: boolean;
  reflectionAvailable: boolean;
  commitmentAvailable: boolean;
  missingFields: string[];
}

export interface HuddleDetailResponse {
  externalId: string;
  name: string;
  description: string | null;
  type: string;
  publicationStatus: string;
  focusAreaExternalId: string | null;
  focusAreaName: string | null;
  durationMinutes: number | null;
  recommendationPriority: number | null;
  roles: HuddleRoleResponse[];
  audienceDescription: string | null;
  todayObjective: string | null;
  useCase: string | null;
  whyItMatters: string | null;
  desiredOutcome: string | null;
  stepsToGetStarted: string[];
  mcemStages: HuddleMcemStageResponse[];
  primaryAgents: HuddleAgentResponse[];
  secondaryAgents: HuddleAgentResponse[];
  phases: HuddlePhaseResponse[];
  facilitatorGuide: HuddleFacilitatorGuideResponse | null;
  topicResources: HuddleResourceResponse[];
  reflectionPrompt: string | null;
  commitmentPrompt: string | null;
  keyTakeaway: string | null;
  contentAvailability: HuddleContentAvailabilityResponse;
}

export interface RecommendedHuddlePathItemResponse {
  week: number;
  pathOrder: number;
  huddle: HuddleCatalogItemResponse;
}

export interface RecommendedHuddlePathResponse {
  roleExternalId: string;
  isComplete: boolean;
  configurationMessage: string | null;
  items: RecommendedHuddlePathItemResponse[];
}

export interface HuddleVoteResponse {
  huddleExternalId: string;
  upvotes: number;
  downvotes: number;
  currentUserVote: -1 | 1 | null;
}

export interface SetHuddleVoteRequest {
  value: -1 | 1;
  downvoteReasons: string[] | null;
  comment: string | null;
}

export interface HuddleCatalogFilters {
  roleExternalId?: string;
  focusAreaExternalId?: string;
  agentExternalId?: string;
  type?: string;
  search?: string;
  sort?: "default" | "name" | "priority" | "most-upvoted" | "role-relevance";
}

export interface HuddlePlanItemResponse {
  week: number;
  recommendedHuddleExternalId: string;
  isCustomized: boolean;
  huddle: HuddleCatalogItemResponse;
}

export interface HuddlePlanResponse {
  roleExternalId: string;
  isCustomized: boolean;
  rowVersion: string | null;
  items: HuddlePlanItemResponse[];
}

export interface SaveHuddlePlanRequest {
  roleExternalId: string;
  rowVersion: string | null;
  items: { week: number; huddleExternalId: string }[];
}

export interface HuddleSessionActivityProgressResponse {
  activityExternalId: string;
  isCompleted: boolean;
  completedAtUtc: string | null;
}

export interface HuddleSessionResponse {
  huddleExternalId: string;
  currentPhaseExternalId: string | null;
  facilitatorNotes: string | null;
  startedAtUtc: string;
  lastSavedAtUtc: string;
  completedAtUtc: string | null;
  sessionStatus: "InProgress" | "Completed";
  rowVersion: string;
  activities: HuddleSessionActivityProgressResponse[];
  removedActivityExternalIds: string[];
  validActivityCount: number;
  completedActivityCount: number;
  canContinue: boolean;
}

export interface IncompleteHuddleSessionResponse {
  huddleExternalId: string;
  huddleName: string;
  huddleDescription: string | null;
  huddleType: string;
  session: HuddleSessionResponse;
}

export interface CreateHuddleLaunchEmailDraftRequest {
  subject: string;
  bodyText: string;
}

export interface HuddleLaunchEmailDraftResponse {
  messageId: string;
  webLink: string;
}

export interface SaveHuddleSessionRequest {
  currentPhaseExternalId: string | null;
  facilitatorNotes: string | null;
  rowVersion: string | null;
}

export interface SetHuddleActivityCompletionRequest {
  isCompleted: boolean;
  rowVersion: string;
}

export interface CompleteHuddleSessionRequest {
  rowVersion: string;
}

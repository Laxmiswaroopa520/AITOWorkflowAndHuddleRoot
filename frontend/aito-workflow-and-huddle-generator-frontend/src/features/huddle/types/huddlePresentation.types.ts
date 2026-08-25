export interface HuddlePresentationAudienceSelection {
  roleExternalId: string | null;
  roleName: string | null;
}

export interface HuddlePresentationIdentity {
  externalId: string;
  name: string;
  description: string | null;
  type: string;
  durationMinutes: number | null;
}

export interface HuddlePresentationAudience extends HuddlePresentationAudienceSelection {
  audienceDescription: string | null;
}

export interface HuddlePresentationNarrative {
  todayObjective: string | null;
  useCase: string | null;
  whyItMatters: string | null;
  desiredOutcome: string | null;
}

export interface HuddlePresentationResource {
  externalId: string;
  title: string;
  description: string | null;
  url: string | null;
  type: string | null;
  linkLabel: string | null;
  displayOrder: number;
}

export interface HuddlePresentationAgent {
  externalId: string;
  name: string;
  shortDescription: string | null;
  whatItIs: string | null;
  whatItHelpsYouDo: string | null;
  whenToUseIt: string | null;
  keyBenefits: readonly string[];
  usageType: string;
  displayLabel: string | null;
  showAccessLink: boolean;
  accessUrl: string | null;
  accessLinkLabel: string | null;
  displayOrder: number;
  resources: readonly HuddlePresentationResource[];
}

export interface HuddlePresentationMcemStage {
  externalId: string;
  name: string;
  description: string | null;
  displayOrder: number;
}

export interface HuddlePresentationActivity {
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
  /** "Featured" or "Extended". Featured activities are the priority practice and can be completed. */
  practiceTier: string;
  executionMethod: string;
  activitySteps: readonly string[];
  whyThisMatters: string | null;
  launchUrl: string | null;
  launchLabel: string | null;
  prerequisiteActivityExternalId: string | null;
  prerequisiteActivityName: string | null;
  agents: readonly HuddlePresentationAgent[];
  resources: readonly HuddlePresentationResource[];
}

export interface HuddlePresentationPhase {
  externalId: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  displayOrder: number;
  activities: readonly HuddlePresentationActivity[];
}

/**
 * The placement's facilitator guide, complete. The workbook stores it across three sheets:
 * Preparation, Explore_Practice and Commit, one row each per placement. Reflect and Commit live in
 * the Commit sheet, so they are guide fields, not topic fields.
 */
export interface HuddlePresentationFacilitatorGuide {
  sessionIntroduction: string | null;
  keyTalkingPoints: readonly string[];
  discussionQuestions: readonly string[];
  suggestedTransitions: readonly string[];
  wrapUpGuidance: string | null;
  preparationChecklist: readonly string[];
  facilitatorQuestions: readonly string[];
  listenFor: readonly string[];
  fallbackGuidance: string | null;
  reflectPrompt: string | null;
  commitPrompt: string | null;
  bringBackEvidence: readonly string[];
}

export interface HuddlePresentationContentAvailability {
  narrativeComplete: boolean;
  facilitatorGuideAvailable: boolean;
  phasesAvailable: boolean;
  activitiesAvailable: boolean;
  agentsAvailable: boolean;
  resourcesAvailable: boolean;
  reflectionAvailable: boolean;
  commitmentAvailable: boolean;
  missingFields: readonly string[];
}

export interface HuddlePresentationModel {
  identity: HuddlePresentationIdentity;
  audience: HuddlePresentationAudience;
  narrative: HuddlePresentationNarrative;
  agents: {
    primary: readonly HuddlePresentationAgent[];
    secondary: readonly HuddlePresentationAgent[];
  };
  mcemStages: readonly HuddlePresentationMcemStage[];
  phases: readonly HuddlePresentationPhase[];
  facilitatorGuide: HuddlePresentationFacilitatorGuide | null;
  resources: readonly HuddlePresentationResource[];
  reflectionPrompt: string | null;
  commitmentPrompt: string | null;
  keyTakeaway: string | null;
  contentAvailability: HuddlePresentationContentAvailability;
}

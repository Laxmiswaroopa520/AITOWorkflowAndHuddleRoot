import type {
  HuddleActivityResponse,
  HuddleAgentResponse,
  HuddleDetailResponse,
  HuddleMcemStageResponse,
  HuddlePhaseResponse,
  HuddleResourceResponse,
} from "../types/huddleApi.types";
import type {
  HuddlePresentationActivity,
  HuddlePresentationAgent,
  HuddlePresentationAudienceSelection,
  HuddlePresentationMcemStage,
  HuddlePresentationModel,
  HuddlePresentationPhase,
  HuddlePresentationResource,
} from "../types/huddlePresentation.types";

function byDisplayOrderThenExternalId<T extends { displayOrder: number; externalId: string }>(left: T, right: T): number {
  return left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId);
}

function mapResource(resource: HuddleResourceResponse): HuddlePresentationResource {
  return {
    externalId: resource.externalId,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    type: resource.type,
    linkLabel: resource.linkLabel,
    displayOrder: resource.displayOrder,
  };
}

function mapResources(resources: readonly HuddleResourceResponse[]): readonly HuddlePresentationResource[] {
  return [...resources].sort(byDisplayOrderThenExternalId).map(mapResource);
}

function mapAgent(agent: HuddleAgentResponse): HuddlePresentationAgent {
  return {
    externalId: agent.externalId,
    name: agent.name,
    shortDescription: agent.shortDescription,
    whatItIs: agent.whatItIs,
    whatItHelpsYouDo: agent.whatItHelpsYouDo,
    whenToUseIt: agent.whenToUseIt,
    keyBenefits: [...agent.keyBenefits],
    usageType: agent.usageType,
    displayLabel: agent.displayLabel,
    showAccessLink: agent.showAccessLink,
    accessUrl: agent.accessUrl,
    accessLinkLabel: agent.accessLinkLabel,
    displayOrder: agent.displayOrder,
    resources: mapResources(agent.resources),
  };
}

function mapAgents(agents: readonly HuddleAgentResponse[]): readonly HuddlePresentationAgent[] {
  return [...agents].sort(byDisplayOrderThenExternalId).map(mapAgent);
}

function mapActivity(activity: HuddleActivityResponse): HuddlePresentationActivity {
  return {
    externalId: activity.externalId,
    name: activity.name,
    description: activity.description,
    durationMinutes: activity.durationMinutes,
    displayOrder: activity.displayOrder,
    prompt: activity.prompt,
    expectedOutput: activity.expectedOutput,
    humanCheckpoint: activity.humanCheckpoint,
    requiredContext: activity.requiredContext,
    bestFitJob: activity.bestFitJob,
    practiceTier: activity.practiceTier,
    executionMethod: activity.executionMethod,
    activitySteps: activity.activitySteps ?? [],
    whyThisMatters: activity.whyThisMatters,
    launchUrl: activity.launchUrl,
    launchLabel: activity.launchLabel,
    prerequisiteActivityExternalId: activity.prerequisiteActivityExternalId,
    prerequisiteActivityName: activity.prerequisiteActivityName,
    agents: mapAgents(activity.agents),
    resources: mapResources(activity.resources),
  };
}

function mapPhase(phase: HuddlePhaseResponse): HuddlePresentationPhase {
  return {
    externalId: phase.externalId,
    name: phase.name,
    description: phase.description,
    durationMinutes: phase.durationMinutes,
    displayOrder: phase.displayOrder,
    activities: [...phase.activities].sort(byDisplayOrderThenExternalId).map(mapActivity),
  };
}

function mapMcemStage(stage: HuddleMcemStageResponse): HuddlePresentationMcemStage {
  return {
    externalId: stage.externalId,
    name: stage.name,
    description: stage.description,
    displayOrder: stage.displayOrder,
  };
}

export function createHuddlePresentationModel(
  detail: HuddleDetailResponse,
  audience: HuddlePresentationAudienceSelection,
): HuddlePresentationModel {
  return {
    identity: {
      externalId: detail.externalId,
      // The placement's role-facing title and description, falling back to the topic's. This also
      // titles the generated HTML and PowerPoint, so an AE export reads as the AE version.
      name: detail.roleTopicName ?? detail.name,
      description: detail.roleTopicDescription ?? detail.description,
      type: detail.type,
      durationMinutes: detail.durationMinutes,
    },
    audience: {
      roleExternalId: audience.roleExternalId,
      roleName: audience.roleName,
      audienceDescription: detail.audienceDescription,
    },
    narrative: {
      todayObjective: detail.todayObjective,
      useCase: detail.useCase,
      whyItMatters: detail.whyItMatters,
      desiredOutcome: detail.desiredOutcome,
    },
    agents: {
      primary: mapAgents(detail.primaryAgents),
      secondary: mapAgents(detail.secondaryAgents),
    },
    mcemStages: [...detail.mcemStages].sort(byDisplayOrderThenExternalId).map(mapMcemStage),
    phases: [...detail.phases].sort(byDisplayOrderThenExternalId).map(mapPhase),
    facilitatorGuide: detail.facilitatorGuide === null ? null : {
      sessionIntroduction: detail.facilitatorGuide.sessionIntroduction,
      keyTalkingPoints: [...detail.facilitatorGuide.keyTalkingPoints],
      discussionQuestions: [...detail.facilitatorGuide.discussionQuestions],
      suggestedTransitions: [...detail.facilitatorGuide.suggestedTransitions],
      wrapUpGuidance: detail.facilitatorGuide.wrapUpGuidance,
      // Carried in full. Dropping these was why Reflect and Commit reached the HTML export empty:
      // the workbook stores them per placement in the Commit sheet, not on the topic.
      preparationChecklist: [...detail.facilitatorGuide.preparationChecklist],
      facilitatorQuestions: [...detail.facilitatorGuide.facilitatorQuestions],
      listenFor: [...detail.facilitatorGuide.listenFor],
      fallbackGuidance: detail.facilitatorGuide.fallbackGuidance,
      reflectPrompt: detail.facilitatorGuide.reflectPrompt,
      commitPrompt: detail.facilitatorGuide.commitPrompt,
      bringBackEvidence: [...detail.facilitatorGuide.bringBackEvidence],
    },
    resources: mapResources(detail.topicResources),
    // The placement's guide is the real source; the topic-level columns have no workbook column
    // behind them and are null for all V4 content. Kept as a fallback for pre-V4 topics.
    reflectionPrompt: detail.facilitatorGuide?.reflectPrompt ?? detail.reflectionPrompt,
    commitmentPrompt: detail.facilitatorGuide?.commitPrompt ?? detail.commitmentPrompt,
    keyTakeaway: detail.keyTakeaway,
    contentAvailability: {
      ...detail.contentAvailability,
      missingFields: [...detail.contentAvailability.missingFields],
    },
  };
}

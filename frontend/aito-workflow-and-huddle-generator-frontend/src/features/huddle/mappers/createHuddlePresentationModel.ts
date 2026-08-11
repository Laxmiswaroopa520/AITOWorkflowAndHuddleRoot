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
      name: detail.name,
      description: detail.description,
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
    },
    resources: mapResources(detail.topicResources),
    reflectionPrompt: detail.reflectionPrompt,
    commitmentPrompt: detail.commitmentPrompt,
    keyTakeaway: detail.keyTakeaway,
    contentAvailability: {
      ...detail.contentAvailability,
      missingFields: [...detail.contentAvailability.missingFields],
    },
  };
}

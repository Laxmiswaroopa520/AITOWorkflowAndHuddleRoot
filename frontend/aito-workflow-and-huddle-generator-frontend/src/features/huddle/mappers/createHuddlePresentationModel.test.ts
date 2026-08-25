import { describe, expect, it } from "vitest";
import type { HuddleAgentResponse, HuddleDetailResponse, HuddleResourceResponse } from "../types";
import { createHuddlePresentationModel } from "./createHuddlePresentationModel";

function resource(externalId: string, displayOrder: number): HuddleResourceResponse {
  return { externalId, title: `Resource ${externalId}`, description: null, url: `https://example.com/${externalId}`, type: "Guide", linkLabel: "Open", displayOrder };
}

function agent(externalId: string, displayOrder: number): HuddleAgentResponse {
  return { externalId, name: `Agent ${externalId}`, shortDescription: null, whatItIs: null, whatItHelpsYouDo: null, whenToUseIt: null, keyBenefits: ["Benefit"], whenNotToUseIt: null, stepsToGetStarted: [], usageType: "Primary", displayLabel: null, showAccessLink: true, accessUrl: `https://example.com/${externalId}`, accessLinkLabel: "Open", displayOrder, resources: [resource(`${externalId}-resource-2`, 2), resource(`${externalId}-resource-1`, 1)] };
}

function detail(overrides: Partial<HuddleDetailResponse> = {}): HuddleDetailResponse {
  return {
    externalId: "huddle-1", name: "Huddle", description: "Description", type: "Prescriptive", publicationStatus: "Published",
    placementExternalId: null, roleTopicName: null, roleTopicDescription: null, wiifm: null,
    focusAreaExternalId: "focus-1", focusAreaName: "Focus", durationMinutes: 30, recommendationPriority: 1,
    roles: [{ externalId: "role-1", name: "Role", abbreviation: "R", segment: "Segment", description: null }], audienceDescription: "Audience",
    todayObjective: "Objective", useCase: "Use case", whyItMatters: "Why", desiredOutcome: "Outcome", stepsToGetStarted: [],
    mcemStages: [{ externalId: "stage-2", name: "Stage 2", description: null, displayOrder: 2, stageNumber: 2 }, { externalId: "stage-1", name: "Stage 1", description: null, displayOrder: 1, stageNumber: 1 }],
    primaryAgents: [agent("primary-2", 2), agent("primary-1", 1)], secondaryAgents: [agent("secondary-1", 1)],
    phases: [
      { externalId: "phase-2", name: "Phase 2", description: null, durationMinutes: 10, displayOrder: 2, activities: [] },
      { externalId: "phase-1", name: "Phase 1", description: null, durationMinutes: 20, displayOrder: 1, activities: [
        { externalId: "activity-2", name: "Activity 2", description: null, durationMinutes: 10, displayOrder: 2, prompt: "Prompt 2", expectedOutput: "Output 2", humanCheckpoint: "Check 2", requiredContext: "Context 2", bestFitJob: "Job 2", practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null, agents: [agent("activity-agent-2", 2), agent("activity-agent-1", 1)], resources: [resource("activity-resource-2", 2), resource("activity-resource-1", 1)] },
        { externalId: "activity-1", name: "Activity 1", description: null, durationMinutes: 10, displayOrder: 1, prompt: "Prompt 1", expectedOutput: "Output 1", humanCheckpoint: "Check 1", requiredContext: "Context 1", bestFitJob: "Job 1", practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null, agents: [], resources: [] },
      ] },
    ],
    facilitatorGuide: { sessionIntroduction: "Introduction", keyTalkingPoints: ["Point"], discussionQuestions: ["Question"], suggestedTransitions: ["Transition"], wrapUpGuidance: "Wrap up", preparationChecklist: [], facilitatorQuestions: [], listenFor: [], fallbackGuidance: null, reflectPrompt: null, commitPrompt: null, bringBackEvidence: [] },
    topicResources: [resource("topic-resource-2", 2), resource("topic-resource-1", 1)], reflectionPrompt: "Reflect", commitmentPrompt: "Commit", keyTakeaway: "Takeaway",
    contentAvailability: { narrativeComplete: true, facilitatorGuideAvailable: true, phasesAvailable: true, activitiesAvailable: true, agentsAvailable: true, resourcesAvailable: true, reflectionAvailable: true, commitmentAvailable: true, missingFields: [] },
    ...overrides,
  };
}

const selectedAudience = { roleExternalId: "role-1", roleName: "Role" };

describe("createHuddlePresentationModel", () => {
  it("maps a complete detail response using exact semantic fields", () => {
    const model = createHuddlePresentationModel(detail(), selectedAudience);
    expect(model.identity).toEqual({ externalId: "huddle-1", name: "Huddle", description: "Description", type: "Prescriptive", durationMinutes: 30 });
    expect(model.audience).toEqual({ ...selectedAudience, audienceDescription: "Audience" });
    expect(model.narrative).toEqual({ todayObjective: "Objective", useCase: "Use case", whyItMatters: "Why", desiredOutcome: "Outcome" });
    expect(model.phases[0]?.activities[0]).toMatchObject({ requiredContext: "Context 1", bestFitJob: "Job 1", practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null });
    expect(model.facilitatorGuide?.sessionIntroduction).toBe("Introduction");
  });

  it("keeps missing narrative values null without semantic substitution", () => {
    const model = createHuddlePresentationModel(detail({ todayObjective: null, useCase: null, whyItMatters: null, desiredOutcome: null, description: "Must not substitute", keyTakeaway: "Must not substitute" }), selectedAudience);
    expect(model.narrative).toEqual({ todayObjective: null, useCase: null, whyItMatters: null, desiredOutcome: null });
  });

  it("preserves a missing facilitator guide as null", () => {
    expect(createHuddlePresentationModel(detail({ facilitatorGuide: null }), selectedAudience).facilitatorGuide).toBeNull();
  });

  it("supports empty phases and empty activities", () => {
    expect(createHuddlePresentationModel(detail({ phases: [] }), selectedAudience).phases).toEqual([]);
    expect(createHuddlePresentationModel(detail({ phases: [{ externalId: "phase", name: "Phase", description: null, durationMinutes: null, displayOrder: 1, activities: [] }] }), selectedAudience).phases[0]?.activities).toEqual([]);
  });

  it("maps multiple agents and resources in stable display order", () => {
    const model = createHuddlePresentationModel(detail(), selectedAudience);
    expect(model.agents.primary.map((item) => item.externalId)).toEqual(["primary-1", "primary-2"]);
    expect(model.resources.map((item) => item.externalId)).toEqual(["topic-resource-1", "topic-resource-2"]);
    expect(model.agents.primary[0]?.resources.map((item) => item.displayOrder)).toEqual([1, 2]);
  });

  it("orders stages, phases, activities and nested relationships without changing semantic values", () => {
    const model = createHuddlePresentationModel(detail(), selectedAudience);
    expect(model.mcemStages.map((item) => item.externalId)).toEqual(["stage-1", "stage-2"]);
    expect(model.phases.map((item) => item.externalId)).toEqual(["phase-1", "phase-2"]);
    expect(model.phases[0]?.activities.map((item) => item.externalId)).toEqual(["activity-1", "activity-2"]);
    expect(model.phases[0]?.activities[1]?.agents.map((item) => item.externalId)).toEqual(["activity-agent-1", "activity-agent-2"]);
  });

  it("does not mutate the API response or share mutable collection references", () => {
    const input = detail();
    const before = structuredClone(input);
    const model = createHuddlePresentationModel(input, selectedAudience);
    expect(input).toEqual(before);
    expect(model.phases).not.toBe(input.phases);
    expect(model.resources).not.toBe(input.topicResources);
    expect(model.facilitatorGuide?.keyTalkingPoints).not.toBe(input.facilitatorGuide?.keyTalkingPoints);
  });
});

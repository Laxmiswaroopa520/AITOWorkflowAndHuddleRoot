/// <reference types="node" />
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HuddlePresentationModel } from "../../types/huddlePresentation.types";
import { buildHuddlePowerPoint } from "./exportHuddlePowerPoint";
import { createHuddlePowerPointPlan } from "./powerPointLayouts";

const resource = { externalId: "resource-1", title: "Approved playbook", description: "Governed reference material.", url: "https://example.com/playbook", type: "Guide", linkLabel: "Open", displayOrder: 1 } as const;
const agent = { externalId: "agent-1", name: "Copilot", shortDescription: null, whatItIs: null, whatItHelpsYouDo: null, whenToUseIt: null, keyBenefits: [], usageType: "Primary", displayLabel: null, showAccessLink: true, accessUrl: "https://example.com", accessLinkLabel: "Open", displayOrder: 1, resources: [resource] } as const;

function model(overrides: Partial<HuddlePresentationModel> = {}): HuddlePresentationModel {
  return {
    identity: { externalId: "huddle-1", name: "Accelerate a Strategic Deal", description: "Apply AI to prepare a grounded, decision-ready deal review.", type: "Prescriptive", durationMinutes: 30 },
    audience: { roleExternalId: "seller", roleName: "Seller", audienceDescription: "Customer-facing sellers." },
    narrative: { todayObjective: "Prepare a concise deal inspection.", useCase: "A priority opportunity needs alignment.", whyItMatters: "Focused preparation improves decision quality.", desiredOutcome: "An agreed action plan." },
    agents: { primary: [agent], secondary: [{ ...agent, externalId: "agent-2", name: "Researcher", usageType: "Secondary", displayOrder: 2 }] },
    mcemStages: [{ externalId: "stage-1", name: "Inspire and Design", description: null, displayOrder: 1 }],
    phases: [
      { externalId: "phase-1", name: "Preparation", description: "Ground the Huddle in current evidence.", durationMinutes: 10, displayOrder: 1, activities: [{ externalId: "activity-1", name: "Create a deal inspection", description: "Review the current opportunity.", durationMinutes: 10, displayOrder: 1, prompt: "Create a grounded deal inspection.", expectedOutput: "A decision-ready deal brief.", humanCheckpoint: "Verify assumptions and sources.", requiredContext: "Current opportunity data.", bestFitJob: "Strategic opportunity review.", practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null, agents: [agent], resources: [resource] }] },
      { externalId: "phase-2", name: "Explore and Practice", description: "Test the output with the team.", durationMinutes: 10, displayOrder: 2, activities: [{ externalId: "activity-2", name: "Pressure-test the plan", description: null, durationMinutes: 10, displayOrder: 1, prompt: "Identify the top risks and mitigations.", expectedOutput: "Prioritized risks.", humanCheckpoint: null, requiredContext: null, bestFitJob: null, practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null, agents: [], resources: [] }] },
      { externalId: "phase-3", name: "Commit to Action", description: "Agree ownership and next steps.", durationMinutes: 10, displayOrder: 3, activities: [{ externalId: "activity-3", name: "Confirm next actions", description: null, durationMinutes: 10, displayOrder: 1, prompt: "Assign owners and dates.", expectedOutput: "Owned action list.", humanCheckpoint: "Confirm owner agreement.", requiredContext: null, bestFitJob: null, practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null, agents: [], resources: [] }] },
    ],
    facilitatorGuide: null,
    resources: [resource], reflectionPrompt: "What changed in your understanding?", commitmentPrompt: "What will you do next?", keyTakeaway: null,
    contentAvailability: { narrativeComplete: true, facilitatorGuideAvailable: false, phasesAvailable: true, activitiesAvailable: true, agentsAvailable: true, resourcesAvailable: true, reflectionAvailable: true, commitmentAvailable: true, missingFields: [] },
    ...overrides,
  };
}

describe("Huddle PowerPoint export", () => {
  it("builds a valid PowerPoint package without mutating the canonical model", async () => {
    const input = model();
    const snapshot = JSON.stringify(input);
    const output = await buildHuddlePowerPoint(input).write({ outputType: "nodebuffer" });
    expect(Buffer.isBuffer(output)).toBe(true);
    expect((output as Buffer).subarray(0, 2).toString()).toBe("PK");
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it("preserves stable phase and activity ordering", () => {
    const input = model();
    const plan = createHuddlePowerPointPlan(input);
    expect(plan.activityPages.map((page) => `${page.phaseName}/${page.activityName}`)).toEqual([
      "Preparation/Create a deal inspection", "Explore and Practice/Pressure-test the plan", "Commit to Action/Confirm next actions",
    ]);
  });

  it("generates representative verification decks", async () => {
    const outputDirectory = path.resolve(process.cwd(), "..", "..", "docs", "exports", "part22-verification");
    await mkdir(outputDirectory, { recursive: true });
    const longPrompt = "Analyze the opportunity evidence, identify unsupported assumptions, propose mitigations, and clearly separate verified facts from hypotheses. ".repeat(35).trim();
    const examples: Array<[string, HuddlePresentationModel]> = [
      ["01-complete-prescriptive.pptx", model()],
      ["02-missing-narrative.pptx", model({ narrative: { todayObjective: null, useCase: null, whyItMatters: null, desiredOutcome: null } })],
      ["03-long-prompt.pptx", model({ phases: [{ ...model().phases[0], activities: [{ ...model().phases[0].activities[0], prompt: longPrompt }] }] })],
      ["04-multiple-phases.pptx", model()],
      ["05-multiple-agents.pptx", model({ agents: { primary: [agent, { ...agent, externalId: "agent-3", name: "Sales Agent", displayOrder: 2 }], secondary: [{ ...agent, externalId: "agent-4", name: "Researcher", displayOrder: 3 }, { ...agent, externalId: "agent-5", name: "Analyst", displayOrder: 4 }] } })],
      ["06-multiple-resources.pptx", model({ resources: Array.from({ length: 8 }, (_, index) => ({ ...resource, externalId: `resource-${index + 1}`, title: `Approved resource ${index + 1}`, displayOrder: index + 1 })) })],
    ];
    for (const [fileName, input] of examples) await buildHuddlePowerPoint(input).writeFile({ fileName: path.join(outputDirectory, fileName) });
    expect(examples).toHaveLength(6);
  });
});

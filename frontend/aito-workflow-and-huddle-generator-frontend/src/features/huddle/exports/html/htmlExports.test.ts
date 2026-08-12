/// <reference types="node" />
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HuddlePlanResponse, HuddlePresentationModel } from "../../types";
import { createHuddleHtmlExport } from "./exportHuddleHtml";
import { createLearningPlanHtmlExport } from "./exportLearningPlanHtml";
import { escapeHtml, safeExternalUrl } from "./htmlSanitizer";

const huddle: HuddlePresentationModel = {
  identity: { externalId: "topic-1", name: '<img src=x onerror="alert(1)"> Strategic Huddle', description: "A governed <review>.", type: "Prescriptive", durationMinutes: 30 },
  audience: { roleExternalId: "seller", roleName: "Seller & Lead", audienceDescription: null },
  narrative: { todayObjective: "Prepare safely.", useCase: null, whyItMatters: null, desiredOutcome: null },
  agents: { primary: [], secondary: [] }, mcemStages: [],
  phases: [{ externalId: "phase-1", name: "Preparation", description: null, durationMinutes: 30, displayOrder: 1, activities: [{ externalId: "activity-1", name: "Review", description: null, durationMinutes: 30, displayOrder: 1, prompt: "<script>alert('x')</script> " + "Long content. ".repeat(200), expectedOutput: "Safe output", humanCheckpoint: null, requiredContext: null, bestFitJob: null, agents: [], resources: [{ externalId: "bad", title: "Unsafe link", description: null, url: "javascript:alert(1)", type: null, linkLabel: null, displayOrder: 1 }] }] }],
  facilitatorGuide: null, resources: [], reflectionPrompt: null, commitmentPrompt: null, keyTakeaway: null,
  contentAvailability: { narrativeComplete: false, facilitatorGuideAvailable: false, phasesAvailable: true, activitiesAvailable: true, agentsAvailable: false, resourcesAvailable: true, reflectionAvailable: false, commitmentAvailable: false, missingFields: ["useCase"] },
};

const catalog = (week: number) => ({ externalId: `topic-${week}`, name: `Huddle ${week}`, description: null, type: "Prescriptive", focusAreaExternalId: null, focusAreaName: null, durationMinutes: 30, recommendationPriority: week, audienceDescription: null, desiredOutcome: null, roles: [], primaryAgents: [], secondaryAgents: [] });
const plan: HuddlePlanResponse = { roleExternalId: "seller", isCustomized: true, rowVersion: "row", items: [12, 8, 6, 11, 7, 10, 9].map((week) => ({ week, recommendedHuddleExternalId: week === 8 ? "recommended-topic" : `topic-${week}`, isCustomized: week === 8, huddle: catalog(week) })) };

describe("secure Huddle HTML exports", () => {
  it("escapes markup and rejects script URLs", () => {
    expect(escapeHtml('<script onload="x">')).toBe("&lt;script onload=&quot;x&quot;&gt;");
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
  });

  it("exports long Huddle content without scripts, event handlers, or semantic substitution", () => {
    const output = createHuddleHtmlExport(huddle);
    expect(output.html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(output.html).not.toContain("<script");
    expect(output.html).not.toContain("<img");
    expect(output.html).not.toContain("javascript:");
    expect(output.html).not.toContain("Use Case</h3>");
    expect(output.html).toContain("Long content. Long content.");
  });

  it("orders the persisted learning plan as Weeks 6 through 12", () => {
    const html = createLearningPlanHtmlExport(plan).html;
    const positions = [6, 7, 8, 9, 10, 11, 12].map((week) => html.indexOf(`W${week}</span>`));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain("Recommended replacement reference:");
    expect(html).toContain("@media(max-width:760px)");
  });

  it("writes representative files that can be opened locally", async () => {
    const directory = path.resolve(process.cwd(), "..", "..", "docs", "exports", "part23-verification");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "complete-huddle.html"), createHuddleHtmlExport(huddle).html, "utf8");
    await writeFile(path.join(directory, "learning-plan.html"), createLearningPlanHtmlExport(plan).html, "utf8");
  });
});

/// <reference types="node" />
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HuddlePlanResponse, HuddlePresentationModel } from "../../types";
import { HUDDLE_FONT_STACK } from "./fontStack";
import { createHuddleHtmlExport } from "./exportHuddleHtml";
import { createLearningPlanHtmlExport } from "./exportLearningPlanHtml";
import { escapeHtml, safeExternalUrl } from "./htmlSanitizer";

const huddle: HuddlePresentationModel = {
  identity: { externalId: "topic-1", name: '<img src=x onerror="alert(1)"> Strategic Huddle', description: "A governed <review>.", type: "Prescriptive", durationMinutes: 30 },
  audience: { roleExternalId: "seller", roleName: "Seller & Lead", audienceDescription: null },
  narrative: { todayObjective: "Prepare safely.", useCase: null, whyItMatters: null, desiredOutcome: null },
  agents: { primary: [], secondary: [] }, mcemStages: [],
  phases: [{ externalId: "phase-1", name: "Preparation", description: null, durationMinutes: 30, displayOrder: 1, activities: [{ externalId: "activity-1", name: "Review", description: null, durationMinutes: 30, displayOrder: 1, prompt: "<script>alert('x')</script> " + "Long content. ".repeat(200), expectedOutput: "Safe output", humanCheckpoint: null, requiredContext: null, bestFitJob: null, practiceTier: "Featured", executionMethod: "Prompt", activitySteps: [], whyThisMatters: null, launchUrl: null, launchLabel: null, prerequisiteActivityExternalId: null, prerequisiteActivityName: null, agents: [], resources: [{ externalId: "bad", title: "Unsafe link", description: null, url: "javascript:alert(1)", type: null, linkLabel: null, displayOrder: 1 }] }] }],
  facilitatorGuide: null, resources: [], reflectionPrompt: null, commitmentPrompt: null, keyTakeaway: null,
  contentAvailability: { narrativeComplete: false, facilitatorGuideAvailable: false, phasesAvailable: true, activitiesAvailable: true, agentsAvailable: false, resourcesAvailable: true, reflectionAvailable: false, commitmentAvailable: false, missingFields: ["useCase"] },
};

const catalog = (week: number) => ({ externalId: `topic-${week}`, name: `Huddle ${week}`, description: null, type: "Prescriptive", focusAreaExternalId: null, focusAreaName: null, durationMinutes: 30, recommendationPriority: week, audienceDescription: null, desiredOutcome: null, roles: [], primaryAgents: [], secondaryAgents: [], mcemStages: [], activityCount: 0, placementExternalId: null, featuredActivityCount: null, extendedActivityCount: null, roleTopicName: null, roleTopicDescription: null });
const plan: HuddlePlanResponse = { roleExternalId: "seller", isCustomized: true, rowVersion: "row", items: [8, 4, 2, 7, 3, 6, 5].map((week) => ({ week, recommendedHuddleExternalId: week === 4 ? "recommended-topic" : `topic-${week}`, isCustomized: week === 4, huddle: catalog(week) })) };

describe("secure Huddle HTML exports", () => {
  it("escapes markup and rejects script URLs", () => {
    expect(escapeHtml('<script onload="x">')).toBe("&lt;script onload=&quot;x&quot;&gt;");
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
  });

  it("exports long Huddle content without scripts, event handlers, or semantic substitution", () => {
    const output = createHuddleHtmlExport(huddle);
    expect(output.html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(output.html).not.toContain("<img src=x");
    expect(output.html).not.toContain('onerror="');
    expect(output.html).not.toContain("javascript:");
    expect(output.html).not.toContain("<script>alert");
    expect(output.html).not.toContain("Use Case</h3>");
    expect(output.html).toContain("Long content. Long content.");
    // Brand artwork is inlined as data URIs, never fetched from the network.
    expect(output.html).toContain('src="data:image/png;base64,');
    expect(output.html).not.toContain('src="http');
    // The eight-section guide layout from the Frontier Accelerator reference export.
    ["overview", "best-practices", "preparation", "practice", "commit", "tool", "resources", "notes"]
      .forEach((section) => expect(output.html).toContain('data-section-panel="' + section + '"'));
    expect(output.html).toContain("Share Your Experience");
    expect(output.html).toContain("Featured activities");
    expect(output.html).toContain('data-activity-tier="optional"');
    expect(output.html).toContain('data-practice-tier="featured"');
    expect(output.html).toContain("data-section-previous");
    expect(output.html).toContain("data-flow-target");
    expect(output.html).toContain("data-copy=");
  });

  it("keeps Extended activities out of the featured list and in the additional section", () => {
    const featured = huddle.phases[0].activities[0];
    const extended = { ...featured, externalId: "activity-2", name: "Optional depth activity", practiceTier: "Extended" };
    const output = createHuddleHtmlExport({ ...huddle, phases: [{ ...huddle.phases[0], activities: [featured, extended] }] });

    const featuredStack = output.html.split('data-activity-tier="featured"')[1].split('data-activity-tier="optional"')[0];
    const optionalStack = output.html.split('data-activity-tier="optional"')[1];
    expect(featuredStack).toContain("Review");
    expect(featuredStack).not.toContain("Optional depth activity");
    expect(optionalStack).toContain("Optional depth activity");
    // Letters run as one sequence across both stacks: A featured, B optional.
    expect(optionalStack).toContain(">B<");
    expect(output.html).toContain("1 featured activity");
    expect(output.html).toContain("1 optional");
    expect(output.html).not.toContain("No additional activities are configured");
  });

  it("includes explicitly supplied facilitator notes and escapes untrusted markup", () => {
    const output = createHuddleHtmlExport(huddle, { facilitatorNotes: '<img src=x onerror="alert(1)"> Follow up' });
    // The panel heading follows the Frontier Accelerator reference export.
    expect(output.html).toContain("Facilitator Notes");
    expect(output.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt; Follow up");
    expect(output.html).not.toContain('<img src=x onerror="alert(1)"> Follow up');
  });

  it("orders the persisted learning plan as Weeks 2 through 8", () => {
    const html = createLearningPlanHtmlExport(plan).html;
    const positions = [2, 3, 4, 5, 6, 7, 8].map((week) => html.indexOf(`W${week}</span>`));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain("Recommended replacement reference:");
    expect(html).toContain("@media(max-width:760px)");
  });

  it("renders every generated document in the one font stack", () => {
    // The manager reported the downloaded page not matching the application. The cause was
    // divergent declarations: the app rendered in Segoe UI Variable while the exports declared
    // only Segoe UI, and a missing 800 weight was being faked. One shared constant now feeds
    // both, so a document can never drift from the screen it came from again.
    const documents = [createHuddleHtmlExport(huddle).html, createLearningPlanHtmlExport(plan).html];

    for (const html of documents) {
      // Both the font-family property and the font shorthand, which also carries a family.
      const declared = new Set([
        ...[...html.matchAll(/font-family\s*:\s*([^;}]+)/g)].map((match) => match[1].trim()),
        ...[...html.matchAll(/(?<![-a-z])font\s*:\s*(?!inherit)[^;}]*?((?:"|')[^;}]+)/g)].map((match) => match[1].trim()),
      ]);
      expect([...declared]).toEqual([HUDDLE_FONT_STACK]);
      expect(html).toMatch(/font-synthesis:\s*none/);
    }
  });

  it("writes representative files that can be opened locally", async () => {
    const directory = path.resolve(process.cwd(), "..", "..", "docs", "exports", "part23-verification");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "complete-huddle.html"), createHuddleHtmlExport(huddle).html, "utf8");
    await writeFile(path.join(directory, "learning-plan.html"), createLearningPlanHtmlExport(plan).html, "utf8");
  });
});

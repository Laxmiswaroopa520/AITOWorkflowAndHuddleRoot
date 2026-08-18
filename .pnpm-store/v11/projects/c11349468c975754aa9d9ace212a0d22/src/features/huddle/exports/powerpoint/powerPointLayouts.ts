import type PptxGenJS from "pptxgenjs";
import type { HuddlePresentationModel } from "../../types/huddlePresentation.types";
import { addSectionCard, addSlideFrame, isSupportedHyperlink, paginateSections } from "./powerPointHelpers";
import { powerPointTheme } from "./powerPointTheme";
import type { HuddlePowerPointPlan, PowerPointSection } from "./powerPoint.types";

export function createHuddlePowerPointPlan(model: HuddlePresentationModel): HuddlePowerPointPlan {
  const activityPages = model.phases.flatMap((phase) => phase.activities.flatMap((activity, activityIndex) => {
    const sections: PowerPointSection[] = [
      { title: "Description", value: activity.description ?? "" },
      { title: "Prompt", value: activity.prompt ?? "" },
      { title: "Expected output", value: activity.expectedOutput ?? "" },
      { title: "Human checkpoint", value: activity.humanCheckpoint ?? "" },
      { title: "Required context", value: activity.requiredContext ?? "" },
      { title: "Best-fit job", value: activity.bestFitJob ?? "" },
    ];
    return paginateSections(sections).map((pageSections) => ({ phaseName: phase.name, activityName: activity.name, activityNumber: activityIndex + 1, sections: pageSections }));
  }));
  return { model, activityPages };
}

export function addHuddleSlides(pptx: PptxGenJS, plan: HuddlePowerPointPlan): void {
  const { model } = plan;
  addCover(pptx, model);
  addContext(pptx, model);
  addAgentsAndStages(pptx, model);
  addFlow(pptx, model);
  model.phases.forEach((phase, index) => addPhase(pptx, phase.name, phase.description, phase.durationMinutes, index + 1, phase.activities.length));
  plan.activityPages.forEach((page) => addActivity(pptx, page));
  addResources(pptx, model);
  addReflectionAndCommitment(pptx, model);
}

function addCover(pptx: PptxGenJS, model: HuddlePresentationModel): void {
  const slide = pptx.addSlide();
  const { colors, fonts, height } = powerPointTheme;
  slide.background = { color: colors.navy };
  slide.addShape("rect", { x: 0, y: 0, w: 0.18, h: height, fill: { color: colors.primary }, line: { color: colors.primary } });
  slide.addText("AITO HUDDLE", { x: 0.8, y: 0.65, w: 4, h: 0.3, fontFace: fonts.body, fontSize: 12, bold: true, color: "72D8FF", charSpacing: 2, margin: 0 });
  slide.addText(model.identity.name, { x: 0.8, y: 1.35, w: 10.9, h: 1.7, fontFace: fonts.heading, fontSize: 32, bold: true, color: colors.white, margin: 0, valign: "middle", fit: "shrink" });
  if (model.identity.description) slide.addText(model.identity.description, { x: 0.82, y: 3.2, w: 10.4, h: 1.05, fontFace: fonts.body, fontSize: 18, color: "DDEBF7", margin: 0, fit: "shrink" });
  const metadata = [model.identity.type, model.audience.roleName, model.identity.durationMinutes === null ? null : `${model.identity.durationMinutes} minutes`].filter(Boolean).join("  •  ");
  if (metadata) slide.addText(metadata, { x: 0.82, y: 5.55, w: 10.8, h: 0.4, fontFace: fonts.body, fontSize: 14, color: colors.white, margin: 0, fit: "shrink" });
  slide.addShape("roundRect", { x: 10.95, y: 5.3, w: 1.45, h: 1.45, rectRadius: 0.08, fill: { color: colors.primary }, line: { color: colors.primary } });
  slide.addText("AI", { x: 11.18, y: 5.62, w: 1, h: 0.6, fontFace: fonts.heading, fontSize: 28, bold: true, align: "center", color: colors.white, margin: 0 });
}

function addContext(pptx: PptxGenJS, model: HuddlePresentationModel): void {
  const sections = [
    { title: "Today's Objective", value: model.narrative.todayObjective ?? "" },
    { title: "Use Case", value: model.narrative.useCase ?? "" },
    { title: "Why It Matters", value: model.narrative.whyItMatters ?? "" },
    { title: "Desired Outcome", value: model.narrative.desiredOutcome ?? "" },
  ].filter((section) => section.value);
  paginateSections(sections, 1000).forEach((page, index) => {
    const slide = pptx.addSlide(); addSlideFrame(slide, index === 0 ? "Huddle context" : "Huddle context (continued)", model.audience.roleName ?? undefined);
    const height = Math.min(1.25, 5.55 / Math.max(page.length, 1));
    page.forEach((section, itemIndex) => addSectionCard(slide, section, 1.35 + itemIndex * (height + 0.12), height));
  });
}

function addAgentsAndStages(pptx: PptxGenJS, model: HuddlePresentationModel): void {
  if (model.agents.primary.length + model.agents.secondary.length + model.mcemStages.length === 0) return;
  const slide = pptx.addSlide(); addSlideFrame(slide, "AI tools and MCEM alignment");
  const sections: PowerPointSection[] = [];
  if (model.agents.primary.length) sections.push({ title: "Primary AI tools", value: model.agents.primary.map((agent) => agent.name).join("\n") });
  if (model.agents.secondary.length) sections.push({ title: "Secondary AI tools", value: model.agents.secondary.map((agent) => agent.name).join("\n") });
  if (model.mcemStages.length) sections.push({ title: "MCEM stages", value: model.mcemStages.map((stage) => stage.name).join("\n") });
  sections.forEach((section, index) => addSectionCard(slide, section, 1.45 + index * 1.65, 1.42));
}

function addFlow(pptx: PptxGenJS, model: HuddlePresentationModel): void {
  if (!model.phases.length) return;
  const slide = pptx.addSlide(); addSlideFrame(slide, "Huddle flow", `${model.phases.length} phases • ${model.phases.reduce((sum, phase) => sum + phase.activities.length, 0)} activities`);
  model.phases.slice(0, 5).forEach((phase, index) => {
    const y = 1.45 + index * 1.02;
    slide.addShape("ellipse", { x: 0.8, y, w: 0.55, h: 0.55, fill: { color: powerPointTheme.colors.primary }, line: { color: powerPointTheme.colors.primary } });
    slide.addText(String(index + 1), { x: 0.8, y: y + 0.08, w: 0.55, h: 0.24, fontSize: 12, bold: true, align: "center", color: powerPointTheme.colors.white, margin: 0 });
    slide.addText(phase.name, { x: 1.58, y: y - 0.02, w: 5.3, h: 0.32, fontSize: 16, bold: true, color: powerPointTheme.colors.text, margin: 0, fit: "shrink" });
    slide.addText(`${phase.activities.length} activities${phase.durationMinutes === null ? "" : ` • ${phase.durationMinutes} min`}`, { x: 1.58, y: y + 0.34, w: 5.3, h: 0.24, fontSize: 10, color: powerPointTheme.colors.muted, margin: 0 });
  });
}

function addPhase(pptx: PptxGenJS, name: string, description: string | null, duration: number | null, number: number, activityCount: number): void {
  const slide = pptx.addSlide(); slide.background = { color: powerPointTheme.colors.lightSurface };
  slide.addText(`PHASE ${number}`, { x: 0.85, y: 1.1, w: 2.5, h: 0.3, fontSize: 12, bold: true, color: powerPointTheme.colors.primary, charSpacing: 2, margin: 0 });
  slide.addText(name, { x: 0.85, y: 1.65, w: 11.1, h: 1.2, fontSize: 31, bold: true, color: powerPointTheme.colors.navy, margin: 0, fit: "shrink" });
  if (description) slide.addText(description, { x: 0.88, y: 3.05, w: 10.8, h: 1.1, fontSize: 17, color: powerPointTheme.colors.muted, margin: 0, fit: "shrink" });
  slide.addText(`${activityCount} activities${duration === null ? "" : `  •  ${duration} minutes`}`, { x: 0.88, y: 5.5, w: 5, h: 0.4, fontSize: 14, bold: true, color: powerPointTheme.colors.primary, margin: 0 });
}

function addActivity(pptx: PptxGenJS, page: HuddlePowerPointPlan["activityPages"][number]): void {
  const slide = pptx.addSlide(); addSlideFrame(slide, `${page.activityNumber}. ${page.activityName}`, page.phaseName);
  const height = Math.min(1.7, 5.5 / Math.max(page.sections.length, 1));
  page.sections.forEach((section, index) => addSectionCard(slide, section, 1.35 + index * (height + 0.12), height));
}

function addResources(pptx: PptxGenJS, model: HuddlePresentationModel): void {
  const resources = [...model.resources, ...model.phases.flatMap((phase) => phase.activities.flatMap((activity) => activity.resources))]
    .filter((resource, index, all) => all.findIndex((item) => item.externalId === resource.externalId) === index)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId));
  for (let offset = 0; offset < resources.length; offset += 5) {
    const slide = pptx.addSlide(); addSlideFrame(slide, offset === 0 ? "Resources" : "Resources (continued)");
    resources.slice(offset, offset + 5).forEach((resource, index) => {
      const y = 1.35 + index * 1.08;
      slide.addText(resource.title, { x: 0.8, y, w: 5.6, h: 0.3, fontSize: 15, bold: true, color: powerPointTheme.colors.text, margin: 0, fit: "shrink", ...(isSupportedHyperlink(resource.url) ? { hyperlink: { url: resource.url } } : {}) });
      if (resource.description) slide.addText(resource.description, { x: 0.8, y: y + 0.36, w: 11.5, h: 0.48, fontSize: 10.5, color: powerPointTheme.colors.muted, margin: 0, fit: "shrink" });
    });
  }
}

function addReflectionAndCommitment(pptx: PptxGenJS, model: HuddlePresentationModel): void {
  const sections = [{ title: "Reflection", value: model.reflectionPrompt ?? "" }, { title: "Commitment", value: model.commitmentPrompt ?? "" }].filter((section) => section.value);
  if (!sections.length) return;
  const slide = pptx.addSlide(); addSlideFrame(slide, "Reflection and commitment");
  sections.forEach((section, index) => addSectionCard(slide, section, 1.55 + index * 2.45, 2.15));
}

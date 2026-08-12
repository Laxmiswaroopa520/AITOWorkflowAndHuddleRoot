import type { HuddlePresentationAgent, HuddlePresentationModel, HuddlePresentationResource } from "../../types";
import { downloadHtmlFile, createHtmlDocument } from "./htmlTemplate";
import { escapeHtml, safeExternalUrl, safeHtmlFileName } from "./htmlSanitizer";
import type { HtmlExportFile, HuddleHtmlExportOptions } from "./html.types";

const text = (value: string | number) => escapeHtml(value);
const field = (label: string, value: string | null, featured = false) => value ? `<div class="field${featured ? " prompt" : ""}"><span class="label">${text(label)}</span>${text(value)}</div>` : "";
const tags = (values: readonly string[]) => values.length ? `<div class="tag-list">${values.map((value) => `<span class="tag">${text(value)}</span>`).join("")}</div>` : "";

function agentNames(agents: readonly HuddlePresentationAgent[]): string {
  return tags(agents.map((agent) => agent.name));
}

function resourceMarkup(resources: readonly HuddlePresentationResource[]): string {
  if (!resources.length) return "";
  return `<ul class="resource-list">${resources.map((resource) => {
    const copy = `<strong>${text(resource.title)}</strong>${resource.description ? `<small>${text(resource.description)}</small>` : ""}`;
    const url = safeExternalUrl(resource.url);
    return `<li>${url ? `<a class="resource" href="${text(url)}" target="_blank" rel="noopener noreferrer">${copy}</a>` : `<div class="resource">${copy}</div>`}</li>`;
  }).join("")}</ul>`;
}

export function createHuddleHtmlExport(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const narrative = [
    ["Today's Objective", model.narrative.todayObjective], ["Use Case", model.narrative.useCase],
    ["Why It Matters", model.narrative.whyItMatters], ["Desired Outcome", model.narrative.desiredOutcome],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const phases = [...model.phases].sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId));
  const activityResources = phases.flatMap((phase) => phase.activities.flatMap((activity) => activity.resources));
  const resources = [...model.resources, ...activityResources].filter((resource, index, all) => all.findIndex((candidate) => candidate.externalId === resource.externalId) === index).sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId));
  const body = `<main class="page"><header class="hero"><p class="eyebrow">AITO Huddle</p><h1>${text(model.identity.name)}</h1>${model.identity.description ? `<p class="hero-description">${text(model.identity.description)}</p>` : ""}<div class="meta"><span class="pill">${text(model.identity.type)}</span>${model.audience.roleName ? `<span class="pill">${text(model.audience.roleName)}</span>` : ""}${model.identity.durationMinutes !== null ? `<span class="pill">${text(model.identity.durationMinutes)} minutes</span>` : ""}</div></header><div class="content">
  ${narrative.length ? `<section class="section"><div class="section-heading"><span class="section-number">1</span><h2>Overview</h2></div><div class="grid">${narrative.map(([label, value]) => `<article class="card soft"><h3>${text(label)}</h3><p>${text(value)}</p></article>`).join("")}</div></section>` : ""}
  ${(model.agents.primary.length || model.agents.secondary.length || model.mcemStages.length) ? `<section class="section"><div class="section-heading"><span class="section-number">2</span><h2>AI tools and MCEM alignment</h2></div><div class="grid">${model.agents.primary.length ? `<article class="card"><h3>Primary AI tools</h3>${agentNames(model.agents.primary)}</article>` : ""}${model.agents.secondary.length ? `<article class="card"><h3>Secondary AI tools</h3>${agentNames(model.agents.secondary)}</article>` : ""}${model.mcemStages.length ? `<article class="card"><h3>MCEM stages</h3>${tags(model.mcemStages.map((stage) => stage.name))}</article>` : ""}</div></section>` : ""}
  ${phases.length ? `<section class="section"><div class="section-heading"><span class="section-number">3</span><h2>Huddle flow</h2></div>${phases.map((phase, phaseIndex) => `<article class="phase"><header class="phase-header"><h3>${phaseIndex + 1}. ${text(phase.name)}</h3>${phase.description ? `<p>${text(phase.description)}</p>` : ""}</header>${[...phase.activities].sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId)).map((activity, activityIndex) => `<section class="activity"><div class="activity-title"><span class="activity-index">${activityIndex + 1}</span><div><h4>${text(activity.name)}</h4>${activity.durationMinutes !== null ? `<span class="label">${text(activity.durationMinutes)} minutes</span>` : ""}</div></div>${activity.description ? `<p class="activity-copy">${text(activity.description)}</p>` : ""}<div class="activity-grid">${field("Prompt", activity.prompt, true)}${field("Expected output", activity.expectedOutput)}${field("Human checkpoint", activity.humanCheckpoint)}${field("Required context", activity.requiredContext)}${field("Best-fit job", activity.bestFitJob)}</div>${activity.agents.length ? `<div class="section"><span class="label">AI tools</span>${agentNames(activity.agents)}</div>` : ""}${activity.resources.length ? `<div class="section"><span class="label">Activity resources</span>${resourceMarkup(activity.resources)}</div>` : ""}</section>`).join("")}</article>`).join("")}</section>` : ""}
  ${resources.length ? `<section class="section"><div class="section-heading"><span class="section-number">4</span><h2>Resources</h2></div>${resourceMarkup(resources)}</section>` : ""}
  ${(model.reflectionPrompt || model.commitmentPrompt) ? `<section class="section"><div class="section-heading"><span class="section-number">5</span><h2>Reflect and commit</h2></div><div class="grid">${model.reflectionPrompt ? `<article class="card soft"><h3>Reflection</h3><p>${text(model.reflectionPrompt)}</p></article>` : ""}${model.commitmentPrompt ? `<article class="card soft"><h3>Commitment</h3><p>${text(model.commitmentPrompt)}</p></article>` : ""}</div></section>` : ""}
  </div><footer class="footer">AITO Workflow &amp; Huddle Generator</footer></main>`;
  return { html: createHtmlDocument(`${model.identity.name} Huddle`, body), fileName: options.fileName ?? safeHtmlFileName(`${model.identity.name} - Huddle`, "Huddle") };
}

export function exportHuddleHtml(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const output = createHuddleHtmlExport(model, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

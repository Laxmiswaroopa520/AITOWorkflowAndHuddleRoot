import type { HuddlePresentationAgent, HuddlePresentationModel, HuddlePresentationResource } from "../../types";
import { downloadHtmlFile, createHtmlDocument } from "./htmlTemplate";
import { escapeHtml, safeExternalUrl, safeHtmlFileName } from "./htmlSanitizer";
import type { HtmlExportFile, HuddleHtmlExportOptions } from "./html.types";
import { huddleHtmlInteractions } from "./htmlInteractions";

const text = (value: string | number) => escapeHtml(value);
const unavailable = '<p class="empty-state">Content unavailable</p>';
const list = (values: readonly string[]) => values.length
  ? `<ul class="governed-list">${values.map((value) => `<li>${text(value)}</li>`).join("")}</ul>`
  : unavailable;
const tags = (values: readonly string[]) => values.length
  ? `<div class="tag-list">${values.map((value) => `<span class="tag">${text(value)}</span>`).join("")}</div>`
  : unavailable;
const field = (label: string, value: string | null, featured = false) => value
  ? `<div class="field${featured ? " prompt" : ""}"><span class="label">${text(label)}</span><p>${text(value)}</p></div>`
  : "";

function agentNames(agents: readonly HuddlePresentationAgent[]): string {
  return tags(agents.map((agent) => agent.name));
}

function discussionGuide(questions: readonly string[]): string {
  if (!questions.length) return "";
  return `<section class="discussion-guide"><span class="label">Discussion guide</span>${list(questions)}</section>`;
}

function resourceMarkup(resources: readonly HuddlePresentationResource[]): string {
  if (!resources.length) return unavailable;
  return `<ul class="resource-list">${resources.map((resource) => {
    const copy = `<strong>${text(resource.title)}</strong>${resource.description ? `<small>${text(resource.description)}</small>` : ""}`;
    const url = safeExternalUrl(resource.url);
    return `<li>${url ? `<a class="resource" href="${text(url)}" target="_blank" rel="noopener noreferrer">${copy}<span>→</span></a>` : `<div class="resource">${copy}</div>`}</li>`;
  }).join("")}</ul>`;
}

function agentCards(agents: readonly HuddlePresentationAgent[]): string {
  if (!agents.length) return unavailable;
  return `<div class="tool-grid">${agents.map((agent) => `<article class="tool-card"><div class="tool-mark">✦</div><div><span class="label">${text(agent.usageType)}</span><h3>${text(agent.displayLabel || agent.name)}</h3>${agent.shortDescription ? `<p>${text(agent.shortDescription)}</p>` : ""}${field("What it is", agent.whatItIs)}${field("What it helps you do", agent.whatItHelpsYouDo)}${field("When to use it", agent.whenToUseIt)}${agent.keyBenefits.length ? `<div class="field"><span class="label">Key benefits</span>${list(agent.keyBenefits)}</div>` : ""}${agent.showAccessLink && safeExternalUrl(agent.accessUrl) ? `<a class="primary-link" href="${text(safeExternalUrl(agent.accessUrl) ?? "")}" target="_blank" rel="noopener noreferrer">${text(agent.accessLinkLabel || "Open agent")} →</a>` : ""}</div></article>`).join("")}</div>`;
}

export function createHuddleHtmlExport(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const phases = [...model.phases].sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId));
  const activities = phases.flatMap((phase) => [...phase.activities].sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId)).map((activity) => ({ activity, phase })));
  const activityResources = activities.flatMap(({ activity }) => activity.resources);
  const resources = [...model.resources, ...activityResources]
    .filter((resource, index, all) => all.findIndex((candidate) => candidate.externalId === resource.externalId) === index)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId));
  const allAgents = [...model.agents.primary, ...model.agents.secondary]
    .filter((agent, index, all) => all.findIndex((candidate) => candidate.externalId === agent.externalId) === index)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.externalId.localeCompare(b.externalId));
  const guide = model.facilitatorGuide;
  const facilitatorNotes = options.facilitatorNotes?.trim() || null;

  const body = `<article class="page huddle-page v5-export segmented-huddle-page">
    <header class="page-topbar"><div class="brand-left"><div class="microsoft-brand"><span class="ms-grid"><i></i><i></i><i></i><i></i></span><span>Microsoft</span></div><small>Frontier Accelerator · Huddle guide</small></div><div class="ribbon-art" aria-hidden="true"><i class="wave wave-one"></i><i class="wave wave-two"></i><i class="wave wave-three"></i></div></header>
    <nav class="section-nav" aria-label="Huddle sections"><div class="section-tabs"><button type="button" class="is-active" data-section-target="overview">Overview</button><button type="button" data-section-target="workflow">Workflow</button><button type="button" data-section-target="discussion">Prompts &amp; Discussion</button><button type="button" data-section-target="tools">Microsoft AI Tools</button><button type="button" data-section-target="notes">Facilitator Notes</button><button type="button" data-section-target="commit">Reflect &amp; Commit</button></div><div class="section-status"><small>Huddle section</small><strong><span data-section-index>1</span> of 6 · <span data-section-name>Overview</span></strong></div></nav>
    <div class="content">
      <section class="panel is-active overview-panel" data-section-panel="overview"><div class="hero-grid"><div class="hero-copy"><p class="eyebrow">${text(model.identity.type)} Huddle</p><h1>${text(model.identity.name)}</h1>${model.identity.description ? `<p class="hero-description">${text(model.identity.description)}</p>` : ""}<div class="meta-strip"><div class="meta-item"><span class="round-icon">◎</span><span><small>Role</small><strong>${model.audience.roleName ? text(model.audience.roleName) : "Not specified"}</strong></span></div><span class="meta-divider"></span><div class="meta-item"><span class="round-icon">✦</span><span><small>AI Tools</small>${agentNames(allAgents)}</span></div><span class="meta-divider"></span><div class="meta-item"><span class="round-icon">▤</span><span><small>MCEM stages</small>${tags(model.mcemStages.map((stage) => stage.name))}</span></div></div></div><aside class="objective-card"><span class="objective-icon">◎</span><div><h2>Today’s Objective</h2>${model.narrative.todayObjective ? `<p>${text(model.narrative.todayObjective)}</p>` : unavailable}</div></aside></div>${model.audience.audienceDescription ? `<div class="audience-card"><span class="label">Audience</span><p>${text(model.audience.audienceDescription)}</p></div>` : ""}<section class="three-column-summary card"><div class="summary-column"><span class="summary-icon blue">◉</span><div><h3>Use Case / Activity</h3>${model.narrative.useCase ? `<p>${text(model.narrative.useCase)}</p>` : unavailable}</div></div><div class="vertical-rule"></div><div class="summary-column"><span class="summary-icon green">✓</span><div><h3>Why it matters</h3>${model.narrative.whyItMatters ? `<p>${text(model.narrative.whyItMatters)}</p>` : unavailable}</div></div><div class="vertical-rule"></div><div class="summary-column"><span class="summary-icon purple">♛</span><div><h3>Desired Outcome</h3>${model.narrative.desiredOutcome ? `<p>${text(model.narrative.desiredOutcome)}</p>` : unavailable}</div></div></section></section>
      <section class="panel workflow-panel" data-section-panel="workflow"><div class="panel-heading"><span>01</span><div><p class="eyebrow">Huddle flow</p><h2>Business workflow</h2></div></div>${phases.length ? `<div class="workflow-grid">${phases.map((phase, index) => `<article class="workflow-card"><span class="workflow-number">${index + 1}</span><div><h3>${text(phase.name)}</h3>${phase.description ? `<p>${text(phase.description)}</p>` : ""}<small>${phase.durationMinutes === null ? "Duration unavailable" : `${text(phase.durationMinutes)} min`} · ${phase.activities.length} ${phase.activities.length === 1 ? "activity" : "activities"}</small></div></article>`).join("")}</div>` : unavailable}</section>
      <section class="panel discussion-panel" data-section-panel="discussion"><div class="required-section-heading"><div><p class="eyebrow">Huddle Activities</p><h2>Activities &amp; Recommended Prompts</h2><p>Select a Huddle phase, then open an activity to review its governed content and copy its prompt.</p></div><span class="scenario-count" data-visible-activity-count>${activities.length} activities</span></div>${phases.length ? `<div class="phase-filter">${phases.map((phase, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-phase-filter="${text(phase.externalId)}" data-phase-name="${text(phase.name)}" data-phase-description="${text(phase.description || "")}"><span>${index + 1}</span><strong>${text(phase.name)}</strong><small>${phase.activities.length} ${phase.activities.length === 1 ? "activity" : "activities"}</small></button>`).join("")}</div><div class="selected-phase"><span>1</span><div><small>Selected phase</small><h3 data-selected-phase-title></h3><p data-selected-phase-description></p></div></div>` : ""}<div class="activity-stack">${activities.length ? activities.map(({ activity, phase }, index) => `<details class="activity" data-activity-phase="${text(phase.externalId)}"${index === 0 ? " open" : ""}><summary><span class="activity-index">${index + 1}</span><span><small>${text(phase.name)}</small><strong>${text(activity.name)}</strong></span><b>⌄</b></summary><div class="activity-body">${activity.description ? `<p class="activity-copy">${text(activity.description)}</p>` : ""}${activity.prompt ? `<div class="prompt-label-row"><span class="label">Recommended prompt</span><button type="button" class="copy-button" data-copy-prompt="${text(activity.prompt)}" aria-label="Copy prompt" title="Copy prompt">▣</button></div><div class="prompt-scroll">${text(activity.prompt)}</div>` : unavailable}<div class="activity-grid">${field("Expected output", activity.expectedOutput)}${field("Human checkpoint", activity.humanCheckpoint)}${field("Required context", activity.requiredContext)}${field("Best-fit job", activity.bestFitJob)}</div>${activity.agents.length ? `<section class="recommended-tool"><span class="label">Recommended Microsoft tool</span>${agentNames(activity.agents)}</section>` : ""}${activity.resources.length ? `<div class="subsection"><span class="label">Activity resources</span>${resourceMarkup(activity.resources)}</div>` : ""}</div></details>`).join("") : unavailable}<div class="empty-state" data-phase-empty hidden>No activities are mapped to this phase.</div></div>${discussionGuide(guide?.discussionQuestions ?? [])}</section>
      <section class="panel tools-panel" data-section-panel="tools"><div class="panel-heading"><span>03</span><div><p class="eyebrow">Approved assistants</p><h2>Microsoft AI Tools</h2></div></div>${agentCards(allAgents)}${resources.length ? `<div class="resources-card"><h2>Resources</h2>${resourceMarkup(resources)}</div>` : ""}</section>
      <section class="panel notes-panel" data-section-panel="notes"><div class="panel-heading"><span>04</span><div><p class="eyebrow">Facilitation package</p><h2>Facilitator Notes</h2></div></div>${facilitatorNotes ? `<div class="field prompt"><span class="label">Your facilitator notes</span><p>${text(facilitatorNotes)}</p></div>` : ""}${guide ? `<div class="guide-grid">${field("Session introduction", guide.sessionIntroduction, true)}<div class="field"><span class="label">Key talking points</span>${list(guide.keyTalkingPoints)}</div><div class="field"><span class="label">Discussion questions</span>${list(guide.discussionQuestions)}</div><div class="field"><span class="label">Suggested transitions</span>${list(guide.suggestedTransitions)}</div>${field("Wrap-up guidance", guide.wrapUpGuidance, true)}</div>` : facilitatorNotes ? "" : unavailable}</section>
      <section class="panel commit-panel" data-section-panel="commit"><div class="panel-heading"><span>05</span><div><p class="eyebrow">Close the Huddle</p><h2>Reflect &amp; Commit</h2></div></div><div class="commit-grid">${model.reflectionPrompt ? `<article class="reflect-card"><span>↻</span><h3>Reflection</h3><p>${text(model.reflectionPrompt)}</p></article>` : ""}${model.commitmentPrompt ? `<article class="commit-card"><span>✓</span><h3>Commitment</h3><p>${text(model.commitmentPrompt)}</p></article>` : ""}${model.keyTakeaway ? `<article class="takeaway-card"><span>✦</span><h3>Key takeaway</h3><p>${text(model.keyTakeaway)}</p></article>` : ""}</div>${!model.reflectionPrompt && !model.commitmentPrompt && !model.keyTakeaway ? unavailable : ""}</section>
    </div><div class="section-actions"><button type="button" data-section-previous>← Previous</button><button type="button" class="next" data-section-next>Next →</button></div><footer class="footer"><span>Generated from the AITO Workflow &amp; Huddle Generator</span><span>${text(model.identity.name)}</span></footer><div class="copy-toast" data-copy-toast>Prompt copied</div>
  </article>${huddleHtmlInteractions}`;

  return { html: createHtmlDocument(`${model.identity.name} Huddle`, body), fileName: options.fileName ?? safeHtmlFileName(`${model.identity.name} - Huddle`, "Huddle") };
}

export function exportHuddleHtml(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const output = createHuddleHtmlExport(model, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

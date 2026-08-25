import type { HuddlePresentationActivity, HuddlePresentationAgent, HuddlePresentationModel, HuddlePresentationPhase, HuddlePresentationResource } from "../../types";
import { downloadHtmlFile, createHtmlDocument } from "./htmlTemplate";
import { escapeHtml, safeExternalUrl, safeHtmlFileName } from "./htmlSanitizer";
import type { HtmlExportFile, HuddleHtmlExportOptions } from "./html.types";
import { huddleGuideInteractions } from "./huddleGuideInteractions";
import { huddleGuideStyles } from "./huddleGuideStyles";
import { agentArtwork, frontierAcceleratorLogo } from "./huddleGuideAssets";

const text = (value: string | number) => escapeHtml(value);

/** Dashed placeholder used wherever the content model has no value yet. */
const placeholder = (message: string) => `<div class="empty-state">${text(message)}</div>`;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const activityLetter = (index: number) => (index < LETTERS.length ? LETTERS[index] : String(index + 1));

const CHEVRON_SVG = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20"><path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
const COPY_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>';
/** Pure-CSS Copilot glyph, used when an agent has no inlined logo. */
const COPILOT_MARK = '<span class="copilot-mark" aria-hidden="true"><span class="copilot-loop copilot-loop-a"></span><span class="copilot-loop copilot-loop-b"></span></span>';

/**
 * Copy that belongs to the guide template rather than to any Huddle record. The
 * reference export renders these identical strings for every Huddle, so they are
 * layout furniture and not database content. If the content model gains fields for
 * them, read them from the model here instead.
 */
const TEMPLATE = {
  agenda: [
    { label: "Overview", minutes: 2 },
    { label: "Share Your Experience", minutes: 10 },
    { label: "AI-in-Action (Stages 1-3)", minutes: 15 },
    { label: "Closing & Next Steps", minutes: 3 },
  ],
  flow: [
    { key: "preparation", title: "Preparation", copy: "Bring a real scenario, share the context and friction, and align on what matters before using AI." },
    { key: "practice", title: "Explore & Practice", copy: "Use AI on real work, compare approaches, and validate the output together." },
    { key: "commit", title: "Commit to Action", copy: "Choose one action to try after the Huddle and decide what you will bring back next time." },
  ],
  thinkFeelDo: [
    { label: "THINK", copy: (topic: string) => `See where AI can improve ${topic.toLowerCase()} in your work.` },
    { label: "FEEL", copy: (_topic: string) => "Build confidence using AI while keeping your judgment in the loop." },
    { label: "DO", copy: (_topic: string) => "Apply the workflow to a real scenario and leave with one action to try." },
  ],
  shareYourExperience: [
    { title: "What did you try with AI since the last Huddle?", copy: "Share a real task, prompt, workflow, or moment where you used AI." },
    { title: "What worked well, and what did not?", copy: "Compare useful approaches with outputs, dead ends, or situations where AI was less helpful." },
    { title: "What did you learn, and where did you run into friction?", copy: "Share a discovery others can reuse and any process, data, tool, access, or confidence blockers you encountered." },
  ],
  bringIntoTheConversation: [
    "One real customer, account, opportunity, or work scenario",
    "Relevant source context and current signals",
    "Known constraints, risks, and decision owners",
    "A clear definition of what a useful outcome looks like",
  ],
  closeTheHuddle: [
    "What is the next best action the team should take after this Huddle?",
    "What will you bring back to the next Huddle as evidence of progress?",
  ],
} as const;

function agentNames(agents: readonly HuddlePresentationAgent[]): string[] {
  return agents.map((agent) => agent.displayLabel?.trim() || agent.name).filter((name) => name.length > 0);
}

function questionList(values: readonly string[], fallback: string): string {
  if (!values.length) return placeholder(fallback);
  return `<ul class="question-list">${values.map((value) => `<li>${text(value)}</li>`).join("")}</ul>`;
}

function checkList(values: readonly string[]): string {
  return `<ul class="check-list">${values.map((value) => `<li>${text(value)}</li>`).join("")}</ul>`;
}

function resourceRows(resources: readonly HuddlePresentationResource[]): string {
  return `<ul>${resources.map((resource) => {
    const copy = `<span class="resource-copy"><strong>${text(resource.title)}</strong>${resource.description ? `<small>${text(resource.description)}</small>` : ""}</span><span class="resource-arrow">→</span>`;
    const url = safeExternalUrl(resource.url);
    const inner = url
      ? `<a href="${text(url)}" target="_blank" rel="noopener noreferrer">${copy}</a>`
      : `<span>${copy}</span>`;
    return `<li class="resource-row">${inner}</li>`;
  }).join("")}</ul>`;
}

function activityCard(activity: HuddlePresentationActivity, index: number, tier: "featured" | "optional", discussionWhilePracticing: readonly string[]): string {
  const tools = agentNames(activity.agents);
  const toolRow = tools.length
    ? `<div class="activity-tool-row"><div><span class="activity-eyebrow">Use</span><strong>${text(tools.join(" + "))}</strong></div></div>`
    : "";
  const promptTarget = tools[0] ?? "your AI tool";
  const promptBlock = activity.prompt
    ? `<div class="activity-prompt-block"><div class="prompt-label-row"><span class="prompt-label">Try this prompt in ${text(promptTarget)}.</span><button type="button" class="copy-button scenario-copy-button" data-copy="${text(activity.prompt)}" aria-label="Copy prompt" title="Copy prompt">${COPY_SVG}</button></div><div class="scenario-prompt-scroll">${text(activity.prompt)}</div></div>`
    : placeholder("No recommended prompt is configured for this activity yet.");

  return `<details class="practice-activity-card" data-practice-tier="${tier}"${index === 0 && tier === "featured" ? " open" : ""}>`
    + `<summary class="practice-activity-summary"><span class="activity-letter">${text(activityLetter(index))}</span>`
    + `<span class="practice-activity-heading"><strong>${text(activity.name)}</strong>${activity.description ? `<small>${text(activity.description)}</small>` : ""}</span>`
    + `<span class="scenario-chevron">${CHEVRON_SVG}</span></summary>`
    + `<div class="practice-activity-body">${toolRow}${promptBlock}`
    + `<div class="activity-practice-grid">`
    + `<section class="activity-detail-card"><h3>How to practice</h3>${activity.requiredContext ? `<ol class="numbered-steps compact-steps"><li><span>1</span><p>${text(activity.requiredContext)}</p></li></ol>` : placeholder("Step-by-step practice guidance is not configured for this activity yet.")}</section>`
    + `<section class="activity-detail-card"><h3>Discuss while practicing</h3>${questionList(discussionWhilePracticing, "No discussion prompts are configured for this activity yet.")}</section>`
    + `</div>`
    + `<div class="activity-output-grid">`
    + `<section class="activity-output-card expected-output-card"><span class="activity-eyebrow">Expected output</span>${activity.expectedOutput ? `<p>${text(activity.expectedOutput)}</p>` : placeholder("Not configured yet.")}</section>`
    + `<section class="activity-output-card human-checkpoint-card"><span class="activity-eyebrow">Human checkpoint</span>${activity.humanCheckpoint ? `<p>${text(activity.humanCheckpoint)}</p>` : placeholder("Not configured yet.")}</section>`
    + `</div>`
    // Best-fit job is deliberately not rendered. Removed on the manager's instruction; the value
    // still reaches the presentation model, so restoring it is a one-line change.
    + `${activity.resources.length ? `<section class="resources-card"><div class="bottom-title blue-title"><span>▤</span><h2>Activity resources</h2></div>${resourceRows(activity.resources)}</section>` : ""}`
    + `</div></details>`;
}

function toolCard(agent: HuddlePresentationAgent): string {
  const label = agent.displayLabel?.trim() || agent.name;
  const artwork = agentArtwork(agent.name);
  const brandMark = artwork
    ? `<img class="${artwork.className}" src="${artwork.source}" alt="${text(label)}">`
    : COPILOT_MARK;
  const info = (icon: string, tone: string, heading: string, value: string | null) => value
    ? `<div class="tool-divider"></div><div class="tool-info"><span class="mini-icon ${tone}">${icon}</span><div><h3>${text(heading)}</h3><p>${text(value)}</p></div></div>`
    : "";
  const accessUrl = agent.showAccessLink ? safeExternalUrl(agent.accessUrl) : null;

  return `<section class="tool-card card multi-tool-card">`
    + `<div class="tool-card-title"><span>✦</span><h2>${text(label)}</h2></div>`
    + `<div class="tool-grid">`
    + `<div class="tool-brand">${brandMark}<div><strong>${text(label)}</strong><span>${text(agent.shortDescription?.trim() || "Microsoft AI experience")}</span></div></div>`
    + info("♙", "green", "What it is", agent.whatItIs)
    + info("◎", "green", "What it helps you do", agent.whatItHelpsYouDo)
    + info("▣", "purple", "When to use it", agent.whenToUseIt)
    + `</div>`
    + `${agent.keyBenefits.length ? `<ul class="benefit-strip">${agent.keyBenefits.map((benefit) => `<li><span class="check-dot">✓</span>${text(benefit)}</li>`).join("")}</ul>` : ""}`
    + `${accessUrl ? `<a class="launch-agent-button" href="${text(accessUrl)}" target="_blank" rel="noopener noreferrer">${text(agent.accessLinkLabel?.trim() || `Open ${label}`)} →</a>` : ""}`
    + `</section>`;
}

function stageShell(topicName: string, stageNumber: number, title: string, description: string | null, inner: string, badge = ""): string {
  return `<section class="card stage-shell">`
    + `<div class="stage-topic-context"><span>TODAY’S TOPIC</span><strong>${text(topicName)}</strong></div>`
    + `<div class="stage-header"><span class="stage-number">${stageNumber}</span>`
    + `<div><span class="stage-kicker">AI in Action</span><h2>${text(title)}</h2>${description ? `<p>${text(description)}</p>` : ""}</div>${badge}</div>`
    + inner
    + `</section>`;
}

export function createHuddleHtmlExport(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const phases: readonly HuddlePresentationPhase[] = [...model.phases]
    .sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId));

  // Every activity is listed under Explore & Practice, matching the reference guide,
  // so no activity is dropped when a Huddle keeps activities on another phase.
  const allActivities = phases.flatMap((phase) => [...phase.activities]
    .sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId)));

  // PracticeTier decides where an activity goes. Featured is the priority practice and leads the
  // section; Extended is optional depth and belongs under Additional activities, matching the
  // workspace. Anything without a tier counts as Featured rather than being hidden.
  const featuredActivities: readonly HuddlePresentationActivity[] =
    allActivities.filter((activity) => activity.practiceTier !== "Extended");
  const optionalActivities: readonly HuddlePresentationActivity[] =
    allActivities.filter((activity) => activity.practiceTier === "Extended");

  const agents = [...model.agents.primary, ...model.agents.secondary]
    .filter((agent, index, all) => all.findIndex((candidate) => candidate.externalId === agent.externalId) === index)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId));

  const resources = [...model.resources, ...allActivities.flatMap((activity) => activity.resources), ...agents.flatMap((agent) => agent.resources)]
    .filter((resource, index, all) => all.findIndex((candidate) => candidate.externalId === resource.externalId) === index)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId));

  const guide = model.facilitatorGuide;
  // Reflect and Commit belong to the placement, in the workbook's Commit sheet. The topic-level
  // fields have no workbook column behind them and are null for all V4 content, which is why this
  // panel previously rendered its placeholders.
  const reflectPrompt = guide?.reflectPrompt ?? model.reflectionPrompt;
  const commitPrompt = guide?.commitPrompt ?? model.commitmentPrompt;
  const facilitatorNotes = options.facilitatorNotes?.trim() || null;
  const topicName = model.identity.name;
  const toolNames = agentNames(agents);
  const stageName = (index: number, fallback: string) => phases[index]?.name?.trim() || fallback;
  const stageDescription = (index: number) => phases[index]?.description ?? null;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "best-practices", label: "Share Your Experience" },
    { key: "preparation", label: stageName(0, "Preparation") },
    { key: "practice", label: stageName(1, "Explore & Practice") },
    { key: "commit", label: stageName(2, "Commit to Action") },
    { key: "tool", label: "AI Tools" },
    { key: "resources", label: "Resources" },
    { key: "notes", label: "Facilitator Notes" },
  ];

  const generated = new Date();
  const generatedDate = generated.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const generatedTime = generated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const overviewPanel = `<section class="huddle-section-panel is-active" data-section-panel="overview">`
    + `<div class="overview-timing-band" aria-label="Today’s Huddle"><div class="overview-timing-title">Today’s Huddle</div><div class="overview-timing-steps">`
    + TEMPLATE.agenda.map((step, index) => `${index > 0 ? '<div class="overview-timing-arrow">→</div>' : ""}<div class="overview-timing-step"><strong>${text(step.label)}</strong><span>· ${step.minutes} min</span></div>`).join("")
    + `</div></div>`
    + `<section class="hero-grid"><div class="hero-copy"><h1>${text(topicName)}</h1>${model.identity.description ? `<p class="hero-description">${text(model.identity.description)}</p>` : ""}`
    + `<div class="meta-strip">`
    + `<div class="meta-item"><span class="round-icon">◎</span><span><small>Role</small><strong>${text(model.audience.roleName?.trim() || "Not specified")}</strong></span></div>`
    + `<span class="meta-divider"></span>`
    + `<div class="meta-item"><span class="round-icon">✦</span><span><small>AI Tools</small><strong>${text(toolNames.length ? toolNames.join(", ") : "Not configured")}</strong></span></div>`
    + `<span class="meta-divider"></span>`
    + `<div class="meta-item"><span class="round-icon">▤</span><span><small>MCEM Stages</small><strong>${text(model.mcemStages.length ? model.mcemStages.map((stage) => stage.name).join(", ") : "Not configured")}</strong></span></div>`
    + `</div></div>`
    + `<aside class="objective-card"><span class="objective-icon">◎</span><div><h2>Today’s Objective</h2>${model.narrative.todayObjective ? `<p>${text(model.narrative.todayObjective)}</p>` : placeholder("No objective is configured for this Huddle yet.")}</div></aside></section>`
    + `<section class="overview-two-column">`
    + `<div class="card overview-summary-card"><div class="section-heading"><span class="sparkle-icon">✦</span><h2>Why this Huddle matters</h2></div>`
    + `${model.narrative.whyItMatters ? `<p>${text(model.narrative.whyItMatters)}</p>` : placeholder("Not configured yet.")}`
    + `<div class="overview-outcome"><span>Desired outcome</span><strong>${text(model.narrative.desiredOutcome?.trim() || "Not configured yet.")}</strong></div></div>`
    + `<div class="card activity-preview-card"><div class="section-heading"><span class="line-icon">◉</span><h2>What you’ll practice</h2></div>`
    + `${featuredActivities.length ? `<div class="activity-preview-list">${featuredActivities.map((activity, index) => `<div class="activity-preview-row"><span class="activity-letter">${text(activityLetter(index))}</span><div><strong>${text(activity.name)}</strong>${activity.description ? `<p>${text(activity.description)}</p>` : ""}</div></div>`).join("")}</div>` : placeholder("No activities are configured for this Huddle yet.")}</div>`
    + `</section>`
    + `<section class="card huddle-flow-card"><div class="business-workflow-heading"><span class="sparkle-icon">✦</span><div><h2>AI in Action</h2><p>Each workflow moves through 3 stages: prepare the context, practice with AI on real work, and commit to a next action.</p></div></div>`
    + `<div class="three-stage-flow">`
    + TEMPLATE.flow.map((stage, index) => `${index > 0 ? '<div class="flow-arrow">→</div>' : ""}<article class="flow-stage-card" role="button" tabindex="0" data-flow-target="${stage.key}" aria-label="Go to ${text(stageName(index, stage.title))}"><span>${index + 1}</span><div><h3>${text(stageName(index, stage.title))}</h3><p>${text(stageDescription(index) ?? stage.copy)}</p></div></article>`).join("")
    + `</div></section>`
    + `<div class="tfd-section-heading"><h2>Accelerating AI Confidence and Capability through real work</h2></div>`
    + `<section class="think-feel-do-grid">${TEMPLATE.thinkFeelDo.map((entry) => `<div class="card tfd-card"><span>${entry.label}</span><p>${text(entry.copy(topicName))}</p></div>`).join("")}</section>`
    + `<div class="overview-next-note"><span class="transition-kicker">Up next</span><div><strong>Share Your Experience</strong><span>Before we practice with AI, share what you’ve tried, what worked, and where you ran into friction.</span></div></div>`
    + `</section>`;

  const sharePanel = `<section class="huddle-section-panel" data-section-panel="best-practices">`
    + `<section class="card best-practices-shell"><div class="section-heading"><span class="sparkle-icon">✦</span><h2>Share Your Experience</h2></div>`
    + `<p class="best-practices-intro">Use this time to share what you tried with AI since the last Huddle. Compare what worked, what did not, what you learned, and where you ran into friction.</p>`
    + `<div class="discussion-question-grid">${TEMPLATE.shareYourExperience.map((entry, index) => `<div class="discussion-question-card"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${text(entry.title)}</strong><p>${text(entry.copy)}</p></div></div>`).join("")}</div>`
    + `</section></section>`;

  const preparationPanel = `<section class="huddle-section-panel" data-section-panel="preparation">`
    + stageShell(topicName, 1, stageName(0, "Preparation"), stageDescription(0) ?? "Set the context before opening an AI tool. Align on the workflow, people, evidence, and friction that matter.",
      `<div class="stage-content-grid">`
      + `${guide?.sessionIntroduction ? `<section class="stage-content-card"><h3>Session introduction</h3><p>${text(guide.sessionIntroduction)}</p></section>` : ""}`
      + `<section class="stage-content-card"><h3>Discuss before practicing</h3>${questionList(guide?.discussionQuestions ?? [], "No discussion questions are configured for this Huddle yet.")}</section>`
      + `<section class="stage-content-card preparation-checklist"><h3>Bring into the conversation</h3>${guide?.preparationChecklist?.length ? checkList(guide.preparationChecklist) : checkList(TEMPLATE.bringIntoTheConversation)}</section>`
      + `</div>`)
    + `</section>`;

  const practicePanel = `<section class="huddle-section-panel" data-section-panel="practice">`
    + stageShell(topicName, 2, stageName(1, "Explore & Practice"), stageDescription(1) ?? "Work through the Huddle activities using a real scenario. Adapt the prompt, inspect the output, and keep human judgment explicit.",
      `${guide?.facilitatorQuestions?.length || guide?.listenFor?.length || guide?.fallbackGuidance
        ? `<div class="stage-content-grid">`
          + `${guide?.facilitatorQuestions?.length ? `<section class="stage-content-card"><h3>Ask while practicing</h3>${questionList(guide.facilitatorQuestions, "")}</section>` : ""}`
          + `${guide?.listenFor?.length ? `<section class="stage-content-card"><h3>Listen for</h3>${questionList(guide.listenFor, "")}</section>` : ""}`
          + `${guide?.fallbackGuidance ? `<section class="stage-content-card"><h3>If it goes wrong</h3><p>${text(guide.fallbackGuidance)}</p></section>` : ""}`
          + `</div>`
        : ""}`
      + `<div class="featured-activities-header"><div><h3>Featured activities</h3><p>Start with these priority activities for today’s Huddle.</p></div><span class="activity-tier-badge">Featured</span></div>`
      + `<div class="practice-activity-stack" data-activity-tier="featured">${featuredActivities.length
        ? featuredActivities.map((activity, index) => activityCard(activity, index, "featured", guide?.keyTalkingPoints ?? [])).join("")
        : placeholder("No featured activities are configured for this Huddle yet.")}</div>`
      + `<details class="additional-activities"><summary><span class="additional-activities-copy"><strong>Additional activities to explore</strong><small>Optional activities are available here when you want to go beyond the featured practice.</small></span><span class="scenario-chevron" aria-hidden="true">${CHEVRON_SVG}</span></summary>`
      + `<div class="optional-activity-stack" data-activity-tier="optional">${optionalActivities.length
        ? optionalActivities.map((activity, index) => activityCard(activity, featuredActivities.length + index, "optional", guide?.keyTalkingPoints ?? [])).join("")
        : `<div class="optional-activities-empty">No additional activities are configured for this Huddle yet.</div>`}</div></details>`,
      `<span class="scenario-count">${featuredActivities.length} featured ${featuredActivities.length === 1 ? "activity" : "activities"}${optionalActivities.length ? ` \u00b7 ${optionalActivities.length} optional` : ""}</span>`)
    + `</section>`;

  const commitPanel = `<section class="huddle-section-panel" data-section-panel="commit">`
    + stageShell(topicName, 3, stageName(2, "Commit to Action"), stageDescription(2) ?? "Turn the practice into a concrete behavior. Reflect on what changed, agree on the next action, and define what to bring back.",
      `<div class="commit-layout">`
      + `<section class="reflection-card card nested-card"><div class="bottom-title green-title"><span>♧</span><h2>Reflect</h2></div><h3>What did you learn today?</h3>${reflectPrompt ? `<p>${text(reflectPrompt)}</p>` : placeholder("No reflection prompt is configured yet.")}</section>`
      + `<section class="commit-card card nested-card"><div class="bottom-title orange-title"><span>◎</span><h2>Commit</h2></div><h3>What will you do this week?</h3>${commitPrompt ? `<p>${text(commitPrompt)}</p>` : placeholder("No commitment prompt is configured yet.")}</section>`
      + `</div>`
      + `${guide?.bringBackEvidence?.length ? `<section class="commit-discussion-card"><h3>Bring back as evidence</h3>${questionList(guide.bringBackEvidence, "")}</section>` : ""}`
      + `${guide?.wrapUpGuidance ? `<section class="commit-discussion-card"><h3>Wrap up</h3><p>${text(guide.wrapUpGuidance)}</p></section>` : ""}`
      + `<section class="commit-discussion-card"><h3>Close the Huddle</h3>${questionList(TEMPLATE.closeTheHuddle, "")}</section>`
      + `${model.keyTakeaway ? `<section class="commit-discussion-card"><h3>Key takeaway</h3><p>${text(model.keyTakeaway)}</p></section>` : ""}`)
    + `</section>`;

  const toolPanel = `<section class="huddle-section-panel" data-section-panel="tool">`
    + `<section class="tool-section-intro card"><div class="section-heading"><span class="sparkle-icon">✦</span><h2>AI Tools</h2></div><p>These are the tools used across the ${text(stageName(1, "Explore & Practice"))} activities.</p></section>`
    + `${agents.length ? `<div class="multi-tool-stack">${agents.map(toolCard).join("")}</div>` : placeholder("No AI tools are configured for this Huddle yet.")}`
    + `</section>`;

  const resourcesPanel = `<section class="huddle-section-panel" data-section-panel="resources">`
    + `<section class="resources-card card resources-tab-card"><div class="bottom-title blue-title"><span>▤</span><h2>Resources</h2></div>`
    + `<p class="resources-intro">Use portfolio, role, topic, activity, and agent resources that support this Huddle.</p>`
    + `${resources.length ? resourceRows(resources) : placeholder("No resources are configured for this Huddle yet.")}`
    + `</section></section>`;

  const notesPanel = `<section class="huddle-section-panel" data-section-panel="notes">`
    + `<section class="facilitator-notes-card card"><div class="section-heading"><span class="sparkle-icon">✦</span><h2>Facilitator Notes</h2></div>`
    + `<p class="facilitator-notes-intro">These notes were added by the facilitator before downloading the Huddle.</p>`
    + `<div class="facilitator-notes-content">${facilitatorNotes ? text(facilitatorNotes) : "No facilitator notes were added for this Huddle."}</div>`
    + `</section>`
    + `${guide ? `<section class="facilitator-guidance-summary card"><div class="section-heading"><span class="sparkle-icon">✦</span><h2>Facilitation guidance</h2></div>`
      + `<div class="facilitator-stage-summary-grid">`
      + `<div class="guide-card"><span class="activity-eyebrow">Session introduction</span>${guide.sessionIntroduction ? `<p>${text(guide.sessionIntroduction)}</p>` : placeholder("Not configured yet.")}</div>`
      + `<div class="guide-card"><span class="activity-eyebrow">Key talking points</span>${questionList(guide.keyTalkingPoints, "Not configured yet.")}</div>`
      + `<div class="guide-card"><span class="activity-eyebrow">Suggested transitions</span>${questionList(guide.suggestedTransitions, "Not configured yet.")}</div>`
      + `<div class="guide-card"><span class="activity-eyebrow">Wrap-up guidance</span>${guide.wrapUpGuidance ? `<p>${text(guide.wrapUpGuidance)}</p>` : placeholder("Not configured yet.")}</div>`
      + `</div></section>` : ""}`
    + `<footer class="page-footer"><div class="generated-badge">${COPILOT_MARK}<span>Generated from the AITO Workflow &amp; Huddle Generator</span><i></i><span>${text(generatedDate)}</span><b>•</b><span>${text(generatedTime)}</span></div><span class="page-number">1</span></footer>`
    + `</section>`;

  const body = `<article class="huddle-page segmented-huddle-page workflow-huddle-page" id="huddle-1">`
    + `<header class="page-topbar">`
    + `<div class="frontier-brand" aria-label="Frontier Accelerator"><img src="${frontierAcceleratorLogo}" alt="Frontier Accelerator"></div>`
    + `<div class="brand-right"><div class="microsoft-brand" aria-label="Microsoft"><span class="ms-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Microsoft</span></div></div>`
    + `<div class="ribbon-art" aria-hidden="true"><span class="wave wave-one"></span><span class="wave wave-two"></span><span class="wave wave-three"></span></div>`
    + `</header>`
    + `<nav class="huddle-section-nav" aria-label="Huddle sections"><div class="huddle-section-tabs">`
    + tabs.map((tab, index) => `<button type="button" class="huddle-section-tab${index === 0 ? " is-active" : ""}" data-section-target="${tab.key}">${text(tab.label)}</button>`).join("")
    + `</div><div class="huddle-section-status"><small>Huddle section</small><strong><span data-section-index>1</span> of ${tabs.length} · <span data-section-name>Overview</span></strong></div></nav>`
    + `<main class="page-content">${overviewPanel}${sharePanel}${preparationPanel}${practicePanel}${commitPanel}${toolPanel}${resourcesPanel}${notesPanel}</main>`
    + `<div class="huddle-section-actions"><button type="button" class="section-action-button section-previous" data-section-previous>← Previous</button><button type="button" class="section-action-button section-next" data-section-next>Next →</button></div>`
    + `</article><div class="toast" id="copyToast">Prompt copied</div>`;

  return {
    html: createHtmlDocument(`${topicName} Huddle`, `${body}${huddleGuideInteractions}`, huddleGuideStyles),
    fileName: options.fileName ?? safeHtmlFileName(`${topicName} - Huddle`, "Huddle"),
  };
}

export function exportHuddleHtml(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const output = createHuddleHtmlExport(model, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

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
const ROLE_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" stroke-width="1.8"></circle><path d="M5.5 19c.8-4 3-6 6.5-6s5.7 2 6.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>';
const AI_TOOLS_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3.5l1.25 4.1L17.5 9l-4.25 1.4L12 14.5l-1.25-4.1L6.5 9l4.25-1.4L12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path><path d="M18.5 14.5l.7 2.25 2.3.75-2.3.75-.7 2.25-.7-2.25-2.3-.75 2.3-.75.7-2.25Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path></svg>';
const MCEM_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 5h12M6 12h12M6 19h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><circle cx="7" cy="5" r="1.7" fill="currentColor"></circle><circle cx="12" cy="12" r="1.7" fill="currentColor"></circle><circle cx="17" cy="19" r="1.7" fill="currentColor"></circle></svg>';

function compactFileToken(value: string): string {
  return value
    .trim()
    .replace(/&/g, " And ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getWorkflowExportName(model: HuddlePresentationModel): string {
  const candidate = model as unknown as {
    workflowName?: string | null;
    workflow?: { name?: string | null; displayName?: string | null } | null;
    identity: HuddlePresentationModel["identity"] & { workflowName?: string | null; workflow?: string | null };
  };

  return candidate.workflow?.displayName?.trim()
    || candidate.workflow?.name?.trim()
    || candidate.workflowName?.trim()
    || candidate.identity.workflowName?.trim()
    || candidate.identity.workflow?.trim()
    || model.identity.name;
}

function getRoleExportName(model: HuddlePresentationModel): string {
  const audience = model.audience as typeof model.audience & {
    roleCode?: string | null;
    roleShortName?: string | null;
    roleExternalId?: string | null;
  };

  const explicit = audience.roleCode?.trim() || audience.roleShortName?.trim();
  if (explicit) return compactFileToken(explicit).toUpperCase();

  const roleName = audience.roleName?.trim() || audience.roleExternalId?.trim() || "Role";
  const knownRoleCodes: Record<string, string> = {
    "account executive": "AE",
    "account technology strategist": "ATS",
    "solution sales professional": "SSP",
    "solution engineer": "SE",
    "commercial executive": "CE",
    "cloud solution architect": "CSA",
    "customer success account manager": "CSAM",
  };

  return knownRoleCodes[roleName.toLowerCase()] || compactFileToken(roleName);
}

function exportDateToken(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}_${mm}_${dd}`;
}
/** Pure-CSS Copilot glyph, used when an agent has no inlined logo. */
const COPILOT_MARK = '<span class="copilot-mark" aria-hidden="true"><span class="copilot-loop copilot-loop-a"></span><span class="copilot-loop copilot-loop-b"></span></span>';


/**
 * Export-only typography corrections.
 * Keep these scoped to the specific content areas called out in the HTML export
 * so the rest of the existing Huddle UI/UX remains unchanged.
 */
const HUDDLE_EXPORT_STYLE_FIXES = `
  /* Consistent typography across the exported Huddle. */
  .huddle-page,
  .huddle-page button,
  .huddle-page input,
  .huddle-page textarea {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
  }

  /* Main Huddle title */
  .hero-copy h1 {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 44px;
    font-weight: 700;
    line-height: 1.08;
  }

  /* Stage titles */
  .stage-header h2 {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  /* Major section titles */
  .section-heading h2,
  .bottom-title h2,
  .tool-card-title h2,
  .business-workflow-heading h2,
  .tfd-section-heading h2 {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
  }

  /* Card headings */
  .stage-content-card h3,
  .activity-detail-card h3,
  .commit-discussion-card h3,
  .reflection-card h3,
  .commit-card h3,
  .guide-card .activity-eyebrow,
  .discussion-question-card strong,
  .activity-preview-row strong,
  .practice-activity-heading strong,
  .featured-activities-header h3,
  .additional-activities-copy strong,
  .resource-copy strong,
  .tool-info h3,
  .flow-stage-card h3 {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  /* Standard body copy used inside cards and content sections. */
  .hero-description,
  .objective-card p,
  .overview-summary-card > p,
  .overview-outcome .overview-outcome-value,
  .best-practices-intro,
  .discussion-question-card p,
  .stage-header p,
  .stage-content-card .question-list li,
  .activity-detail-card .question-list li,
  .activity-output-card p,
  .reflection-card > p,
  .commit-card > p,
  .commit-discussion-card .question-list li,
  .commit-discussion-card > p,
  .resources-intro,
  .resource-copy small,
  .tool-info p,
  .tool-brand span,
  .facilitator-notes-intro,
  .facilitator-notes-content,
  .flow-stage-card p,
  .tfd-card p,
  .overview-next-note span {
    color: #263660;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
  }

  /* Activity supporting descriptions are intentionally one step smaller. */
  .activity-preview-row p,
  .practice-activity-heading small,
  .additional-activities-copy small,
  .featured-activities-header p {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
  }

  /* Small labels */
  .activity-eyebrow,
  .prompt-label,
  .stage-kicker,
  .transition-kicker,
  .stage-topic-context > span,
  .overview-outcome > span {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
  }

  /* Role / AI Tools / MCEM metadata */
  .meta-item small {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.3;
  }

  .meta-item strong {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  /* Navigation and section controls */
  .huddle-section-tab,
  .section-action-button {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
  }

  /* Desired outcome remains regular rather than bold. */
  .overview-outcome .overview-outcome-value {
    display: block;
    margin: 0;
    color: var(--ink);
    text-transform: none;
    letter-spacing: normal;
  }

  /* Keep all three metadata items together in the original compact overview row. */
  .hero-copy .meta-strip {
    display: grid;
    grid-template-columns: minmax(0, .8fr) 1px minmax(0, 1.35fr) 1px minmax(0, 1fr);
    align-items: center;
    column-gap: 16px;
    width: 100%;
  }

  .hero-copy .meta-strip .meta-item {
    min-width: 0;
    align-items: center;
  }

  .round-icon.meta-icon svg {
    width: 21px;
    height: 21px;
    display: block;
  }

  /*
   * Do not override hero-grid or objective-card dimensions here.
   * Their original export styles keep Today's Objective at the intended compact size.
   */

  /* Preparation uses the same bullet treatment in all three cards. */
  .stage-content-grid .stage-content-card .question-list {
    margin-top: 14px;
  }

  /* Closed details point down; expanded details point up. */
  .additional-activities > summary .scenario-chevron,
  .practice-activity-card > summary .scenario-chevron {
    transform: none !important;
    transition: transform .18s ease;
  }

  .additional-activities[open] > summary .scenario-chevron,
  .practice-activity-card[open] > summary .scenario-chevron {
    transform: rotate(180deg) !important;
  }
`;

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
    + `<section class="activity-detail-card"><h3>How to practice</h3>${activity.requiredContext ? questionList([activity.requiredContext], "") : placeholder("Step-by-step practice guidance is not configured for this activity yet.")}</section>`
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
  const workflowExportName = compactFileToken(getWorkflowExportName(model)) || "Huddle";
  const roleExportName = getRoleExportName(model);
  const exportBaseName = `FA-Huddle_${workflowExportName}_${roleExportName}_${exportDateToken(generated)}`;

  const overviewPanel = `<section class="huddle-section-panel is-active" data-section-panel="overview">`
    + `<div class="overview-timing-band" aria-label="Today’s Huddle"><div class="overview-timing-title">Today’s Huddle</div><div class="overview-timing-steps">`
    + TEMPLATE.agenda.map((step, index) => `${index > 0 ? '<div class="overview-timing-arrow">→</div>' : ""}<div class="overview-timing-step"><strong>${text(step.label)}</strong><span>· ${step.minutes} min</span></div>`).join("")
    + `</div></div>`
    + `<section class="hero-grid"><div class="hero-copy"><h1>${text(topicName)}</h1>${model.identity.description ? `<p class="hero-description">${text(model.identity.description)}</p>` : ""}`
    + `<div class="meta-strip">`
    + `<div class="meta-item"><span class="round-icon meta-icon">${ROLE_SVG}</span><span><small>Role</small><strong>${text(model.audience.roleName?.trim() || "Not specified")}</strong></span></div>`
    + `<span class="meta-divider"></span>`
    + `<div class="meta-item"><span class="round-icon meta-icon">${AI_TOOLS_SVG}</span><span><small>AI Tools</small><strong>${text(toolNames.length ? toolNames.join(", ") : "Not configured")}</strong></span></div>`
    + `<span class="meta-divider"></span>`
    + `<div class="meta-item"><span class="round-icon meta-icon">${MCEM_SVG}</span><span><small>MCEM Stages</small><strong>${text(model.mcemStages.length ? model.mcemStages.map((stage) => stage.name).join(", ") : "Not configured")}</strong></span></div>`
    + `</div></div>`
    + `<aside class="objective-card"><span class="objective-icon">◎</span><div><h2>Today’s Objective</h2>${model.narrative.todayObjective ? `<p>${text(model.narrative.todayObjective)}</p>` : placeholder("No objective is configured for this Huddle yet.")}</div></aside></section>`
    + `<section class="overview-two-column">`
    + `<div class="card overview-summary-card"><div class="section-heading"><span class="sparkle-icon">✦</span><h2>Why this Huddle matters</h2></div>`
    + `${model.narrative.whyItMatters ? `<p>${text(model.narrative.whyItMatters)}</p>` : placeholder("Not configured yet.")}`
    + `<div class="overview-outcome"><span>Desired outcome</span><p class="overview-outcome-value">${text(model.narrative.desiredOutcome?.trim() || "Not configured yet.")}</p></div></div>`
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
      + `${guide?.sessionIntroduction ? `<section class="stage-content-card"><h3>Session introduction</h3>${questionList([guide.sessionIntroduction], "")}</section>` : ""}`
      + `<section class="stage-content-card"><h3>Discuss before practicing</h3>${questionList(guide?.discussionQuestions ?? [], "No discussion questions are configured for this Huddle yet.")}</section>`
      + `<section class="stage-content-card preparation-checklist"><h3>Bring into the conversation</h3>${questionList(guide?.preparationChecklist?.length ? guide.preparationChecklist : TEMPLATE.bringIntoTheConversation, "")}</section>`
      + `</div>`)
    + `</section>`;

  const practicePanel = `<section class="huddle-section-panel" data-section-panel="practice">`
    + stageShell(topicName, 2, stageName(1, "Explore & Practice"), stageDescription(1) ?? "Work through the Huddle activities using a real scenario. Adapt the prompt, inspect the output, and keep human judgment explicit.",
      `<div class="featured-activities-header"><div><h3>Featured activities</h3><p>Start with these priority activities for today’s Huddle.</p></div><span class="activity-tier-badge">Featured</span></div>`
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
      + `<section class="commit-discussion-card"><h3>Close the Huddle</h3>${questionList(TEMPLATE.closeTheHuddle, "")}</section>`
      )
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
    + `<footer class="page-footer"><div class="generated-badge">${COPILOT_MARK}<span>Generated from the Frontier Accelerator App</span><i></i><span>${text(generatedDate)}</span><b>•</b><span>${text(generatedTime)}</span></div><span class="page-number">1</span></footer>`
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
    html: createHtmlDocument(exportBaseName, `${body}${huddleGuideInteractions}`, `${huddleGuideStyles}\n${HUDDLE_EXPORT_STYLE_FIXES}`),
    fileName: options.fileName ?? safeHtmlFileName(exportBaseName, "FA-Huddle"),
  };
}

export function exportHuddleHtml(model: HuddlePresentationModel, options: HuddleHtmlExportOptions = {}): HtmlExportFile {
  const output = createHuddleHtmlExport(model, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

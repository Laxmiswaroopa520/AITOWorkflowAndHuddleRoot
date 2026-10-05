import type { HuddlePresentationActivity, HuddlePresentationAgent, HuddlePresentationModel, HuddlePresentationPhase, HuddlePresentationResource } from "../../types";
import { downloadHtmlFile, createHtmlDocument } from "./htmlTemplate";
import { escapeHtml, safeExternalUrl, safeHtmlFileName } from "./htmlSanitizer";
import type { HtmlExportFile, HuddleHtmlExportOptions } from "./html.types";
import { huddleGuideInteractions } from "./huddleGuideInteractions";
import { huddleGuideStyles } from "./huddleGuideStyles";
import { agentArtwork, frontierAcceleratorLogo } from "./huddleGuideAssets";
import { HUDDLE_FONT_STACK } from "./fontStack";

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
 * Export-only UI/UX corrections layered on top of the base Huddle stylesheet.
 * Keep these scoped to the specific content areas called out in the HTML export
 * so the rest of the existing Huddle UI/UX remains unchanged.
 *
 * 2026-09-18: extended to align the exported guide's visual presentation (typography,
 * the four Microsoft-brand-color activity/preparation card accents, the AI-in-Action
 * tab grouping, the resource hub cards, and the Closing & Next Steps layout) with the
 * reference mockup supplied for this Huddle export. Every rule below is presentation
 * only -- no data-fetching, mapping, or template-copy logic changed as part of this.
 */
const HUDDLE_EXPORT_STYLE_FIXES = `
  /* Consistent typography across the exported Huddle. */
  .huddle-page,
  .huddle-page button,
  .huddle-page input,
  .huddle-page textarea {
    font-family: ${HUDDLE_FONT_STACK};
  }

  /* Main Huddle title */
  .hero-copy h1 {
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 44px;
    font-weight: 700;
    line-height: 1.08;
  }

  /* Stage titles */
  .stage-header h2 {
    font-family: ${HUDDLE_FONT_STACK};
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
    font-family: ${HUDDLE_FONT_STACK};
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
    font-family: ${HUDDLE_FONT_STACK};
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
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
  }

  /* Activity supporting descriptions are intentionally one step smaller. */
  .activity-preview-row p,
  .practice-activity-heading small,
  .additional-activities-copy small,
  .featured-activities-header p {
    font-family: ${HUDDLE_FONT_STACK};
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
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
  }

  /* Role / AI Tools / MCEM metadata */
  .meta-item small {
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12px;
    font-weight: 400;
    line-height: 1.3;
  }

  .meta-item strong {
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    white-space: pre-line;
    overflow-wrap: anywhere;
  }

  /* Navigation and section controls */
  .huddle-section-tab,
  .section-action-button {
    font-family: ${HUDDLE_FONT_STACK};
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
    justify-content: center;
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


  /* Preparation follows the same Microsoft four-color visual language as Explore & Practice. */
  .preparation-session-card {
    border-left: 4px solid #F25022;
  }

  .preparation-talking-card {
    border-left: 4px solid #7FBA00;
  }

  .preparation-discuss-card {
    border-left: 4px solid #00A4EF;
  }

  .preparation-bring-card {
    border-left: 4px solid #FFB900;
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

  /* Attendee action area: tool identity, access link, prompt and copy action live together. */
  .activity-tool-actions {
    display: grid;
    gap: 10px;
    margin-bottom: 12px;
  }

  .activity-tool-action {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 11px;
    border: 1px solid #d7e3f4;
    border-radius: 12px;
    background: #f7faff;
  }

  .activity-tool-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    padding: 4px 9px;
    border-radius: 999px;
    color: #0f6cbd;
    background: #e8f2ff;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: .045em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .activity-tool-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 9px;
    background: #fff;
    overflow: hidden;
  }

  .activity-tool-logo .activity-agent-logo {
    display: block;
    width: 29px;
    height: 29px;
    object-fit: contain;
  }

  /* Preserve alignment without showing a generic logo when an agent has no artwork. */
  .agent-logo-placeholder {
    display: block;
    width: 58px;
    height: 58px;
    flex: 0 0 58px;
  }

  .activity-tool-logo .agent-logo-placeholder {
    width: 29px;
    height: 29px;
    flex: 0 0 29px;
  }

  .activity-tool-logo .copilot-mark {
    transform: scale(.66);
  }

  .activity-tool-name {
    min-width: 0;
    color: var(--ink);
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
  }

  .activity-open-tool {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    margin-left: auto;
    padding: 6px 10px;
    border: 1px solid #c7dcf3;
    border-radius: 9px;
    color: #0f6cbd;
    background: #eef6ff;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    text-decoration: none;
    white-space: nowrap;
  }

  .activity-open-tool:hover {
    border-color: #0f6cbd;
    background: #e3f0ff;
  }

  .activity-practice-grid > .activity-detail-card:only-child {
    grid-column: 1 / -1;
  }

  /* Four activity detail cards use the four Microsoft brand colors consistently. */
  .context-required-card {
    border-left: 4px solid #F25022;
  }

  .activity-wiifm-card {
    border-left: 4px solid #7FBA00;
  }

  .expected-output-card {
    border-left: 4px solid #00A4EF;
  }

  .human-checkpoint-card {
    border-left: 4px solid #FFB900;
  }

  .activity-detail-card > p {
    margin: 10px 0 0;
    color: #263660;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
  }

  .activity-wiifm-card > p {
    margin: 10px 0 0;
    color: #263660;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
  }

  .tool-card-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .tool-card-title-main {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
  }

  .tool-card-title-main > span:first-child {
    color: #123ccf;
  }

  .tool-card-title-main h2 {
    margin: 0;
  }

  .tool-access-link {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 6px 10px;
    border: 1px solid #c7dcf3;
    border-radius: 9px;
    color: #0f6cbd;
    background: #eef6ff;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    text-decoration: none;
    white-space: nowrap;
  }

  .tool-access-link:hover {
    border-color: #0f6cbd;
    background: #e3f0ff;
  }

  /* Prompt height follows its content; long prompts scroll only after reaching the cap. */
  .scenario-prompt-scroll {
    height: auto;
    min-height: 0;
    max-height: 220px;
    overflow-y: auto;
  }




  /* Keep the agenda band full width, but center the agenda content to remove dead space. */
  .overview-timing-band {
    justify-content: center;
    gap: 16px;
  }

  .overview-timing-steps {
    flex: 0 1 auto;
    justify-content: center;
  }

  /* Top navigation mirrors the timed Huddle agenda. */
  .huddle-section-tabs {
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .huddle-section-status {
    display: none !important;
  }

  .huddle-section-tab {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0;
    min-height: 40px;
    padding-top: 9px;
    padding-bottom: 9px;
  }

  .huddle-section-tab .tab-label {
    display: block;
  }

  /*
   * AI In Action is grouped visually like the reference design:
   * a small label above the outlined Preparation / Explore & Practice / Commit group.
   * The label is not another tab and does not occupy the horizontal section band.
   */
  .ai-action-tab-group {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0;
    min-height: 42px;
    padding: 0 3px;
    border: 1px solid #b9cff2;
    border-radius: 10px;
    background: #f7faff;
  }

  .ai-action-tab-group::before {
    content: "AI IN ACTION";
    position: absolute;
    top: -9px;
    left: 50%;
    z-index: 3;
    transform: translateX(-50%);
    padding: 0 7px;
    color: #0f6cbd;
    background: #ffffff;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 9px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: .035em;
    white-space: nowrap;
  }

  .ai-action-tab-group-label {
    display: none;
  }

  .ai-action-tab-group .huddle-section-tab {
    min-height: 38px;
    padding-left: 11px;
    padding-right: 11px;
  }

  /* With three prompts, stack Share Your Experience cards vertically.
     If the template grows to four prompts, switch cleanly to a 2 x 2 grid. */
  .discussion-question-grid.is-stacked {
    grid-template-columns: 1fr;
  }

  .discussion-question-grid.is-four {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }


  /* Resources hub: compact, readable tool cards and resource tiles. */
  .resources-hub-intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .resources-hub-count {
    flex: 0 0 auto;
    padding: 6px 10px;
    border-radius: 999px;
    color: #0f6cbd;
    background: #e8f2ff;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .resource-section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
    margin: 26px 2px 12px;
  }

  .resource-section-heading-first {
    margin-top: 4px;
    padding-top: 2px;
  }

  .resource-section-heading h3 {
    margin: 0;
    color: var(--ink);
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
  }

  .resource-section-heading p {
    margin: 3px 0 0;
    color: #61739b;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12.5px;
    font-weight: 400;
    line-height: 1.4;
  }

  .resource-tool-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .resource-tool-card {
    padding: 18px;
    border: 1px solid #dbe4f0;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 8px 22px rgba(18, 45, 92, .045);
  }

  .resource-tool-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid #edf1f7;
  }

  .resource-tool-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border-radius: 11px;
    background: #f7faff;
    overflow: hidden;
  }

  .resource-tool-logo img {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  .resource-tool-logo .agent-logo-placeholder {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }

  .resource-tool-identity {
    min-width: 0;
    flex: 1 1 auto;
  }

  .resource-tool-identity h3 {
    margin: 0;
    color: var(--ink);
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;
  }

  .resource-tool-identity span {
    display: block;
    margin-top: 3px;
    color: #61739b;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12px;
    font-weight: 500;
    line-height: 1.35;
  }

  .resource-tool-open {
    flex: 0 0 auto;
    padding: 6px 9px;
    border: 1px solid #c7dcf3;
    border-radius: 8px;
    color: #0f6cbd;
    background: #eef6ff;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    text-decoration: none;
    white-space: nowrap;
  }

  .resource-tool-open:hover {
    border-color: #0f6cbd;
    background: #e3f0ff;
  }

  .resource-tool-details {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding-top: 14px;
  }

  .resource-tool-detail {
    min-width: 0;
    padding: 12px;
    border-radius: 10px;
    background: #f8faff;
  }

  .resource-tool-detail.what-it-is {
    grid-column: 1 / -1;
  }

  .resource-tool-detail strong {
    display: block;
    margin-bottom: 5px;
    color: #0f6cbd;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 11px;
    font-weight: 700;
    line-height: 1.25;
    text-transform: uppercase;
    letter-spacing: .035em;
  }

  .resource-tool-detail p {
    margin: 0;
    color: #263660;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12.5px;
    font-weight: 400;
    line-height: 1.5;
  }

  .resource-tool-benefits {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  .resource-tool-benefits li {
    padding: 5px 8px;
    border-radius: 999px;
    color: #326b38;
    background: #eff9f0;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 10.5px;
    font-weight: 600;
    line-height: 1.25;
  }

  .resource-link-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .resource-link-card {
    display: flex;
    min-width: 0;
    min-height: 108px;
    padding: 15px;
    border: 1px solid #dbe4f0;
    border-radius: 12px;
    background: #fff;
    text-decoration: none;
    transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
  }

  a.resource-link-card:hover {
    border-color: #9fc3ef;
    box-shadow: 0 8px 22px rgba(18, 45, 92, .07);
    transform: translateY(-1px);
  }

  .resource-link-copy {
    min-width: 0;
    flex: 1 1 auto;
  }

  .resource-link-copy small {
    display: block;
    margin-bottom: 5px;
    color: #61739b;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 10px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .resource-link-copy strong {
    display: block;
    color: #0f6cbd;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 13.5px;
    font-weight: 700;
    line-height: 1.35;
  }

  .resource-link-copy p {
    margin: 7px 0 0;
    color: #263660;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 12.5px;
    font-weight: 400;
    line-height: 1.45;
  }

  .resource-link-arrow {
    flex: 0 0 auto;
    margin-left: 10px;
    color: #0f6cbd;
    font-size: 17px;
    line-height: 1;
  }

  /* Closing & Next Steps cards. */
  .closing-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .closing-card {
    padding: 22px;
    border: 1px solid #dbe4f0;
    border-radius: 14px;
    background: #fff;
  }

  .closing-card.full-width {
    grid-column: 1 / -1;
  }

  .closing-card h3 {
    margin: 0 0 12px;
    color: var(--ink);
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  .closing-card > p {
    margin: 0;
    color: #263660;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
  }

  .weekly-pulse-question {
    margin-top: 10px !important;
    font-weight: 600 !important;
    color: var(--ink) !important;
  }

  /* Official Top 5 treatment used on Overview and Resources. */
  .top-five-agent-band {
    display: grid;
    grid-template-columns: auto repeat(5, minmax(0, 1fr));
    gap: 10px;
    align-items: center;
    margin: -12px 0 28px;
    padding: 12px 14px;
    border: 1px solid #b9cff2;
    border-radius: 12px;
    background: linear-gradient(90deg, #eef6ff 0%, #f8fbff 100%);
    box-shadow: 0 5px 16px rgba(18, 45, 92, .055);
  }

  .top-five-agent-band-label {
    display: grid;
    gap: 2px;
    padding-right: 4px;
    color: #0f3f87;
    font-family: ${HUDDLE_FONT_STACK};
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: .04em;
    white-space: nowrap;
  }

  .top-five-agent-band-label span {
    color: #506087;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: normal;
    text-transform: none;
  }

  .top-five-agent-pill {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    min-height: 48px;
    padding: 7px 9px;
    border: 1px solid #d7e3f4;
    border-radius: 999px;
    background: #ffffff;
    color: #1b2b60;
  }

  .top-five-agent-icon {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 50%;
    background: #e8f2ff;
    color: #0f6cbd;
    font-size: 10px;
    font-weight: 800;
  }

  .top-five-agent-logo {
    display: block;
    width: 27px;
    height: 27px;
    object-fit: contain;
  }

  .top-five-agent-title {
    display: block;
    overflow: hidden;
    color: #142154;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .top-five-agent-status {
    display: block;
    margin-top: 2px;
    color: #61739b;
    font-size: 10.5px;
    line-height: 1.15;
  }

  .top-five-agent-pill.is-featured {
    border-width: 2px;
    border-color: #0f6cbd;
    box-shadow: 0 0 0 3px #dcebff;
  }

  .top-five-agent-pill.is-featured .top-five-agent-icon {
    background: #0f6cbd;
    color: #ffffff;
  }

  .top-five-agent-pill.is-featured .top-five-agent-title {
    font-weight: 700;
  }

  .top-five-resource {
    border-color: #b9cff2;
    box-shadow: 0 0 0 3px #eef6ff, 0 8px 22px rgba(18, 45, 92, .045);
  }

  .resource-tool-badge-slot {
    display: flex;
    align-items: flex-start;
    min-height: 22px;
    margin-bottom: 10px;
  }

  .resource-tool-badge {
    display: inline-flex;
    padding: 5px 9px;
    border-radius: 999px;
    background: #e8f2ff;
    color: #0f6cbd;
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .resource-tool-badge.is-surfaced {
    background: #f1f4f8;
    color: #40517d;
  }

  @media (max-width: 980px) {
    .top-five-agent-band {
      grid-template-columns: 1fr 1fr;
    }

    .top-five-agent-band-label {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 760px) {
    .activity-tool-action {
      flex-wrap: wrap;
    }

    .activity-open-tool {
      width: 100%;
      margin-left: 0;
    }

    .tool-card-title-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }

    .ai-action-tab-group {
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 8px;
    }

    .discussion-question-grid.is-four,
    .closing-grid,
    .resource-tool-grid,
    .resource-link-grid {
      grid-template-columns: 1fr;
    }

    .resource-tool-head {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .resource-tool-open {
      margin-left: 56px;
    }

    .closing-card.full-width {
      grid-column: auto;
    }

    .top-five-agent-band {
      grid-template-columns: 1fr;
    }

  }

  /* "Discuss while practicing" keeps the same four-color accent treatment as the
     other activity detail cards, using its own class since this export shows
     existing key-talking-points discussion content here rather than a per-activity
     WIIFM field (that field does not exist on this app's activity model). */
  .activity-discuss-card {
    border-left: 4px solid #7FBA00;
  }
`;

/**
 * THINK/FEEL/DO copy is called uniformly as `entry.copy(topicName)` (see the
 * think-feel-do-grid render below), so every entry needs the same `(topic: string) =>
 * string` signature even though FEEL and DO don't use the topic in their copy. Typed
 * explicitly here (rather than inferred inline inside TEMPLATE) so those two entries can
 * simply omit the unused parameter -- TypeScript allows a function with fewer parameters
 * to satisfy a type that declares more, so calls still pass `topicName` as before.
 */
const THINK_FEEL_DO: Array<{ label: string; copy: (topic: string) => string }> = [
  { label: "THINK", copy: (topic) => `See where AI can improve ${topic.toLowerCase()} in your work.` },
  { label: "FEEL", copy: () => "Build confidence using AI while keeping your judgment in the loop." },
  { label: "DO", copy: () => "Apply the workflow to a real scenario and leave with one action to try." },
];

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
  thinkFeelDo: THINK_FEEL_DO,
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
  // Added to support the new Closing & Next Steps panel. Same category as the copy
  // above: template furniture, not Huddle-record data.
  managerReflection: [
    "What did you observe about how the team applied AI during this Huddle?",
    "What support, coaching, access, or follow-up would help the team make progress before the next Huddle?",
  ],
  weeklyPulse: "How useful was this week\u2019s huddle for helping you apply AI in your work (Scale of 1-10)?",
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
    const copy = `<span class="resource-copy"><strong>${text(resource.title)}</strong>${resource.description ? `<small>${text(resource.description)}</small>` : ""}</span><span class="resource-arrow">\u2192</span>`;
    const url = safeExternalUrl(resource.url);
    const inner = url
      ? `<a href="${text(url)}" target="_blank" rel="noopener noreferrer">${copy}</a>`
      : `<span>${copy}</span>`;
    return `<li class="resource-row">${inner}</li>`;
  }).join("")}</ul>`;
}

/** Agent brand mark shared by the activity tool-action rows and the resource hub cards. */
function agentBrandMark(agent: HuddlePresentationAgent, className: string): string {
  const label = agent.displayLabel?.trim() || agent.name;
  const artwork = agentArtwork(agent.name);
  return artwork
    ? `<img class="${className} ${artwork.className}" src="${artwork.source}" alt="${text(label)}">`
    : COPILOT_MARK;
}

/**
 * The five agents Frontier Accelerator promotes org-wide. There is no governance table or
 * config file for this list in the app's data model (no HuddlePlacements-style source exists),
 * so it is a fixed, self-contained list here -- move it to a shared config if the content
 * model ever gains a place for it. A pill is "Used in huddle" when this Huddle's own agent
 * list resolves to the same brand artwork as the official agent, so small label differences
 * (e.g. "Sales Copilot" vs "Sales Agent") still match correctly via the existing agentArtwork
 * lookup instead of a second, duplicate name-matching rule.
 */
const TOP_FIVE_AGENT_NAMES = ["Researcher", "Cowork", "Scout", "Sales Agent", "Agent J.ai"] as const;

/** "Top 5 agents" pill band shown on the Overview panel, mirroring the reference guide. */
function topFiveAgentBand(agents: readonly HuddlePresentationAgent[]): string {
  const usedArtworkSources = new Set(
    agents
      .map((agent) => agentArtwork(agent.name)?.source)
      .filter((source): source is string => Boolean(source)),
  );

  return `<section class="top-five-agent-band" aria-label="Top 5 agents">`
    + `<div class="top-five-agent-band-label">Top 5 agents<span>Circle = included today</span></div>`
    + TOP_FIVE_AGENT_NAMES.map((name) => {
      const artwork = agentArtwork(name);
      const isUsed = artwork ? usedArtworkSources.has(artwork.source) : false;
      const icon = artwork
        ? `<img class="top-five-agent-logo" src="${artwork.source}" alt="${text(name)}">`
        : `<span>${text(name.split(/\s+/).map((part) => part[0]).join("").slice(0, 3))}</span>`;
      return `<div class="top-five-agent-pill${isUsed ? " is-featured" : ""}">`
        + `<span class="top-five-agent-icon">${icon}</span>`
        + `<span><strong class="top-five-agent-title">${text(name)}</strong>${isUsed ? `<small class="top-five-agent-status">Used in huddle</small>` : ""}</span>`
        + `</div>`;
    }).join("")
    + `</section>`;
}

/** Per-agent "AI Tool" row shown above an activity's prompt, mirroring the reference guide. */
function activityToolActions(agents: readonly HuddlePresentationAgent[]): string {
  if (!agents.length) return "";
  return `<div class="activity-tool-actions">`
    + agents.map((agent) => {
      const label = agent.displayLabel?.trim() || agent.name;
      const accessUrl = agent.showAccessLink ? safeExternalUrl(agent.accessUrl) : null;
      return `<div class="activity-tool-action">`
        + `<span class="activity-tool-kicker">AI Tool</span>`
        + `<span class="activity-tool-logo">${agentBrandMark(agent, "activity-agent-logo")}</span>`
        + `<strong class="activity-tool-name">${text(label)}</strong>`
        + `${accessUrl ? `<a class="activity-open-tool" href="${text(accessUrl)}" target="_blank" rel="noopener noreferrer">${text(agent.accessLinkLabel?.trim() || `Open ${label}`)} \u2197</a>` : ""}`
        + `</div>`;
    }).join("")
    + `</div>`;
}

function activityCard(activity: HuddlePresentationActivity, index: number, tier: "featured" | "optional", discussionWhilePracticing: readonly string[]): string {
  const tools = agentNames(activity.agents);
  const promptTarget = tools[0] ?? "your AI tool";
  const toolActions = activityToolActions(activity.agents);
  const promptBlock = activity.prompt
    ? `<div class="activity-prompt-block">${toolActions}<div class="prompt-label-row"><span class="prompt-label">Try this prompt in ${text(promptTarget)}.</span><button type="button" class="copy-button scenario-copy-button" data-copy="${text(activity.prompt)}" aria-label="Copy prompt" title="Copy prompt">${COPY_SVG}</button></div><div class="scenario-prompt-scroll">${text(activity.prompt)}</div></div>`
    : `<div class="activity-prompt-block">${toolActions}${placeholder("No recommended prompt is configured for this activity yet.")}</div>`;

  return `<details class="practice-activity-card" data-practice-tier="${tier}"${index === 0 && tier === "featured" ? " open" : ""}>`
    + `<summary class="practice-activity-summary"><span class="activity-letter">${text(activityLetter(index))}</span>`
    + `<span class="practice-activity-heading"><strong>${text(activity.name)}</strong>${activity.description ? `<small>${text(activity.description)}</small>` : ""}</span>`
    + `<span class="scenario-chevron">${CHEVRON_SVG}</span></summary>`
    + `<div class="practice-activity-body">${promptBlock}`
    + `<div class="activity-practice-grid">`
    + `<section class="activity-detail-card context-required-card"><h3>Context Required</h3>${activity.requiredContext ? questionList([activity.requiredContext], "") : placeholder("Required context is not configured for this activity yet.")}</section>`
    + `<section class="activity-detail-card activity-discuss-card"><h3>Discuss while practicing</h3>${questionList(discussionWhilePracticing, "No discussion prompts are configured for this activity yet.")}</section>`
    + `</div>`
    + `<div class="activity-output-grid">`
    + `<section class="activity-output-card expected-output-card"><span class="activity-eyebrow">Expected output</span>${activity.expectedOutput ? `<p>${text(activity.expectedOutput)}</p>` : placeholder("Not configured yet.")}</section>`
    + `<section class="activity-output-card human-checkpoint-card"><span class="activity-eyebrow">Human checkpoint</span>${activity.humanCheckpoint ? `<p>${text(activity.humanCheckpoint)}</p>` : placeholder("Not configured yet.")}</section>`
    + `</div>`
    // Best-fit job is deliberately not rendered. Removed on the manager's instruction; the value
    // still reaches the presentation model, so restoring it is a one-line change.
    + `${activity.resources.length ? `<section class="resources-card"><div class="bottom-title blue-title"><span>\u25a4</span><h2>Activity resources</h2></div>${resourceRows(activity.resources)}</section>` : ""}`
    + `</div></details>`;
}

/** Resource-hub tool card (Resources tab). Same agent fields the old AI Tools tab used, restyled. */
function resourceHubToolCard(agent: HuddlePresentationAgent): string {
  const label = agent.displayLabel?.trim() || agent.name;
  const brandMark = agentBrandMark(agent, "agent-logo");
  const accessUrl = agent.showAccessLink ? safeExternalUrl(agent.accessUrl) : null;
  const identitySubtitle = agent.shortDescription?.trim() || "Microsoft AI experience";
  const whatItIs = agent.whatItIs?.trim() || null;
  const helps = agent.whatItHelpsYouDo?.trim() || null;
  const when = agent.whenToUseIt?.trim() || null;

  const detail = (className: string, heading: string, value: string | null) => value
    ? `<div class="resource-tool-detail ${className}"><strong>${text(heading)}</strong><p>${text(value)}</p></div>`
    : "";

  return `<article class="resource-tool-card">`
    // Empty badge slot reserved for layout parity with the reference design's "Top 5 agent"
    // badge. This app has no agent-governance/Top-5 data source to populate it from, so no
    // badge is rendered here -- see the export report for what a badge would require.
    + `<div class="resource-tool-badge-slot"></div>`
    + `<div class="resource-tool-head"><span class="resource-tool-logo">${brandMark}</span>`
    + `<div class="resource-tool-identity"><h3>${text(label)}</h3><span>${text(identitySubtitle)}</span></div>`
    + `${accessUrl ? `<a class="resource-tool-open" href="${text(accessUrl)}" target="_blank" rel="noopener noreferrer">${text(agent.accessLinkLabel?.trim() || `Open ${label}`)} \u2197</a>` : ""}`
    + `</div>`
    + `<div class="resource-tool-details">`
    + detail("what-it-is", "What it is", whatItIs)
    + detail("", "What it helps you do", helps)
    + detail("", "When to use it", when)
    + `</div>`
    + `${agent.keyBenefits.length ? `<ul class="resource-tool-benefits">${agent.keyBenefits.map((benefit) => `<li>\u2713 ${text(benefit)}</li>`).join("")}</ul>` : ""}`
    + `</article>`;
}

/** Resource-hub link card (Resources tab, "Supporting resources"). */
function resourceHubLinks(resources: readonly HuddlePresentationResource[]): string {
  return `<div class="resource-link-grid">${resources.map((resource) => {
    const url = safeExternalUrl(resource.url);
    const content = `<span class="resource-link-copy"><small>Resource</small><strong>${text(resource.title)}</strong>${resource.description ? `<p>${text(resource.description)}</p>` : ""}</span><span class="resource-link-arrow">\u2197</span>`;
    return url
      ? `<a class="resource-link-card" href="${text(url)}" target="_blank" rel="noopener noreferrer">${content}</a>`
      : `<div class="resource-link-card">${content}</div>`;
  }).join("")}</div>`;
}

function stageShell(topicName: string, stageNumber: number, title: string, description: string | null, inner: string, badge = ""): string {
  return `<section class="card stage-shell">`
    + `<div class="stage-topic-context"><span>TODAY\u2019S TOPIC</span><strong>${text(topicName)}</strong></div>`
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

  // "Used" means an activity actually calls on the agent -- not just that the Huddle's
  // author-curated agents.primary/secondary tags mention it. Those tags can list an agent no
  // activity actually uses, which used to make it show as "Used in huddle" in the Top 5 band
  // (and in the AI Tools summary / Resources tool grid below) even though nothing in the
  // Huddle calls on it. Matching by agentArtwork (rather than externalId) keeps this
  // label-tolerant, the same way topFiveAgentBand already matches artwork.
  const declaredAgents = [...model.agents.primary, ...model.agents.secondary]
    .filter((agent, index, all) => all.findIndex((candidate) => candidate.externalId === agent.externalId) === index)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId));

  const activityAgentArtworkSources = new Set(
    allActivities
      .flatMap((activity) => activity.agents)
      .map((agent) => agentArtwork(agent.name)?.source)
      .filter((source): source is string => Boolean(source)),
  );
  const usedDeclaredAgents = declaredAgents.filter((agent) => {
    const source = agentArtwork(agent.name)?.source;
    return source ? activityAgentArtworkSources.has(source) : false;
  });

  // The Top 5 (in the official band order) that this Huddle actually uses, followed by
  // whichever other used agents are not one of the five -- matching the "Top 5: ... . Also
  // used: ... ." grouping in the AI Tools summary below and the order of the Resources tool grid.
  const topFiveUsedAgents = TOP_FIVE_AGENT_NAMES
    .map((name) => usedDeclaredAgents.find((agent) => agentArtwork(agent.name)?.source === agentArtwork(name)?.source))
    .filter((agent): agent is HuddlePresentationAgent => Boolean(agent));
  const alsoUsedAgents = usedDeclaredAgents.filter((agent) => !topFiveUsedAgents.includes(agent));

  const agents = [...topFiveUsedAgents, ...alsoUsedAgents];

  const resources = [...model.resources, ...allActivities.flatMap((activity) => activity.resources), ...agents.flatMap((agent) => agent.resources)]
    .filter((resource, index, all) => all.findIndex((candidate) => candidate.externalId === resource.externalId) === index)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.externalId.localeCompare(right.externalId));

  const guide = model.facilitatorGuide;
  // Reflect and Commit belong to the placement, in the workbook's Commit sheet. The topic-level
  // fields have no workbook column behind them and are null for all V4 content, which is why this
  // panel previously rendered its placeholders.
  const reflectPrompt = guide?.reflectPrompt ?? model.reflectionPrompt;
  const commitPrompt = guide?.commitPrompt ?? model.commitmentPrompt;
  const topicName = model.identity.name;
  const aiToolsSummary = (() => {
    const topFiveNames = agentNames(topFiveUsedAgents);
    const alsoUsedNames = agentNames(alsoUsedAgents);
    if (!topFiveNames.length && !alsoUsedNames.length) return "Not configured";
    const topFivePart = topFiveNames.length ? `Top 5: ${topFiveNames.join(", ")}.` : "";
    const alsoUsedPart = alsoUsedNames.length ? `Also used: ${alsoUsedNames.join(", ")}.` : "";
    return [topFivePart, alsoUsedPart].filter(Boolean).join(" ");
  })();
  const stageName = (index: number, fallback: string) => phases[index]?.name?.trim() || fallback;
  const stageDescription = (index: number) => phases[index]?.description ?? null;

  // "AI Tools" is no longer a standalone tab -- its content (the same `agents` array) now
  // renders inside Resources as the resource hub, matching the reference design. "Closing &
  // Next Steps" is new. Facilitator Notes has no panel in the downloaded export (removed on
  // the manager's instruction; options.facilitatorNotes still reaches this function -- see the
  // export report for why the export itself no longer renders it).
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "best-practices", label: "Share Your Experience" },
    { key: "preparation", label: stageName(0, "Preparation") },
    { key: "practice", label: stageName(1, "Explore & Practice") },
    { key: "commit", label: stageName(2, "Commit to Action") },
    { key: "closing", label: "Closing & Next Steps" },
    { key: "resources", label: "Resources" },
  ];

  const generated = new Date();
  const generatedDate = generated.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const generatedTime = generated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const workflowExportName = compactFileToken(getWorkflowExportName(model)) || "Huddle";
  const roleExportName = getRoleExportName(model);
  const exportBaseName = `FA-Huddle_${workflowExportName}_${roleExportName}_${exportDateToken(generated)}`;

  const overviewPanel = `<section class="huddle-section-panel is-active" data-section-panel="overview">`
    + `<div class="overview-timing-band" aria-label="Today\u2019s Huddle"><div class="overview-timing-title">Today\u2019s Huddle</div><div class="overview-timing-steps">`
    + TEMPLATE.agenda.map((step, index) => `${index > 0 ? '<div class="overview-timing-arrow">\u2192</div>' : ""}<div class="overview-timing-step"><strong>${text(step.label)}</strong><span>\u00b7 ${step.minutes} min</span></div>`).join("")
    + `</div></div>`
    + topFiveAgentBand(agents)
    + `<section class="hero-grid"><div class="hero-copy"><h1>${text(topicName)}</h1>${model.identity.description ? `<p class="hero-description">${text(model.identity.description)}</p>` : ""}`
    + `<div class="meta-strip">`
    + `<div class="meta-item"><span class="round-icon meta-icon">${ROLE_SVG}</span><span><small>Role</small><strong>${text(model.audience.roleName?.trim() || "Not specified")}</strong></span></div>`
    + `<span class="meta-divider"></span>`
    + `<div class="meta-item"><span class="round-icon meta-icon">${AI_TOOLS_SVG}</span><span><small>AI Tools</small><strong>${text(aiToolsSummary)}</strong></span></div>`
    + `<span class="meta-divider"></span>`
    + `<div class="meta-item"><span class="round-icon meta-icon">${MCEM_SVG}</span><span><small>MCEM Stages</small><strong>${text(model.mcemStages.length ? model.mcemStages.map((stage) => stage.name).join(", ") : "Not configured")}</strong></span></div>`
    + `</div></div>`
    + `<aside class="objective-card"><span class="objective-icon">\u25ce</span><div><h2>Today\u2019s Objective</h2>${model.narrative.todayObjective ? `<p>${text(model.narrative.todayObjective)}</p>` : placeholder("No objective is configured for this Huddle yet.")}</div></aside></section>`
    + `<section class="overview-two-column">`
    + `<div class="card overview-summary-card"><div class="section-heading"><span class="sparkle-icon">\u2726</span><h2>Why this Huddle matters</h2></div>`
    + `${model.narrative.whyItMatters ? `<p>${text(model.narrative.whyItMatters)}</p>` : placeholder("Not configured yet.")}`
    + `<div class="overview-outcome"><span>Desired outcome</span><p class="overview-outcome-value">${text(model.narrative.desiredOutcome?.trim() || "Not configured yet.")}</p></div></div>`
    + `<div class="card activity-preview-card"><div class="section-heading"><span class="line-icon">\u25c9</span><h2>What you\u2019ll practice</h2></div>`
    + `${featuredActivities.length ? `<div class="activity-preview-list">${featuredActivities.map((activity, index) => `<div class="activity-preview-row"><span class="activity-letter">${text(activityLetter(index))}</span><div><strong>${text(activity.name)}</strong>${activity.description ? `<p>${text(activity.description)}</p>` : ""}</div></div>`).join("")}</div>` : placeholder("No activities are configured for this Huddle yet.")}</div>`
    + `</section>`
    + `<section class="card huddle-flow-card"><div class="business-workflow-heading"><span class="sparkle-icon">\u2726</span><div><h2>AI in Action</h2><p>Each workflow moves through 3 stages: prepare the context, practice with AI on real work, and commit to a next action.</p></div></div>`
    + `<div class="three-stage-flow">`
    + TEMPLATE.flow.map((stage, index) => `${index > 0 ? '<div class="flow-arrow">\u2192</div>' : ""}<article class="flow-stage-card" role="button" tabindex="0" data-flow-target="${stage.key}" aria-label="Go to ${text(stageName(index, stage.title))}"><span>${index + 1}</span><div><h3>${text(stageName(index, stage.title))}</h3><p>${text(stageDescription(index) ?? stage.copy)}</p></div></article>`).join("")
    + `</div></section>`
    + `<div class="tfd-section-heading"><h2>Accelerating AI Confidence and Capability through real work</h2></div>`
    + `<section class="think-feel-do-grid">${TEMPLATE.thinkFeelDo.map((entry) => `<div class="card tfd-card"><span>${entry.label}</span><p>${text(entry.copy(topicName))}</p></div>`).join("")}</section>`
    + `</section>`;

  const sharePanel = `<section class="huddle-section-panel" data-section-panel="best-practices">`
    + `<section class="card best-practices-shell"><div class="section-heading"><span class="sparkle-icon">\u2726</span><h2>Share Your Experience</h2></div>`
    + `<p class="best-practices-intro">Use this time to share what you tried with AI since the last Huddle. Compare what worked, what did not, what you learned, and where you ran into friction.</p>`
    // Stack the cards in one straight column for the three-prompt template, matching the
    // reference guide; keep the CSS's own 2x2 fallback (`is-four`) if the template ever grows.
    // (widened to `number` so the comparisons below aren't narrowed to this fixed tuple's literal length)
    + (() => {
      const shareCount: number = TEMPLATE.shareYourExperience.length;
      const gridModifier = shareCount === 4 ? " is-four" : shareCount === 3 ? " is-stacked" : "";
      return `<div class="discussion-question-grid${gridModifier}">${TEMPLATE.shareYourExperience.map((entry, index) => `<div class="discussion-question-card"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${text(entry.title)}</strong><p>${text(entry.copy)}</p></div></div>`).join("")}</div>`;
    })()
    + `</section></section>`;

  const preparationPanel = `<section class="huddle-section-panel" data-section-panel="preparation">`
    + stageShell(topicName, 1, stageName(0, "Preparation"), stageDescription(0) ?? "Set the context before opening an AI tool. Align on the workflow, people, evidence, and friction that matter.",
      `<div class="stage-content-grid">`
      + `<section class="stage-content-card preparation-session-card"><h3>Session introduction</h3>${guide?.sessionIntroduction ? questionList([guide.sessionIntroduction], "") : placeholder("No session introduction is configured for this Huddle yet.")}</section>`
      + `<section class="stage-content-card preparation-talking-card"><h3>Key Talking Points</h3>${questionList(guide?.keyTalkingPoints ?? [], "No key talking points are configured for this Huddle yet.")}</section>`
      + `<section class="stage-content-card preparation-discuss-card"><h3>Discuss before practicing</h3>${questionList(guide?.discussionQuestions ?? [], "No discussion questions are configured for this Huddle yet.")}</section>`
      + `<section class="stage-content-card preparation-checklist preparation-bring-card"><h3>Facilitator to bring into the conversation</h3>${questionList(guide?.preparationChecklist?.length ? guide.preparationChecklist : TEMPLATE.bringIntoTheConversation, "")}</section>`
      + `</div>`)
    + `</section>`;

  const practicePanel = `<section class="huddle-section-panel" data-section-panel="practice">`
    + stageShell(topicName, 2, stageName(1, "Explore & Practice"), stageDescription(1) ?? "Work through the Huddle activities using a real scenario. Adapt the prompt, inspect the output, and keep human judgment explicit.",
      `<div class="featured-activities-header"><div><h3>Featured activities</h3><p>Start with these priority activities for today\u2019s Huddle.</p></div><span class="activity-tier-badge">Featured</span></div>`
      + `<div class="practice-activity-stack" data-activity-tier="featured">${featuredActivities.length
        ? featuredActivities.map((activity, index) => activityCard(activity, index, "featured", guide?.keyTalkingPoints ?? [])).join("")
        : placeholder("No featured activities are configured for this Huddle yet.")}</div>`
      + `<details class="additional-activities"><summary><span class="additional-activities-copy"><strong>Additional activities to explore</strong><small>Extended activities are available here when you want to go beyond the featured practice.</small></span><span class="scenario-chevron" aria-hidden="true">${CHEVRON_SVG}</span></summary>`
      + `<div class="optional-activity-stack" data-activity-tier="optional">${optionalActivities.length
        ? optionalActivities.map((activity, index) => activityCard(activity, featuredActivities.length + index, "optional", guide?.keyTalkingPoints ?? [])).join("")
        : `<div class="optional-activities-empty">No additional activities are configured for this Huddle yet.</div>`}</div></details>`,
      `<span class="scenario-count">${featuredActivities.length} featured ${featuredActivities.length === 1 ? "activity" : "activities"}${optionalActivities.length ? ` \u00b7 ${optionalActivities.length} extended` : ""}</span>`)
    + `</section>`;

  const commitPanel = `<section class="huddle-section-panel" data-section-panel="commit">`
    + stageShell(topicName, 3, stageName(2, "Commit to Action"), stageDescription(2) ?? "Turn the practice into a concrete behavior. Reflect on what changed, agree on the next action, and define what to bring back.",
      `<div class="commit-layout">`
      + `<section class="reflection-card card nested-card"><div class="bottom-title green-title"><span>\u2667</span><h2>Reflect</h2></div><h3>What did you learn today?</h3>${reflectPrompt ? `<p>${text(reflectPrompt)}</p>` : placeholder("No reflection prompt is configured yet.")}</section>`
      + `<section class="commit-card card nested-card"><div class="bottom-title orange-title"><span>\u25ce</span><h2>Commit</h2></div><h3>What will you do this week?</h3>${commitPrompt ? `<p>${text(commitPrompt)}</p>` : placeholder("No commitment prompt is configured yet.")}</section>`
      + `</div>`)
    + `</section>`;

  // New: mirrors the reference design's dedicated Closing & Next Steps panel. "Close the
  // Huddle" moved here from the Commit panel (same TEMPLATE.closeTheHuddle copy, unchanged);
  // Manager Reflection and Weekly Pulse are new template-copy sections, not Huddle-record data.
  const closingPanel = `<section class="huddle-section-panel" data-section-panel="closing">`
    + `<section class="card stage-shell">`
    + `<div class="stage-topic-context"><span>TODAY\u2019S TOPIC</span><strong>${text(topicName)}</strong></div>`
    + `<div class="stage-header"><div><span class="stage-kicker">Closing</span><h2>Closing & Next Steps</h2><p>Close the loop on today\u2019s Huddle and capture a quick reflection.</p></div></div>`
    + `<div class="closing-grid">`
    + `<section class="closing-card full-width"><h3>Close the Huddle</h3>${questionList(TEMPLATE.closeTheHuddle, "")}</section>`
    + `<section class="closing-card"><h3>Manager Reflection</h3>${questionList(TEMPLATE.managerReflection, "")}</section>`
    + `<section class="closing-card"><h3>Weekly Pulse</h3><p class="weekly-pulse-question">${text(TEMPLATE.weeklyPulse)}</p></section>`
    + `</div>`
    + `</section>`
    // Facilitator Notes (removed from this export) used to be the last panel, and this footer
    // was rendered at its end. Closing & Next Steps is now the last panel, so the footer moved
    // here with it.
    + `<footer class="page-footer"><div class="generated-badge">${COPILOT_MARK}<span>Generated from the Frontier Accelerator App</span><i></i><span>${text(generatedDate)}</span><b>\u2022</b><span>${text(generatedTime)}</span></div><span class="page-number">1</span></footer>`
    + `</section>`;

  // Resources now doubles as the resource hub: the AI tools grid that used to be its own
  // "AI Tools" tab (same `agents` array, same fields), followed by the supporting-resource
  // link cards (same `resources` array that resourceRows() used before).
  const resourcesPanel = `<section class="huddle-section-panel" data-section-panel="resources">`
    + `<div class="resource-section-heading resource-section-heading-first"><div><h3>AI tools used in this Huddle</h3><p>Tools used across the ${text(stageName(1, "Explore & Practice"))} activities.</p></div><span class="resources-hub-count">${agents.length} ${agents.length === 1 ? "AI tool" : "AI tools"} \u00b7 ${resources.length} ${resources.length === 1 ? "resource" : "resources"}</span></div>`
    + `${agents.length ? `<div class="resource-tool-grid">${agents.map(resourceHubToolCard).join("")}</div>` : placeholder("No AI tools are configured for this Huddle yet.")}`
    + `<div class="resource-section-heading"><div><h3>Supporting resources</h3><p>Use portfolio, role, topic, activity, and agent resources that support this Huddle.</p></div></div>`
    + `${resources.length ? resourceHubLinks(resources) : placeholder("No resources are configured for this Huddle yet.")}`
    + `</section>`;

  const body = `<article class="huddle-page segmented-huddle-page workflow-huddle-page" id="huddle-1">`
    + `<header class="page-topbar">`
    + `<div class="frontier-brand" aria-label="Frontier Accelerator"><img src="${frontierAcceleratorLogo}" alt="Frontier Accelerator"></div>`
    + `<div class="brand-right"><div class="microsoft-brand" aria-label="Microsoft"><span class="ms-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Microsoft</span></div></div>`
    + `<div class="ribbon-art" aria-hidden="true"><span class="wave wave-one"></span><span class="wave wave-two"></span><span class="wave wave-three"></span></div>`
    + `</header>`
    + `<nav class="huddle-section-nav" aria-label="Huddle sections"><div class="huddle-section-tabs">`
    + `<button type="button" class="huddle-section-tab is-active" data-section-target="overview"><span class="tab-label">Overview</span></button>`
    + `<button type="button" class="huddle-section-tab" data-section-target="best-practices"><span class="tab-label">Share Your Experience</span></button>`
    + `<div class="ai-action-tab-group" aria-label="AI In Action"><span class="ai-action-tab-group-label" aria-hidden="true">AI In Action</span>`
    + `<button type="button" class="huddle-section-tab" data-section-target="preparation"><span class="tab-label">${text(stageName(0, "Preparation"))}</span></button>`
    + `<button type="button" class="huddle-section-tab" data-section-target="practice"><span class="tab-label">${text(stageName(1, "Explore & Practice"))}</span></button>`
    + `<button type="button" class="huddle-section-tab" data-section-target="commit"><span class="tab-label">${text(stageName(2, "Commit to Action"))}</span></button>`
    + `</div>`
    + `<button type="button" class="huddle-section-tab" data-section-target="closing"><span class="tab-label">Closing & Next Steps</span></button>`
    + `<button type="button" class="huddle-section-tab" data-section-target="resources"><span class="tab-label">Resources</span></button>`
    + `</div><div class="huddle-section-status"><small>Huddle section</small><strong><span data-section-index>1</span> of ${tabs.length} \u00b7 <span data-section-name>Overview</span></strong></div></nav>`
    + `<main class="page-content">${overviewPanel}${sharePanel}${preparationPanel}${practicePanel}${commitPanel}${closingPanel}${resourcesPanel}</main>`
    + `<div class="huddle-section-actions"><button type="button" class="section-action-button section-previous" data-section-previous>\u2190 Previous</button><button type="button" class="section-action-button section-next" data-section-next>Next \u2192</button></div>`
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

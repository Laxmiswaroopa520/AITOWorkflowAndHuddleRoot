import type { HuddlePlanResponse } from "../../types";
import { HUDDLE_FONT_STACK } from "./fontStack";
import { createHtmlDocument, downloadHtmlFile } from "./htmlTemplate";
import { escapeHtml, safeHtmlFileName } from "./htmlSanitizer";
import type { HtmlExportFile, LearningPlanHtmlExportOptions } from "./html.types";

/**
 * A plain, print-friendly table -- matching the reference layout the manager shared -- rather
 * than the full shared Huddle guide stylesheet. Font stays the one shared constant so this still
 * never drifts from the app's own Segoe UI Variable rendering (see the "one font stack" test).
 */
const LEARNING_PLAN_HTML_STYLES = `body{margin:40px;color:#242424;font-family:${HUDDLE_FONT_STACK};font-synthesis:none;-webkit-font-smoothing:antialiased}h1{color:#0f6cbd}table{width:100%;margin-top:24px;border-collapse:collapse}th,td{padding:12px;border:1px solid #d1d1d1;text-align:left;vertical-align:top}th{background:#f3f6fb}small{color:#616161}`;

export function createLearningPlanHtmlExport(plan: HuddlePlanResponse, options: LearningPlanHtmlExportOptions = {}): HtmlExportFile {
  const items = [...plan.items].sort((a, b) => a.week - b.week);
  // External IDs like "ae-ent" are internal; show the role name when we have it.
  const audience = options.roleName?.trim() || plan.roleExternalId;
  const weeks = items.map((item) => item.week);
  const durations = new Set(items.map((item) => item.huddle.durationMinutes).filter((duration): duration is number => duration !== null));
  const commonDuration = durations.size === 1 ? [...durations][0] : null;
  const curriculum = weeks.length === 0
    ? "No Huddles are scheduled yet."
    : `Weeks ${Math.min(...weeks)}–${Math.max(...weeks)} · ${items.length} ${commonDuration !== null ? `${commonDuration}-minute ` : ""}Huddle${items.length === 1 ? "" : "s"}`;
  const rows = items.map((item) => {
    // The response only ever names the previously recommended huddle's external ID, not its
    // display name, so that is what the Customization column can show for a swapped-out week.
    const changedFromRecommendation = item.huddle.externalId !== item.recommendedHuddleExternalId;
    const duration = item.huddle.durationMinutes === null ? "Duration unavailable" : `${escapeHtml(item.huddle.durationMinutes)} minutes`;
    const customization = changedFromRecommendation ? `Replaced ${escapeHtml(item.recommendedHuddleExternalId)}` : "—";
    return `<tr><td>Week ${escapeHtml(item.week)}</td><td>${escapeHtml(item.huddle.name)}</td><td>${item.isCustomized ? "Customized" : "Recommended"}</td><td>${customization}</td><td>${duration}</td></tr>`;
  }).join("");
  const body = `<h1>Role Path</h1><p><strong>Role:</strong> ${escapeHtml(audience)}</p><p><strong>Curriculum:</strong> ${curriculum}</p><table><thead><tr><th>Week</th><th>Huddle</th><th>Path status</th><th>Customization</th><th>Duration</th></tr></thead><tbody>${rows}</tbody></table><p><small>This export contains the learning plan only.</small></p>`;
  return { html: createHtmlDocument(`${audience} Role Path`, body, LEARNING_PLAN_HTML_STYLES), fileName: options.fileName ?? safeHtmlFileName(`${audience} - Learning Plan`, "Learning Plan") };
}

export function exportLearningPlanHtml(plan: HuddlePlanResponse, options: LearningPlanHtmlExportOptions = {}): HtmlExportFile {
  const output = createLearningPlanHtmlExport(plan, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

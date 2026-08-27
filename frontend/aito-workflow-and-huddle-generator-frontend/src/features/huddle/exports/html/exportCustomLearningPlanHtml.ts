import { formatMcemStageLabel } from "../../mappers";
import type { HuddleCatalogItemResponse } from "../../types";
import { createHtmlDocument, downloadHtmlFile } from "./htmlTemplate";
import { escapeHtml, safeHtmlFileName } from "./htmlSanitizer";
import type { CustomLearningPlanHtmlExportOptions, HtmlExportFile } from "./html.types";

/**
 * Renders the Additional Topics custom learning plan as a standalone HTML file.
 * `huddles` must already be in the facilitator's chosen order.
 */
export function createCustomLearningPlanHtmlExport(
  huddles: readonly HuddleCatalogItemResponse[],
  options: CustomLearningPlanHtmlExportOptions = {},
): HtmlExportFile {
  if (huddles.length === 0) throw new Error("Select at least one topic before exporting the learning plan.");

  const audienceLabel = options.personaLabel?.trim() ? escapeHtml(options.personaLabel.trim()) : "All experiences";
  const totalMinutes = huddles.reduce((total, huddle) => total + (huddle.durationMinutes ?? 0), 0);

  const body = `<main class="page"><header class="hero"><p class="eyebrow">Frontier Accelerator</p><h1>Custom Learning Plan</h1><p class="hero-description">A self-selected sequence of published Huddles from Additional Topics.</p><div class="meta"><span class="pill">${audienceLabel}</span><span class="pill">${huddles.length} ${huddles.length === 1 ? "Huddle" : "Huddles"}</span>${totalMinutes > 0 ? `<span class="pill">${escapeHtml(totalMinutes)} minutes total</span>` : ""}</div></header><div class="content"><section class="plan-summary"><div><span class="label">Selected experience</span><strong>${audienceLabel}</strong></div><div><span class="label">Topics in plan</span><strong>${huddles.length}</strong></div></section><section class="timeline">${huddles.map((huddle, index) => {
    const primary = huddle.primaryAgents.map((agent) => agent.name);
    const secondary = huddle.secondaryAgents.map((agent) => agent.name);
    const audience = huddle.roles.map((role) => role.abbreviation || role.name);
    const mcemLabel = formatMcemStageLabel(huddle.mcemStages ?? []);
    return `<article class="week"><span class="week-badge">${index + 1}</span><div class="week-card"><h3>${escapeHtml(huddle.name)}</h3><p>${huddle.description ? escapeHtml(huddle.description) : "Description unavailable."}</p><div class="week-meta"><span class="tag">${huddle.durationMinutes === null ? "Duration unavailable" : `${escapeHtml(huddle.durationMinutes)} minutes`}</span>${mcemLabel ? `<span class="status">${escapeHtml(mcemLabel)}</span>` : ""}${huddle.focusAreaName ? `<span class="tag">${escapeHtml(huddle.focusAreaName)}</span>` : ""}</div>${audience.length ? `<div class="section"><span class="label">Audience</span><div class="tag-list">${audience.map((name) => `<span class="tag">${escapeHtml(name)}</span>`).join("")}</div></div>` : ""}${primary.length ? `<div class="section"><span class="label">Primary AI tools</span><div class="tag-list">${primary.map((name) => `<span class="tag">${escapeHtml(name)}</span>`).join("")}</div></div>` : ""}${secondary.length ? `<div class="section"><span class="label">Secondary AI tools</span><div class="tag-list">${secondary.map((name) => `<span class="tag">${escapeHtml(name)}</span>`).join("")}</div></div>` : ""}</div></article>`;
  }).join("")}</section></div><footer class="footer">Frontier Accelerator App</footer></main>`;

  return {
    html: createHtmlDocument("Custom Learning Plan", body),
    fileName: options.fileName ?? safeHtmlFileName("Custom Learning Plan", "Custom Learning Plan"),
  };
}

export function exportCustomLearningPlanHtml(
  huddles: readonly HuddleCatalogItemResponse[],
  options: CustomLearningPlanHtmlExportOptions = {},
): HtmlExportFile {
  const output = createCustomLearningPlanHtmlExport(huddles, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

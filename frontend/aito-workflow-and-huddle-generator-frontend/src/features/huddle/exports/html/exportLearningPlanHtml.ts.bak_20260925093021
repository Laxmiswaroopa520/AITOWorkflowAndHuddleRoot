import type { HuddlePlanResponse } from "../../types";
import { createHtmlDocument, downloadHtmlFile } from "./htmlTemplate";
import { escapeHtml, safeHtmlFileName } from "./htmlSanitizer";
import type { HtmlExportFile, LearningPlanHtmlExportOptions } from "./html.types";

export function createLearningPlanHtmlExport(plan: HuddlePlanResponse, options: LearningPlanHtmlExportOptions = {}): HtmlExportFile {
  const items = [...plan.items].sort((a, b) => a.week - b.week);
  // External IDs like "ae-ent" are internal; show the role name when we have it.
  const audience = options.roleName?.trim() || plan.roleExternalId;
  const body = `<main class="page"><header class="hero"><p class="eyebrow">Frontier Accelerator</p><h1>Role Path Learning Plan</h1><p class="hero-description">Seven API-backed Huddles for Weeks 2–8.</p><div class="meta"><span class="pill">${escapeHtml(audience)}</span><span class="pill">Weeks 2–8</span><span class="pill">${items.length} Huddles</span>${plan.isCustomized ? `<span class="pill">Customized</span>` : ""}</div></header><div class="content"><section class="plan-summary"><div><span class="label">Audience</span><strong>${escapeHtml(plan.roleExternalId)}</strong></div><div><span class="label">Plan status</span><strong>${plan.isCustomized ? "Customized" : "Recommended"}</strong></div></section><section class="timeline">${items.map((item) => {
    const primary = item.huddle.primaryAgents.map((agent) => agent.name);
    const secondary = item.huddle.secondaryAgents.map((agent) => agent.name);
    const changedFromRecommendation = item.huddle.externalId !== item.recommendedHuddleExternalId;
    return `<article class="week"><span class="week-badge">W${escapeHtml(item.week)}</span><div class="week-card"><h3>${escapeHtml(item.huddle.name)}</h3>${item.huddle.description ? `<p>${escapeHtml(item.huddle.description)}</p>` : ""}<div class="week-meta"><span class="tag">${item.huddle.durationMinutes === null ? "Duration unavailable" : `${escapeHtml(item.huddle.durationMinutes)} minutes`}</span><span class="status${item.isCustomized ? " custom" : ""}">${item.isCustomized ? "Customized" : "Recommended"}</span></div>${primary.length ? `<div class="section"><span class="label">Primary AI tools</span><div class="tag-list">${primary.map((name) => `<span class="tag">${escapeHtml(name)}</span>`).join("")}</div></div>` : ""}${secondary.length ? `<div class="section"><span class="label">Secondary AI tools</span><div class="tag-list">${secondary.map((name) => `<span class="tag">${escapeHtml(name)}</span>`).join("")}</div></div>` : ""}${changedFromRecommendation ? `<p class="recommended-note"><strong>Recommended replacement reference:</strong> ${escapeHtml(item.recommendedHuddleExternalId)}</p>` : ""}</div></article>`;
  }).join("")}</section></div><footer class="footer">Frontier Accelerator App</footer></main>`;
  return { html: createHtmlDocument(`${audience} Learning Plan`, body), fileName: options.fileName ?? safeHtmlFileName(`${audience} - Learning Plan`, "Learning Plan") };
}

export function exportLearningPlanHtml(plan: HuddlePlanResponse, options: LearningPlanHtmlExportOptions = {}): HtmlExportFile {
  const output = createLearningPlanHtmlExport(plan, options);
  downloadHtmlFile(output.html, output.fileName);
  return output;
}

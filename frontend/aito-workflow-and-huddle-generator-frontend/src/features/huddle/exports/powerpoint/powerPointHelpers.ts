import type PptxGenJS from "pptxgenjs";
import { powerPointTheme } from "./powerPointTheme";
import type { PowerPointSection } from "./powerPoint.types";

const invalidFileNameCharacters = /[<>:"/\\|?*]/g;

export function createPowerPointFileName(name: string): string {
  const printableName = [...name].map((character) => character.charCodeAt(0) < 32 ? "-" : character).join("");
  const safeName = printableName.replace(invalidFileNameCharacters, "-").replace(/\s+/g, " ").trim() || "Huddle";
  return `${safeName} - Huddle.pptx`;
}

export function isSupportedHyperlink(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function paginateSections(sections: readonly PowerPointSection[], characterLimit = 900): PowerPointSection[][] {
  const pages: PowerPointSection[][] = [];
  let page: PowerPointSection[] = [];
  let used = 0;
  for (const section of sections.filter((item) => item.value.trim().length > 0)) {
    const chunks = splitText(section.value, characterLimit);
    chunks.forEach((chunk, index) => {
      const item = { title: index === 0 ? section.title : `${section.title} (continued)`, value: chunk };
      const size = item.title.length + item.value.length;
      if (page.length > 0 && used + size > characterLimit) {
        pages.push(page);
        page = [];
        used = 0;
      }
      page.push(item);
      used += size;
    });
  }
  if (page.length > 0) pages.push(page);
  return pages;
}

function splitText(value: string, limit: number): string[] {
  if (value.length <= limit) return [value];
  const chunks: string[] = [];
  let remaining = value;
  while (remaining.length > limit) {
    const preferred = Math.max(remaining.lastIndexOf("\n", limit), remaining.lastIndexOf(" ", limit));
    const boundary = preferred > limit * 0.55 ? preferred : limit;
    chunks.push(remaining.slice(0, boundary).trim());
    remaining = remaining.slice(boundary).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export function addSlideFrame(slide: PptxGenJS.Slide, title: string, subtitle?: string): void {
  const { colors, fonts, width, height } = powerPointTheme;
  slide.background = { color: colors.white };
  slide.addShape("rect", { x: 0, y: 0, w: width, h: 0.12, fill: { color: colors.primary }, line: { color: colors.primary } });
  slide.addText(title, { x: 0.65, y: 0.38, w: 11.9, h: 0.48, fontFace: fonts.heading, fontSize: 24, bold: true, color: colors.navy, margin: 0, breakLine: false, fit: "shrink" });
  if (subtitle) slide.addText(subtitle, { x: 0.67, y: 0.92, w: 11.8, h: 0.3, fontFace: fonts.body, fontSize: 10.5, color: colors.muted, margin: 0, fit: "shrink" });
  slide.addText("AITO  |  Huddle", { x: 0.65, y: height - 0.34, w: 3, h: 0.18, fontFace: fonts.body, fontSize: 8, color: colors.muted, margin: 0 });
}

export function addSectionCard(slide: PptxGenJS.Slide, section: PowerPointSection, y: number, height: number): void {
  const { colors, fonts } = powerPointTheme;
  slide.addShape("roundRect", { x: 0.7, y, w: 11.93, h: height, rectRadius: 0.06, fill: { color: colors.lightSurface }, line: { color: colors.border, width: 0.7 } });
  slide.addText(section.title.toUpperCase(), { x: 0.95, y: y + 0.18, w: 11.4, h: 0.25, fontFace: fonts.body, fontSize: 9, bold: true, color: colors.primary, margin: 0 });
  slide.addText(section.value, { x: 0.95, y: y + 0.52, w: 11.35, h: height - 0.68, fontFace: fonts.body, fontSize: 13, color: colors.text, margin: 0, valign: "top", breakLine: false, fit: "shrink" });
}

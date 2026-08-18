import type { HuddlePlanResponse, HuddlePresentationModel } from "../../types";

export interface HtmlExportFile {
  fileName: string;
  html: string;
}

export interface HuddleHtmlExportOptions {
  fileName?: string;
  facilitatorNotes?: string | null;
}

export interface LearningPlanHtmlExportOptions {
  fileName?: string;
}

export type HuddleHtmlInput = HuddlePresentationModel;
export type LearningPlanHtmlInput = HuddlePlanResponse;

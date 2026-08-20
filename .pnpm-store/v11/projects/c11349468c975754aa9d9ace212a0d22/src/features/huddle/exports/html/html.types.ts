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
  /** Human-readable audience role shown instead of the external ID. */
  roleName?: string | null;
}

export interface CustomLearningPlanHtmlExportOptions {
  fileName?: string;
  /** Persona label shown in the exported plan header. */
  personaLabel?: string | null;
}

export type HuddleHtmlInput = HuddlePresentationModel;
export type LearningPlanHtmlInput = HuddlePlanResponse;

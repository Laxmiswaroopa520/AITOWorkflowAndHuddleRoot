import type PptxGenJS from "pptxgenjs";
import type { HuddlePresentationModel } from "../../types/huddlePresentation.types";

export interface PowerPointExportOptions {
  fileName?: string;
}

export interface PowerPointSection {
  title: string;
  value: string;
}

export interface PowerPointActivityPage {
  phaseName: string;
  activityName: string;
  activityNumber: number;
  sections: readonly PowerPointSection[];
}

export interface HuddlePowerPointPlan {
  model: HuddlePresentationModel;
  activityPages: readonly PowerPointActivityPage[];
}

export type HuddlePowerPoint = PptxGenJS;

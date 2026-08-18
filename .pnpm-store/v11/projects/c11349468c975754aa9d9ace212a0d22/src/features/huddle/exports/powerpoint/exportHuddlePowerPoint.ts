import PptxGenJS from "pptxgenjs";
import type { HuddlePresentationModel } from "../../types/huddlePresentation.types";
import { createPowerPointFileName } from "./powerPointHelpers";
import { addHuddleSlides, createHuddlePowerPointPlan } from "./powerPointLayouts";
import { powerPointTheme } from "./powerPointTheme";
import type { HuddlePowerPoint, PowerPointExportOptions } from "./powerPoint.types";

export function buildHuddlePowerPoint(model: HuddlePresentationModel): HuddlePowerPoint {
  const pptx = new PptxGenJS();
  pptx.layout = powerPointTheme.layout;
  pptx.author = "AITO";
  pptx.subject = model.identity.name;
  pptx.title = `${model.identity.name} Huddle`;
  pptx.company = "AITO";
  pptx.theme = {
    headFontFace: powerPointTheme.fonts.heading,
    bodyFontFace: powerPointTheme.fonts.body,
  };
  addHuddleSlides(pptx, createHuddlePowerPointPlan(model));
  return pptx;
}

export async function exportHuddlePowerPoint(model: HuddlePresentationModel, options: PowerPointExportOptions = {}): Promise<string> {
  const fileName = options.fileName ?? createPowerPointFileName(model.identity.name);
  await buildHuddlePowerPoint(model).writeFile({ fileName });
  return fileName;
}

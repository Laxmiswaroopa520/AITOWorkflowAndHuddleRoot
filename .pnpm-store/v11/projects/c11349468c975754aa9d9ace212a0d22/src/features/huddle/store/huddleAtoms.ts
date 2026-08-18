import { atom } from "jotai";
import type { HuddlePersona } from "../types/huddlePersona.types";

export type HuddleViewMode =
  | "orientation"
  | "guided"
  | "evergreen";

export const huddleViewModeAtom = atom<HuddleViewMode>("orientation");
export const selectedHuddleExternalIdAtom = atom<string | null>(null);
export const selectedHuddleRoleExternalIdAtom = atom<string | null>(null);
export const huddlePersonaAtom = atom<HuddlePersona | null>(null);

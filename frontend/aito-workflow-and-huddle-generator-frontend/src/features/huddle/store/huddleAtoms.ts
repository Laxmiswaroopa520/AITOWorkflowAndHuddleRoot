import { atom } from "jotai";

export type HuddleViewMode =
  | "orientation"
  | "guided"
  | "evergreen";

export const huddleViewModeAtom = atom<HuddleViewMode>("orientation");
export const selectedHuddleExternalIdAtom = atom<string | null>(null);
export const selectedHuddleRoleExternalIdAtom = atom<string | null>(null);

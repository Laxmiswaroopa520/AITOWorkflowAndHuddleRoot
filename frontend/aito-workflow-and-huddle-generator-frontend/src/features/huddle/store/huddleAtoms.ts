import { atom } from "jotai";

export type HuddleViewMode =
  | "foundation"
  | "guided"
  | "evergreen";

export const huddleViewModeAtom = atom<HuddleViewMode>("foundation");
export const selectedHuddleExternalIdAtom = atom<string | null>(null);
export const selectedHuddleRoleExternalIdAtom = atom<string | null>(null);

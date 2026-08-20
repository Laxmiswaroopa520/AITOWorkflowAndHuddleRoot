import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HuddlePersona } from "../types";

/**
 * Persona-scoped "Additional Topics" custom learning plan.
 *
 * `selectedIds` is membership (which cards are ticked) and `sequence` is the ordered
 * plan the facilitator builds from that selection. They are kept in step: ticking a card
 * appends it to the end of the sequence, unticking removes it, and reordering never
 * changes membership.
 *
 * PERSISTENCE
 * -----------
 * State is stored in localStorage because the API has no endpoint for an arbitrary,
 * user-ordered topic list. `UserHuddlePlan` is the governed seven-item Weeks 2-8 role
 * path and is deliberately a different concept, so it cannot back this feature.
 *
 * To move this server-side later, replace the two effects below with a React Query
 * query + mutation pair. Nothing outside this hook needs to change: the returned shape
 * is already API-agnostic.
 */

const storagePrefix = "aito-additional-topics-plan";

interface StoredCustomLearningPlan {
  selectedIds?: string[];
  sequence?: string[];
}

export interface CustomLearningPlanState {
  /** Ticked huddle external IDs, unordered. */
  selectedIds: readonly string[];
  /** Ticked huddle external IDs in the order the facilitator arranged them. */
  sequence: readonly string[];
  isSelected: (externalId: string) => boolean;
  toggle: (externalId: string) => void;
  /** Moves the item at `index` one slot up (-1) or down (1). No-op at the ends. */
  move: (index: number, direction: -1 | 1) => void;
  remove: (externalId: string) => void;
  clear: () => void;
}

function readStoredPlan(storageKey: string): StoredCustomLearningPlan | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as StoredCustomLearningPlan;
  } catch {
    return null;
  }
}

function uniqueIds(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

export function useCustomLearningPlan(persona: HuddlePersona | null): CustomLearningPlanState {
  const storageKey = `${storagePrefix}:${persona ?? "general"}`;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sequence, setSequence] = useState<string[]>([]);
  // Skips the very first persist after a load so switching persona never writes the
  // outgoing persona's plan into the incoming persona's key.
  const hydratedKey = useRef<string | null>(null);

  useEffect(() => {
    const stored = readStoredPlan(storageKey);
    // Tolerates the legacy single-array shape written by earlier builds.
    const storedSelected = uniqueIds(stored?.selectedIds ?? stored?.sequence ?? []);
    const storedSequence = uniqueIds(stored?.sequence ?? stored?.selectedIds ?? []);
    const retained = storedSequence.filter((id) => storedSelected.includes(id));
    setSelectedIds(storedSelected);
    setSequence([...retained, ...storedSelected.filter((id) => !retained.includes(id))]);
    hydratedKey.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    if (hydratedKey.current !== storageKey) return;
    try {
      if (selectedIds.length === 0 && sequence.length === 0) {
        // Must remove rather than skip, otherwise an emptied plan reappears on reload.
        window.localStorage.removeItem(storageKey);
        return;
      }
      window.localStorage.setItem(storageKey, JSON.stringify({ selectedIds, sequence }));
    } catch {
      // Storage can be unavailable (private mode, quota). The in-memory plan still works.
    }
  }, [storageKey, selectedIds, sequence]);

  const selectedLookup = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = useCallback((externalId: string) => {
    setSelectedIds((current) => {
      const next = current.includes(externalId)
        ? current.filter((id) => id !== externalId)
        : [...current, externalId];
      setSequence((order) => {
        const retained = order.filter((id) => next.includes(id));
        return [...retained, ...next.filter((id) => !retained.includes(id))];
      });
      return next;
    });
  }, []);

  const move = useCallback((index: number, direction: -1 | 1) => {
    setSequence((order) => {
      const target = index + direction;
      if (index < 0 || index >= order.length || target < 0 || target >= order.length) return order;
      const next = [...order];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const remove = useCallback((externalId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== externalId));
    setSequence((order) => order.filter((id) => id !== externalId));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
    setSequence([]);
  }, []);

  const isSelected = useCallback((externalId: string) => selectedLookup.has(externalId), [selectedLookup]);

  return { selectedIds, sequence, isSelected, toggle, move, remove, clear };
}

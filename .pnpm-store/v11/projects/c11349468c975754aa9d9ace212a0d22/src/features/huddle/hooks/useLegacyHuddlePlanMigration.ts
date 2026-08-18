import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { saveHuddlePlan } from "../api";
import type { HuddleCatalogItemResponse, HuddlePlanResponse } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

interface LegacyItem { week?: number; huddleId?: string }

export function useLegacyHuddlePlanMigration(role: string | null, plan?: HuddlePlanResponse, catalog?: HuddleCatalogItemResponse[]) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const attempted = useRef(new Set<string>());

  useEffect(() => {
    if (!role || !plan || !catalog || attempted.current.has(role)) return;
    attempted.current.add(role);
    const completeKey = `aito-recommended-path-migrated:${role}:v1`;
    const legacyKey = `aito-recommended-path:${role}`;
    if (localStorage.getItem(completeKey)) return;
    const finish = () => { localStorage.removeItem(legacyKey); localStorage.setItem(completeKey, "true"); };
    try {
      const legacy = JSON.parse(localStorage.getItem(legacyKey) ?? "null") as LegacyItem[] | null;
      const known = new Map(catalog.map((item) => [item.externalId, item]));
      if (!Array.isArray(legacy) || legacy.length !== 7) { finish(); return; }
      const ordered = [...legacy].sort((left, right) => (left.week ?? 0) - (right.week ?? 0));
      if (new Set(ordered.map((item) => item.huddleId)).size !== 7 || ordered.some((item) => !item.huddleId || !known.has(item.huddleId))) { finish(); return; }
      const request = { roleExternalId: role, rowVersion: plan.rowVersion, items: ordered.map((item, index) => ({ week: 2 + index, huddleExternalId: item.huddleId! })) };
      void saveHuddlePlan(apiClient, request).then((saved) => { queryClient.setQueryData(huddleQueryKeys.plan(role), saved); finish(); }).catch(() => attempted.current.delete(role));
    } catch { finish(); }
  }, [apiClient, catalog, plan, queryClient, role]);
}

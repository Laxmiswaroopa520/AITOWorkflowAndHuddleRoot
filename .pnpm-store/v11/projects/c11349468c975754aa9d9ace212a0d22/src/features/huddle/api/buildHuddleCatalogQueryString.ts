import type {
  HuddleCatalogFilters,
} from "../types";

export function buildHuddleCatalogQueryString(
  filters: HuddleCatalogFilters,
): string {
  const parameters = new URLSearchParams();

  const values: Record<string, string | undefined> = {
    roleExternalId: filters.roleExternalId,
    focusAreaExternalId: filters.focusAreaExternalId,
    agentExternalId: filters.agentExternalId,
    type: filters.type,
    search: filters.search,
    sort: filters.sort,
  };

  Object.entries(values).forEach(([key, value]) => {
    const normalizedValue = value?.trim();

    if (normalizedValue) {
      parameters.set(key, normalizedValue);
    }
  });

  const queryString = parameters.toString();
  return queryString ? `?${queryString}` : "";
}

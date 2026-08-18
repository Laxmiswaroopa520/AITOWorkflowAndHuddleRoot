import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getHuddleCatalog } from "../api";
import type {
  HuddleCatalogFilters,
  HuddleCatalogItemResponse,
} from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useHuddleCatalog(
  filters: HuddleCatalogFilters = {},
  enabled = true,
): UseQueryResult<HuddleCatalogItemResponse[], Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: huddleQueryKeys.catalog(filters),
    queryFn: ({ signal }) =>
      getHuddleCatalog(apiClient, filters, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

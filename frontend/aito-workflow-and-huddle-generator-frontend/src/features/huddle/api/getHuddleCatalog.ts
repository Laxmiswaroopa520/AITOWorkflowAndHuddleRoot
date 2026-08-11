import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type {
  HuddleCatalogFilters,
  HuddleCatalogItemResponse,
} from "../types";
import { buildHuddleCatalogQueryString } from "./buildHuddleCatalogQueryString";

export function getHuddleCatalog(
  apiClient: ApiClient,
  filters: HuddleCatalogFilters = {},
  signal?: AbortSignal,
): Promise<HuddleCatalogItemResponse[]> {
  return apiClient.get<HuddleCatalogItemResponse[]>(
    `${apiEndpoints.huddles.root}${buildHuddleCatalogQueryString(filters)}`,
    signal,
  );
}

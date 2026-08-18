import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleDetailResponse } from "../types";

export function getHuddleById(
  apiClient: ApiClient,
  externalId: string,
  signal?: AbortSignal,
): Promise<HuddleDetailResponse> {
  return apiClient.get<HuddleDetailResponse>(
    apiEndpoints.huddles.byExternalId(externalId),
    signal,
  );
}

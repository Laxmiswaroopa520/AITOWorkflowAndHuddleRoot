import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { RecommendedHuddlePathResponse } from "../types";

export function getRecommendedPath(
  apiClient: ApiClient,
  roleExternalId: string,
  signal?: AbortSignal,
): Promise<RecommendedHuddlePathResponse> {
  const parameters = new URLSearchParams({ roleExternalId });

  return apiClient.get<RecommendedHuddlePathResponse>(
    `${apiEndpoints.huddles.recommendedPath}?${parameters.toString()}`,
    signal,
  );
}

import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";

export function removeHuddleVote(
  apiClient: ApiClient,
  externalId: string,
): Promise<void> {
  return apiClient.delete(apiEndpoints.huddles.vote(externalId));
}

import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleSessionResponse, SetHuddleActivityCompletionRequest } from "../types";

export function setHuddleActivityCompletion(apiClient: ApiClient, externalId: string, activityExternalId: string, request: SetHuddleActivityCompletionRequest) {
  return apiClient.put<HuddleSessionResponse, SetHuddleActivityCompletionRequest>(apiEndpoints.huddles.sessionActivity(externalId, activityExternalId), request);
}

import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleSessionResponse, SetHuddleActivityCompletionRequest } from "../types";
import { placementQuery } from "./huddleSessionQuery";

export function setHuddleActivityCompletion(
  apiClient: ApiClient,
  externalId: string,
  activityExternalId: string,
  request: SetHuddleActivityCompletionRequest,
  placementExternalId: string | null = null,
) {
  const path = `${apiEndpoints.huddles.sessionActivity(externalId, activityExternalId)}${placementQuery(placementExternalId)}`;
  return apiClient.put<HuddleSessionResponse, SetHuddleActivityCompletionRequest>(path, request);
}

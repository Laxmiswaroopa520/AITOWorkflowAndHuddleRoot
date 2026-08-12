import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { CompleteHuddleSessionRequest, HuddleSessionResponse } from "../types";

export function completeHuddleSession(apiClient: ApiClient, externalId: string, request: CompleteHuddleSessionRequest) {
  return apiClient.post<HuddleSessionResponse, CompleteHuddleSessionRequest>(apiEndpoints.huddles.completeSession(externalId), request);
}

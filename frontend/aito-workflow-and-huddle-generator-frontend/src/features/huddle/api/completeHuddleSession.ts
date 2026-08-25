import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { CompleteHuddleSessionRequest, HuddleSessionResponse } from "../types";
import { placementQuery } from "./huddleSessionQuery";

export function completeHuddleSession(
  apiClient: ApiClient,
  externalId: string,
  request: CompleteHuddleSessionRequest,
  placementExternalId: string | null = null,
) {
  const path = `${apiEndpoints.huddles.completeSession(externalId)}${placementQuery(placementExternalId)}`;
  return apiClient.post<HuddleSessionResponse, CompleteHuddleSessionRequest>(path, request);
}

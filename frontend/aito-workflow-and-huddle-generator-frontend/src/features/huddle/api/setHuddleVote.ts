import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleVoteResponse, SetHuddleVoteRequest } from "../types";

export function setHuddleVote(
  apiClient: ApiClient,
  externalId: string,
  request: SetHuddleVoteRequest,
): Promise<HuddleVoteResponse> {
  return apiClient.put<HuddleVoteResponse, SetHuddleVoteRequest>(
    apiEndpoints.huddles.vote(externalId), request);
}

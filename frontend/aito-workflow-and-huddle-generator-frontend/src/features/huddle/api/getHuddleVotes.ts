import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleVoteResponse } from "../types";

export function getHuddleVotes(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<HuddleVoteResponse[]> {
  return apiClient.get<HuddleVoteResponse[]>(apiEndpoints.huddles.votes, signal);
}

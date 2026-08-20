import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { CreateHuddleLaunchEmailDraftRequest, HuddleLaunchEmailDraftResponse } from "../types";

export function createHuddleLaunchEmailDraft(apiClient: ApiClient, request: CreateHuddleLaunchEmailDraftRequest) {
  return apiClient.post<HuddleLaunchEmailDraftResponse, CreateHuddleLaunchEmailDraftRequest>(
    apiEndpoints.huddleLaunchPlans.emailDrafts,
    request,
  );
}

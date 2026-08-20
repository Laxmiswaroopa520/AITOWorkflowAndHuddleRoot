import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { createHuddleLaunchEmailDraft } from "../api";
import type { CreateHuddleLaunchEmailDraftRequest, HuddleLaunchEmailDraftResponse } from "../types";

export function useCreateHuddleLaunchEmailDraft() {
  const apiClient = useApiClient();
  return useMutation<HuddleLaunchEmailDraftResponse, Error, CreateHuddleLaunchEmailDraftRequest>({
    mutationFn: request => createHuddleLaunchEmailDraft(apiClient, request),
  });
}

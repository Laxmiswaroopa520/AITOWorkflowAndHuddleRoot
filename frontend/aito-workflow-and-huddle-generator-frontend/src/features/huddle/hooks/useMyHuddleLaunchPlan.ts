import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getMyHuddleLaunchPlan } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useMyHuddleLaunchPlan() {
  const apiClient = useApiClient();
  return useQuery({ queryKey: huddleQueryKeys.launchPlan(), queryFn: ({ signal }) => getMyHuddleLaunchPlan(apiClient, signal), retry: false });
}

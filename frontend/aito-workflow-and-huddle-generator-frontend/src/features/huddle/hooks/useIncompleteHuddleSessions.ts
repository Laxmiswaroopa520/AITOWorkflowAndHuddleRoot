import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getIncompleteHuddleSessions } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useIncompleteHuddleSessions() {
  const apiClient = useApiClient();
  return useQuery({ queryKey: huddleQueryKeys.incompleteSessions(), queryFn: () => getIncompleteHuddleSessions(apiClient) });
}

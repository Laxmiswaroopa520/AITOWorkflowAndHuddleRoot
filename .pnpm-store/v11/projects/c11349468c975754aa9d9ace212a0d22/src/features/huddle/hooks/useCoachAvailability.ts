import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { getCoachAvailability } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useCoachAvailability(coachExternalId: string | null, startUtc: string, endUtc: string, durationMinutes: number, enabled: boolean) {
  const apiClient = useApiClient();
  return useQuery({ queryKey: huddleQueryKeys.coachAvailability(coachExternalId ?? "", startUtc, endUtc, durationMinutes), queryFn: ({ signal }) => getCoachAvailability(apiClient, coachExternalId!, startUtc, endUtc, durationMinutes, signal), enabled: enabled && Boolean(coachExternalId), retry: 1 });
}

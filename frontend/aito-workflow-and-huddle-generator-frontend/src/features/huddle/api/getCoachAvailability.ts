import { apiEndpoints } from "@/api/endpoints";
import type { ApiClient } from "@/api/apiClient";
import type { CoachAvailabilityResponse } from "../types";

export function getCoachAvailability(apiClient: ApiClient, coachExternalId: string, startUtc: string, endUtc: string, durationMinutes: number, signal?: AbortSignal): Promise<CoachAvailabilityResponse> {
  const query = new URLSearchParams({ startUtc, endUtc, durationMinutes: String(durationMinutes) });
  return apiClient.get<CoachAvailabilityResponse>(`${apiEndpoints.huddleCoaching.availability(coachExternalId)}?${query}`, signal);
}

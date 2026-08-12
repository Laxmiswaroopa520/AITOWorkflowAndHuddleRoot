import { apiEndpoints } from "@/api/endpoints";
import type { ApiClient } from "@/api/apiClient";
import type { BookCoachRequest, CoachBookingResponse } from "../types";

export function bookCoach(apiClient: ApiClient, request: BookCoachRequest): Promise<CoachBookingResponse> {
  return apiClient.post<CoachBookingResponse, BookCoachRequest>(apiEndpoints.huddleCoaching.bookings, request);
}

import { ApiError, type ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleSessionResponse } from "../types";

export async function getHuddleSession(apiClient: ApiClient, externalId: string): Promise<HuddleSessionResponse | null> {
  try { return await apiClient.get<HuddleSessionResponse>(apiEndpoints.huddles.session(externalId)); }
  catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
}

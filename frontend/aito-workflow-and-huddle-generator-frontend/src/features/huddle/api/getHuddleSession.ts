import { ApiError, type ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleSessionResponse } from "../types";
import { placementQuery } from "./huddleSessionQuery";

export async function getHuddleSession(
  apiClient: ApiClient,
  externalId: string,
  placementExternalId: string | null = null,
  signal?: AbortSignal,
): Promise<HuddleSessionResponse | null> {
  const path = `${apiEndpoints.huddles.session(externalId)}${placementQuery(placementExternalId)}`;
  try { return await apiClient.get<HuddleSessionResponse>(path, signal); }
  catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
}

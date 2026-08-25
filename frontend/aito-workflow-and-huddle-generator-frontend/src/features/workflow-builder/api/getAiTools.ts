import type {
  ApiClient,
} from "@/api/apiClient";

import {
  apiEndpoints,
} from "@/api/endpoints";

import type {
  AiTool,
} from "../types/aiTool.types";

export function getAiTools(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<AiTool[]> {
  return apiClient.get<AiTool[]>(
    apiEndpoints.aiTools.getAll,
    signal,
  );
}
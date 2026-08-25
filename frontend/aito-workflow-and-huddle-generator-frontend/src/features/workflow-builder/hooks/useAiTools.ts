import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getAiTools,
} from "../api/getAiTools";

import type {
  AiTool,
} from "../types/aiTool.types";

import {
  workflowQueryKeys,
} from "./workflowQueryKeys";

export function useAiTools():
  UseQueryResult<AiTool[], Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey:
      workflowQueryKeys.aiTools(),

    queryFn: ({ signal }) =>
      getAiTools(
        apiClient,
        signal,
      ),

    staleTime:
      30 * 60 * 1000,
  });
}
import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  getRoles,
} from "../api/getRoles";

import type {
  Role,
} from "../types/role.types";

import {
  workflowQueryKeys,
} from "./workflowQueryKeys";

export function useRoles():
  UseQueryResult<Role[], Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey:
      workflowQueryKeys.roles(),

    queryFn: ({ signal }) =>
      getRoles(
        apiClient,
        signal,
      ),

    staleTime:
      30 * 60 * 1000,
  });
}
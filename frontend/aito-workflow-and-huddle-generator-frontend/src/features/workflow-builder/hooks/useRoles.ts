import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  useApiClient,
} from "@/api/useApiClient";

import {
  ApiError,
} from "@/api/apiClient";

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

    /*
     * Roles are small, stable reference data. Do not bind this request to the
     * temporary observer AbortSignal: React StrictMode intentionally mounts,
     * unmounts, and remounts the page in development, and cancelling this
     * startup request can otherwise leave the replacement screen waiting while
     * a debugger is paused on the expected OperationCanceledException.
     */
    queryFn: () =>
      getRoles(
        apiClient,
      ),

    retry: (
      failureCount,
      error,
    ) => {
      if (
        error.name === "AbortError" ||
        error.name === "CanceledError"
      ) {
        return false;
      }

      if (
        error instanceof ApiError &&
        error.status < 500
      ) {
        return false;
      }

      return failureCount < 3;
    },

    retryDelay: attemptIndex =>
      Math.min(
        1_000 * 2 ** attemptIndex,
        5_000,
      ),

    retryOnMount: true,

    // Roles are stable reference data with a 30-minute staleTime below, so a remount within that
    // window should serve the cached list instantly. "always" previously forced a network round
    // trip -- and its full retry/backoff sequence on any transient failure -- on every single
    // visit to the Workflow page, which is what made "Loading roles..." reappear every time even
    // though the 8 roles rarely change.
    refetchOnReconnect: "always",

    staleTime:
      30 * 60 * 1000,
  });
}

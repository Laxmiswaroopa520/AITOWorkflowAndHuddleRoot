/*Reads the active MSAL account and exposes basic signed-in-user details to React components.*/
import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import type { CurrentUser } from "./auth.types";

export function useCurrentUser():
  UseQueryResult<CurrentUser, Error> {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: ({ signal }) =>
      apiClient.get<CurrentUser>(
        "/api/auth/me",
        signal,
      ),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const status =
        "status" in error
          ? Number(error.status)
          : null;

      if (status === 401 || status === 403) {
        return false;
      }

      return failureCount < 2;
    },
  });
}
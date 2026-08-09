/* Injects token acquisition into API client*/
import { useMemo } from "react";
import { useAccessToken } from "@/auth/useAccessToken";
import {
  createApiClient,
  type ApiClient,
} from "./apiClient";

export function useApiClient(): ApiClient {
  const getAccessToken = useAccessToken();

  return useMemo(
    () => createApiClient(getAccessToken),
    [getAccessToken],
  );
}
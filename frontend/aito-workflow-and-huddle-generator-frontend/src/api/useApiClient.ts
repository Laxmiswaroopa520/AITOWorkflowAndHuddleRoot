/* Injects token acquisition into API client*/
/*It's purpose is to Get the authentication token function and create an API client that your React components/hooks can use to call the backend.*/
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
//why useMemo is used here:? 
//without useMemo:  const apiClient = createApiClient(getAccessToken);  //this will create a new instance of the API client on every render, which can lead to unnecessary re-renders and performance issues in your React components that use this hook.
//with useMemo: react remembers the previusly created api client 
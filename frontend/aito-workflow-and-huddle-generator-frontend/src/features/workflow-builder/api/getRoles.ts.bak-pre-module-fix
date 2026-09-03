//Calls the protected Roles API.
import type {
  ApiClient,
} from "@/api/apiClient";

import {
  apiEndpoints,
} from "@/api/endpoints";

import type {
  Role,
} from "../types/role.types";

export function getRoles(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<Role[]> {
  return apiClient.get<Role[]>(
    apiEndpoints.roles.getAll,
    signal,
  );
}
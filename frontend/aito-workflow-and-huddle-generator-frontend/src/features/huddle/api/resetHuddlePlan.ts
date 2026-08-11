import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";

export function resetHuddlePlan(apiClient: ApiClient, roleExternalId: string) {
  return apiClient.delete(apiEndpoints.huddlePlans.mineByRole(roleExternalId));
}

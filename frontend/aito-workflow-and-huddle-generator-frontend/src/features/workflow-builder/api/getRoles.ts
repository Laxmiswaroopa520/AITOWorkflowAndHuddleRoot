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

// dbo.Roles is shared with the Huddle module; Huddle's own rows are seeded with a "ROLE-"
// ExternalId prefix, and several role names (Account Executive, Account Technology Strategist,
// Cloud Solution Architect, Commercial Executive, Solution Sales Professional) exist as a
// separate row in each module. Reading the endpoint unscoped shows every one of those names
// twice in the Workflow Builder's role picker -- once as the Workflow-owned row, once as the
// Huddle-owned row. `module=Workflow` asks the API to filter to the Workflow Builder's own
// rows before it comes back, mirroring what useHuddleAudienceRoles.ts already does with
// `module=Huddle`.
export function getRoles(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<Role[]> {
  return apiClient.get<Role[]>(
    `${apiEndpoints.roles.getAll}?${new URLSearchParams({ module: "Workflow" })}`,
    signal,
  );
}
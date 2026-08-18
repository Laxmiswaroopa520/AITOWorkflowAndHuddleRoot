//create the health api service
//Calls the Health API endpoint to verify backend connectivity.
// Calls the public Health API endpoint to verify backend connectivity.

import { apiEndpoints } from "./endpoints";

export interface DatabaseHealthResponse {
  status: string;
  message: string | null;
}

export interface HealthResponse {
  status: string;
  application: string;
  environment: string;
  timestampUtc: string;
  database: DatabaseHealthResponse;
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured.",
  );
}

export async function getHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const response = await fetch(
    `${apiBaseUrl}${apiEndpoints.health}`,
    {
      method: "GET",
      signal,
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Health API request failed with status ${response.status}.`,
    );
  }

  return await response.json() as HealthResponse;
}









/*import { apiRequest } from "./apiClient";
import { apiEndpoints } from "./endpoints";

export interface DatabaseHealthResponse {
  status: string;
  message: string | null;
}

export interface HealthResponse {
  status: string;
  application: string;
  environment: string;
  timestampUtc: string;
  database: DatabaseHealthResponse;
}

export function getHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  return apiRequest<HealthResponse>(
    apiEndpoints.health,
    {
      method: "GET",
      signal,
    },
  );
}*/
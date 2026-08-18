//Create the centralized api client
//Centralized helper for making all HTTP API requests.
/* Sends HTTP requests*/
/*Adds the bearer access token to protected API requests and converts backend failures into frontend ApiError objects.*/
export class ApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  public constructor(
    message: string,
    status: number,
    details: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface ProblemDetailsPayload {
  title?: string;
  detail?: string;
}

function getApiErrorMessage(
  status: number,
  details: unknown,
): string {
  if (
    typeof details === "object" &&
    details !== null
  ) {
    const problemDetails =
      details as ProblemDetailsPayload;

    if (
      typeof problemDetails.detail === "string" &&
      problemDetails.detail.trim()
    ) {
      return problemDetails.detail;
    }

    if (
      typeof problemDetails.title === "string" &&
      problemDetails.title.trim()
    ) {
      return problemDetails.title;
    }
  }

  return `API request failed with status ${status}.`;
}

type AccessTokenProvider =
  () => Promise<string>;

export interface ApiClient {
  get<TResponse>(
    path: string,
    signal?: AbortSignal,
  ): Promise<TResponse>;

  post<TResponse, TRequest>(
    path: string,
    body: TRequest,
    signal?: AbortSignal,
  ): Promise<TResponse>;

  put<TResponse, TRequest>(
    path: string,
    body: TRequest,
    signal?: AbortSignal,
  ): Promise<TResponse>;

  patch<TResponse, TRequest>(
    path: string,
    body: TRequest,
    signal?: AbortSignal,
  ): Promise<TResponse>;

  delete(
    path: string,
    signal?: AbortSignal,
  ): Promise<void>;
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL
    ?.replace(/\/+$/, "");

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured.",
  );
}

export function createApiClient(
  getAccessToken: AccessTokenProvider,
): ApiClient {
  async function request<TResponse>(
    path: string,
    init: RequestInit,
  ): Promise<TResponse> {
    const accessToken = await getAccessToken();

    const headers = new Headers(init.headers);

    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );

    if (
      init.body &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }

    const response = await fetch(
      `${apiBaseUrl}${path}`,
      {
        ...init,
        headers,
      },
    );

    if (!response.ok) {
      let details: unknown;

      try {
        details = await response.json();
      } catch {
        details = await response.text();
      }

      throw new ApiError(
        getApiErrorMessage(
          response.status,
          details,
        ),
        response.status,
        details,
      );
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return await response.json() as TResponse;
  }

  return {
    get: <TResponse>(
      path: string,
      signal?: AbortSignal,
    ) =>
      request<TResponse>(path, {
        method: "GET",
        signal,
      }),

    post: <TResponse, TRequest>(
      path: string,
      body: TRequest,
      signal?: AbortSignal,
    ) =>
      request<TResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
        signal,
      }),

    put: <TResponse, TRequest>(
      path: string,
      body: TRequest,
      signal?: AbortSignal,
    ) =>
      request<TResponse>(path, {
        method: "PUT",
        body: JSON.stringify(body),
        signal,
      }),

    patch: <TResponse, TRequest>(
      path: string,
      body: TRequest,
      signal?: AbortSignal,
    ) =>
      request<TResponse>(path, {
        method: "PATCH",
        body: JSON.stringify(body),
        signal,
      }),

    delete: async (
      path: string,
      signal?: AbortSignal,
    ) => {
      await request<void>(path, {
        method: "DELETE",
        signal,
      });
    },
  };
}


/*import {
  ApiError,
  type ApiProblemDetails,
} from "./apiError";

const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim();

if (!configuredBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is missing. " +
      "Configure it in .env.development or .env.production.",
  );
}

const apiBaseUrl =
  configuredBaseUrl.replace(/\/+$/, "");

type ApiRequestOptions =
  Omit<RequestInit, "body"> & {
    body?: unknown;
  };

function isJsonResponse(
  response: Response,
): boolean {
  const contentType =
    response.headers.get("content-type") ?? "";

  return (
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json")
  );
}

async function readProblemDetails(
  response: Response,
): Promise<ApiProblemDetails | undefined> {
  if (!isJsonResponse(response)) {
    return undefined;
  }

  try {
    return await response.json() as ApiProblemDetails;
  } catch {
    return undefined;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  // Microsoft Entra access token will be added in Part 4.
  // headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;

  try {
    response = await fetch(
      `${apiBaseUrl}${path}`,
      {
        ...options,
        headers,
        body:
          options.body === undefined
            ? undefined
            : JSON.stringify(options.body),
      },
    );
  } catch (error) {
    throw new ApiError(
      error instanceof Error
        ? `Unable to reach the API: ${error.message}`
        : "Unable to reach the API.",
      0,
    );
  }

  const correlationId =
    response.headers.get("X-Correlation-ID") ??
    undefined;

  if (!response.ok) {
    const problemDetails =
      await readProblemDetails(response);

    throw new ApiError(
      problemDetails?.detail ??
        problemDetails?.title ??
        `API request failed with status ${response.status}.`,
      response.status,
      problemDetails,
      correlationId,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  if (!isJsonResponse(response)) {
    throw new ApiError(
      "The API returned an unsupported response format.",
      response.status,
      undefined,
      correlationId,
    );
  }

  return await response.json() as TResponse;
}
*/

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/*
 * Focused tests for apiClient error handling: a Response body can only be read once, so the
 * client must read the error body a single time and still report the original HTTP status.
 * apiClient.ts throws at import time when VITE_API_BASE_URL is missing, so the env var is
 * stubbed before the module is imported dynamically.
 */

type ApiClientModule = typeof import("./apiClient");

let apiModule: ApiClientModule;

beforeAll(async () => {
  vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test/");
  apiModule = await import("./apiClient");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function createClient() {
  return apiModule.createApiClient(async () => "test-token");
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Expected the request to fail.");
}

describe("apiClient error responses", () => {
  it("uses ProblemDetails detail from a JSON error body and keeps the 409 status", async () => {
    const body = { title: "Conflict", detail: "Progress changed elsewhere.", status: 409 };
    mockFetch(new Response(JSON.stringify(body), {
      status: 409,
      headers: { "Content-Type": "application/problem+json" },
    }));

    const error = await captureError(createClient().put("/api/x", { a: 1 }));

    expect(error).toBeInstanceOf(apiModule.ApiError);
    const apiError = error as InstanceType<ApiClientModule["ApiError"]>;
    expect(apiError.status).toBe(409);
    expect(apiError.message).toBe("Progress changed elsewhere.");
    expect(apiError.details).toEqual(body);
  });

  it("falls back to ProblemDetails title when detail is missing", async () => {
    mockFetch(new Response(JSON.stringify({ title: "Not Found" }), { status: 404 }));

    const error = await captureError(createClient().get("/api/x")) as InstanceType<ApiClientModule["ApiError"]>;

    expect(error.status).toBe(404);
    expect(error.message).toBe("Not Found");
  });

  it("keeps a plain-text error body as details and uses a generic message", async () => {
    mockFetch(new Response("Service temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    }));

    const error = await captureError(createClient().get("/api/x")) as InstanceType<ApiClientModule["ApiError"]>;

    expect(error).toBeInstanceOf(apiModule.ApiError);
    expect(error.status).toBe(503);
    expect(error.message).toBe("API request failed with status 503.");
    expect(error.details).toBe("Service temporarily unavailable");
  });

  it("does not surface an APIM/proxy HTML error page as the message", async () => {
    const html = "<!DOCTYPE html><html><body><h1>502 Bad Gateway</h1></body></html>";
    mockFetch(new Response(html, { status: 502, headers: { "Content-Type": "text/html" } }));

    const error = await captureError(createClient().get("/api/x")) as InstanceType<ApiClientModule["ApiError"]>;

    expect(error).toBeInstanceOf(apiModule.ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe("API request failed with status 502.");
    expect(error.message).not.toContain("<html");
    expect(error.details).toBe(html);
  });

  it("handles an empty error body", async () => {
    mockFetch(new Response(null, { status: 500 }));

    const error = await captureError(createClient().get("/api/x")) as InstanceType<ApiClientModule["ApiError"]>;

    expect(error).toBeInstanceOf(apiModule.ApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe("API request failed with status 500.");
    expect(error.details).toBe("");
  });

  it("handles a malformed JSON error body without a parsing error", async () => {
    mockFetch(new Response("{\"title\": \"Not Fou", {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }));

    const error = await captureError(createClient().get("/api/x")) as InstanceType<ApiClientModule["ApiError"]>;

    expect(error).toBeInstanceOf(apiModule.ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe("API request failed with status 404.");
    expect(error.details).toBe("{\"title\": \"Not Fou");
  });

  it.each([404, 409, 500])("preserves HTTP status %i for non-JSON bodies", async (status) => {
    mockFetch(new Response("<html>error</html>", { status, headers: { "Content-Type": "text/html" } }));

    const error = await captureError(createClient().delete("/api/x")) as InstanceType<ApiClientModule["ApiError"]>;

    expect(error).toBeInstanceOf(apiModule.ApiError);
    expect(error.status).toBe(status);
  });

  it("reads the error body only once", async () => {
    const response = new Response("<html>gateway</html>", { status: 502 });
    const jsonSpy = vi.spyOn(response, "json");
    const textSpy = vi.spyOn(response, "text");
    mockFetch(response);

    await captureError(createClient().get("/api/x"));

    expect(jsonSpy).not.toHaveBeenCalled();
    expect(textSpy).toHaveBeenCalledTimes(1);
  });
});

describe("apiClient successful responses and request options", () => {
  it("returns parsed JSON for a successful response", async () => {
    mockFetch(new Response(JSON.stringify({ id: 7 }), { status: 200 }));

    await expect(createClient().get<{ id: number }>("/api/x")).resolves.toEqual({ id: 7 });
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch(new Response(null, { status: 204 }));

    await expect(createClient().delete("/api/x")).resolves.toBeUndefined();
  });

  it("keeps the bearer token, method, body, content type and abort signal", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const controller = new AbortController();

    await createClient().post("/api/workflows", { name: "W" }, controller.signal);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe("https://api.example.test/api/workflows");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "W" }));
    expect(init.signal).toBe(controller.signal);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});

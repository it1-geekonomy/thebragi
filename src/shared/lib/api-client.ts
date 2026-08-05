export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const NETWORK_ERROR_MESSAGE = `Backend unreachable at ${API_URL}. Start the CRM API.`;

function isNetworkFailure(error: unknown) {
  return error instanceof TypeError || (error instanceof DOMException && error.name === "AbortError");
}

export async function apiClient<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    if (isNetworkFailure(error)) {
      throw { code: "NETWORK_ERROR", message: NETWORK_ERROR_MESSAGE, status: 0 } satisfies ApiError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let message = "Something went wrong.";
    try {
      const data = (await response.json()) as { error?: string; message?: string; code?: string };
      message = data.message ?? data.error ?? message;
      throw { code: data.code ?? "API_ERROR", message, status: response.status } satisfies ApiError;
    } catch (error) {
      if (typeof error === "object" && error && "status" in error) {
        throw error;
      }
      throw { code: "API_ERROR", message, status: response.status } satisfies ApiError;
    }
  }

  return (await response.json()) as T;
}

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export function getApiUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return `http://${host}:8080`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

export const API_URL = getApiUrl();

function isNetworkFailure(error: unknown) {
  return error instanceof TypeError || (error instanceof DOMException && error.name === "AbortError");
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message ?? "");
    if (message) return message;
  }
  return fallback;
}

export async function apiClient<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...authHeaders(),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (isNetworkFailure(error)) {
      const message = `Backend unreachable at ${getApiUrl()}. Start the CRM API.`;
      throw Object.assign(new Error(message), {
        code: "NETWORK_ERROR",
        message,
        status: 0,
      } satisfies ApiError);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let message = "Something went wrong.";
    let code = "API_ERROR";
    try {
      const data = (await response.json()) as { error?: string; message?: string; code?: string };
      message = data.message ?? data.error ?? message;
      code = data.code ?? code;
    } catch {
      // keep defaults
    }
    throw Object.assign(new Error(message), {
      code,
      message,
      status: response.status,
    } satisfies ApiError);
  }

  return (await response.json()) as T;
}

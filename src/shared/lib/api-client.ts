export type ApiError = {
  code: string;
  message: string;
  status: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

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

import { API_BASE_URL } from "./env";

interface FetchOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers = {}, ...rest } = options;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: requestHeaders,
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "Something went wrong");
  }

  return data;
}

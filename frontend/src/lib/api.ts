import { clearToken, getToken, setToken } from "./auth-storage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  database: "connected" | "disconnected";
};

export type UserRole = "STUDENT" | "ADMIN";

export type User = {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? `Ошибка ${response.status}`;
  } catch {
    return `Ошибка ${response.status}`;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const token = getToken();

    if (!token) {
      throw new ApiError("Требуется авторизация", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health", { cache: "no-store" });
}

export async function registerUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>("/auth/me", {}, true);
}

export function persistAuth(response: AuthResponse): void {
  setToken(response.token);
}

export function clearAuth(): void {
  clearToken();
}

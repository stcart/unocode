export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  database: "connected" | "disconnected";
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

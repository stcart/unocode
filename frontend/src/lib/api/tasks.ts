import { apiFetch } from "@/lib/api";
import type { TaskBoard, TaskCard, TaskCardInput } from "@/lib/types/task";

export async function fetchTaskBoard(
  cohortId: number,
  options: { weekStart?: string; showAll?: boolean } = {}
): Promise<TaskBoard> {
  const params = new URLSearchParams();

  if (options.weekStart) {
    params.set("weekStart", options.weekStart);
  }

  if (options.showAll) {
    params.set("showAll", "true");
  }

  const query = params.toString();
  const path = query
    ? `/tasks/cohort/${cohortId}?${query}`
    : `/tasks/cohort/${cohortId}`;

  return apiFetch<TaskBoard>(path, {}, true);
}

export async function saveTaskCard(
  cohortId: number,
  date: string,
  input: TaskCardInput
): Promise<{ card: TaskCard }> {
  return apiFetch(
    `/tasks/cohort/${cohortId}/${date}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    true
  );
}

export async function fetchAdminTaskBoard(
  cohortId: number,
  weekStart?: string
): Promise<TaskBoard> {
  const path = weekStart
    ? `/admin/cohorts/${cohortId}/tasks?weekStart=${weekStart}`
    : `/admin/cohorts/${cohortId}/tasks`;

  return apiFetch<TaskBoard>(path, {}, true);
}

import { apiFetch } from "@/lib/api";
import type {
  Application,
  ApplicationAnswerInput,
  PublicSurveyResponse,
  TestTaskState,
} from "@/lib/types/application";

export async function fetchPublicSurvey(
  cohortId: number
): Promise<PublicSurveyResponse> {
  return apiFetch<PublicSurveyResponse>(`/public/cohorts/${cohortId}/survey`, {
    cache: "no-store",
  });
}

export async function fetchMyApplications(): Promise<{
  applications: Application[];
}> {
  return apiFetch("/applications/me", {}, true);
}

export async function fetchMyApplicationForCohort(
  cohortId: number
): Promise<{ application: Application | null }> {
  return apiFetch(`/applications/cohort/${cohortId}`, {}, true);
}

export async function fetchApplicationPrefill(
  cohortId: number
): Promise<{ defaults: Record<number, string> }> {
  return apiFetch(`/applications/cohort/${cohortId}/prefill`, {}, true);
}

export async function submitApplication(
  cohortId: number,
  answers: ApplicationAnswerInput[]
): Promise<{ application: Application }> {
  return apiFetch(
    "/applications",
    {
      method: "POST",
      body: JSON.stringify({ cohortId, answers }),
    },
    true
  );
}

export async function fetchMyTestTask(
  cohortId: number
): Promise<{ testTask: TestTaskState }> {
  return apiFetch(`/applications/cohort/${cohortId}/test-task`, {}, true);
}

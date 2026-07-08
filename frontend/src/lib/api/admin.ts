import { API_BASE_URL, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import type {
  AdminApplication,
  AdminDocumentStudent,
  AdminReviewInput,
  AdminStudentDocumentDetail,
  ReviewApplicationInput,
} from "@/lib/types/admin";
import type {
  CohortDetail,
  CohortInput,
  CohortListItem,
  CohortRole,
  SurveyField,
  SurveyFieldInput,
  TestTask,
} from "@/lib/types/cohort";

export async function fetchCohorts(): Promise<{ cohorts: CohortListItem[] }> {
  return apiFetch("/admin/cohorts", {}, true);
}

export async function fetchCohort(
  cohortId: number
): Promise<{ cohort: CohortDetail }> {
  return apiFetch(`/admin/cohorts/${cohortId}`, {}, true);
}

export async function createCohort(
  input: CohortInput
): Promise<{ cohort: CohortDetail }> {
  return apiFetch("/admin/cohorts", {
    method: "POST",
    body: JSON.stringify(input),
  }, true);
}

export async function updateCohort(
  cohortId: number,
  input: CohortInput
): Promise<{ cohort: CohortDetail }> {
  return apiFetch(`/admin/cohorts/${cohortId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }, true);
}

export async function createSurveyField(
  cohortId: number,
  input: SurveyFieldInput
): Promise<{ surveyField: SurveyField }> {
  return apiFetch(`/admin/cohorts/${cohortId}/survey-fields`, {
    method: "POST",
    body: JSON.stringify(input),
  }, true);
}

export async function updateSurveyField(
  cohortId: number,
  fieldId: number,
  input: SurveyFieldInput
): Promise<{ surveyField: SurveyField }> {
  return apiFetch(`/admin/cohorts/${cohortId}/survey-fields/${fieldId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }, true);
}

export async function deleteSurveyField(
  cohortId: number,
  fieldId: number
): Promise<void> {
  await apiFetch(`/admin/cohorts/${cohortId}/survey-fields/${fieldId}`, {
    method: "DELETE",
  }, true);
}

export async function createCohortRole(
  cohortId: number,
  name: string
): Promise<{ role: CohortRole }> {
  return apiFetch(`/admin/cohorts/${cohortId}/roles`, {
    method: "POST",
    body: JSON.stringify({ name }),
  }, true);
}

export async function updateCohortRole(
  cohortId: number,
  roleId: number,
  name: string
): Promise<{ role: CohortRole }> {
  return apiFetch(`/admin/cohorts/${cohortId}/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  }, true);
}

export async function deleteCohortRole(
  cohortId: number,
  roleId: number
): Promise<void> {
  await apiFetch(`/admin/cohorts/${cohortId}/roles/${roleId}`, {
    method: "DELETE",
  }, true);
}

export async function saveTestTask(
  cohortId: number,
  content: string
): Promise<{ testTask: TestTask }> {
  return apiFetch(`/admin/cohorts/${cohortId}/test-task`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  }, true);
}

export async function publishTestTask(
  cohortId: number
): Promise<{ testTask: TestTask }> {
  return apiFetch(`/admin/cohorts/${cohortId}/test-task/publish`, {
    method: "POST",
  }, true);
}

export async function unpublishTestTask(
  cohortId: number
): Promise<{ testTask: TestTask }> {
  return apiFetch(`/admin/cohorts/${cohortId}/test-task/unpublish`, {
    method: "POST",
  }, true);
}

export async function fetchCohortApplications(
  cohortId: number
): Promise<{ applications: AdminApplication[] }> {
  return apiFetch(`/admin/cohorts/${cohortId}/applications`, {}, true);
}

export async function reviewApplication(
  cohortId: number,
  applicationId: number,
  input: ReviewApplicationInput
): Promise<{ application: AdminApplication }> {
  return apiFetch(
    `/admin/cohorts/${cohortId}/applications/${applicationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    true
  );
}

export async function fetchCohortDocuments(
  cohortId: number
): Promise<{ students: AdminDocumentStudent[] }> {
  return apiFetch(`/admin/cohorts/${cohortId}/documents`, {}, true);
}

export async function fetchStudentDocument(
  cohortId: number,
  userId: number
): Promise<AdminStudentDocumentDetail> {
  return apiFetch(`/admin/cohorts/${cohortId}/documents/${userId}`, {}, true);
}

export async function saveStudentReview(
  cohortId: number,
  userId: number,
  input: AdminReviewInput
): Promise<{ data: AdminStudentDocumentDetail["data"] }> {
  return apiFetch(
    `/admin/cohorts/${cohortId}/documents/${userId}/review`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    true
  );
}

export async function setReportApproval(
  cohortId: number,
  userId: number,
  approved: boolean
): Promise<{ data: AdminStudentDocumentDetail["data"] }> {
  return apiFetch(
    `/admin/cohorts/${cohortId}/documents/${userId}/report-approval`,
    {
      method: "PATCH",
      body: JSON.stringify({ approved }),
    },
    true
  );
}

export function getStudentReportUrl(cohortId: number, userId: number): string {
  return `${API_BASE_URL}/admin/cohorts/${cohortId}/documents/${userId}/report`;
}

export async function openStudentReport(
  cohortId: number,
  userId: number
): Promise<void> {
  const token = getToken();

  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(getStudentReportUrl(cohortId, userId), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Не удалось открыть отчёт");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

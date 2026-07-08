import { apiFetch } from "@/lib/api";
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

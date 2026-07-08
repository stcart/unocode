import type { Request, Response } from "express";
import {
  getCohortApplication,
  listCohortApplications,
  reviewCohortApplication,
} from "../services/admin-application.service";
import {
  getCohortStudentDocument,
  getReportFile,
  listCohortDocuments,
  saveAdminReview,
  setReportApproval,
  type AdminReviewInput,
} from "../services/admin-document.service";
import {
  createCohort,
  getCohortById,
  listCohorts,
  updateCohort,
} from "../services/cohort.service";
import {
  createSurveyField,
  deleteSurveyField,
  listSurveyFields,
  updateSurveyField,
} from "../services/survey-field.service";
import {
  createCohortRole,
  deleteCohortRole,
  listCohortRoles,
  updateCohortRole,
} from "../services/cohort-role.service";
import {
  getTestTask,
  publishTestTask,
  unpublishTestTask,
  upsertTestTask,
} from "../services/test-task.service";
import { AppError } from "../utils/app-error";
import {
  parseCohortId,
  parseEntityId,
  type CohortInput,
} from "../utils/cohort-validation";
import type { ApplicationStatus, SurveyFieldType } from "@prisma/client";

export async function getCohorts(_req: Request, res: Response): Promise<void> {
  const cohorts = await listCohorts();
  res.json({ cohorts });
}

export async function getCohort(req: Request, res: Response): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const cohort = await getCohortById(cohortId);
  res.json({ cohort });
}

export async function postCohort(req: Request, res: Response): Promise<void> {
  const cohort = await createCohort(req.body as CohortInput);
  res.status(201).json({ cohort });
}

export async function putCohort(req: Request, res: Response): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const cohort = await updateCohort(cohortId, req.body as CohortInput);
  res.json({ cohort });
}

export async function getSurveyFields(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const surveyFields = await listSurveyFields(cohortId);
  res.json({ surveyFields });
}

export async function postSurveyField(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const body = req.body as {
    label?: string;
    type?: SurveyFieldType;
    options?: string[];
    sortOrder?: number;
  };

  if (typeof body.label !== "string" || typeof body.type !== "string") {
    throw new AppError(400, "label и type обязательны");
  }

  const surveyField = await createSurveyField(cohortId, {
    label: body.label,
    type: body.type,
    options: body.options,
    sortOrder: body.sortOrder,
  });

  res.status(201).json({ surveyField });
}

export async function putSurveyField(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const fieldId = parseEntityId(req.params.fieldId, "fieldId");
  const body = req.body as {
    label?: string;
    type?: SurveyFieldType;
    options?: string[];
    sortOrder?: number;
  };

  if (typeof body.label !== "string" || typeof body.type !== "string") {
    throw new AppError(400, "label и type обязательны");
  }

  const surveyField = await updateSurveyField(cohortId, fieldId, {
    label: body.label,
    type: body.type,
    options: body.options,
    sortOrder: body.sortOrder,
  });

  res.json({ surveyField });
}

export async function removeSurveyField(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const fieldId = parseEntityId(req.params.fieldId, "fieldId");
  await deleteSurveyField(cohortId, fieldId);
  res.status(204).send();
}

export async function getRoles(req: Request, res: Response): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const roles = await listCohortRoles(cohortId);
  res.json({ roles });
}

export async function postRole(req: Request, res: Response): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const body = req.body as { name?: string };

  if (typeof body.name !== "string") {
    throw new AppError(400, "name обязателен");
  }

  const role = await createCohortRole(cohortId, body.name);
  res.status(201).json({ role });
}

export async function putRole(req: Request, res: Response): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const roleId = parseEntityId(req.params.roleId, "roleId");
  const body = req.body as { name?: string };

  if (typeof body.name !== "string") {
    throw new AppError(400, "name обязателен");
  }

  const role = await updateCohortRole(cohortId, roleId, body.name);
  res.json({ role });
}

export async function removeRole(req: Request, res: Response): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const roleId = parseEntityId(req.params.roleId, "roleId");
  await deleteCohortRole(cohortId, roleId);
  res.status(204).send();
}

export async function getCohortTestTask(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const testTask = await getTestTask(cohortId);
  res.json({ testTask });
}

export async function putCohortTestTask(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const body = req.body as { content?: string };

  if (typeof body.content !== "string") {
    throw new AppError(400, "content обязателен");
  }

  const testTask = await upsertTestTask(cohortId, body.content);
  res.json({ testTask });
}

export async function postPublishTestTask(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const testTask = await publishTestTask(cohortId);
  res.json({ testTask });
}

export async function postUnpublishTestTask(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const testTask = await unpublishTestTask(cohortId);
  res.json({ testTask });
}

export async function getCohortApplications(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const applications = await listCohortApplications(cohortId);
  res.json({ applications });
}

export async function getCohortApplicationById(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const applicationId = parseEntityId(req.params.applicationId, "applicationId");
  const application = await getCohortApplication(cohortId, applicationId);
  res.json({ application });
}

export async function patchCohortApplication(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const applicationId = parseEntityId(req.params.applicationId, "applicationId");
  const body = req.body as {
    status?: ApplicationStatus;
    reviewComment?: string | null;
    roleId?: number | null;
  };

  const application = await reviewCohortApplication(
    cohortId,
    applicationId,
    body
  );

  res.json({ application });
}

export async function getCohortDocumentsList(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const students = await listCohortDocuments(cohortId);
  res.json({ students });
}

export async function getCohortStudentDocumentByUser(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const userId = parseEntityId(req.params.userId, "userId");
  const student = await getCohortStudentDocument(cohortId, userId);
  res.json(student);
}

export async function putCohortStudentReview(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const userId = parseEntityId(req.params.userId, "userId");
  const data = await saveAdminReview(
    cohortId,
    userId,
    req.body as AdminReviewInput
  );
  res.json({ data });
}

export async function patchCohortReportApproval(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const userId = parseEntityId(req.params.userId, "userId");
  const body = req.body as { approved?: boolean };

  if (typeof body.approved !== "boolean") {
    throw new AppError(400, "approved обязателен");
  }

  const data = await setReportApproval(cohortId, userId, body.approved);
  res.json({ data });
}

export async function getCohortStudentReport(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const userId = parseEntityId(req.params.userId, "userId");
  const { buffer, filename, mimeType } = await getReportFile(cohortId, userId);

  res.setHeader("Content-Type", mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  res.send(buffer);
}

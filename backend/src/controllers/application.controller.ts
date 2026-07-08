import type { Request, Response } from "express";
import {
  getApplicantTestTask,
  getPrefillDefaults,
  getUserApplicationForCohort,
  listUserApplications,
  submitApplication,
  type ApplicationAnswerInput,
} from "../services/application.service";
import { AppError } from "../utils/app-error";
import { parseCohortId } from "../utils/cohort-validation";

export async function getMyApplications(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const applications = await listUserApplications(req.user.userId);
  res.json({ applications });
}

export async function getMyApplicationForCohort(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const application = await getUserApplicationForCohort(
    req.user.userId,
    cohortId
  );

  res.json({ application });
}

export async function getApplicationPrefill(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const prefill = await getPrefillDefaults(req.user.userId, cohortId);
  res.json(prefill);
}

export async function postApplication(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const { cohortId, answers } = req.body as {
    cohortId?: number;
    answers?: ApplicationAnswerInput[];
  };

  if (!Number.isInteger(cohortId) || !Array.isArray(answers)) {
    throw new AppError(400, "cohortId и answers обязательны");
  }

  const application = await submitApplication(
    req.user.userId,
    cohortId as number,
    answers
  );

  res.status(201).json({ application });
}

export async function getMyTestTask(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const testTask = await getApplicantTestTask(req.user.userId, cohortId);
  res.json({ testTask });
}

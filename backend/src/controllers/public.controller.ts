import type { Request, Response } from "express";
import {
  getActiveCohort,
  getPublicSurvey,
} from "../services/public-cohort.service";
import { parseCohortId } from "../utils/cohort-validation";

export async function getActivePublicCohort(
  _req: Request,
  res: Response
): Promise<void> {
  const result = await getActiveCohort();
  res.json(result);
}

export async function getPublicCohortSurvey(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const survey = await getPublicSurvey(cohortId);
  res.json(survey);
}

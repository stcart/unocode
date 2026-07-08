import type { Request, Response } from "express";
import { getPublicSurvey } from "../services/public-cohort.service";
import { parseCohortId } from "../utils/cohort-validation";

export async function getPublicCohortSurvey(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const survey = await getPublicSurvey(cohortId);
  res.json(survey);
}

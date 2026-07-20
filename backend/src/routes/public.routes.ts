import { Router } from "express";
import {
  getActivePublicCohort,
  getPublicCohortSurvey,
} from "../controllers/public.controller";
import { asyncHandler } from "../middleware/async.middleware";

const router = Router();

router.get(
  "/public/cohorts/active",
  asyncHandler(getActivePublicCohort)
);

router.get(
  "/public/cohorts/:cohortId/survey",
  asyncHandler(getPublicCohortSurvey)
);

export default router;

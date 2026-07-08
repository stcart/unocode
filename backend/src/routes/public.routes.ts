import { Router } from "express";
import { getPublicCohortSurvey } from "../controllers/public.controller";
import { asyncHandler } from "../middleware/async.middleware";

const router = Router();

router.get(
  "/public/cohorts/:cohortId/survey",
  asyncHandler(getPublicCohortSurvey)
);

export default router;

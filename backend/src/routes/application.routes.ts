import { Router } from "express";
import {
  getApplicationPrefill,
  getMyApplicationForCohort,
  getMyApplications,
  getMyTestTask,
  postApplication,
} from "../controllers/application.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { SubmitApplicationBodySchema } from "../schemas/application.schemas";

const router = Router();

router.use(requireAuth);

router.get("/applications/me", asyncHandler(getMyApplications));
router.get(
  "/applications/cohort/:cohortId",
  asyncHandler(getMyApplicationForCohort)
);
router.get(
  "/applications/cohort/:cohortId/prefill",
  asyncHandler(getApplicationPrefill)
);
router.post(
  "/applications",
  validateBody(SubmitApplicationBodySchema),
  asyncHandler(postApplication)
);
router.get(
  "/applications/cohort/:cohortId/test-task",
  asyncHandler(getMyTestTask)
);

export default router;

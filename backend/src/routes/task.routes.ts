import { Router } from "express";
import {
  getAdminTasksForCohort,
  getTasksForCohort,
  putTaskCard,
} from "../controllers/task.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { UpsertTaskCardBodySchema } from "../schemas/task.schemas";

const router = Router();

router.use(requireAuth);

router.get("/tasks/cohort/:cohortId", asyncHandler(getTasksForCohort));
router.put(
  "/tasks/cohort/:cohortId/:date",
  validateBody(UpsertTaskCardBodySchema),
  asyncHandler(putTaskCard)
);

export default router;

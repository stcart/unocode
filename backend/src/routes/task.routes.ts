import { Router } from "express";
import {
  getAdminTasksForCohort,
  getTasksForCohort,
  putTaskCard,
} from "../controllers/task.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/tasks/cohort/:cohortId", asyncHandler(getTasksForCohort));
router.put("/tasks/cohort/:cohortId/:date", asyncHandler(putTaskCard));

export default router;

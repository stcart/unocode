import { Router } from "express";
import {
  getCohort,
  getCohorts,
  getCohortTestTask,
  getRoles,
  getSurveyFields,
  postCohort,
  postPublishTestTask,
  postRole,
  postSurveyField,
  postUnpublishTestTask,
  putCohort,
  putCohortTestTask,
  putRole,
  putSurveyField,
  removeRole,
  removeSurveyField,
} from "../controllers/admin.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/admin/cohorts", asyncHandler(getCohorts));
router.post("/admin/cohorts", asyncHandler(postCohort));
router.get("/admin/cohorts/:cohortId", asyncHandler(getCohort));
router.put("/admin/cohorts/:cohortId", asyncHandler(putCohort));

router.get(
  "/admin/cohorts/:cohortId/survey-fields",
  asyncHandler(getSurveyFields)
);
router.post(
  "/admin/cohorts/:cohortId/survey-fields",
  asyncHandler(postSurveyField)
);
router.put(
  "/admin/cohorts/:cohortId/survey-fields/:fieldId",
  asyncHandler(putSurveyField)
);
router.delete(
  "/admin/cohorts/:cohortId/survey-fields/:fieldId",
  asyncHandler(removeSurveyField)
);

router.get("/admin/cohorts/:cohortId/roles", asyncHandler(getRoles));
router.post("/admin/cohorts/:cohortId/roles", asyncHandler(postRole));
router.put(
  "/admin/cohorts/:cohortId/roles/:roleId",
  asyncHandler(putRole)
);
router.delete(
  "/admin/cohorts/:cohortId/roles/:roleId",
  asyncHandler(removeRole)
);

router.get(
  "/admin/cohorts/:cohortId/test-task",
  asyncHandler(getCohortTestTask)
);
router.put(
  "/admin/cohorts/:cohortId/test-task",
  asyncHandler(putCohortTestTask)
);
router.post(
  "/admin/cohorts/:cohortId/test-task/publish",
  asyncHandler(postPublishTestTask)
);
router.post(
  "/admin/cohorts/:cohortId/test-task/unpublish",
  asyncHandler(postUnpublishTestTask)
);

export default router;

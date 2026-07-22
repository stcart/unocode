import { Router } from "express";
import {
  getCohort,
  getCohortApplicationById,
  getCohortApplications,
  getCohortDocumentsList,
  getCohortStudentDocumentByUser,
  getCohortStudentReport,
  getCohortTasks,
  getCohortTestTask,
  getCohorts,
  getRoles,
  getSurveyFields,
  patchCohortApplication,
  patchCohortReportApproval,
  postCohort,
  postPublishTestTask,
  postRole,
  postSurveyField,
  postUnpublishTestTask,
  putCohort,
  putCohortStudentReview,
  putCohortTestTask,
  putRole,
  putSurveyField,
  removeRole,
  removeSurveyField,
} from "../controllers/admin.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  AdminReviewBodySchema,
  CohortBodySchema,
  CohortRoleBodySchema,
  ReportApprovalBodySchema,
  ReviewApplicationBodySchema,
  SurveyFieldBodySchema,
  TestTaskContentBodySchema,
} from "../schemas/admin.schemas";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/admin/cohorts", asyncHandler(getCohorts));
router.post(
  "/admin/cohorts",
  validateBody(CohortBodySchema),
  asyncHandler(postCohort)
);
router.get("/admin/cohorts/:cohortId", asyncHandler(getCohort));
router.put(
  "/admin/cohorts/:cohortId",
  validateBody(CohortBodySchema),
  asyncHandler(putCohort)
);

router.get(
  "/admin/cohorts/:cohortId/survey-fields",
  asyncHandler(getSurveyFields)
);
router.post(
  "/admin/cohorts/:cohortId/survey-fields",
  validateBody(SurveyFieldBodySchema),
  asyncHandler(postSurveyField)
);
router.put(
  "/admin/cohorts/:cohortId/survey-fields/:fieldId",
  validateBody(SurveyFieldBodySchema),
  asyncHandler(putSurveyField)
);
router.delete(
  "/admin/cohorts/:cohortId/survey-fields/:fieldId",
  asyncHandler(removeSurveyField)
);

router.get("/admin/cohorts/:cohortId/roles", asyncHandler(getRoles));
router.post(
  "/admin/cohorts/:cohortId/roles",
  validateBody(CohortRoleBodySchema),
  asyncHandler(postRole)
);
router.put(
  "/admin/cohorts/:cohortId/roles/:roleId",
  validateBody(CohortRoleBodySchema),
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
  validateBody(TestTaskContentBodySchema),
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

router.get(
  "/admin/cohorts/:cohortId/applications",
  asyncHandler(getCohortApplications)
);
router.get(
  "/admin/cohorts/:cohortId/applications/:applicationId",
  asyncHandler(getCohortApplicationById)
);
router.patch(
  "/admin/cohorts/:cohortId/applications/:applicationId",
  validateBody(ReviewApplicationBodySchema),
  asyncHandler(patchCohortApplication)
);

router.get(
  "/admin/cohorts/:cohortId/documents",
  asyncHandler(getCohortDocumentsList)
);
router.get(
  "/admin/cohorts/:cohortId/documents/:userId",
  asyncHandler(getCohortStudentDocumentByUser)
);
router.put(
  "/admin/cohorts/:cohortId/documents/:userId/review",
  validateBody(AdminReviewBodySchema),
  asyncHandler(putCohortStudentReview)
);
router.patch(
  "/admin/cohorts/:cohortId/documents/:userId/report-approval",
  validateBody(ReportApprovalBodySchema),
  asyncHandler(patchCohortReportApproval)
);
router.get(
  "/admin/cohorts/:cohortId/documents/:userId/report",
  asyncHandler(getCohortStudentReport)
);

router.get(
  "/admin/cohorts/:cohortId/tasks",
  asyncHandler(getCohortTasks)
);

export default router;

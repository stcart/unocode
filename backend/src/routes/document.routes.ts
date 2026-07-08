import { Router } from "express";
import multer from "multer";
import {
  getDocumentsForCohort,
  postGenerateDocument,
  postReportUpload,
  putDocumentFields,
} from "../controllers/document.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed =
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!allowed) {
      callback(new Error("Допустимы только файлы .docx и .pdf"));
      return;
    }

    callback(null, true);
  },
});

router.use(requireAuth);

router.get("/documents/cohort/:cohortId", asyncHandler(getDocumentsForCohort));
router.put("/documents/cohort/:cohortId", asyncHandler(putDocumentFields));
router.post(
  "/documents/cohort/:cohortId/report",
  upload.single("report"),
  asyncHandler(postReportUpload)
);
router.post("/documents/:type/generate", asyncHandler(postGenerateDocument));

export default router;

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import multer, { MulterError } from "multer";
import {
  getDocumentsForCohort,
  postGenerateDocument,
  postReportUpload,
  putDocumentFields,
} from "../controllers/document.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { GenerateDocumentBodySchema, StudentDocumentFieldsBodySchema } from "../schemas/document.schemas";
import { AppError } from "../utils/app-error";
import {
  isAllowedReportExtension,
  isAllowedReportMime,
  validateReportFileContent,
} from "../utils/file-validation";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (
      isAllowedReportExtension(file.originalname) &&
      isAllowedReportMime(file.mimetype)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("Допустимы только файлы .docx и .pdf"));
  },
});

function uploadReportMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  upload.single("report")(req, res, (err) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(new AppError(400, "Файл не должен превышать 20 МБ"));
          return;
        }

        next(new AppError(400, "Некорректный файл отчёта"));
        return;
      }

      next(err instanceof Error ? new AppError(400, err.message) : err);
      return;
    }

    if (req.file) {
      try {
        validateReportFileContent(req.file.buffer, req.file.originalname);
      } catch (error) {
        next(error);
        return;
      }
    }

    next();
  });
}

const router = Router();

router.use(requireAuth);

router.get("/documents/cohort/:cohortId", asyncHandler(getDocumentsForCohort));
router.put(
  "/documents/cohort/:cohortId",
  validateBody(StudentDocumentFieldsBodySchema),
  asyncHandler(putDocumentFields)
);
router.post(
  "/documents/cohort/:cohortId/report",
  uploadReportMiddleware,
  asyncHandler(postReportUpload)
);
router.post(
  "/documents/:type/generate",
  validateBody(GenerateDocumentBodySchema),
  asyncHandler(postGenerateDocument)
);

export default router;

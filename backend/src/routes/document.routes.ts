import path from "node:path";
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
import { AppError } from "../utils/app-error";

function isAllowedReportFile(filename: string, mimetype: string): boolean {
  const ext = path.extname(filename).toLowerCase();

  if (ext !== ".pdf" && ext !== ".docx") {
    return false;
  }

  const allowedMimes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
    "application/zip",
  ]);

  return allowedMimes.has(mimetype);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (isAllowedReportFile(file.originalname, file.mimetype)) {
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

    next();
  });
}

const router = Router();

router.use(requireAuth);

router.get("/documents/cohort/:cohortId", asyncHandler(getDocumentsForCohort));
router.put("/documents/cohort/:cohortId", asyncHandler(putDocumentFields));
router.post(
  "/documents/cohort/:cohortId/report",
  uploadReportMiddleware,
  asyncHandler(postReportUpload)
);
router.post("/documents/:type/generate", asyncHandler(postGenerateDocument));

export default router;

import type { Request, Response } from "express";
import {
  generateDocument,
  getDocumentContext,
  isDocumentType,
  saveReportFile,
  saveStudentDocumentFields,
  type StudentDocumentInput,
} from "../services/document.service";
import { AppError } from "../utils/app-error";
import { parseCohortId } from "../utils/cohort-validation";

export async function getDocumentsForCohort(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const context = await getDocumentContext(req.user.userId, cohortId);
  res.json(context);
}

export async function putDocumentFields(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const body = req.body as StudentDocumentInput;
  const data = await saveStudentDocumentFields(
    req.user.userId,
    cohortId,
    body
  );

  res.json({ data });
}

export async function postGenerateDocument(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const documentType = req.params.type;

  if (!isDocumentType(documentType)) {
    throw new AppError(400, "Неизвестный тип документа");
  }

  const cohortIdRaw = req.body?.cohortId ?? req.query.cohortId;

  if (!Number.isInteger(Number(cohortIdRaw))) {
    throw new AppError(400, "cohortId обязателен");
  }

  const cohortId = Number(cohortIdRaw);
  const { buffer, filename } = await generateDocument(
    req.user.userId,
    cohortId,
    documentType
  );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  res.send(buffer);
}

export async function postReportUpload(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);

  if (!req.file) {
    throw new AppError(400, "Файл отчёта обязателен");
  }

  const data = await saveReportFile(req.user.userId, cohortId, req.file);
  res.json({ data });
}

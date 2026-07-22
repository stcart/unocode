import fs from "node:fs";
import path from "node:path";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";
import { trimOrNull } from "../utils/string";
import { inferFioFromAnswers } from "../utils/survey-answers";
import {
  computeReviewComplete,
  computeStudentFieldCompletion,
  emptyStudentDocumentFields,
  serializeAdminDocumentData,
  toStudentDocumentFields,
} from "./serializers/document.serializer";

const projectRoot = path.join(__dirname, "..", "..");

async function ensureApprovedParticipant(cohortId: number, userId: number) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    include: {
      user: { select: { id: true, email: true } },
      role: { select: { id: true, name: true } },
      answers: {
        include: {
          surveyField: { select: { label: true } },
        },
      },
    },
  });

  if (!application || application.status !== "APPROVED") {
    throw new AppError(404, "Одобренный практикант не найден в этой когорте");
  }

  return application;
}

export async function listCohortDocuments(cohortId: number) {
  await ensureCohortExists(cohortId);

  const applications = await prisma.application.findMany({
    where: { cohortId, status: "APPROVED" },
    include: {
      user: { select: { id: true, email: true } },
      role: { select: { id: true, name: true } },
      answers: {
        include: {
          surveyField: { select: { label: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const documentDataList = await prisma.studentDocumentData.findMany({
    where: {
      cohortId,
      userId: { in: applications.map((application) => application.userId) },
    },
  });

  const documentDataByUserId = new Map(
    documentDataList.map((data) => [data.userId, data])
  );

  return applications.map((application) => {
    const data = documentDataByUserId.get(application.userId);
    const displayName =
      data?.studentFio ??
      inferFioFromAnswers(application.answers) ??
      application.user.email;

    const fields = data
      ? toStudentDocumentFields(data)
      : emptyStudentDocumentFields();

    const studentFieldCompletion = computeStudentFieldCompletion(fields);
    const reviewComplete = data ? computeReviewComplete(data) : false;

    return {
      userId: application.userId,
      email: application.user.email,
      displayName,
      role: application.role,
      studentFieldCompletion,
      reviewComplete,
      hasReport: Boolean(data?.reportFileUrl),
      reportAdminApproved: data?.reportAdminApproved ?? false,
    };
  });
}

export async function getCohortStudentDocument(
  cohortId: number,
  userId: number
) {
  const application = await ensureApprovedParticipant(cohortId, userId);

  let data = await prisma.studentDocumentData.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!data) {
    data = await prisma.studentDocumentData.create({
      data: { userId, cohortId },
    });
  }

  const displayName =
    data.studentFio ??
    inferFioFromAnswers(application.answers) ??
    application.user.email;

  return {
    displayName,
    email: application.user.email,
    role: application.role,
    data: serializeAdminDocumentData(data),
  };
}

export type AdminReviewInput = {
  reviewActivities?: string | null;
  reviewCharacteristic?: string | null;
  reviewEmployed?: string | null;
  reviewNextPractice?: string | null;
  reviewEmploymentOffer?: string | null;
  reviewSuggestions?: string | null;
  reviewGrade?: string | null;
};

const REVIEW_FIELDS: (keyof AdminReviewInput)[] = [
  "reviewActivities",
  "reviewCharacteristic",
  "reviewEmployed",
  "reviewNextPractice",
  "reviewEmploymentOffer",
  "reviewSuggestions",
  "reviewGrade",
];

export async function saveAdminReview(
  cohortId: number,
  userId: number,
  input: AdminReviewInput
) {
  await ensureApprovedParticipant(cohortId, userId);

  const existing = await prisma.studentDocumentData.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!existing) {
    await prisma.studentDocumentData.create({
      data: { userId, cohortId },
    });
  }

  const updateData: Record<string, string | null> = {};

  for (const field of REVIEW_FIELDS) {
    if (field in input) {
      updateData[field] = trimOrNull(input[field]);
    }
  }

  const updated = await prisma.studentDocumentData.update({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    data: updateData,
  });

  return serializeAdminDocumentData(updated);
}

export async function setReportApproval(
  cohortId: number,
  userId: number,
  approved: boolean
) {
  await ensureApprovedParticipant(cohortId, userId);

  const data = await prisma.studentDocumentData.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!data?.reportFileUrl) {
    throw new AppError(400, "Практикант ещё не загрузил отчёт");
  }

  const updated = await prisma.studentDocumentData.update({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    data: { reportAdminApproved: approved },
  });

  return serializeAdminDocumentData(updated);
}

export async function getReportFile(
  cohortId: number,
  userId: number
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  await ensureApprovedParticipant(cohortId, userId);

  const data = await prisma.studentDocumentData.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    select: { reportFileUrl: true },
  });

  if (!data?.reportFileUrl) {
    throw new AppError(404, "Отчёт не загружен");
  }

  const absolutePath = path.join(projectRoot, data.reportFileUrl);

  if (!fs.existsSync(absolutePath)) {
    throw new AppError(404, "Файл отчёта не найден на сервере");
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType =
    ext === ".pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return {
    buffer: fs.readFileSync(absolutePath),
    filename: path.basename(absolutePath),
    mimeType,
  };
}

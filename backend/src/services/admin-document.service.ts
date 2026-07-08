import fs from "node:fs";
import path from "node:path";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";
import {
  areStudentFieldsComplete,
  type StudentDocumentFields,
} from "../utils/can-generate";
import type { DocumentType } from "../utils/document.constants";
import { DOCUMENT_TYPES } from "../utils/document.constants";

const projectRoot = path.join(__dirname, "..", "..");

function trimOrNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStudentDocumentFields(data: {
  studentFio: string | null;
  group: string | null;
  directionCode: string | null;
  directionName: string | null;
  programName: string | null;
  specialty: string | null;
  practiceTopic: string | null;
  mainStageTasks: string | null;
  reviewActivities: string | null;
  reviewCharacteristic: string | null;
  reviewEmployed: string | null;
  reviewNextPractice: string | null;
  reviewEmploymentOffer: string | null;
  reviewSuggestions: string | null;
  reviewGrade: string | null;
  reportFileUrl: string | null;
  reportAdminApproved: boolean;
}): StudentDocumentFields {
  return {
    studentFio: data.studentFio,
    group: data.group,
    directionCode: data.directionCode,
    directionName: data.directionName,
    programName: data.programName,
    specialty: data.specialty,
    practiceTopic: data.practiceTopic,
    mainStageTasks: data.mainStageTasks,
    reviewActivities: data.reviewActivities,
    reviewCharacteristic: data.reviewCharacteristic,
    reviewEmployed: data.reviewEmployed,
    reviewNextPractice: data.reviewNextPractice,
    reviewEmploymentOffer: data.reviewEmploymentOffer,
    reviewSuggestions: data.reviewSuggestions,
    reviewGrade: data.reviewGrade,
    reportFileUrl: data.reportFileUrl,
    reportAdminApproved: data.reportAdminApproved,
  };
}

function inferFioFromAnswers(
  answers: Array<{ value: string; surveyField: { label: string } }>
): string | null {
  for (const answer of answers) {
    const label = answer.surveyField.label.trim().toLowerCase();
    if (label.includes("фио") || label === "ф.и.о.") {
      return answer.value.trim() || null;
    }
  }
  return null;
}

function serializeDocumentData(data: {
  id: number;
  userId: number;
  cohortId: number;
  studentFio: string | null;
  group: string | null;
  directionCode: string | null;
  directionName: string | null;
  programName: string | null;
  specialty: string | null;
  practiceTopic: string | null;
  mainStageTasks: string | null;
  reviewActivities: string | null;
  reviewCharacteristic: string | null;
  reviewEmployed: string | null;
  reviewNextPractice: string | null;
  reviewEmploymentOffer: string | null;
  reviewSuggestions: string | null;
  reviewGrade: string | null;
  reportFileUrl: string | null;
  reportAdminApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const fields = toStudentDocumentFields(data);
  const studentFieldCompletion = Object.fromEntries(
    DOCUMENT_TYPES.map((type) => [
      type,
      areStudentFieldsComplete(type, fields),
    ])
  ) as Record<DocumentType, boolean>;

  const reviewComplete = [
    data.reviewActivities,
    data.reviewCharacteristic,
    data.reviewEmployed,
    data.reviewNextPractice,
    data.reviewEmploymentOffer,
    data.reviewSuggestions,
    data.reviewGrade,
  ].every((value) => typeof value === "string" && value.trim().length > 0);

  return {
    id: data.id,
    userId: data.userId,
    cohortId: data.cohortId,
    studentFio: data.studentFio,
    group: data.group,
    directionCode: data.directionCode,
    directionName: data.directionName,
    programName: data.programName,
    specialty: data.specialty,
    practiceTopic: data.practiceTopic,
    mainStageTasks: data.mainStageTasks,
    reviewActivities: data.reviewActivities,
    reviewCharacteristic: data.reviewCharacteristic,
    reviewEmployed: data.reviewEmployed,
    reviewNextPractice: data.reviewNextPractice,
    reviewEmploymentOffer: data.reviewEmploymentOffer,
    reviewSuggestions: data.reviewSuggestions,
    reviewGrade: data.reviewGrade,
    reportFileUrl: data.reportFileUrl,
    reportAdminApproved: data.reportAdminApproved,
    hasReport: Boolean(data.reportFileUrl),
    reviewComplete,
    studentFieldCompletion,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
}

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
      : ({
          studentFio: null,
          group: null,
          directionCode: null,
          directionName: null,
          programName: null,
          specialty: null,
          practiceTopic: null,
          mainStageTasks: null,
          reviewActivities: null,
          reviewCharacteristic: null,
          reviewEmployed: null,
          reviewNextPractice: null,
          reviewEmploymentOffer: null,
          reviewSuggestions: null,
          reviewGrade: null,
          reportFileUrl: null,
          reportAdminApproved: false,
        } satisfies StudentDocumentFields);

    const studentFieldCompletion = Object.fromEntries(
      DOCUMENT_TYPES.map((type) => [
        type,
        areStudentFieldsComplete(type, fields),
      ])
    ) as Record<DocumentType, boolean>;

    const reviewComplete = data
      ? [
          data.reviewActivities,
          data.reviewCharacteristic,
          data.reviewEmployed,
          data.reviewNextPractice,
          data.reviewEmploymentOffer,
          data.reviewSuggestions,
          data.reviewGrade,
        ].every((value) => typeof value === "string" && value.trim().length > 0)
      : false;

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
    data: serializeDocumentData(data),
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

  return serializeDocumentData(updated);
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

  return serializeDocumentData(updated);
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

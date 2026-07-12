import fs from "node:fs";
import path from "node:path";
import type { ApplicationStatus } from "@prisma/client";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import {
  areStudentFieldsComplete,
  canGenerate,
  type StudentDocumentFields,
} from "../utils/can-generate";
import {
  DOCUMENT_STATIC_FIELDS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES,
  type DocumentType,
  formatCityYear,
  formatDateRu,
  TEMPLATE_FILES,
} from "../utils/document.constants";
import { formatDateOnly } from "../utils/dates";

export type StudentDocumentInput = {
  studentFio?: string | null;
  group?: string | null;
  directionCode?: string | null;
  directionName?: string | null;
  programName?: string | null;
  specialty?: string | null;
  practiceTopic?: string | null;
  mainStageTasks?: string | null;
  supervisorUrfuName?: string | null;
};

const STUDENT_EDITABLE_FIELDS: (keyof StudentDocumentInput)[] = [
  "studentFio",
  "group",
  "directionCode",
  "directionName",
  "programName",
  "specialty",
  "practiceTopic",
  "mainStageTasks",
  "supervisorUrfuName",
];

const projectRoot = path.join(__dirname, "..", "..");
const templatesDir = path.join(projectRoot, "templates");
const uploadsDir = path.join(projectRoot, "uploads", "reports");

function trimOrNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
  supervisorUrfuName: string | null;
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
    supervisorUrfuName: data.supervisorUrfuName,
    reviewActivities: data.reviewActivities,
    reviewCharacteristic: data.reviewCharacteristic,
    reviewEmployed: data.reviewEmployed,
    reviewNextPractice: data.reviewNextPractice,
    reviewEmploymentOffer: data.reviewEmploymentOffer,
    reviewSuggestions: data.reviewSuggestions,
    reviewGrade: data.reviewGrade,
    reportFileUrl: data.reportFileUrl,
    reportAdminApproved: data.reportAdminApproved,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
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
  supervisorUrfuName: string | null;
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
    supervisorUrfuName: data.supervisorUrfuName,
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

async function inferPrefillFromApplication(userId: number, cohortId: number) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    include: {
      answers: {
        include: {
          surveyField: {
            select: { label: true },
          },
        },
      },
    },
  });

  if (!application) {
    return {};
  }

  const prefill: StudentDocumentInput = {};

  for (const answer of application.answers) {
    const label = answer.surveyField.label.trim().toLowerCase();

    if (label.includes("фио") || label === "ф.и.о.") {
      prefill.studentFio ??= answer.value.trim();
    } else if (label.includes("групп")) {
      prefill.group ??= answer.value.trim();
    }
  }

  return prefill;
}

async function ensureDocumentData(userId: number, cohortId: number) {
  const existing = await prisma.studentDocumentData.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (existing) {
    return existing;
  }

  const prefill = await inferPrefillFromApplication(userId, cohortId);

  return prisma.studentDocumentData.create({
    data: {
      userId,
      cohortId,
      studentFio: trimOrNull(prefill.studentFio),
      group: trimOrNull(prefill.group),
      directionCode: trimOrNull(prefill.directionCode),
      directionName: trimOrNull(prefill.directionName),
      programName: trimOrNull(prefill.programName),
      specialty: trimOrNull(prefill.specialty),
      practiceTopic: trimOrNull(prefill.practiceTopic),
      mainStageTasks: trimOrNull(prefill.mainStageTasks),
    },
  });
}

async function getApplicationStatus(
  userId: number,
  cohortId: number
): Promise<ApplicationStatus | null> {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    select: { status: true },
  });

  return application?.status ?? null;
}

export async function getDocumentContext(userId: number, cohortId: number) {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: {
      id: true,
      name: true,
      practiceStart: true,
      practiceEnd: true,
    },
  });

  if (!cohort) {
    throw new AppError(404, "Когорта не найдена");
  }

  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    select: { status: true },
  });

  if (!application) {
    throw new AppError(403, "Документы доступны только после подачи заявки");
  }

  const data = await ensureDocumentData(userId, cohortId);
  const fields = toStudentDocumentFields(data);
  const availability = Object.fromEntries(
    DOCUMENT_TYPES.map((type) => [
      type,
      canGenerate(type, fields, {
        applicationStatus: application.status,
      }),
    ])
  ) as Record<DocumentType, ReturnType<typeof canGenerate>>;

  const studentFieldCompletion = Object.fromEntries(
    DOCUMENT_TYPES.map((type) => [
      type,
      areStudentFieldsComplete(type, fields),
    ])
  ) as Record<DocumentType, boolean>;

  return {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      practiceStart: formatDateOnly(cohort.practiceStart),
      practiceEnd: formatDateOnly(cohort.practiceEnd),
    },
    applicationStatus: application.status,
    data: serializeDocumentData(data),
    availability,
    studentFieldCompletion,
  };
}

export async function saveStudentDocumentFields(
  userId: number,
  cohortId: number,
  input: StudentDocumentInput
) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!application) {
    throw new AppError(403, "Документы доступны только после подачи заявки");
  }

  await ensureDocumentData(userId, cohortId);

  const updateData: Record<string, string | null> = {};

  for (const field of STUDENT_EDITABLE_FIELDS) {
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

function buildTemplateData(
  data: StudentDocumentFields,
  cohort: { name: string; practiceStart: Date; practiceEnd: Date }
) {
  return {
    ...DOCUMENT_STATIC_FIELDS,
    student_fio: data.studentFio ?? "",
    group: data.group ?? "",
    direction_code: data.directionCode ?? "",
    direction_name: data.directionName ?? "",
    program_name: data.programName ?? "",
    specialty: data.specialty ?? "",
    practice_topic: data.practiceTopic ?? "",
    main_stage_tasks: data.mainStageTasks ?? "",
    supervisor_urfu_name: data.supervisorUrfuName ?? "",
    practice_start: formatDateRu(cohort.practiceStart),
    practice_end: formatDateRu(cohort.practiceEnd),
    review_activities: data.reviewActivities ?? "",
    review_characteristic: data.reviewCharacteristic ?? "",
    review_employed: data.reviewEmployed ?? "",
    review_next_practice: data.reviewNextPractice ?? "",
    review_employment_offer: data.reviewEmploymentOffer ?? "",
    review_suggestions: data.reviewSuggestions ?? "",
    review_grade: data.reviewGrade ?? "",
    city_year: formatCityYear(cohort.name),
  };
}

export async function generateDocument(
  userId: number,
  cohortId: number,
  documentType: DocumentType
): Promise<{ buffer: Buffer; filename: string }> {
  if (!DOCUMENT_TYPES.includes(documentType)) {
    throw new AppError(400, "Неизвестный тип документа");
  }

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: {
      id: true,
      name: true,
      practiceStart: true,
      practiceEnd: true,
    },
  });

  if (!cohort) {
    throw new AppError(404, "Когорта не найдена");
  }

  const applicationStatus = await getApplicationStatus(userId, cohortId);

  if (!applicationStatus) {
    throw new AppError(403, "Документы доступны только после подачи заявки");
  }

  const data = await ensureDocumentData(userId, cohortId);
  const fields = toStudentDocumentFields(data);
  const availability = canGenerate(documentType, fields, {
    applicationStatus,
  });

  if (!availability.canGenerate) {
    const reason =
      availability.blockedReason ??
      `Заполните поля: ${availability.missingStudentFields.join(", ")}`;
    throw new AppError(400, reason);
  }

  const templatePath = path.join(templatesDir, TEMPLATE_FILES[documentType]);

  if (!fs.existsSync(templatePath)) {
    throw new AppError(500, "Шаблон документа не найден");
  }

  const templateContent = fs.readFileSync(templatePath);
  const zip = new PizZip(templateContent);

  let doc: Docxtemplater;

  try {
    doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
    });
    doc.render(buildTemplateData(fields, cohort));
  } catch (err) {
    console.error("Ошибка формирования документа:", err);
    throw new AppError(500, "Не удалось сформировать документ");
  }

  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  const safeName = DOCUMENT_TYPE_LABELS[documentType]
    .replace(/\s+/g, "_")
    .toLowerCase();

  return {
    buffer,
    filename: `${safeName}_${cohort.name}.docx`,
  };
}

export async function saveReportFile(
  userId: number,
  cohortId: number,
  file: Express.Multer.File
) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!application) {
    throw new AppError(403, "Загрузка отчёта доступна только после подачи заявки");
  }

  if (application.status !== "APPROVED") {
    throw new AppError(400, "Загрузка отчёта доступна после одобрения заявки");
  }

  await ensureDocumentData(userId, cohortId);

  const existing = await prisma.studentDocumentData.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    select: { reportFileUrl: true },
  });

  if (existing?.reportFileUrl) {
    const previousPath = path.join(projectRoot, existing.reportFileUrl);
    if (fs.existsSync(previousPath)) {
      fs.unlinkSync(previousPath);
    }
  }

  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".pdf" && ext !== ".docx") {
    throw new AppError(400, "Допустимы только файлы .docx и .pdf");
  }

  const targetDir = path.join(uploadsDir, String(cohortId), String(userId));
  fs.mkdirSync(targetDir, { recursive: true });

  const relativePath = path.posix.join(
    "uploads",
    "reports",
    String(cohortId),
    String(userId),
    `report${ext}`
  );
  const absolutePath = path.join(projectRoot, relativePath);

  fs.writeFileSync(absolutePath, file.buffer);

  const updated = await prisma.studentDocumentData.update({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    data: {
      reportFileUrl: relativePath,
      reportAdminApproved: false,
    },
  });

  return serializeDocumentData(updated);
}

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}

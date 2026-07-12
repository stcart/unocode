import type { ApplicationStatus } from "@prisma/client";
import type { DocumentType } from "./document.constants";

export type StudentDocumentFields = {
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
};

export type CanGenerateContext = {
  applicationStatus: ApplicationStatus | null;
};

export type CanGenerateResult = {
  canGenerate: boolean;
  missingStudentFields: string[];
  blockedReason: string | null;
};

const STUDENT_FIELD_LABELS: Record<string, string> = {
  studentFio: "ФИО студента",
  group: "Группа",
  directionCode: "Код направления",
  directionName: "Наименование направления",
  programName: "Образовательная программа",
  specialty: "Специальность",
  practiceTopic: "Тема практики",
  mainStageTasks: "Перечень работ основного этапа",
  supervisorUrfuName: "Руководитель практики от УрФУ",
};

const REQUIRED_STUDENT_FIELDS: Record<DocumentType, (keyof StudentDocumentFields)[]> =
  {
    "individual-task": [
      "studentFio",
      "group",
      "directionCode",
      "directionName",
      "programName",
      "practiceTopic",
      "mainStageTasks",
      "supervisorUrfuName",
    ],
    review: ["studentFio", "group"],
    "title-page": ["studentFio", "group", "specialty", "practiceTopic"],
  };

const REVIEW_FIELDS: (keyof StudentDocumentFields)[] = [
  "reviewActivities",
  "reviewCharacteristic",
  "reviewEmployed",
  "reviewNextPractice",
  "reviewEmploymentOffer",
  "reviewSuggestions",
  "reviewGrade",
];

function isFilled(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function getMissingStudentFields(
  documentType: DocumentType,
  data: StudentDocumentFields
): string[] {
  return REQUIRED_STUDENT_FIELDS[documentType]
    .filter((field) => !isFilled(data[field] as string | null))
    .map((field) => STUDENT_FIELD_LABELS[field] ?? field);
}

function checkAdditionalCondition(
  documentType: DocumentType,
  data: StudentDocumentFields,
  context: CanGenerateContext
): string | null {
  if (documentType === "individual-task") {
    if (context.applicationStatus !== "APPROVED") {
      return "Документ доступен после одобрения заявки";
    }
    return null;
  }

  if (documentType === "review") {
    const allReviewFilled = REVIEW_FIELDS.every((field) =>
      isFilled(data[field] as string | null)
    );

    if (!allReviewFilled) {
      return "Отзыв ещё не заполнен администратором";
    }

    return null;
  }

  if (!isFilled(data.reportFileUrl)) {
    return "Сначала загрузите отчёт о практике";
  }

  if (!data.reportAdminApproved) {
    return "Администратор ещё не допустил к скачиванию титульного листа";
  }

  return null;
}

export function canGenerate(
  documentType: DocumentType,
  data: StudentDocumentFields,
  context: CanGenerateContext
): CanGenerateResult {
  const missingStudentFields = getMissingStudentFields(documentType, data);
  const blockedReason = checkAdditionalCondition(documentType, data, context);

  return {
    canGenerate: missingStudentFields.length === 0 && blockedReason === null,
    missingStudentFields,
    blockedReason,
  };
}

export function areStudentFieldsComplete(
  documentType: DocumentType,
  data: StudentDocumentFields
): boolean {
  return getMissingStudentFields(documentType, data).length === 0;
}

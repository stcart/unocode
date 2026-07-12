import type { ApplicationStatus } from "@/lib/types/application";
import type {
  CanGenerateResult,
  DocumentType,
  StudentDocumentData,
} from "@/lib/types/document";

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

const REQUIRED_STUDENT_FIELDS: Record<
  DocumentType,
  (keyof StudentDocumentData)[]
> = {
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

const REVIEW_FIELDS: (keyof StudentDocumentData)[] = [
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
  data: StudentDocumentData
): string[] {
  return REQUIRED_STUDENT_FIELDS[documentType]
    .filter((field) => !isFilled(data[field] as string | null))
    .map((field) => STUDENT_FIELD_LABELS[field] ?? field);
}

function checkAdditionalCondition(
  documentType: DocumentType,
  data: StudentDocumentData,
  applicationStatus: ApplicationStatus
): string | null {
  if (documentType === "individual-task") {
    if (applicationStatus !== "APPROVED") {
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
  data: StudentDocumentData,
  applicationStatus: ApplicationStatus
): CanGenerateResult {
  const missingStudentFields = getMissingStudentFields(documentType, data);
  const blockedReason = checkAdditionalCondition(
    documentType,
    data,
    applicationStatus
  );

  return {
    canGenerate: missingStudentFields.length === 0 && blockedReason === null,
    missingStudentFields,
    blockedReason,
  };
}

export const DOCUMENT_TYPES = [
  "individual-task",
  "review",
  "title-page",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  "individual-task": "Индивидуальное задание",
  review: "Отзыв о практике",
  "title-page": "Титульный лист отчёта",
};

export type StudentDocumentData = {
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
  createdAt: string;
  updatedAt: string;
};

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

export type CanGenerateResult = {
  canGenerate: boolean;
  missingStudentFields: string[];
  blockedReason: string | null;
};

export type DocumentContext = {
  cohort: {
    id: number;
    name: string;
    practiceStart: string;
    practiceEnd: string;
  };
  applicationStatus: "PENDING" | "APPROVED" | "REJECTED";
  data: StudentDocumentData;
  availability: Record<DocumentType, CanGenerateResult>;
  studentFieldCompletion: Record<DocumentType, boolean>;
};

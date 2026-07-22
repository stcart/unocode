import {
  areStudentFieldsComplete,
  type StudentDocumentFields,
} from "../../utils/can-generate";
import type { DocumentType } from "../../utils/document.constants";
import { DOCUMENT_TYPES } from "../../utils/document.constants";

export type DocumentDataRecord = {
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
};

export function toStudentDocumentFields(
  data: Pick<
    DocumentDataRecord,
    | "studentFio"
    | "group"
    | "directionCode"
    | "directionName"
    | "programName"
    | "specialty"
    | "practiceTopic"
    | "mainStageTasks"
    | "supervisorUrfuName"
    | "reviewActivities"
    | "reviewCharacteristic"
    | "reviewEmployed"
    | "reviewNextPractice"
    | "reviewEmploymentOffer"
    | "reviewSuggestions"
    | "reviewGrade"
    | "reportFileUrl"
    | "reportAdminApproved"
  >
): StudentDocumentFields {
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

export function computeReviewComplete(data: {
  reviewActivities: string | null;
  reviewCharacteristic: string | null;
  reviewEmployed: string | null;
  reviewNextPractice: string | null;
  reviewEmploymentOffer: string | null;
  reviewSuggestions: string | null;
  reviewGrade: string | null;
}): boolean {
  return [
    data.reviewActivities,
    data.reviewCharacteristic,
    data.reviewEmployed,
    data.reviewNextPractice,
    data.reviewEmploymentOffer,
    data.reviewSuggestions,
    data.reviewGrade,
  ].every((value) => typeof value === "string" && value.trim().length > 0);
}

export function computeStudentFieldCompletion(
  fields: StudentDocumentFields
): Record<DocumentType, boolean> {
  return Object.fromEntries(
    DOCUMENT_TYPES.map((type) => [type, areStudentFieldsComplete(type, fields)])
  ) as Record<DocumentType, boolean>;
}

export function serializeStudentDocumentData(data: DocumentDataRecord) {
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

export function serializeAdminDocumentData(data: DocumentDataRecord) {
  const fields = toStudentDocumentFields(data);

  return {
    ...serializeStudentDocumentData(data),
    hasReport: Boolean(data.reportFileUrl),
    reviewComplete: computeReviewComplete(data),
    studentFieldCompletion: computeStudentFieldCompletion(fields),
  };
}

export function emptyStudentDocumentFields(): StudentDocumentFields {
  return {
    studentFio: null,
    group: null,
    directionCode: null,
    directionName: null,
    programName: null,
    specialty: null,
    practiceTopic: null,
    mainStageTasks: null,
    supervisorUrfuName: null,
    reviewActivities: null,
    reviewCharacteristic: null,
    reviewEmployed: null,
    reviewNextPractice: null,
    reviewEmploymentOffer: null,
    reviewSuggestions: null,
    reviewGrade: null,
    reportFileUrl: null,
    reportAdminApproved: false,
  };
}

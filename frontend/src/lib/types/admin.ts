import type { ApplicationStatus } from "@/lib/types/application";
import type { DocumentType } from "@/lib/types/document";

export type AdminApplication = {
  id: number;
  userId: number;
  cohortId: number;
  status: ApplicationStatus;
  statusLabel: string;
  reviewComment: string | null;
  roleId: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
  };
  role: {
    id: number;
    name: string;
  } | null;
  answers: Array<{
    surveyFieldId: number;
    label: string;
    type: string;
    value: string;
  }>;
};

export type AdminDocumentStudent = {
  userId: number;
  email: string;
  displayName: string;
  role: {
    id: number;
    name: string;
  } | null;
  studentFieldCompletion: Record<DocumentType, boolean>;
  reviewComplete: boolean;
  hasReport: boolean;
  reportAdminApproved: boolean;
};

export type AdminStudentDocumentData = {
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
  hasReport: boolean;
  reviewComplete: boolean;
  studentFieldCompletion: Record<DocumentType, boolean>;
  createdAt: string;
  updatedAt: string;
};

export type AdminStudentDocumentDetail = {
  displayName: string;
  email: string;
  role: {
    id: number;
    name: string;
  } | null;
  data: AdminStudentDocumentData;
};

export type AdminReviewInput = {
  reviewActivities?: string | null;
  reviewCharacteristic?: string | null;
  reviewEmployed?: string | null;
  reviewNextPractice?: string | null;
  reviewEmploymentOffer?: string | null;
  reviewSuggestions?: string | null;
  reviewGrade?: string | null;
};

export type ReviewApplicationInput = {
  status?: ApplicationStatus;
  reviewComment?: string | null;
  roleId?: number | null;
};

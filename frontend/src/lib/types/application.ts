import type { SurveyFieldType } from "@/lib/types/cohort";

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PublicSurveyField = {
  id: number;
  label: string;
  type: SurveyFieldType;
  options: string[];
  sortOrder: number;
};

export type PublicSurveyResponse = {
  cohort: {
    id: number;
    name: string;
    applicationStart: string;
    applicationEnd: string;
    practiceStart: string;
    practiceEnd: string;
    isApplicationOpen: boolean;
  };
  surveyFields: PublicSurveyField[];
};

export type ApplicationAnswer = {
  surveyFieldId: number;
  label: string;
  type: SurveyFieldType;
  value: string;
};

export type Application = {
  id: number;
  cohortId: number;
  status: ApplicationStatus;
  statusLabel: string;
  reviewComment: string | null;
  createdAt: string;
  updatedAt: string;
  cohort: {
    id: number;
    name: string;
  };
  answers: ApplicationAnswer[];
};

export type TestTaskState =
  | { state: "not_configured" }
  | { state: "not_published" }
  | {
      state: "available";
      content: string;
      publishedAt: string;
    };

export type ApplicationAnswerInput = {
  surveyFieldId: number;
  value: string;
};

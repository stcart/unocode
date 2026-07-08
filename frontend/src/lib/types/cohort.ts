export type SurveyFieldType = "TEXT" | "LONG_TEXT" | "SELECT";

export type CohortInput = {
  name: string;
  applicationStart: string;
  applicationEnd: string;
  practiceStart: string;
  practiceEnd: string;
};

export type SurveyField = {
  id: number;
  cohortId: number;
  label: string;
  type: SurveyFieldType;
  options: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CohortRole = {
  id: number;
  cohortId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TestTask = {
  id: number;
  cohortId: number;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CohortListItem = CohortInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
  testTaskPublished: boolean;
  applicationsCount: number;
  surveyFieldsCount: number;
  cohortRolesCount: number;
};

export type CohortDetail = CohortInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
  surveyFields: SurveyField[];
  cohortRoles: CohortRole[];
  testTask: TestTask | null;
  applicationsCount: number;
};

export type SurveyFieldInput = {
  label: string;
  type: SurveyFieldType;
  options?: string[];
  sortOrder?: number;
};

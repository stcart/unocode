import type { ApplicationStatus } from "@prisma/client";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "На рассмотрении",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
};

type ApplicationAnswerRecord = {
  surveyFieldId: number;
  value: string;
  surveyField: { label: string; type: string };
};

export function serializeApplicationAnswers(answers: ApplicationAnswerRecord[]) {
  return answers.map((answer) => ({
    surveyFieldId: answer.surveyFieldId,
    label: answer.surveyField.label,
    type: answer.surveyField.type,
    value: answer.value,
  }));
}

export function serializeApplicationBase(application: {
  id: number;
  cohortId: number;
  status: ApplicationStatus;
  reviewComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  answers: ApplicationAnswerRecord[];
}) {
  return {
    id: application.id,
    cohortId: application.cohortId,
    status: application.status,
    statusLabel: APPLICATION_STATUS_LABELS[application.status],
    reviewComment: application.reviewComment,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    answers: serializeApplicationAnswers(application.answers),
  };
}

export function serializeStudentApplication(application: {
  id: number;
  cohortId: number;
  status: ApplicationStatus;
  reviewComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  cohort: { id: number; name: string };
  answers: ApplicationAnswerRecord[];
}) {
  return {
    ...serializeApplicationBase(application),
    cohort: application.cohort,
  };
}

export function serializeAdminApplication(application: {
  id: number;
  userId: number;
  cohortId: number;
  status: ApplicationStatus;
  reviewComment: string | null;
  roleId: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: number; email: string };
  role: { id: number; name: string } | null;
  answers: ApplicationAnswerRecord[];
}) {
  return {
    ...serializeApplicationBase(application),
    userId: application.userId,
    roleId: application.roleId,
    user: application.user,
    role: application.role,
  };
}

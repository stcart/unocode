import type { ApplicationStatus, SurveyField } from "@prisma/client";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import {
  getPublicSurvey,
  isApplicationPeriodOpen,
} from "./public-cohort.service";
import { serializeStudentApplication } from "./serializers/application.serializer";

export type ApplicationAnswerInput = {
  surveyFieldId: number;
  value: string;
};

const applicationInclude = {
  cohort: {
    select: { id: true, name: true },
  },
  answers: {
    include: {
      surveyField: {
        select: { label: true, type: true },
      },
    },
  },
} as const;

export async function listUserApplications(userId: number) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });

  return applications.map(serializeStudentApplication);
}

export async function getUserApplicationForCohort(
  userId: number,
  cohortId: number
) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
    include: applicationInclude,
  });

  if (!application) {
    return null;
  }

  return serializeStudentApplication(application);
}

export async function getPrefillDefaults(userId: number, cohortId: number) {
  await getPublicSurvey(cohortId);

  const currentFields = await prisma.surveyField.findMany({
    where: { cohortId },
    orderBy: { sortOrder: "asc" },
  });

  const previousAnswers = await prisma.applicationAnswer.findMany({
    where: {
      application: { userId },
    },
    include: {
      surveyField: {
        select: { label: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const defaults: Record<number, string> = {};

  for (const field of currentFields) {
    const normalizedLabel = field.label.trim().toLowerCase();
    const match = previousAnswers.find(
      (answer) =>
        answer.surveyField.label.trim().toLowerCase() === normalizedLabel
    );

    if (match) {
      defaults[field.id] = match.value;
    }
  }

  return { defaults };
}

function validateAnswers(
  surveyFields: SurveyField[],
  answers: ApplicationAnswerInput[]
): ApplicationAnswerInput[] {
  if (surveyFields.length === 0) {
    throw new AppError(400, "Анкета для этой когорты ещё не настроена");
  }

  const answersByFieldId = new Map<number, string>();

  for (const answer of answers) {
    if (
      !Number.isInteger(answer.surveyFieldId) ||
      answer.surveyFieldId <= 0
    ) {
      throw new AppError(400, "Некорректный ID поля анкеты");
    }

    const value = answer.value.trim();

    if (!value) {
      throw new AppError(400, "Все поля анкеты обязательны для заполнения");
    }

    answersByFieldId.set(answer.surveyFieldId, value);
  }

  const validatedAnswers: ApplicationAnswerInput[] = [];

  for (const field of surveyFields) {
    const value = answersByFieldId.get(field.id);

    if (!value) {
      throw new AppError(400, `Заполните поле «${field.label}»`);
    }

    if (field.type === "SELECT" && !field.options.includes(value)) {
      throw new AppError(400, `Некорректное значение для поля «${field.label}»`);
    }

    validatedAnswers.push({
      surveyFieldId: field.id,
      value,
    });
  }

  return validatedAnswers;
}

export async function submitApplication(
  userId: number,
  cohortId: number,
  answers: ApplicationAnswerInput[]
) {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      surveyFields: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!cohort) {
    throw new AppError(404, "Когорта не найдена");
  }

  if (!isApplicationPeriodOpen(cohort.applicationStart, cohort.applicationEnd)) {
    throw new AppError(400, "Приём заявок для этой когорты сейчас закрыт");
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (existingApplication) {
    throw new AppError(409, "Вы уже подали заявку в эту когорту");
  }

  const validatedAnswers = validateAnswers(cohort.surveyFields, answers);

  const application = await prisma.$transaction(async (tx) => {
    const createdApplication = await tx.application.create({
      data: {
        userId,
        cohortId,
        status: "PENDING",
      },
    });

    await tx.applicationAnswer.createMany({
      data: validatedAnswers.map((answer) => ({
        applicationId: createdApplication.id,
        surveyFieldId: answer.surveyFieldId,
        value: answer.value,
      })),
    });

    return tx.application.findUnique({
      where: { id: createdApplication.id },
      include: applicationInclude,
    });
  });

  if (!application) {
    throw new AppError(500, "Не удалось создать заявку");
  }

  return serializeStudentApplication(application);
}

export async function getApplicantTestTask(userId: number, cohortId: number) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!application) {
    throw new AppError(403, "Тестовое задание доступно после подачи заявки");
  }

  const testTask = await prisma.testTask.findUnique({
    where: { cohortId },
  });

  if (!testTask) {
    return {
      state: "not_configured" as const,
    };
  }

  if (!testTask.publishedAt) {
    return {
      state: "not_published" as const,
    };
  }

  return {
    state: "available" as const,
    content: testTask.content,
    publishedAt: testTask.publishedAt.toISOString(),
  };
}

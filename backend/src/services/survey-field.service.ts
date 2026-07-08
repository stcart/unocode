import type { SurveyFieldType } from "@prisma/client";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";

export type SurveyFieldInput = {
  label: string;
  type: SurveyFieldType;
  options?: string[];
  sortOrder?: number;
};

function validateSurveyFieldInput(input: SurveyFieldInput): {
  label: string;
  type: SurveyFieldType;
  options: string[];
  sortOrder?: number;
} {
  const label = input.label.trim();

  if (!label) {
    throw new AppError(400, "Название поля анкеты обязательно");
  }

  if (!["TEXT", "LONG_TEXT", "SELECT"].includes(input.type)) {
    throw new AppError(400, "Некорректный тип поля анкеты");
  }

  const options = (input.options ?? [])
    .map((option) => option.trim())
    .filter(Boolean);

  if (input.type === "SELECT" && options.length === 0) {
    throw new AppError(400, "Для поля select нужен хотя бы один вариант");
  }

  if (input.type !== "SELECT" && options.length > 0) {
    throw new AppError(400, "Варианты ответа допустимы только для select");
  }

  return {
    label,
    type: input.type,
    options,
    sortOrder: input.sortOrder,
  };
}

async function getNextSortOrder(cohortId: number): Promise<number> {
  const lastField = await prisma.surveyField.findFirst({
    where: { cohortId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return (lastField?.sortOrder ?? 0) + 1;
}

export async function listSurveyFields(cohortId: number) {
  await ensureCohortExists(cohortId);

  return prisma.surveyField.findMany({
    where: { cohortId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createSurveyField(
  cohortId: number,
  input: SurveyFieldInput
) {
  await ensureCohortExists(cohortId);

  const data = validateSurveyFieldInput(input);
  const sortOrder = data.sortOrder ?? (await getNextSortOrder(cohortId));

  return prisma.surveyField.create({
    data: {
      cohortId,
      label: data.label,
      type: data.type,
      options: data.options,
      sortOrder,
    },
  });
}

export async function updateSurveyField(
  cohortId: number,
  fieldId: number,
  input: SurveyFieldInput
) {
  await ensureSurveyFieldBelongsToCohort(cohortId, fieldId);

  const data = validateSurveyFieldInput(input);

  return prisma.surveyField.update({
    where: { id: fieldId },
    data: {
      label: data.label,
      type: data.type,
      options: data.options,
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });
}

export async function deleteSurveyField(cohortId: number, fieldId: number) {
  await ensureSurveyFieldBelongsToCohort(cohortId, fieldId);

  await prisma.surveyField.delete({
    where: { id: fieldId },
  });
}

async function ensureSurveyFieldBelongsToCohort(
  cohortId: number,
  fieldId: number
) {
  const field = await prisma.surveyField.findFirst({
    where: { id: fieldId, cohortId },
  });

  if (!field) {
    throw new AppError(404, "Поле анкеты не найдено");
  }

  return field;
}

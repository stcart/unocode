import type { Cohort, Prisma, TestTask } from "@prisma/client";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import {
  parseCohortInput,
  serializeCohort,
  type CohortInput,
} from "../utils/cohort-validation";

const cohortInclude = {
  surveyFields: {
    orderBy: { sortOrder: "asc" as const },
  },
  cohortRoles: {
    orderBy: { id: "asc" as const },
  },
  testTask: true,
  _count: {
    select: { applications: true },
  },
} satisfies Prisma.CohortInclude;

export type CohortDetail = Prisma.CohortGetPayload<{
  include: typeof cohortInclude;
}>;

function serializeTestTask(task: TestTask | null) {
  if (!task) {
    return null;
  }

  return {
    ...task,
    publishedAt: task.publishedAt?.toISOString() ?? null,
  };
}

function serializeCohortDetail(cohort: CohortDetail) {
  return {
    ...serializeCohort(cohort),
    surveyFields: cohort.surveyFields,
    cohortRoles: cohort.cohortRoles,
    testTask: serializeTestTask(cohort.testTask),
    applicationsCount: cohort._count.applications,
  };
}

function handleUniqueNameError(error: unknown): never {
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  ) {
    throw new AppError(409, "Когорта с таким названием уже существует");
  }

  throw error;
}

export async function listCohorts() {
  const cohorts = await prisma.cohort.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      testTask: {
        select: { publishedAt: true },
      },
      _count: {
        select: {
          applications: true,
          surveyFields: true,
          cohortRoles: true,
        },
      },
    },
  });

  return cohorts.map((cohort) => ({
    ...serializeCohort(cohort),
    testTaskPublished: cohort.testTask?.publishedAt !== null,
    applicationsCount: cohort._count.applications,
    surveyFieldsCount: cohort._count.surveyFields,
    cohortRolesCount: cohort._count.cohortRoles,
  }));
}

export async function getCohortById(cohortId: number) {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: cohortInclude,
  });

  if (!cohort) {
    throw new AppError(404, "Когорта не найдена");
  }

  return serializeCohortDetail(cohort);
}

export async function createCohort(input: CohortInput) {
  const { name, dates } = parseCohortInput(input);

  try {
    const cohort = await prisma.cohort.create({
      data: {
        name,
        ...dates,
      },
      include: cohortInclude,
    });

    return serializeCohortDetail(cohort);
  } catch (error) {
    handleUniqueNameError(error);
  }
}

export async function updateCohort(cohortId: number, input: CohortInput) {
  await ensureCohortExists(cohortId);

  const { name, dates } = parseCohortInput(input);

  try {
    const cohort = await prisma.cohort.update({
      where: { id: cohortId },
      data: {
        name,
        ...dates,
      },
      include: cohortInclude,
    });

    return serializeCohortDetail(cohort);
  } catch (error) {
    handleUniqueNameError(error);
  }
}

export async function ensureCohortExists(cohortId: number): Promise<Cohort> {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
  });

  if (!cohort) {
    throw new AppError(404, "Когорта не найдена");
  }

  return cohort;
}

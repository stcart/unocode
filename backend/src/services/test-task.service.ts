import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";
import { sendTestTaskPublishedEmails } from "./email.service";

function serializeTestTask(
  task: {
    id: number;
    cohortId: number;
    content: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null
) {
  if (!task) {
    return null;
  }

  return {
    ...task,
    publishedAt: task.publishedAt?.toISOString() ?? null,
  };
}

export async function getTestTask(cohortId: number) {
  await ensureCohortExists(cohortId);

  const task = await prisma.testTask.findUnique({
    where: { cohortId },
  });

  return serializeTestTask(task);
}

export async function upsertTestTask(cohortId: number, content: string) {
  await ensureCohortExists(cohortId);

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new AppError(400, "Текст тестового задания обязателен");
  }

  const task = await prisma.testTask.upsert({
    where: { cohortId },
    create: {
      cohortId,
      content: trimmedContent,
    },
    update: {
      content: trimmedContent,
    },
  });

  return serializeTestTask(task);
}

export async function publishTestTask(cohortId: number) {
  await ensureCohortExists(cohortId);

  const existingTask = await prisma.testTask.findUnique({
    where: { cohortId },
  });

  if (!existingTask) {
    throw new AppError(400, "Сначала сохраните текст тестового задания");
  }

  const task = await prisma.testTask.update({
    where: { cohortId },
    data: {
      publishedAt: new Date(),
    },
  });

  const [cohort, applications] = await Promise.all([
    prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { name: true },
    }),
    prisma.application.findMany({
      where: { cohortId },
      select: {
        user: { select: { email: true } },
      },
    }),
  ]);

  await sendTestTaskPublishedEmails({
    cohortName: cohort?.name ?? `Когорта ${cohortId}`,
    recipients: applications.map((application) => application.user.email),
  });

  return serializeTestTask(task);
}

export async function unpublishTestTask(cohortId: number) {
  await ensureCohortExists(cohortId);

  const existingTask = await prisma.testTask.findUnique({
    where: { cohortId },
  });

  if (!existingTask) {
    throw new AppError(404, "Тестовое задание не найдено");
  }

  const task = await prisma.testTask.update({
    where: { cohortId },
    data: {
      publishedAt: null,
    },
  });

  return serializeTestTask(task);
}

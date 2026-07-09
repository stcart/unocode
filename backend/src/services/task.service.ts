import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";
import { formatDateOnly, parseDateOnly } from "../utils/dates";
import {
  generateWorkdays,
  groupWorkdaysIntoWeeks,
  resolveWeek,
} from "../utils/workdays";

export type TaskCardInput = {
  title?: string | null;
  description?: string | null;
  artifactLink?: string | null;
};

function trimOrNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function serializeTaskCard(card: {
  id: number;
  userId: number;
  cohortId: number;
  date: Date;
  title: string | null;
  description: string | null;
  artifactLink: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: card.id,
    userId: card.userId,
    cohortId: card.cohortId,
    date: formatDateOnly(card.date),
    title: card.title,
    description: card.description,
    artifactLink: card.artifactLink,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

async function ensureApprovedAccess(userId: number, cohortId: number) {
  const application = await prisma.application.findUnique({
    where: {
      userId_cohortId: { userId, cohortId },
    },
  });

  if (!application || application.status !== "APPROVED") {
    throw new AppError(403, "Задачи доступны после одобрения заявки");
  }

  return application;
}

function inferFioFromAnswers(
  answers: Array<{ value: string; surveyField: { label: string } }>
): string | null {
  for (const answer of answers) {
    const label = answer.surveyField.label.trim().toLowerCase();
    if (label.includes("фио") || label === "ф.и.о.") {
      return answer.value.trim() || null;
    }
  }

  return null;
}

async function getParticipantProfiles(cohortId: number, userIds: number[]) {
  if (userIds.length === 0) {
    return [];
  }

  const applications = await prisma.application.findMany({
    where: {
      cohortId,
      userId: { in: userIds },
      status: "APPROVED",
    },
    include: {
      user: { select: { id: true, email: true } },
      role: { select: { id: true, name: true } },
      answers: {
        include: {
          surveyField: { select: { label: true } },
        },
      },
    },
  });

  const documentData = await prisma.studentDocumentData.findMany({
    where: {
      cohortId,
      userId: { in: userIds },
    },
    select: {
      userId: true,
      studentFio: true,
    },
  });

  const fioByUserId = new Map(
    documentData.map((item) => [item.userId, item.studentFio])
  );

  return applications
    .map((application) => ({
      userId: application.userId,
      email: application.user.email,
      displayName:
        fioByUserId.get(application.userId) ??
        inferFioFromAnswers(application.answers) ??
        application.user.email,
      role: application.role,
    }))
    .sort((left, right) => left.displayName.localeCompare(right.displayName, "ru"));
}

async function buildTaskBoard(
  cohortId: number,
  participantUserIds: number[],
  weekStart?: string
) {
  const cohort = await ensureCohortExists(cohortId);
  const workdays = generateWorkdays(cohort.practiceStart, cohort.practiceEnd);
  const weeks = groupWorkdaysIntoWeeks(workdays);
  const { week, weekIndex } = resolveWeek(weeks, weekStart);

  if (!week) {
    throw new AppError(400, "Для этой когорты нет рабочих дней практики");
  }

  const participants = await getParticipantProfiles(cohortId, participantUserIds);

  const cards = await prisma.taskCard.findMany({
    where: {
      cohortId,
      userId: { in: participantUserIds },
      date: {
        in: week.days.map((day) => parseDateOnly(day, "date")),
      },
    },
  });

  const cardsByUserAndDate = new Map<string, ReturnType<typeof serializeTaskCard>>();

  for (const card of cards) {
    const key = `${card.userId}:${formatDateOnly(card.date)}`;
    cardsByUserAndDate.set(key, serializeTaskCard(card));
  }

  return {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      practiceStart: formatDateOnly(cohort.practiceStart),
      practiceEnd: formatDateOnly(cohort.practiceEnd),
    },
    weekStart: week.weekStart,
    days: week.days,
    weekIndex,
    totalWeeks: weeks.length,
    weeks: weeks.map((item) => item.weekStart),
    participants: participants.map((participant) => ({
      ...participant,
      cards: Object.fromEntries(
        week.days.map((day) => [
          day,
          cardsByUserAndDate.get(`${participant.userId}:${day}`) ?? null,
        ])
      ),
    })),
  };
}

export async function getStudentTaskBoard(
  userId: number,
  cohortId: number,
  options: { showAll?: boolean; weekStart?: string } = {}
) {
  await ensureApprovedAccess(userId, cohortId);

  let participantUserIds = [userId];

  if (options.showAll) {
    const approvedApplications = await prisma.application.findMany({
      where: { cohortId, status: "APPROVED" },
      select: { userId: true },
    });
    participantUserIds = approvedApplications.map(
      (application) => application.userId
    );
  }

  return buildTaskBoard(cohortId, participantUserIds, options.weekStart);
}

export async function getAdminTaskBoard(
  cohortId: number,
  weekStart?: string
) {
  const approvedApplications = await prisma.application.findMany({
    where: { cohortId, status: "APPROVED" },
    select: { userId: true },
  });

  const participantUserIds = approvedApplications.map(
    (application) => application.userId
  );

  return buildTaskBoard(cohortId, participantUserIds, weekStart);
}

export async function upsertTaskCard(
  userId: number,
  cohortId: number,
  dateStr: string,
  input: TaskCardInput
) {
  await ensureApprovedAccess(userId, cohortId);

  const cohort = await ensureCohortExists(cohortId);
  const date = parseDateOnly(dateStr, "date");
  const workdays = generateWorkdays(cohort.practiceStart, cohort.practiceEnd);
  const formattedDate = formatDateOnly(date);

  if (!workdays.includes(formattedDate)) {
    throw new AppError(400, "Дата вне периода практики или выходной день");
  }

  const title = trimOrNull(input.title);
  const description = trimOrNull(input.description);
  const artifactLink = trimOrNull(input.artifactLink);

  const existing = await prisma.taskCard.findFirst({
    where: {
      userId,
      cohortId,
      date,
    },
  });

  if (existing) {
    const updated = await prisma.taskCard.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        artifactLink,
      },
    });

    return serializeTaskCard(updated);
  }

  const created = await prisma.taskCard.create({
    data: {
      userId,
      cohortId,
      date,
      title,
      description,
      artifactLink,
    },
  });

  return serializeTaskCard(created);
}

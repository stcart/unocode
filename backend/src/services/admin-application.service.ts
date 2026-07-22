import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";
import { serializeAdminApplication } from "./serializers/application.serializer";

const applicationInclude = {
  user: {
    select: { id: true, email: true },
  },
  role: {
    select: { id: true, name: true },
  },
  answers: {
    include: {
      surveyField: {
        select: { label: true, type: true },
      },
    },
    orderBy: { surveyFieldId: "asc" as const },
  },
} as const;

export async function listCohortApplications(cohortId: number) {
  await ensureCohortExists(cohortId);

  const applications = await prisma.application.findMany({
    where: { cohortId },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });

  return applications.map(serializeAdminApplication);
}

export async function getCohortApplication(
  cohortId: number,
  applicationId: number
) {
  await ensureCohortExists(cohortId);

  const application = await prisma.application.findFirst({
    where: { id: applicationId, cohortId },
    include: applicationInclude,
  });

  if (!application) {
    throw new AppError(404, "Заявка не найдена");
  }

  return serializeAdminApplication(application);
}

export async function reviewCohortApplication(
  cohortId: number,
  applicationId: number,
  input: {
    status?: ApplicationStatus;
    reviewComment?: string | null;
    roleId?: number | null;
  }
) {
  await ensureCohortExists(cohortId);

  const application = await prisma.application.findFirst({
    where: { id: applicationId, cohortId },
  });

  if (!application) {
    throw new AppError(404, "Заявка не найдена");
  }

  const updateData: {
    status?: ApplicationStatus;
    reviewComment?: string | null;
    roleId?: number | null;
  } = {};

  if (input.status !== undefined) {
    if (!["APPROVED", "REJECTED", "PENDING"].includes(input.status)) {
      throw new AppError(400, "Некорректный статус заявки");
    }
    updateData.status = input.status;

    if (input.status === "REJECTED") {
      updateData.reviewComment =
        typeof input.reviewComment === "string"
          ? input.reviewComment.trim() || null
          : null;
    }

    if (input.status === "APPROVED") {
      updateData.reviewComment = null;
    }
  }

  if (input.roleId !== undefined) {
    if (input.roleId === null) {
      updateData.roleId = null;
    } else {
      const role = await prisma.cohortRole.findFirst({
        where: { id: input.roleId, cohortId },
      });

      if (!role) {
        throw new AppError(400, "Роль не найдена в этой когорте");
      }

      updateData.roleId = input.roleId;
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, "Нет данных для обновления");
  }

  if (updateData.roleId !== undefined && updateData.status === undefined) {
    if (application.status !== "APPROVED") {
      throw new AppError(400, "Роль назначается только одобренным заявкам");
    }
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: updateData,
    include: applicationInclude,
  });

  return serializeAdminApplication(updated);
}

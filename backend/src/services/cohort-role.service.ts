import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { ensureCohortExists } from "./cohort.service";

export async function listCohortRoles(cohortId: number) {
  await ensureCohortExists(cohortId);

  return prisma.cohortRole.findMany({
    where: { cohortId },
    orderBy: { id: "asc" },
  });
}

export async function createCohortRole(cohortId: number, name: string) {
  await ensureCohortExists(cohortId);

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AppError(400, "Название роли обязательно");
  }

  return prisma.cohortRole.create({
    data: {
      cohortId,
      name: trimmedName,
    },
  });
}

export async function updateCohortRole(
  cohortId: number,
  roleId: number,
  name: string
) {
  await ensureCohortRoleBelongsToCohort(cohortId, roleId);

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AppError(400, "Название роли обязательно");
  }

  return prisma.cohortRole.update({
    where: { id: roleId },
    data: { name: trimmedName },
  });
}

export async function deleteCohortRole(cohortId: number, roleId: number) {
  await ensureCohortRoleBelongsToCohort(cohortId, roleId);

  const assignedApplications = await prisma.application.count({
    where: { roleId },
  });

  if (assignedApplications > 0) {
    throw new AppError(
      409,
      "Нельзя удалить роль, назначенную участникам когорты"
    );
  }

  await prisma.cohortRole.delete({
    where: { id: roleId },
  });
}

async function ensureCohortRoleBelongsToCohort(
  cohortId: number,
  roleId: number
) {
  const role = await prisma.cohortRole.findFirst({
    where: { id: roleId, cohortId },
  });

  if (!role) {
    throw new AppError(404, "Роль когорты не найдена");
  }

  return role;
}

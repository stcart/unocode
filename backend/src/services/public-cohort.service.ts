import { prisma } from "./prisma.service";
import { AppError } from "../utils/app-error";
import { formatDateOnly, parseDateOnly } from "../utils/dates";
import { parseCohortId } from "../utils/cohort-validation";

export function isApplicationPeriodOpen(
  applicationStart: Date,
  applicationEnd: Date,
  now = new Date()
): boolean {
  const today = parseDateOnly(formatDateOnly(now), "today");
  return today >= applicationStart && today <= applicationEnd;
}

export async function getActiveCohort() {
  const cohorts = await prisma.cohort.findMany({
    orderBy: [{ applicationStart: "desc" }, { id: "desc" }],
  });

  const now = new Date();
  const active = cohorts.find((cohort) =>
    isApplicationPeriodOpen(
      cohort.applicationStart,
      cohort.applicationEnd,
      now
    )
  );

  if (!active) {
    return { cohort: null };
  }

  return {
    cohort: {
      id: active.id,
      name: active.name,
      applicationStart: formatDateOnly(active.applicationStart),
      applicationEnd: formatDateOnly(active.applicationEnd),
      practiceStart: formatDateOnly(active.practiceStart),
      practiceEnd: formatDateOnly(active.practiceEnd),
      isApplicationOpen: true,
    },
  };
}

export async function getPublicSurvey(cohortId: number) {
  parseCohortId(String(cohortId));

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      surveyFields: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          label: true,
          type: true,
          options: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!cohort) {
    throw new AppError(404, "Когорта не найдена");
  }

  return {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      applicationStart: formatDateOnly(cohort.applicationStart),
      applicationEnd: formatDateOnly(cohort.applicationEnd),
      practiceStart: formatDateOnly(cohort.practiceStart),
      practiceEnd: formatDateOnly(cohort.practiceEnd),
      isApplicationOpen: isApplicationPeriodOpen(
        cohort.applicationStart,
        cohort.applicationEnd
      ),
    },
    surveyFields: cohort.surveyFields,
  };
}

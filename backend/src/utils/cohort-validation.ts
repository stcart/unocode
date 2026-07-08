import { AppError } from "../utils/app-error";
import {
  formatDateOnly,
  parseDateOnly,
  validateDateRanges,
} from "../utils/dates";

export type CohortInput = {
  name: string;
  applicationStart: string;
  applicationEnd: string;
  practiceStart: string;
  practiceEnd: string;
};

export type CohortDates = {
  applicationStart: Date;
  applicationEnd: Date;
  practiceStart: Date;
  practiceEnd: Date;
};

export function parseCohortInput(input: CohortInput): {
  name: string;
  dates: CohortDates;
} {
  const name = input.name.trim();

  if (!name) {
    throw new AppError(400, "Название когорты обязательно");
  }

  const dates: CohortDates = {
    applicationStart: parseDateOnly(input.applicationStart, "applicationStart"),
    applicationEnd: parseDateOnly(input.applicationEnd, "applicationEnd"),
    practiceStart: parseDateOnly(input.practiceStart, "practiceStart"),
    practiceEnd: parseDateOnly(input.practiceEnd, "practiceEnd"),
  };

  try {
    validateDateRanges(dates);
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : "Некорректные даты"
    );
  }

  return { name, dates };
}

export function serializeCohort<
  T extends {
    name: string;
    applicationStart: Date;
    applicationEnd: Date;
    practiceStart: Date;
    practiceEnd: Date;
  },
>(cohort: T) {
  return {
    ...cohort,
    applicationStart: formatDateOnly(cohort.applicationStart),
    applicationEnd: formatDateOnly(cohort.applicationEnd),
    practiceStart: formatDateOnly(cohort.practiceStart),
    practiceEnd: formatDateOnly(cohort.practiceEnd),
  };
}

export function parseCohortId(rawId: string): number {
  const cohortId = Number(rawId);

  if (!Number.isInteger(cohortId) || cohortId <= 0) {
    throw new AppError(400, "Некорректный ID когорты");
  }

  return cohortId;
}

export function parseEntityId(rawId: string, entityName: string): number {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `Некорректный ID: ${entityName}`);
  }

  return id;
}

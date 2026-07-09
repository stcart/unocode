import type { Request, Response } from "express";
import {
  getAdminTaskBoard,
  getStudentTaskBoard,
  upsertTaskCard,
  type TaskCardInput,
} from "../services/task.service";
import { AppError } from "../utils/app-error";
import { parseCohortId } from "../utils/cohort-validation";

function parseWeekStart(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return value;
}

function parseShowAll(value: unknown): boolean {
  return value === "true" || value === "1";
}

export async function getTasksForCohort(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const board = await getStudentTaskBoard(req.user.userId, cohortId, {
    showAll: parseShowAll(req.query.showAll),
    weekStart: parseWeekStart(req.query.weekStart),
  });

  res.json(board);
}

export async function putTaskCard(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const cohortId = parseCohortId(req.params.cohortId);
  const date = req.params.date;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError(400, "Некорректная дата");
  }

  const body = req.body as TaskCardInput;
  const card = await upsertTaskCard(req.user.userId, cohortId, date, body);
  res.json({ card });
}

export async function getAdminTasksForCohort(
  req: Request,
  res: Response
): Promise<void> {
  const cohortId = parseCohortId(req.params.cohortId);
  const board = await getAdminTaskBoard(
    cohortId,
    parseWeekStart(req.query.weekStart)
  );
  res.json(board);
}

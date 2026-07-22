import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

function formatZodError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "Некорректные данные запроса";
  }

  return issue.message;
}

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError(400, formatZodError(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };
}

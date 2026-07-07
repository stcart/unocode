import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt.service";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Недействительный или просроченный токен" });
  }
}

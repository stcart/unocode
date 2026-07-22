import type { NextFunction, Request, Response } from "express";
import { prisma } from "../services/prisma.service";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  void (async () => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Требуется авторизация" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user || user.role !== "ADMIN") {
        res.status(403).json({ error: "Доступ только для администратора" });
        return;
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      next(error);
    }
  })();
}

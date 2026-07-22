import type { Request, Response } from "express";
import {
  getUserById,
  loginUser,
  registerUser,
} from "../services/auth.service";
import { AppError } from "../utils/app-error";

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const result = await registerUser(email, password);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const result = await loginUser(email, password);
  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, "Требуется авторизация");
  }

  const user = await getUserById(req.user.userId);
  res.json({ user });
}

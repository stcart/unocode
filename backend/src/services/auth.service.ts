import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { prisma } from "./prisma.service";
import { signToken } from "./jwt.service";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

export type SafeUser = {
  id: number;
  email: string;
  role: User["role"];
  createdAt: Date;
};

export type AuthResult = {
  user: SafeUser;
  token: string;
};

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateCredentials(email: string, password: string): void {
  if (!email.trim() || !password) {
    throw new AppError(400, "Email и пароль обязательны");
  }

  if (!email.includes("@")) {
    throw new AppError(400, "Некорректный email");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      400,
      `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`
    );
  }
}

export async function registerUser(
  email: string,
  password: string
): Promise<AuthResult> {
  validateCredentials(email, password);

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError(409, "Пользователь с таким email уже существует");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
    },
  });

  const safeUser = toSafeUser(user);
  const token = signToken({
    userId: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });

  return { user: safeUser, token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  validateCredentials(email, password);

  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError(401, "Неверный email или пароль");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, "Неверный email или пароль");
  }

  const safeUser = toSafeUser(user);
  const token = signToken({
    userId: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });

  return { user: safeUser, token };
}

export async function getUserById(userId: number): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  return toSafeUser(user);
}

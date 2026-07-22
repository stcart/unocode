import { z } from "zod";

export const RegisterBodySchema = z.object({
  email: z.string().trim().email("Некорректный email").max(255),
  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(128),
});

export const LoginBodySchema = RegisterBodySchema;

import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { LoginBodySchema, RegisterBodySchema } from "../schemas/auth.schemas";

const router = Router();

router.post(
  "/auth/register",
  validateBody(RegisterBodySchema),
  asyncHandler(register)
);
router.post(
  "/auth/login",
  validateBody(LoginBodySchema),
  asyncHandler(login)
);
router.get("/auth/me", requireAuth, asyncHandler(me));

export default router;

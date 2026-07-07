import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/auth/register", asyncHandler(register));
router.post("/auth/login", asyncHandler(login));
router.get("/auth/me", requireAuth, asyncHandler(me));

export default router;

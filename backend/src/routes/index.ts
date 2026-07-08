import { Router } from "express";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(adminRoutes);

export default router;

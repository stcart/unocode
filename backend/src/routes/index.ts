import { Router } from "express";
import adminRoutes from "./admin.routes";
import applicationRoutes from "./application.routes";
import authRoutes from "./auth.routes";
import documentRoutes from "./document.routes";
import healthRoutes from "./health.routes";
import publicRoutes from "./public.routes";

const router = Router();

router.use(healthRoutes);
router.use(publicRoutes);
router.use(authRoutes);
router.use(applicationRoutes);
router.use(documentRoutes);
router.use(adminRoutes);

export default router;

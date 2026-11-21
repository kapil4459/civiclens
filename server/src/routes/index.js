import { Router } from 'express';
import healthRoutes from './health.routes.js';
import complaintRoutes from './complaint.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/complaints', complaintRoutes);

export default router;

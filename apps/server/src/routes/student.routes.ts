import { Router } from 'express';
import { getMyEnrollments } from '../controllers/student.controller';
import { requireAuth, requireRole } from '../middleware';
import { asyncHandler } from '../utils/asyncHandler';
import deviceRoutes from './device.routes';

const router = Router();

router.use(requireAuth, requireRole('STUDENT'));

router.get('/enrollments', asyncHandler(getMyEnrollments));
router.use('/devices', deviceRoutes);

export default router;
